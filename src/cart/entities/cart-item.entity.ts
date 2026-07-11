import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem {
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
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart!: Cart;
  
  // Muchos productos pertenecen a un carrito
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @CreateDateColumn()
  createdAt!: Date;
}
