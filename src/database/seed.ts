import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Sale } from '../checkout/entities/sale.entity';
import { SaleItem } from '../checkout/entities/sale-item.entity';
import { UserRole } from '../models/user.models';
import { sampleProducts } from './sample-products';

const ADMIN_EMAIL = 'admin@salespoint.com';
const EMPLOYEE_EMAIL = 'employee@salespoint.com';
const DEFAULT_PASSWORD = 'password123';

async function seed(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'sales_point',
    entities: [User, Product, Sale, SaleItem],
    synchronize: true,
  });

  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const productRepository = dataSource.getRepository(Product);

  const admin = await userRepository.findOne({ where: { email: ADMIN_EMAIL } });
  if (!admin) {
    await userRepository.save(
      userRepository.create({
        name: 'Admin User',
        email: ADMIN_EMAIL,
        password: await bcrypt.hash(DEFAULT_PASSWORD, 10),
        role: UserRole.Admin,
      }),
    );
    console.log(`Created admin: ${ADMIN_EMAIL} / ${DEFAULT_PASSWORD}`);
  }

  const employee = await userRepository.findOne({
    where: { email: EMPLOYEE_EMAIL },
  });
  if (!employee) {
    await userRepository.save(
      userRepository.create({
        name: 'Employee User',
        email: EMPLOYEE_EMAIL,
        password: await bcrypt.hash(DEFAULT_PASSWORD, 10),
        role: UserRole.Employee,
      }),
    );
    console.log(`Created employee: ${EMPLOYEE_EMAIL} / ${DEFAULT_PASSWORD}`);
  }

  let createdCount = 0;

  for (const productData of sampleProducts) {
    const existing = await productRepository.findOne({
      where: { sku: productData.sku },
    });

    if (!existing) {
      await productRepository.save(productRepository.create(productData));
      createdCount += 1;
    }
  }

  await dataSource.destroy();
  console.log(
    `Database seed completed. ${createdCount} new products added (${sampleProducts.length} total in catalog).`,
  );
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
