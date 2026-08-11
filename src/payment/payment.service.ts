import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus, PaymentStatus } from '../../enum/index';
import { OrderItemEntity } from '../order/entities/order-item.entity';
import { OrderEntity } from '../order/entities/order.entity';
import { PaymentEntity } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    private readonly jwtService: JwtService,
  ) {}

  // PAGAR ORDEN POR EL ADMIN
  /*
			Crear payment con su status, paidAt, adminId
			Marcar order como paid y completed
			Generar downloadToken para cada OrderItem
	*/
  async pay(paymentId: string, adminId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order', 'order.items'],
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    // Crear pago
    payment.status = PaymentStatus.PAID;
    payment.paidAt = new Date();
    payment.adminId = adminId;
    await this.paymentRepository.save(payment);

    // Marcar Order
    const order = payment.order;
    order.status = OrderStatus.COMPLETED;
    order.paidAt = new Date();
    order.completedAt = new Date();
    await this.orderRepository.save(order);

    // Generar tokens para cada uno de los items de la orden
    for (const items of order.items) {
      const token = this.jwtService.sign({ itemId: items.id, orderId: order.id }, { expiresIn: '24h' });
      items.downloadToken = token;
      items.downloadTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24H
      await this.orderItemRepository.save(items);
    }

    return await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order', 'order.items', 'order.items.product'],
    });
  }
}
