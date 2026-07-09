import { IsString, IsNumber, IsOptional, IsBoolean, MinLength, MaxLength, Min, Max } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  code!: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  discountPercent!: number;

  @IsOptional()
  expiresAt?: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
