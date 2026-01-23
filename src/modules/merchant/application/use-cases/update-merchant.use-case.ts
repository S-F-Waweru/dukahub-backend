import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {IMerchantRepository} from "../../domain/interfaces/merchant.repository.interface";

export interface UpdateMerchantDto {
    businessName?: string;
    physicalAddress?: string;
    kraPin?: string;
}

@Injectable()
export class UpdateMerchantUseCase {
    constructor(
        @Inject(IMerchantRepository)
        private readonly merchantRepo: IMerchantRepository,
    ) {}

    async execute(merchantId: string, dto: UpdateMerchantDto): Promise<void> {
        const merchant = await this.merchantRepo.findById(merchantId);
        if (!merchant) {
            throw new NotFoundException('Merchant not found');
        }

        merchant.updateBusinessInfo(
            dto.businessName,
            dto.physicalAddress,
            dto.kraPin,
        );

        await this.merchantRepo.update(merchant);
    }
}