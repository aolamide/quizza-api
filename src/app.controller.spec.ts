import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as responseUtil from './common/utils/response.util';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);

    jest.spyOn(responseUtil, 'sendSuccess');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWelcome', () => {
    it('should return welcome message', () => {
      const result = controller.getWelcome();

      expect(responseUtil.sendSuccess).toHaveBeenCalledWith(
        null,
        'Welcome to the Quizza API v2',
      );
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('message', 'Welcome to the Quizza API v2');
      expect(result).toHaveProperty('data', null);
    });
  });
});
