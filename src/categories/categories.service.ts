import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category-entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) {}

    // mencari semua data kategori
    async findAll(): Promise<Category[]> {
        return await this.categoryRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    // mencari data kategori berdasarkan id
    async findOne(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({ where: { id } });

        if (!category) {
            throw new NotFoundException(`Kategori ${id} tidak ditemukan`);
        }
        return category;
    }

    // membuat data kategori baru
    async create(dto: CreateCategoryDto): Promise<Category> {
        await this.checkDuplicate(dto.name, dto.type);
        const newCategory = this.categoryRepository.create(dto);
        return await this.categoryRepository.save(newCategory);
    }

    // mengubah data kategori berdasarkan id
    async update(id: string, dto: CreateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);

        if (dto.name !== category.name || dto.type !== category.type) {
            await this.checkDuplicate(dto.name, dto.type);
        }

        const updated = this.categoryRepository.merge(category, dto);
        return await this.categoryRepository.save(updated);
    }

    // menghapus data kategori berdasarkan id (soft delete)
    async remove(id: string): Promise<{ message: string; deletedId: string }> {
        await this.findOne(id);
        await this.categoryRepository.softDelete(id);

        return {
            message: `Kategori ${id} berhasil dihapus`,
            deletedId: id,
        };
    }

    // kategori dengan nama dan type yang sama tidak boleh ganda -> 409
    private async checkDuplicate(name: string, type: string) {
        const exist = await this.categoryRepository.findOneBy({ name, type });
        if (exist) {
            throw new ConflictException(`Kategori ${name} (${type}) sudah ada`);
        }
    }
}