// src/modules/payments/infrastructure/repositories/transaction.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';

import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionSchema } from '../persistence/typeorm/transaction.schema';
import {
  PaymentMethod,
  TransactionStatus,
} from '../../domain/enums/payament.enum';
import {
  ITransactionRepository,
  TransactionFilters,
} from '../../domain/repositories/transcation.repository.interface';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(TransactionSchema)
    private readonly repo: Repository<TransactionSchema>,
  ) {}

  // ─── Mapping Helpers ──────────────────────────────────────────────

  private toDomain(row: TransactionSchema): Transaction {
    return Transaction.fromPersistence({
      id: row.id,
      orderId: row.orderId,
      merchantId: row.merchantId,
      method: row.method as PaymentMethod,
      amount: Number(row.amount),
      status: row.status as TransactionStatus,
      providerTransactionId: row.providerTransactionId ?? undefined,
      providerReceiptNumber: row.providerReceiptNumber ?? undefined,
      providerResponse: row.providerResponse ?? undefined,
      failureReason: row.failureReason ?? undefined,
      paidAt: row.paidAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

// ❌ Remove the ?? null on all nullable fields
  private toSchema(tx: Transaction): Partial<TransactionSchema> {
    return {
      id: tx.id,
      orderId: tx.orderId,
      merchantId: tx.merchantId,
      method: tx.method,
      amount: tx.amount,
      status: tx.status,
      providerTransactionId: tx.providerTransactionId,  // ← remove ?? null
      providerReceiptNumber: tx.providerReceiptNumber,  // ← remove ?? null
      providerResponse: tx.providerResponse,            // ← remove ?? null
      failureReason: tx.failureReason,                  // ← remove ?? null
      paidAt: tx.paidAt,                                // ← remove ?? null
    };
  }

  // ─── ITransactionRepository Implementation ────────────────────────

  async save(transaction: Transaction): Promise<Transaction> {
    const schema = this.repo.create(this.toSchema(transaction));
    const saved = await this.repo.save(schema);
    return this.toDomain(saved);
  }

  async update(transaction: Transaction): Promise<Transaction> {
    await this.repo.save(this.toSchema(transaction));
    const updated = await this.repo.findOneByOrFail({ id: transaction.id });
    return this.toDomain(updated);
  }

  async findById(id: string, merchantId: string): Promise<Transaction | null> {
    const row = await this.repo.findOne({
      where: { id, merchantId }, // tenant isolation enforced here
    });
    return row ? this.toDomain(row) : null;
  }

  async findByOrderId(orderId: string): Promise<Transaction | null> {
    const row = await this.repo.findOne({ where: { orderId } });
    return row ? this.toDomain(row) : null;
  }

  async findByProviderTransactionId(
    providerTransactionId: string,
  ): Promise<Transaction | null> {
    const row = await this.repo.findOne({ where: { providerTransactionId } });
    return row ? this.toDomain(row) : null;
  }

  async findByMerchant(
    merchantId: string,
    filters: TransactionFilters = {},
  ): Promise<{ data: Transaction[]; total: number }> {
    const query = this.repo.createQueryBuilder('payment')
      .where('payment.merchantId = :merchantId', { merchantId });

    if (filters.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }
    if (filters.from) {
      query.andWhere('payment.createdAt >= :from', { from: filters.from });
    }
    if (filters.to) {
      query.andWhere('payment.createdAt <= :to', { to: filters.to });
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    query
      .orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await query.getManyAndCount();

    return {
      data: rows.map((r) => this.toDomain(r)),
      total,
    };
  }

  async findStalePending(
    merchantId: string | null,
    olderThanMinutes: number,
  ): Promise<Transaction[]> {
    const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);

    const query = this.repo.createQueryBuilder('payment')
      .where('payment.status = :status', { status: TransactionStatus.PENDING })
      .andWhere('payment.createdAt < :cutoff', { cutoff });

    // null = background job sweeping all merchants
    // string = owner manually triggering for their merchant only
    if (merchantId) {
      query.andWhere('payment.merchantId = :merchantId', { merchantId });
    }

    const rows = await query.getMany();
    return rows.map((r) => this.toDomain(r));
  }
}