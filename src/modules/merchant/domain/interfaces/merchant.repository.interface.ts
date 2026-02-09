import { Merchant } from '../entities/merchant.entity';

export interface IMerchantRepository {
    findById(id: string): Promise<Merchant | null>;
    findByEmail(email: string): Promise<Merchant | null>;
    save(merchant: Merchant): Promise<Merchant>;
    update(merchant: Merchant): Promise<Merchant>;
}
export const IMerchantRepository = Symbol('IMerchantRepository');