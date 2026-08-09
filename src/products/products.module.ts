import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductEntity } from './entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
