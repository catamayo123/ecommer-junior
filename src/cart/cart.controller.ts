import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // OBTENER CARRITO
  @Get('obtener/')
  getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  // ADD ITEMS EN EL CARRITO
  @Post('addItems')
  addItem(@CurrentUser('id') userId: string, @Body() itemBody: AddItemDto) {
    return this.cartService.addItem(userId, itemBody);
  }

  // MODIFICAR CANTIDAD DE ITEMS EN EL CARRITO 
  @Patch('items/update/:id')
  updateItemQuantity( @CurrentUser('id') userId: string, @Param('id') itemId: string, @Body() updateItemBody: UpdateItemDto,) {
    return this.cartService.updateItemQuantity(userId, itemId, updateItemBody);
  }

  // ELIMINAR ITEMS DEL CARRITO 
  @Delete('items/delete/:id')
  removeItem(@CurrentUser('id') userId: string, @Param('id') itemId: string) {
    return this.cartService.removeItem(userId, itemId);
  }
  
  // LIMPIAR CARRITO
  @Delete('clear')
  clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
  
  // ADD CUPON AL CARRITO
  @Post('addCoupon')
  applyCoupon(@CurrentUser('id') userId: string, @Body() couponBody: ApplyCouponDto) {
    return this.cartService.applyCoupon(userId, couponBody.code);
  }
  
  // ELIMINAR CUPON DEL CARRITO
  @Delete('deleteCoupon')
  removeCoupon(@CurrentUser('id') userId: string) {
    return this.cartService.removeCoupon(userId);
  }
}
