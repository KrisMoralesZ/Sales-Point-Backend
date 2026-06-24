import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { rankProductsBySkuQuery } from './sku-match.util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { name, description, price, quantity, sku, imageUrl } =
      createProductDto;

    const existingSku = await this.productsRepository.findOne({
      where: { sku },
    });

    if (existingSku) {
      throw new ConflictException(`Product with SKU ${sku} already exists`);
    }

    const product = this.productsRepository.create({
      name,
      description,
      price,
      quantity,
      sku,
      imageUrl,
    });

    return this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with UUID ${id} not found`);
    }

    return product;
  }

  async findBySku(sku: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { sku },
    });

    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`);
    }

    return product;
  }

  async searchByCode(code: string): Promise<Product[]> {
    const query = code.trim();

    if (!query) {
      throw new BadRequestException('Product code is required');
    }

    const exactMatch = await this.productsRepository
      .createQueryBuilder('product')
      .where('LOWER(product.sku) = LOWER(:query)', { query })
      .getOne();

    if (exactMatch) {
      return [exactMatch];
    }

    const products = await this.productsRepository.find({
      order: { sku: 'ASC' },
    });

    return rankProductsBySkuQuery(query, products);
  }

  async save(product: Product): Promise<Product> {
    return this.productsRepository.save(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    const { price, sku } = updateProductDto;

    if (price !== undefined && price < 0) {
      throw new BadRequestException('Price must be a positive number');
    }

    if (sku && sku !== product.sku) {
      const existingSku = await this.productsRepository.findOne({
        where: { sku },
      });

      if (existingSku) {
        throw new ConflictException(`Product with SKU ${sku} already exists`);
      }
    }

    Object.assign(product, updateProductDto);

    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}
