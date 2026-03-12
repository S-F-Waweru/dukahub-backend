import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { CreateCategoryUseCase } from '../../application/use-cases/create-category.usecase';

import { CreateCategoryDto } from '../dtos/create-category.dto';
import {JwtAuthGuard} from "../../../merchant-auth/presentation/guards/jwt-auth.guard";
import {ListCategoriesUseCase} from "../../application/use-cases/list-categgory.usecase";
import {GetCategoryUseCase} from "../../application/use-cases/get-category.usecase";
import {CurrentUser} from "../../../merchant-auth/presentation/decorators/current-user.decorator";

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
    constructor(
        private createCategoryUseCase: CreateCategoryUseCase,
        private listCategoriesUseCase: ListCategoriesUseCase,
        private getCategoryUseCase: GetCategoryUseCase,
    ) {}

    @Post()
    async create(
        @Body() dto: CreateCategoryDto,
        @CurrentUser('merchantId') merchantId: string,
    ) {
        const result = await this.createCategoryUseCase.execute({
            ...dto,
            merchantId,
        });
        return { success: true, data: result };
    }

    @Get()
    async list(@CurrentUser('merchantId') merchantId: string) {
        const categories = await this.listCategoriesUseCase.execute(merchantId);
        return { success: true, data: categories };
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        const category = await this.getCategoryUseCase.execute(id);
        return { success: true, data: category };
    }
}