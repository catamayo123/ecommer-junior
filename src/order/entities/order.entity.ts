import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderStatus } from '../../../enum/index';
import { Payment } from '../../payment/entities/payment.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // FK de usuario
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ type: 'text', nullable: true })
  cancelReason!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total!: number;

  @Column({ type: 'timestamp', nullable: true })
  paidAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt!: Date | null;

  // Muchas ordenes pertenecen a un Usuario
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  // Una orden tiene muchos OrderItems
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  // Una orden tiene un pago 
  @OneToOne(() => Payment, (payment) => payment.order)
  payment!: Payment;

  @CreateDateColumn()
  createdAt!: Date;
}
