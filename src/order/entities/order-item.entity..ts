import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { Product } from "../../products/entities/product.entity";

@Entity('order_item')
export class OrderItems {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // FK del carrito 
  @Column({ type: 'uuid' })
  orderId!: string;

  // FK de productos
  @Column({ type: 'uuid' })
  productId!: string;

  // muchos orderItems pertencen a una orden
  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  // Muchos productos pertenecen a un carrito
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product!: Product;
}