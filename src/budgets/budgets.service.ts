import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget-entity.js';
import { Users } from '../users/entities/users-entity.js';
import { Category } from '../categories/entities/category-entity.js';
import { CreateBudgetDto } from './dto/create-budget.dto.js';


@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // Mencari semua data budget
  async findAll(): Promise<Budget[]> {
    return await this.budgetRepository.find({
      relations: { user: true, category: true },
      order: { createdAt: 'DESC' },
    });
  }

  // Mencari budget berdasarkan ID
  async findOne(id: string): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { id },
      relations: { user: true, category: true },
    });

    if (!budget) {
      throw new NotFoundException(`Budget ${id} tidak ditemukan`);
    }
    return budget;
  }

  // Membuat data budget baru
  async create(dto: CreateBudgetDto): Promise<Budget> {
    if (dto.amount <= 0) {
      throw new BadRequestException('Jumlah budget harus lebih dari 0');
    }
    if (dto.endDate < dto.startDate) {
      throw new BadRequestException('Tanggal selesai tidak boleh sebelum tanggal mulai');
    }

    const user = await this.userRepository.findOneBy({ id: dto.userId });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');

    if (category.type !== 'outcome') {
      throw new BadRequestException('Budget hanya untuk kategori pengeluaran');
    }

    const newBudget = this.budgetRepository.create({
      user,
      category,
      amount: dto.amount,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    return await this.budgetRepository.save(newBudget);
  }

  // Mengubah data budget berdasarkan ID
async update(id: string, dto: CreateBudgetDto): Promise<Budget> {
  const budget = await this.findOne(id);

  const user = await this.userRepository.findOneBy({ id: dto.userId });
  if (!user) throw new NotFoundException('User tidak ditemukan');

  const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
  if (!category) throw new NotFoundException('Kategori tidak ditemukan');

  if (category.type !== 'outcome') {
    throw new BadRequestException('Budget hanya untuk kategori pengeluaran');
  }
  if (Number(dto.amount) <= 0) {
    throw new BadRequestException('Jumlah budget harus lebih dari 0');
  }
  if (new Date(dto.endDate) < new Date(dto.startDate)) {
    throw new BadRequestException('Tanggal selesai tidak boleh sebelum tanggal mulai');
  }

  budget.user = user;
  budget.category = category;
  budget.amount = dto.amount;
  budget.startDate = dto.startDate;
  budget.endDate = dto.endDate;

  return await this.budgetRepository.save(budget);
}

  // Menghapus data budget (soft delete)
  async remove(id: string): Promise<{ message: string; deletedId: string }> {
    await this.findOne(id);
    await this.budgetRepository.softDelete(id);

    return { message: `Budget ${id} berhasil dihapus`, deletedId: id };
  }

  // Ringkasan dan realisasi anggaran
  async getSummary(id: string) {
    const budget = await this.findOne(id);

    const result = await this.budgetRepository
      .createQueryBuilder('budget')
      .leftJoin('accounts', 'account', 'account.user_id = budget.user_id')
      .leftJoin(
        'transactions',
        'transaction',
        `transaction.account_id = account.id
        AND transaction.category_id = budget.category_id
        AND transaction.type = :type
        AND transaction.deleted_at IS NULL
        AND transaction.transaction_date BETWEEN budget.start_date AND budget.end_date`,
        { type: 'outcome' },
      )
      .select('COALESCE(SUM(transaction.amount), 0)', 'realization')
      .where('budget.id = :id', { id })
      .getRawOne();

    const totalBudget = Number(budget.amount);
    const realization = Number(result?.realization ?? 0);

    return {
      budgetId: budget.id,
      userId: budget.user.id,
      category: budget.category.name,
      totalBudget,
      realization,
      remaining: totalBudget - realization,
      percentage: totalBudget > 0 ? Number(((realization / totalBudget) * 100).toFixed(2)) : 0,
      startDate: budget.startDate,
      endDate: budget.endDate,
    };
  }
}