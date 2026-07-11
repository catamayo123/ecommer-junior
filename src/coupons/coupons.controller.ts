import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '../../enum/index';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Controller('coupons')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // CREAR CUPON
  @Post('createCupons')
  createCoupon(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.createCoupon(createCouponDto);
  }

  // BUSCAR TODOS LOS CUPONES
  @Get('findAll')
  findAllCoupons() {
    return this.couponsService.findAllCoupons();
  }

  // BUSCAR CUPON POR ID
  @Get('find/:id')
  findCouponById(@Param('id') id: string) {
    return this.couponsService.findCouponById(id);
  }

  // MODIFICAR CUPON
  @Patch('update/:id')
  updateCoupon(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.updateCoupon(id, updateCouponDto);
  }

  // ELIMINAR CUPON
  @Delete('delete/:id')
  removeCoupon(@Param('id') id: string) {
    return this.couponsService.removeCoupon(id);
  }
}
