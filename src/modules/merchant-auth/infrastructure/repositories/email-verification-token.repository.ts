import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';

import { EmailVerificationToken } from '../../domain/entities/email-verification-token.entity';
import { EmailVerificationTokenSchema } from '../persistence/schemas/email-verification-token.schema';
import { IEmailVerificationTokenRepository } from '../../domain/interfaces/email-verification-token.repository.interface';

@Injectable()
export class EmailVerificationTokenRepository
  implements IEmailVerificationTokenRepository
{
  constructor(
    @InjectRepository(EmailVerificationTokenSchema)
    private readonly repository: Repository<EmailVerificationTokenSchema>,
  ) {}

  async findById(id: string): Promise<EmailVerificationToken | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? this.toDomain(schema) : null;
  }

  async findByToken(tokenHash: string): Promise<EmailVerificationToken | null> {
    const schema = await this.repository.findOne({
      where: { tokenHash },
    });
    return schema ? this.toDomain(schema) : null;
  }

  async findByUserId(userId: string): Promise<EmailVerificationToken[]> {
    const schemas = await this.repository.find({
      where: { userId },
    });
    return schemas.map((schema) => this.toDomain(schema));
  }

  async save(token: EmailVerificationToken): Promise<EmailVerificationToken> {
    const schema = this.toSchema(token);
    const saved = await this.repository.save(schema);
    return this.toDomain(saved);
  }

  async update(token: EmailVerificationToken): Promise<EmailVerificationToken> {
    const schema = this.toSchema(token);
    await this.repository.update(token.id, schema);
    const updated = await this.repository.findOne({ where: { id: token.id } });
    return this.toDomain(updated!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  // Mapper: Database Schema → Domain Entity
  private toDomain(
    schema: EmailVerificationTokenSchema,
  ): EmailVerificationToken {
    return EmailVerificationToken.fromPersistence({
      id: schema.id,
      tokenHash: schema.tokenHash,
      userId: schema.userId,
      expiresAt: schema.expiresAt,
      isUsed: schema.isUsed,
      usedAt: schema.usedAt,
    });
  }

  // Mapper: Domain Entity → Database Schema
  private toSchema(
    token: EmailVerificationToken,
  ): Partial<EmailVerificationTokenSchema> {
    return {
      id: token.id,
      tokenHash: token.tokenHash,
      userId: token.userId,
      expiresAt: token.expiresAt,
      isUsed: token.isUsed,
      usedAt: token.usedAt,
    };
  }
}
