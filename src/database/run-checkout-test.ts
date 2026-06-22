import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthenticationService } from '../authentication/authentication.service';
import { ProductsService } from '../products/products.service';
import { CheckoutService } from '../checkout/checkout.service';
import { UserRole } from '../models/user.models';

async function runCheckoutTest(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const authService = app.get(AuthenticationService);
    const productsService = app.get(ProductsService);
    const checkoutService = app.get(CheckoutService);

    const { user, token } = await authService.login({
      email: 'employee@salespoint.com',
      password: 'password123',
    });

    if (user.role !== UserRole.Employee) {
      throw new Error('Expected seeded employee account');
    }

    const products = await productsService.findAll();
    if (products.length < 3) {
      throw new Error('Expected at least 3 seeded products');
    }

    const [first, second, third] = products;
    const firstStockBefore = first.quantity;
    const secondStockBefore = second.quantity;

    const sale = await checkoutService.complete(
      {
        items: [
          { productId: first.id, quantity: 2 },
          { productId: second.id, quantity: 1 },
          { productId: third.id, quantity: 3 },
          { productId: first.id, quantity: 1 },
        ],
      },
      user,
    );

    if (!sale) {
      throw new Error('Checkout did not return a sale');
    }

    const updatedFirst = await productsService.findOne(first.id);
    const updatedSecond = await productsService.findOne(second.id);
    const updatedThird = await productsService.findOne(third.id);

    const expectedTotal =
      Number(first.price) * 3 +
      Number(second.price) * 1 +
      Number(third.price) * 3;

    console.log('Checkout integration test passed');
    console.log(`Employee: ${user.email}`);
    console.log(`JWT issued: ${token.slice(0, 20)}...`);
    console.log(`Sale ID: ${sale.id}`);
    console.log(`Line items: ${sale.items.length}`);
    console.log(`Total charged: $${Number(sale.total).toFixed(2)}`);
    console.log(`Expected total: $${expectedTotal.toFixed(2)}`);
    console.log(
      `Stock ${first.sku}: ${firstStockBefore} -> ${updatedFirst.quantity}`,
    );
    console.log(
      `Stock ${second.sku}: ${secondStockBefore} -> ${updatedSecond.quantity}`,
    );
    console.log(
      `Stock ${third.sku}: ${third.quantity} -> ${updatedThird.quantity}`,
    );

    if (sale.items.length !== 3) {
      throw new Error('Expected 3 aggregated sale items');
    }

    if (Number(sale.total).toFixed(2) !== expectedTotal.toFixed(2)) {
      throw new Error('Checkout total did not match expected amount');
    }

    if (updatedFirst.quantity !== firstStockBefore - 3) {
      throw new Error('First product stock was not decremented correctly');
    }
  } finally {
    await app.close();
  }
}

runCheckoutTest().catch((error: unknown) => {
  console.error('Checkout integration test failed:', error);
  process.exit(1);
});
