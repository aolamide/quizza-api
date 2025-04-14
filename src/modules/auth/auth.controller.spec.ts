/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as responseUtil from '../../common/utils/response.util';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    registerUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.spyOn(responseUtil, 'sendSuccess');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register user and return success response', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.registerUser.mockResolvedValue(mockUser);

      const result = await controller.registerUser(createUserDto);

      expect(authService.registerUser).toHaveBeenCalledWith(createUserDto);

      expect(responseUtil.sendSuccess).toHaveBeenCalledWith(
        null,
        'Registration successful. Verify your email to activate your account.',
      );

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('data', null);
      expect(result).toHaveProperty(
        'message',
        'Registration successful. Verify your email to activate your account.',
      );
    });

    it('should propagate errors from authService', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const error = new Error('Test error');
      mockAuthService.registerUser.mockRejectedValue(error);

      await expect(controller.registerUser(createUserDto)).rejects.toThrow(
        error,
      );

      expect(authService.registerUser).toHaveBeenCalledWith(createUserDto);
    });
  });
});
