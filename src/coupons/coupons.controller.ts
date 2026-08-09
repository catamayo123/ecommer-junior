import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '../../enum/index';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CouponsService } from './coupons.service';
import { CreateCouponDTO } from './DTO/create-coupon.dto';
import { UpdateCouponDTO } from './DTO/update-coupon.dto';

@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // CREAR CUPON
  @Post('createCupons')
  createCoupon(@Body() createCouponDTO: CreateCouponDTO) {
    return this.couponsService.createCoupon(createCouponDTO);
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
  updateCoupon(@Param('id') id: string, @Body() updateCouponDTO: UpdateCouponDTO) {
    return this.couponsService.updateCoupon(id, updateCouponDTO);
  }

  // ELIMINAR CUPON
  @Delete('delete/:id')
  removeCoupon(@Param('id') id: string) {
    return this.couponsService.removeCoupon(id);
  }
}
