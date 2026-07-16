import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { Payment } from '../payment/entities/payment.entity';
import { PassportModule } from '@nestjs/passport';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, OrderItem, Payment]),
        PassportModule.register({ defaultStrategy: 'jwt' })
    ],
    controllers: [DownloadsController],
    providers: [DownloadsService]
})
export class DownloadsModule { }
