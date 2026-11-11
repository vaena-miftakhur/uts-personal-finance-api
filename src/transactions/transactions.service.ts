import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity.js';
import { Accounts } from '../accounts/entities/accounts-entity.js';
import { Category } from '../categories/entities/category-entity.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Accounts)
    private readonly accountRepository: Repository<Accounts>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // Menampilkan semua transaksi
  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.find({
      relations: { accounts: true, category: true },
      order: { createdAt: 'DESC' },
    });
  }

  // Ringkasan: total pemasukan, pengeluaran, selisih
  async summary() {
    const rows = await this.transactionRepository
      .createQueryBuilder('t')
      .select('t.type', 'type')
      .addSelect('SUM(t.amount)', 'total')
      .groupBy('t.type')
      .getRawMany();

    const totalIncome = Number(rows.find((r) => r.type === 'income')?.total ?? 0);
    const totalOutcome = Number(rows.find((r) => r.type === 'outcome')?.total ?? 0);

    return { totalIncome, totalOutcome, balance: totalIncome - totalOutcome };
  }

  // Menampilkan transaksi berdasarkan ID
  async findById(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: { accounts: true, category: true },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaksi ${id} tidak ditemukan`);
    }
    return transaction;
  }

  // Menambahkan transaksi
  async create(dto: CreateTransactionDto): Promise<Transaction> {
    if (dto.amount <= 0) {
      throw new BadRequestException('Nominal transaksi harus lebih dari 0');
    }

    const accounts = await this.accountRepository.findOne({ where: { id: dto.accountsId } });
    if (!accounts) throw new NotFoundException('Akun tidak ditemukan');

    const category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');

    if (category.type !== dto.type) {
      throw new BadRequestException('Tipe transaksi harus sama dengan tipe kategori');
    }

    const transaction = this.transactionRepository.create({
      accounts,
      category,
      type: dto.type,
      amount: dto.amount,
      transactionDate: dto.transactionDate,
      description: dto.description ?? null,
    });

    return this.transactionRepository.save(transaction);
  }

  // Mengubah transaksi
  async update(id: string, dto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findById(id);

    if (dto.accountsId) {
      const accounts = await this.accountRepository.findOne({ where: { id: dto.accountsId } });
      if (!accounts) throw new NotFoundException('Akun tidak ditemukan');
      transaction.accounts = accounts;
    }

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Kategori tidak ditemukan');
      transaction.category = category;
    }

    const newType = dto.type ?? transaction.type;
    if (newType !== 'income' && newType !== 'outcome') {
      throw new BadRequestException('Tipe transaksi harus income atau outcome');
    }
    if (transaction.category.type !== newType) {
      throw new BadRequestException('Tipe transaksi harus sama dengan tipe kategori');
    }

    if (dto.amount !== undefined) {
      if (dto.amount <= 0) {
        throw new BadRequestException('Nominal transaksi harus lebih dari 0');
      }
      transaction.amount = dto.amount;
    }

    transaction.type = newType;
    if (dto.transactionDate !== undefined) transaction.transactionDate = dto.transactionDate;
    if (dto.description !== undefined) transaction.description = dto.description;

    return this.transactionRepository.save(transaction);
  }

  // Menghapus transaksi (soft delete)
  async remove(id: string): Promise<{ message: string; deletedId: string }> {
    await this.findById(id);
    await this.transactionRepository.softDelete(id);

    return { message: `Transaksi ${id} berhasil dihapus`, deletedId: id };
  }
}