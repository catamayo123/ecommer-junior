import { IsString, MinLength, MaxLength } from 'class-validator';

export class ApplyCouponDTO {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  code!: string;
}
