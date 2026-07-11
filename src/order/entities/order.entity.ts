import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItems } from "./order-item.entity.";

@Entity('order')
export class Order {

    @PrimaryGeneratedColumn('uuid')
    id!: string;
    
    // FK de usuarios 
    @Column({ type: 'uuid' })
    usersId!: string;

    @Column({ type: 'int', default: 1 })
    total!: number;
    
    // una orden tiene muchas items 
    @OneToMany( () => OrderItems, (orderItems) => orderItems.order, { cascade: true } )
    orderItems! : OrderItems
    
    @CreateDateColumn()
    paidAt!: Date;

    @CreateDateColumn()
    completedAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;
}