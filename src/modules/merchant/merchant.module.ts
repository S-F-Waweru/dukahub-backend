import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Schema
import { MerchantSchema } from './infrastructure/persistence/typeorm/merchant.schema';

// Repository
import { MerchantRepository } from './infrastructure/repositories/merchant.repository';


// Use Cases
import { CreateMerchantUseCase } from './application/use-cases/create-merchant.use-case';
import { UpdateMerchantUseCase } from './application/use-cases/update-merchant.use-case';
import { GetMerchantUseCase } from './application/use-cases/get-merchant.use-case';
import { UpdatePaymentInfoUseCase } from './application/use-cases/update-payment-info.use-case';

// Controller
import { MerchantController } from './presentation/controllers/merchant.controller';
import {IMerchantRepository} from "./domain/interfaces/merchant.repository.interface";

const useCases = [
    CreateMerchantUseCase,
    UpdateMerchantUseCase,
    GetMerchantUseCase,
    UpdatePaymentInfoUseCase,
];

const repositories = [
    {
        provide: IMerchantRepository,
        useClass: MerchantRepository,
    },
];

@Module({
    imports: [TypeOrmModule.forFeature([MerchantSchema])],
    controllers: [MerchantController],
    providers: [...useCases, ...repositories],
    exports: [
        // Export for Auth module to use during registration
        CreateMerchantUseCase,
        GetMerchantUseCase,
        IMerchantRepository,
    ],
})
export class MerchantModule {}