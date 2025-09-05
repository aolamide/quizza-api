import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: Partial<User>): Promise<User> {
    return await this.userRepository.save(createUserDto);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findByEmailVerifyToken(token: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { emailVerifyToken: token },
    });
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<void> {
    await this.userRepository.update(id, updateData);
  }
}
