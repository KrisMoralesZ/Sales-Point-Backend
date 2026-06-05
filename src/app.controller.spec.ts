/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });

    it('should return "Hello World!" message', () => {
      const result = appController.getHello();
      expect(result).toBe('Hello World!');
    });

    it('should call appService.getHello()', () => {
      const spy = jest.spyOn(appService, 'getHello');
      appController.getHello();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should return a string', () => {
      const result = appController.getHello();
      expect(typeof result).toBe('string');
    });
  });
});
