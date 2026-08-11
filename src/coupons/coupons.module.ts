import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { CouponEntity } from './entities/coupon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CouponEntity]), PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [CouponsService],
  controllers: [CouponsController],
  exports: [CouponsService],
})
export class CouponsModule {}
