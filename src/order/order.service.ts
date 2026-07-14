import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus, PaymentStatus } from '../../enum/index';
import { CartService } from '../cart/cart.service';
import { Payment } from '../payment/entities/payment.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        private readonly cartService: CartService,
        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
    ) { }

    // CREAR ORDEN. QUE HACE ?
    /* 
        Crea una Order a partir de un carrito.
        Crea un OrderItem a partir de order 
        crea Payment para esa orden 
        Limpia carrito
        Retorna una Orden con todas sus relaciones 
    */
    async checkoutOrder(userId: string) {
        const cart = await this.cartService.getCart(userId)

        if (!cart.items || cart.items.length === 0) {
            throw new BadRequestException('El carrito está vacío.')
        }

        // some retorna true si no existe un items o mas con product en null, o undefine
        const existedProductItem = cart.items.some((item) => !item.product)

        // validar todos items tengan un producto
        if (existedProductItem) {
            throw new BadRequestException('Uno o mas productos del carrito ya no estan disponible')
        }

        const total = cart.summary.total
        // crear order a partir del carrito cart
        const order = this.orderRepository.create({
            userId,
            status: OrderStatus.PENDING,
            total
        });
        const saveOrder = await this.orderRepository.save(order)

        // Recorre todo los items del carrito con map y al final lo salva save(orderItems)
        const orderItems = cart.items.map((item: { product: { id: string } | null, priceAtPurchase: number }) =>
            this.orderItemRepository.create({
                orderId: saveOrder.id,
                productId: item.product?.id,
                priceAtPurchase: item.priceAtPurchase
            })
        )
        await this.orderItemRepository.save(orderItems)

        // crear payment 
        const payment = this.paymentRepository.create({
            orderId: saveOrder.id,
            method: 'simulated',
            status: PaymentStatus.PENDING
        });
        await this.paymentRepository.save(payment)

        // limpiar carrito 
        await this.cartService.clearCart(userId)

        // retornar la orden con todas sus relaciones 
        return await this.orderRepository.findOne({
            where: { id: saveOrder.id },
            relations: ['items', 'items.product', 'payment']
        });
    }

    // BUSCAR TODAS LAS ORDENES O HISTORIAL DE ORDENES, mostrando las nuevas ordenes primero
    async findAllOrder(userId: string) {
        return await this.orderRepository.find({
            where: { userId },
            relations: ['items', 'items.product', 'payment'],
            order: { createdAt: 'DESC' }
        })
    }

    // BUSCAR ORDEN POR ID
    async findOrderById(orderId: string, userId?: string) {
        // si entra por parametro userId, agg al where
        const where: any = { id: orderId };
        if (userId) where.userId = userId;

        const order = await this.orderRepository.findOne({
            where,
            relations: ['items', 'items.product', 'payment']
        })

        // Si no existe la orden retorna exception
        if (!order) {
            throw new NotFoundException('Orden no encontrada')
        }

        return order
    }

    // CANCELAR ORDEN
    async cancelOrder(orderId: string, reason?: string) {
        const order = await this.findOrderById(orderId)

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('La orden solo se puede cancelar en estado pendiente')
        }

        order.status = OrderStatus.CANCELLED
        if (reason) order.cancelReason = reason
        return await this.orderRepository.save(order);
    }

    // REEMBOLSAR ORDENES, SOLO PAGADAS O COMPLETADAS
    async refund(orderId: string, reason?: string) {
        const order = await this.findOrderById(orderId)

        if (order.status !== OrderStatus.COMPLETED) {
            throw new BadRequestException('Solo se pueden reembolsar Ordenes pagadas o completadas')
        }

        order.status = OrderStatus.REFUNDED
        if (reason) order.cancelReason = reason

        return await this.orderRepository.save(order)
    }
}
