import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

export enum ProductType {
  COURSE = 'course',
  EBOOK = 'ebook',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'enum', enum: ProductType })
  productType!: ProductType;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  coverImage!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileName!: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  discountPercent!: number;

  @Column({ type: 'timestamp', nullable: true })
  discountEndDate!: Date;

  // FK de Categorias
  @Column({ type: 'uuid', nullable: true })
  categoryId!: string;

  // Muchos productos pertenecen a una categoria
  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @CreateDateColumn()
  createdAt!: Date;
}
