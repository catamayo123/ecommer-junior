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
  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items!: CartItem[];

  // Un carrito tiene o no, muchos cupones 
  @ManyToOne(() => Coupon)
  @JoinColumn({name: 'couponId'})
  cupon!: Coupon | null;

  @CreateDateColumn()
  createdAt!: Date;

}
