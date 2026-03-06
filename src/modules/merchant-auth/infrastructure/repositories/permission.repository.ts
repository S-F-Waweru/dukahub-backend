import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPermissionRepository } from '../../domain/interfaces/permission.repository.interface';
import { Permission } from '../../domain/entities/permission.entity';
import { PermissionSchema } from '../persistence/schemas/permission.schema';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(PermissionSchema)
    private readonly repository: Repository<PermissionSchema>,
  ) {}

  async findById(id: string): Promise<Permission | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? this.toDomain(schema) : null;
  }

  async findByName(name: string): Promise<Permission | null> {
    const schema = await this.repository.findOne({ where: { name } });
    return schema ? this.toDomain(schema) : null;
  }

  async findByResource(resource: string): Promise<Permission[]> {
    const schemas = await this.repository.find({ where: { resource } });
    return schemas.map((schema) => this.toDomain(schema));
  }

  async findByAction(action: string): Promise<Permission[]> {
    const schemas = await this.repository.find({ where: { action } });
    return schemas.map((schema) => this.toDomain(schema));
  }

  async save(permission: Permission): Promise<Permission> {
    const schema = this.toSchema(permission);
    const saved = await this.repository.save(schema);
    return this.toDomain(saved);
  }

  async update(permission: Permission): Promise<Permission> {
    const schema = this.toSchema(permission);
    await this.repository.update(permission.id, schema);
    const updated = await this.repository.findOne({
      where: { id: permission.id },
    });
    return this.toDomain(updated!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(): Promise<Permission[]> {
    const schemas = await this.repository.find();
    return schemas.map((schema) => this.toDomain(schema));
  }

  async findByResourceAndAction(
    resource: string,
    action: string,
  ): Promise<Permission[]> {
    const schemas = await this.repository.find({
      where: { resource, action },
    });
    return schemas.map((schema) => this.toDomain(schema));
  }

  async exists(name: string): Promise<boolean> {
    const count = await this.repository.count({ where: { name } });
    return count > 0;
  }

  // Mapper: Database Schema → Domain Entity
  private toDomain(schema: PermissionSchema): Permission {
    return Permission.fromPersistence({
      id: schema.id,
      name: schema.name,
      resource: schema.resource,
      action: schema.action,
      description: schema.description,
    });
  }

  // Mapper: Domain Entity → Database Schema
  private toSchema(permission: Permission): Partial<PermissionSchema> {
    return {
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
    };
  }
}
