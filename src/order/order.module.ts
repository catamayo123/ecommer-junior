import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../cart/cart.module';
import { Payment } from '../payment/entities/payment.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Payment]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CartModule
  ],
  providers: [OrderService],
  controllers: [OrderController]
})
export class OrderModule { }
