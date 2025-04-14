import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { hashPassword } from '../../common/utils/password.util';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async registerUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User already exists.');
    }

    const hashedPassword = await hashPassword(createUserDto.password);

    return await this.userService.createUser({
      ...createUserDto,
      password: hashedPassword,
    });
  }
}
