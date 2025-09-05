import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { hashPassword } from '../../common/utils/password.util';
import { NotificationService } from '../notification/notification.service';
import { config } from '../../config/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User already exists.');
    }

    const hashedPassword = await hashPassword(createUserDto.password);
    // Generate email verification token
    const emailVerificationToken = randomBytes(20).toString('hex');

    const data = await this.userService.createUser({
      ...createUserDto,
      password: hashedPassword,
      emailVerifyToken: emailVerificationToken,
      emailVerifySentAt: new Date(),
    });

    // Send verification email
    void this.notificationService.sendEmail(
      createUserDto.email,
      config.notification.email.templates.emailVerification,
      { name: createUserDto.name, token: emailVerificationToken },
    );

    return data;
  }

  async verifyEmail(token: string) {
    const user = await this.userService.findByEmailVerifyToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token.');
    }

    await this.userService.updateUser(user.id, {
      isVerified: true,
      emailVerifyToken: null,
      emailVerifySentAt: null,
    });
  }
}
