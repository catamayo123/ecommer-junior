// QueryProductDto para validar y transformar automáticamente los parametros de busqueda que llegen

import { IsOptional, IsString, IsEnum, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType } from '../entities/product.entity';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  searchName?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(ProductType)
  productType?: ProductType;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
