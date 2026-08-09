import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { OrderItemEntity } from '../order/entities/order-item.entity';
import { OrderEntity } from '../order/entities/order.entity';
import { PaymentEntity } from '../payment/entities/payment.entity';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, PaymentEntity]),
		PassportModule.register({ defaultStrategy: 'jwt' }),
		AuthModule
	],
	controllers: [DownloadsController],
	providers: [DownloadsService]
})
export class DownloadsModule { }
