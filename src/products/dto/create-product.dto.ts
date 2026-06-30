import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, MinLength, MaxLength, Min, Max, IsUUID } from 'class-validator';
import { ProductType } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsEnum(ProductType)
  productType!: ProductType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  discountEndDate?: Date;
}
