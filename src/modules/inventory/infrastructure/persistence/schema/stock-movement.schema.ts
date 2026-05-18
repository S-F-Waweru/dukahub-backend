import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn} from "typeorm";

@Entity('stock_movements')
@Index(['variantId'])
@Index(['merchantId', 'createdAt'])
export class StockMovementSchema {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    variantId: string;

    @Column({ type: 'uuid' })
    merchantId: string;

    @Column()
    movementType: string;

    @Column({ type: 'integer' })
    quantity: number;

    @Column({ type: 'integer' })
    previousStock: number;

    @Column({ type: 'integer' })
    newStock: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    unitCost: number;

    @Column({ nullable: true })
    referenceType: string;

    @Column({ type: 'uuid', nullable: true })
    referenceId: string;

    @Column({ type: 'uuid' })
    performedBy: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;
}