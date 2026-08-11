import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../products/entities/product.entity';
import { WhishListEntity } from './Entity/wish-list.entity';
import { WishListController } from './wish-list.controller';
import { WishListService } from './wish-list.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhishListEntity, ProductEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [WishListService],
  controllers: [WishListController],
})
export class WishListModule {}
