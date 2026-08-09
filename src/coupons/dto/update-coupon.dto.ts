import { PartialType } from '@nestjs/mapped-types';
import { CreateCouponDTO } from './create-coupon.dto';

export class UpdateCouponDTO extends PartialType(CreateCouponDTO) {}
