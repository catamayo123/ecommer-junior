import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus, PaymentStatus } from '../../enum/index';
import { Repository } from 'typeorm';
import { OrderItem } from '../order/entities/order-item.entity';
import { Order } from '../order/entities/order.entity';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,
        private readonly jwtService: JwtService
    ) { }

    // PAGAR ORDEN POR EL ADMIN 
    /*
        Crear payment con su status, paidAt, adminId
        Marcar order como paid y completed
        Generar downloadToken para cada OrderItem
    */
    async pay(paymentId: string, adminId: string) {
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId },
            relations: ['order', 'order.items']
        })

        if (!payment) {
            throw new NotFoundException('Pago no encontrado')
        }

        // Crear pago 
        payment.status = PaymentStatus.PAID;
        payment.paidAt = new Date();
        payment.adminId = adminId;
        await this.paymentRepository.save(payment)

        // Marcar Order
        const order = payment.order;
        order.status = OrderStatus.COMPLETED;
        order.paidAt = new Date();
        order.completedAt = new Date();
        await this.orderRepository.save(order)

        // Generar tokens para cada uno de los items de la orden 
        for (const items of order.items) {
            const token = this.jwtService.sign(
                { itemId: items.id, orderId: order.id },
                { expiresIn: '24' }
            )
            items.downloadToken = token
            items.downloadTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24H
            await this.orderItemRepository.save(items)
        }

        return await this.paymentRepository.findOne({
            where: { id: paymentId },
            relations: ['order', 'order.items', 'order.items.product']
        })
    }
}
