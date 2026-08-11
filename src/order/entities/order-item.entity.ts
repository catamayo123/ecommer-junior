import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
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

  @Column({ type: 'int', default: 0 })
  renewalCount!: number;

  @Column({ type: 'varchar', nullable: true })
  downloadToken!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  downloadTokenExpiresAt!: Date | null;

  // Muchas OrderItems pertencen a una orden. Se borra en casadad
  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: OrderEntity;

  // Muchos productos pertenecen a una orden
  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product!: ProductEntity;
}
