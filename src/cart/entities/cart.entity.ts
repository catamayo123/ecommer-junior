import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CouponEntity } from '../../coupons/entities/coupon.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { CartItemEntity } from './cart-item.entity';

@Entity('carts')
export class CartEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActivity!: Date;

  // columna FK con Users
  @Column({ type: 'uuid' })
  userId!: string;

  // columna FK con Coupon
  @Column({ type: 'uuid', nullable: true })
  couponId!: string | null;

  // Un usuario tiene un solo carrito
  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' }) // la FK se llama userId
  user!: UserEntity;

  // Un carriro tiene muchos items
  @OneToMany(() => CartItemEntity, (item) => item.cart, { cascade: true })
  items!: CartItemEntity[];

  // Un carrito tiene o no, muchos cupones
  @ManyToOne(() => CouponEntity)
  @JoinColumn({ name: 'couponId' })
  cupon!: CouponEntity | null;

  @CreateDateColumn()
  createdAt!: Date;
}
