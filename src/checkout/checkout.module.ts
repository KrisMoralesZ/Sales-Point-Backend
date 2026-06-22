import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem])],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
