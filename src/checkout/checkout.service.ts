import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { SaleItem } from './entities/sale-item.entity';
import { Sale } from './entities/sale.entity';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    private readonly dataSource: DataSource,
  ) {}

  async complete(createCheckoutDto: CreateCheckoutDto, employee: User) {
    const aggregatedItems = this.aggregateItems(createCheckoutDto.items);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const saleItems: SaleItem[] = [];
      let total = 0;

      for (const item of aggregatedItems) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(
            `Product with UUID ${item.productId} not found`,
          );
        }

        if (product.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}" (SKU: ${product.sku ?? 'N/A'}). Available: ${product.quantity}, requested: ${item.quantity}`,
          );
        }

        product.quantity -= item.quantity;
        await queryRunner.manager.save(product);

        const unitPrice = Number(product.price);
        const lineTotal = unitPrice * item.quantity;
        total += lineTotal;

        saleItems.push(
          queryRunner.manager.create(SaleItem, {
            productId: product.id,
            sku: product.sku ?? '',
            productName: product.name,
            quantity: item.quantity,
            unitPrice,
            lineTotal,
          }),
        );
      }

      const sale = queryRunner.manager.create(Sale, {
        employeeId: employee.id!,
        total,
        items: saleItems,
      });

      const savedSale = await queryRunner.manager.save(sale);
      await queryRunner.commitTransaction();

      return this.salesRepository.findOne({
        where: { id: savedSale.id },
        relations: { items: true },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private aggregateItems(
    items: CreateCheckoutDto['items'],
  ): { productId: string; quantity: number }[] {
    const quantitiesByProduct = new Map<string, number>();

    for (const item of items) {
      const current = quantitiesByProduct.get(item.productId) ?? 0;
      quantitiesByProduct.set(item.productId, current + item.quantity);
    }

    return Array.from(quantitiesByProduct.entries()).map(
      ([productId, quantity]) => ({
        productId,
        quantity,
      }),
    );
  }
}
