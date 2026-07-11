import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // FK de orden
  @Column({ type: 'uuid' })
  orderId!: string;

  // FK de productos
  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtPurchase!: number;

  @Column({ type: 'varchar', nullable: true })
  downloadToken!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  downloadTokenExpiresAt!: Date | null;

  // Muchas OrderItems pertencen a una orden. Se borra en casadad 
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  // Muchos productos pertenecen a una orden 
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
