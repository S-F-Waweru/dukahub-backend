import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {IMerchantRepository} from "../../domain/interfaces/merchant.repository.interface";

export interface UpdatePaymentInfoDto {
    mpesaTill?: string;
    airtelMoneyNumber?: string;
}

@Injectable()
export class UpdatePaymentInfoUseCase {
    constructor(
        @Inject(IMerchantRepository)
        private readonly merchantRepo: IMerchantRepository,
    ) {}

    async execute(merchantId: string, dto: UpdatePaymentInfoDto): Promise<void> {
        const merchant = await this.merchantRepo.findById(merchantId);
        if (!merchant) {
            throw new NotFoundException('Merchant not found');
        }

        merchant.updatePaymentInfo(dto.mpesaTill, dto.airtelMoneyNumber);
        await this.merchantRepo.update(merchant);
    }
}