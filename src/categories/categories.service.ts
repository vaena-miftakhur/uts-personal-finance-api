import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { Category } from './entities/category-entity.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, type } = createCategoryDto;

    // Cek agar tidak ada kombinasi nama + tipe ganda
    const existingCategory = await this.categoryRepository.findOne({
      where: { name, type },
    });

    if (existingCategory) {
      throw new ConflictException(
        `Kategori "${name}" dengan tipe "${type}" sudah ada.`,
      );
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Kategori dengan ID "${id}" tidak ditemukan`);
    }
    return category;
  }
}