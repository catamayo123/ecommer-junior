import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ProductEntity } from "../../products/entities/product.entity";
import { UserEntity } from "../../users/entities/user.entity";

@Entity('whishListEntity')
@Unique(['userId', 'productId']) 				// 1 favorito/usuario/producto
export class WhishListEntity {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column({ type: 'uuid' })
	userId!: string;

	@Column({ type: 'uuid' })
	productId!: string

	@CreateDateColumn()
	createdAt!: Date;

	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: 'userId' })
	user!: UserEntity;

	@ManyToOne(() => ProductEntity)
	@JoinColumn({ name: 'productId' })
	product!: ProductEntity;
}