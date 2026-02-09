import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../../domain/entities/merchant.entity';
import { MerchantSchema } from '../persistence/typeorm/merchant.schema';
import {IMerchantRepository} from "../../domain/interfaces/merchant.repository.interface";

@Injectable()
export class MerchantRepository implements IMerchantRepository {
    constructor(
        @InjectRepository(MerchantSchema)
        private readonly repo: Repository<MerchantSchema>,
    ) {}

    async findById(id: string): Promise<Merchant | null> {
        const schema = await this.repo.findOne({ where: { id } });
        return schema ? this.toDomain(schema) : null;
    }

    async findByEmail(email: string): Promise<Merchant | null> {
        const schema = await this.repo.findOne({ where: { email } });
        return schema ? this.toDomain(schema) : null;
    }

    async save(merchant: Merchant): Promise<Merchant> {
        const schema = this.toSchema(merchant);
        const saved = await this.repo.save(schema);
        return this.toDomain(saved);
    }

    async update(merchant: Merchant): Promise<Merchant> {
        const schema = this.toSchema(merchant);
        await this.repo.save(schema);
        return merchant;
    }

    private toSchema(merchant: Merchant): MerchantSchema {
        const schema = new MerchantSchema();
        schema.id = merchant.id;
        schema.businessName = merchant.businessName.value;
        schema.type = merchant.type;
        schema.phoneNumber = merchant.phoneNumber;
        schema.email = merchant.email;
        if(merchant.physicalAddress){
            schema.physicalAddress = merchant.physicalAddress;
        }
      if (merchant.kraPin?.value){
          schema.kraPin = merchant.kraPin?.value;
      }
      if(merchant.mpesaTill){
          schema.mpesaTill = merchant.mpesaTill;
      }
       if(merchant.airtelMoneyNumber){
           schema.airtelMoneyNumber = merchant.airtelMoneyNumber;
       }

        schema.status = merchant.status;
        schema.subscriptionTier = merchant.subscriptionTier;
        schema.onboardedAt = merchant.onboardedAt;
        return schema;
    }

    private toDomain(schema: MerchantSchema): Merchant {
        return Merchant.fromPersistence({
            id: schema.id,
            businessName: schema.businessName,
            type: schema.type,
            phoneNumber: schema.phoneNumber,
            email: schema.email,
            physicalAddress: schema.physicalAddress,
            kraPin: schema.kraPin,
            mpesaTill: schema.mpesaTill,
            airtelMoneyNumber: schema.airtelMoneyNumber,
            status: schema.status,
            subscriptionTier: schema.subscriptionTier,
            onboardedAt: schema.onboardedAt,
        });
    }
}