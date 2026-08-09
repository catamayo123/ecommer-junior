import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoryEntity } from './entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
