import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { OrderItem } from '../order/entities/order-item.entity';
import { Order } from '../order/entities/order.entity';
import { Payment } from '../payment/entities/payment.entity';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Order, OrderItem, Payment]),
		PassportModule.register({ defaultStrategy: 'jwt' }),
		AuthModule
	],
	controllers: [DownloadsController],
	providers: [DownloadsService]
})
export class DownloadsModule { }
