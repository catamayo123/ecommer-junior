import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from '../order/order.module';
import { AdminService } from './admin.service';
import { UserEntity } from './entities/user.entity';
import { ProfileController } from './profile.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), PassportModule.register({ defaultStrategy: 'jwt' }), OrderModule],
  providers: [UsersService, AdminService],
  controllers: [UsersController, ProfileController],
  exports: [UsersService],
})
export class UsersModule {}
