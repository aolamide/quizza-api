import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserModule, NotificationModule],
})
export class AuthModule {}
