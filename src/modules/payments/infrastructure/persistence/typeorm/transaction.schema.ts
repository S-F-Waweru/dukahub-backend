import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payments')
@Index(['merchantId', 'createdAt'])
@Index(['orderId'])
export class TransactionSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column()
  @Index()
  merchantId: string;

  /**
   * varchar — NOT a PostgreSQL enum.
   * This lets us add new PaymentMethod values with zero migrations.
   */
  @Column({ type: 'varchar', length: 50 })
  method: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  /**
   * varchar — NOT a PostgreSQL enum.
   * Same reason as method.
   */
  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string;

  @Column({ nullable: true, name: 'transaction_id' })
  providerTransactionId: string;

  @Column({ nullable: true, name: 'mpesa_receipt_number' })
  providerReceiptNumber: string;

  @Column({ type: 'text', nullable: true, name: 'provider_response' })
  providerResponse: string;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
