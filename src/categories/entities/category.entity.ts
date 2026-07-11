import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  slug!: string;

  // FK de la relacion entre las categorias y las subcategorias 
  @Column({ type: 'uuid', nullable: true })
  parentId!: string;

  // Muchas subcategorias pertencen a una sola categoria 
  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent!: Category;

  // Una cageria tiene muchas subcategorias 
  @OneToMany(() => Category, (category) => category.parent)
  children!: Category[];

  @CreateDateColumn()
  createdAt!: Date;
}

/*
  nullable: true  es para que typeorm y la BD sepa que puede ser nulo pq una categoria puede ser padre
  si no se coloca el parentId.
*/
