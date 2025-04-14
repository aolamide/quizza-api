/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ConflictException } from '@nestjs/common';
import * as passwordUtils from '../../common/utils/password.util';

jest.mock('../../common/utils/password.util');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;

  const mockUserService = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const createdUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should register a new user successfully', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.createUser.mockResolvedValue(createdUser);
      jest
        .spyOn(passwordUtils, 'hashPassword')
        .mockResolvedValue('hashedPassword');

      const result = await service.registerUser(createUserDto);

      expect(userService.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
      expect(userService.createUser).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedPassword',
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUserService.findByEmail.mockResolvedValue(createdUser);

      await expect(service.registerUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );

      expect(userService.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(userService.createUser).not.toHaveBeenCalled();
    });
  });
});
