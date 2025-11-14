import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSchema } from '../persistence/schemas/user.schema';
import { IsNull, Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { AuthProvider } from '../../domain/enums/auth-provier.enums';
import { UserStatus } from '../../domain/enums/user-status.enums';

@Injectable()
class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly repository: Repository<UserSchema>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? this.toDomain(schema) : null;
  }
  async findByEmail(email: Email): Promise<User | null> {
    const schema = await this.repository.findOne({
      where: { email: email.value, deletedAt: IsNull() }
    });
    return schema ? this.toDomain(schema) : null;
  }
  async findByMerchantId(merchantId: string): Promise<User | null> {
    const schema = await this.repository.findOne({
      where: { merchantId, deletedAt: IsNull() },
    });
    return schema ? this.toDomain(schema) : null;
  }
  async save(user: User): Promise<User> {
    const schema = this.toSchema(user);
    const savedSchema = await this.repository.save(schema);
    return this.toDomain(savedSchema);
  }

  async update(user: User): Promise<User> {
    const schema = this.toSchema(user);
    await this.repository.update(user.id, schema);
    const updatedSchema = await this.repository.findOne({
      where: { id: user.id },
    });
    return this.toDomain(updatedSchema!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.update(id, {
      deletedAt: new Date(),
      status: 'DELETED',
    });
  }

  async exists(email: Email): Promise<boolean> {
    const count = await this.repository.count({
      where: { email: email.value, deletedAt: IsNull() },
    });
    return count > 0;
  }
  // Mapper: Database Schema → Domain Entity
  private toDomain(schema: UserSchema): User {
    return User.fromPersistence({
      id: schema.id,
      email: schema.email,
      hashedPassword: schema.passwordHash,
      firstName: schema.firstName,
      lastName: schema.lastName,
      merchantId: schema.merchantId,
      authProvider: schema.authProvider as AuthProvider,
      isEmailVerified: schema.isEmailVerified,
      status: schema.status as UserStatus,
      lastLoginAt: schema.lastLoginAt,
    });
  }
  private toSchema(user: User): Partial<UserSchema> {
    return {
      id: user.id,
      email: user.email.value,
      passwordHash: user.password?.value,
      // phoneNumber: user.phoneNumber?.value,
      firstName: user.firstName,
      lastName: user.lastName,
      // profilePhotoUrl: user.profilePhotoUrl,
      merchantId: user.merchantId,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      updatedAt: new Date(),
    };
  }
}

export default UserRepository;
