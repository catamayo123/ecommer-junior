import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../cart/cart.module';
import { PaymentEntity } from '../payment/entities/payment.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, PaymentEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CartModule
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService]
})
export class OrderModule { }
