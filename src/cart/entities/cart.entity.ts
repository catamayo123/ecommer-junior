import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActivity!: Date;
  
  @CreateDateColumn()
  createdAt!: Date;

  // columna FK con users
  @Column({ type: 'uuid' })
  userId!: string;       
  
  // columna FK con cupon
  @Column({ type: 'uuid', nullable: true })
  couponId!: string | null;

  // Un usuario tiene un solo carrito 
  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' }) // la FK se llama userId
  user!: UserEntity;

  // Un carriro tiene muchos items 
  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items!: CartItem[];

  // Un carrito tiene muchos cupones 
  @ManyToOne(() => Coupon)
  @JoinColumn({name: 'couponId'})
  cupon !: Coupon | null;

}
