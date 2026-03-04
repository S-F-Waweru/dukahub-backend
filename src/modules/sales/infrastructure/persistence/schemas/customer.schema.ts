import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('customers')
@Index(['merchantId', 'phoneNumber'], { unique: true })
@Index(['merchantId', 'email'])
@Index(['merchantId', 'lastOrderAt'])
export class CustomerSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  merchantId: string;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ type: 'integer', default: 0 })
  orderCount: number;

  @Column({ type: 'timestamp', nullable: true })
  firstOrderAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastOrderAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
