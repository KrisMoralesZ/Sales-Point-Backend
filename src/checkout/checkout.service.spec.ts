import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserRole } from '../models/user.models';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CheckoutService } from './checkout.service';
import { SaleItem } from './entities/sale-item.entity';
import { Sale } from './entities/sale.entity';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let salesRepository: { findOne: jest.Mock };
  let dataSource: { createQueryRunner: jest.Mock };

  const employee: User = {
    id: 'employee-uuid',
    name: 'Employee User',
    email: 'employee@salespoint.com',
    password: 'hashed',
    role: UserRole.Employee,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createProduct = (
    overrides: Partial<Product> = {},
  ): Product =>
    ({
      id: 'product-uuid-1',
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse',
      price: 29.99,
      quantity: 50,
      sku: 'SP-001',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as Product;

  const setupQueryRunner = (product: Product) => {
    const savedProducts = new Map<string, Product>([[product.id, { ...product }]]);
    const savedSales = new Map<string, Sale>();

    const queryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        findOne: jest.fn().mockImplementation((_entity, options) => {
          const productId = options.where.id as string;
          return Promise.resolve(savedProducts.get(productId) ?? null);
        }),
        save: jest.fn().mockImplementation((entity) => {
          if ('sku' in entity) {
            savedProducts.set(entity.id, entity as Product);
            return Promise.resolve(entity);
          }

          const sale = entity as Sale;
          sale.id = sale.id ?? 'sale-uuid-1';
          savedSales.set(sale.id, sale);
          return Promise.resolve(sale);
        }),
        create: jest.fn().mockImplementation((_entity, data) => data),
      },
    };

    dataSource.createQueryRunner.mockReturnValue(queryRunner);

    salesRepository.findOne.mockImplementation(({ where }) => {
      const sale = savedSales.get(where.id);
      return Promise.resolve(sale ?? null);
    });

    return { queryRunner, savedProducts, savedSales };
  };

  beforeEach(async () => {
    salesRepository = {
      findOne: jest.fn(),
    };

    dataSource = {
      createQueryRunner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: getRepositoryToken(Sale),
          useValue: salesRepository,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('completes checkout, decrements stock, and returns sale with items', async () => {
    const product = createProduct();
    const { queryRunner, savedProducts } = setupQueryRunner(product);

    const result = await service.complete(
      {
        items: [{ productId: product.id, quantity: 2 }],
      },
      employee,
    );

    expect(queryRunner.startTransaction).toHaveBeenCalled();
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(savedProducts.get(product.id)?.quantity).toBe(48);
    expect(result).toMatchObject({
      id: 'sale-uuid-1',
      employeeId: employee.id,
      total: 59.98,
    });
    expect(result?.items).toHaveLength(1);
    expect(result?.items[0]).toMatchObject({
      productId: product.id,
      sku: 'SP-001',
      productName: 'Wireless Mouse',
      quantity: 2,
      unitPrice: 29.99,
      lineTotal: 59.98,
    } satisfies Partial<SaleItem>);
  });

  it('aggregates duplicate product lines into one checkout item', async () => {
    const product = createProduct({ price: 10, quantity: 20 });
    setupQueryRunner(product);

    const result = await service.complete(
      {
        items: [
          { productId: product.id, quantity: 2 },
          { productId: product.id, quantity: 3 },
        ],
      },
      employee,
    );

    expect(result?.items).toHaveLength(1);
    expect(result?.items[0].quantity).toBe(5);
    expect(result?.total).toBe(50);
  });

  it('throws when a product is not found', async () => {
    setupQueryRunner(createProduct());

    await expect(
      service.complete(
        {
          items: [{ productId: 'missing-product-id', quantity: 1 }],
        },
        employee,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when stock is insufficient', async () => {
    setupQueryRunner(createProduct({ quantity: 1 }));

    await expect(
      service.complete(
        {
          items: [{ productId: 'product-uuid-1', quantity: 5 }],
        },
        employee,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rolls back the transaction when checkout fails', async () => {
    const { queryRunner } = setupQueryRunner(createProduct({ quantity: 1 }));

    await expect(
      service.complete(
        {
          items: [{ productId: 'product-uuid-1', quantity: 5 }],
        },
        employee,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });
});
