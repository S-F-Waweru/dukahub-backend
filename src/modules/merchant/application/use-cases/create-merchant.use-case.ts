import { MerchantType } from '../../domain/enums/merchant-type.enum';
import { ConflictException, Inject } from '@nestjs/common';
import { IMerchantRepository } from '../../domain/interfaces/merchant.repository.interface';
import { Merchant } from '../../domain/entities/merchant.entity';

export interface CreateMerchantDto {
  businessName: string;
  type: MerchantType;
  phoneNumber: string;
  email: string;
  physicalAddress?: string;
  kraPin?: string;
}

export class CreateMerchantUseCase {
  constructor(
    @Inject(IMerchantRepository)
    private readonly merchantRepo: IMerchantRepository,
  ) {}

  async execute(dto: CreateMerchantDto, merchantId: string) {
    const existing = await this.merchantRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Merchant with email already exists');
    }
    // Create merchant entity
    const merchant = Merchant.create(
      dto.businessName,
      dto.type,
      dto.phoneNumber,
      dto.email,
      merchantId,
    );

    // Update optional fields if provided
    if (dto.physicalAddress || dto.kraPin) {
      merchant.updateBusinessInfo(undefined, dto.physicalAddress, dto.kraPin);
    }

    // Save merchant
    const savedMerchant = await this.merchantRepo.save(merchant);

    return { merchantId: savedMerchant.id };
  }
}
