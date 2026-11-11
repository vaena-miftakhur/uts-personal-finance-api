import { PrimaryGeneratedColumn, Column, Entity, JoinColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Users } from "../../users/entities/users-entity.js";
import { Category } from "../../categories/entities/category-entity.js";

@Entity({name: 'budgets'})
export class Budget{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Users, {onDelete: 'RESTRICT'})
    @JoinColumn({name: 'user_id'})
    user: Users

    @ManyToOne(() => Category, {onDelete: 'RESTRICT'})
    @JoinColumn({name: 'category_id'})
    category: Category

    @Column({type: 'decimal', precision:14, scale: 2})
    amount: number;

    @Column({ type: 'date', name: 'start_date' })
    startDate: string;

    @Column({ type: 'date', name: 'end_date' })
    endDate: string;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    updateAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}