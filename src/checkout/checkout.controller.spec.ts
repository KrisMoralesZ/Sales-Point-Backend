import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { Sale } from './entities/sale.entity';
import { EmployeeGuard } from '../common/guards/employee.guard';

describe('CheckoutController', () => {
  let controller: CheckoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        CheckoutService,
        {
          provide: getRepositoryToken(Sale),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CheckoutController>(CheckoutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('requires employee role for checkout', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      CheckoutController.prototype.complete,
    );

    expect(guards).toEqual(expect.arrayContaining([EmployeeGuard]));
  });
});
