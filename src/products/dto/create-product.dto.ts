import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  MinLength,
  Min,
  IsInt,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsString()
  @MinLength(1)
  sku!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
