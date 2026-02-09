import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import { Merchant } from '../../domain/entities/merchant.entity';
import {IMerchantRepository} from "../../domain/interfaces/merchant.repository.interface";

@Injectable()
export class GetMerchantUseCase {
    constructor(
        @Inject(IMerchantRepository)
        private readonly merchantRepo: IMerchantRepository,
    ) {}

    async execute(merchantId: string): Promise<Merchant> {
        const merchant = await this.merchantRepo.findById(merchantId);
        if (!merchant) {
            throw new NotFoundException('Merchant not found');
        }
        return merchant;
    }
}