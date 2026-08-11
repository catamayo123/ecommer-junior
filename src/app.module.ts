import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { CouponsModule } from './coupons/coupons.module';
import { DownloadsModule } from './downloads/downloads.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { WishListModule } from './wish-list/wish-list.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'config/.dev.env',
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),

    // archivos estaticos publicos: SOLO portadas
    // los archivos pagados se guardan en private-files y se sirven con token
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads', 'portadas'),
      serveRoot: '/uploads/portadas',
    }),

    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    CouponsModule,
    OrderModule,
    PaymentModule,
    DownloadsModule,
    ReviewsModule,
    WishListModule,
  ],
})
export class AppModule {}
