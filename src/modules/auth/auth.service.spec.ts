/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import * as passwordUtils from '../../common/utils/password.util';
import { NotificationService } from '../notification/notification.service';

jest.mock('../../common/utils/password.util');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;

  const mockUserService = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    findByEmailVerifyToken: jest.fn(),
    updateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: NotificationService,
          useValue: {
            sendEmail: jest.fn().mockResolvedValue(true),
          },
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
      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: createUserDto.email,
          name: createUserDto.name,
          password: 'hashedPassword',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          emailVerifyToken: expect.stringMatching(/^[a-f0-9]{40}$/),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          emailVerifySentAt: expect.any(Date),
        }),
      );
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

  describe('verifyEmail', () => {
    const mockToken = 'valid-token-123';
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      isVerified: false,
      emailVerifyToken: mockToken,
      emailVerifySentAt: new Date(),
    };

    beforeEach(() => {
      mockUserService.findByEmailVerifyToken = jest.fn();
      mockUserService.updateUser = jest.fn();
    });

    it('should verify email successfully when token is valid', async () => {
      mockUserService.findByEmailVerifyToken.mockResolvedValue(mockUser);
      mockUserService.updateUser.mockResolvedValue(undefined);

      await service.verifyEmail(mockToken);

      expect(userService.findByEmailVerifyToken).toHaveBeenCalledWith(
        mockToken,
      );
      expect(userService.updateUser).toHaveBeenCalledWith(mockUser.id, {
        isVerified: true,
        emailVerifyToken: null,
        emailVerifySentAt: null,
      });
    });

    it('should throw ConflictException when token is invalid or expired', async () => {
      mockUserService.findByEmailVerifyToken.mockResolvedValue(null);

      await expect(service.verifyEmail(mockToken)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.verifyEmail(mockToken)).rejects.toThrow(
        'Invalid or expired verification token.',
      );

      expect(userService.findByEmailVerifyToken).toHaveBeenCalledWith(
        mockToken,
      );
      expect(userService.updateUser).not.toHaveBeenCalled();
    });
  });
});
