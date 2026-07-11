import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentStatus } from '../../../enum/index';
import { Order } from '../../order/entities/order.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('payments')
export class Payment {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  method!: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ type: 'timestamp', nullable: true })
  paidAt!: Date | null;

  // FK de orden
  @Column({ type: 'uuid' })
  orderId!: string;

  // FK de usuario solo el usuario admin, puede ser nulo
  @Column({ type: 'uuid', nullable: true })
  adminId!: string | null;

  // Un pago tiene una Orden
  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  // Muchos pagos son manejados por un usuario: Admin
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'adminId' })
  admin!: UserEntity | null;
}
