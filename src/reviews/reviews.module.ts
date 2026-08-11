import { Module } from '@nestjs/common';
import { ProductEntity } from '../products/entities/product.entity';
import { ReviewEntity } from './entities/review.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemEntity } from '../order/entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewEntity, ProductEntity, OrderItemEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
