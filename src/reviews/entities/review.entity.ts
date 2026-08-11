import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('reviewsEntity')
@Unique(['userId', 'productId']) //  restriccion 1 reseña/usuario/producto
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  rating!: number; // 1- 5

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ type: 'boolean', default: true })
  visible!: boolean; // soft-hide

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @CreateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product!: ProductEntity;
}
