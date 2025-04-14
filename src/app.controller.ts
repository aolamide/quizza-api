import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { sendSuccess } from './common/utils/response.util';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWelcome() {
    return sendSuccess(null, 'Welcome to the Quizza API v2');
  }
}
