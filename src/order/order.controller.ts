import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrderService } from './order.service';

import { UserRole } from '../../enum/index';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    // CHECKOUT o CREAR ORDEN
    @Post('checkoutOrders')
    @UseGuards(JwtAuthGuard, RolesGuard)
    checkoutOrder(@CurrentUser('id') userId: string) {
        return this.orderService.checkoutOrder(userId)
    }

    // HISTORIAL DE ORDENES
    @Get('findAllOrders')
    @UseGuards(JwtAuthGuard, RolesGuard)
    findAllOrder(@CurrentUser('id') userId: string) {
        return this.orderService.findAllOrder(userId)
    }

    // BUSCAR ORDEN POR ID > para USUARIO
    @Get('findOrdersById/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    findOrderById(@Param('id') orderId: string, @CurrentUser('id') userId: string) {
        return this.orderService.findOrderById(orderId, userId)
    }

    // BUSCAR ORDEN POR ID > para ADMIN
    @Get('findOrdersByIdAdmin/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findOrderByIdAdmin(@Param('id') orderId: string) {
        return this.orderService.findOrderById(orderId)
    }

    // CANCELAR ORDEN 
    @Patch('cancelOrders/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    cancelOrder(@Param('id') orderId: string) {
        return this.orderService.cancelOrder(orderId)
    }

    // Rembolsar PAGO 
    @Patch('refund/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    refund(@Param('id') orderId: string) {
        return this.orderService.refund(orderId)
    }

}
