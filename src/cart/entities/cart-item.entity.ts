import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { CartEntity } from './cart.entity';

@Entity('cart_items')
export class CartItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // FK del carrito
  @Column({ type: 'uuid' })
  cartId!: string;

  // FK de productos
  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtPurchase!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  appliedDiscount!: number;

  // muchos items pertencen a un carrito
  @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart!: CartEntity;

  // Muchos productos pertenecen a un carrito
  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product!: ProductEntity;

  @CreateDateColumn()
  createdAt!: Date;
}
