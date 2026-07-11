import { IsString, MinLength, MaxLength } from 'class-validator';

export class ApplyCouponDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  code!: string;
}
