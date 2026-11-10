
import {
    Injectable,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Budget } from './entities/budget-entity.js';
import { CreateBudgetDto } from './dto/create-budget.dto.js';
import { UpdateBudgetDto } from './dto/update-budget.dto.js';

@Injectable()
export class BudgetsService {
    constructor(
        @InjectRepository(Budget)
        private readonly budgetRepository: Repository<Budget>
    ) {}

    // Mencari semua data budget
    async findAll(): Promise<Budget[]> {
        return await this.budgetRepository.find({
            relations: {
                user: true,
                category: true
            },
            order: { createdAt: 'DESC' }
        });
    }

    // Membuat data budget baru
    async create(budget: CreateBudgetDto): Promise<Budget> {

        if (budget.amount <= 0) {
            throw new BadRequestException(
                'Jumlah budget harus lebih dari 0'
            );
        }

        if (budget.endDate < budget.startDate) {
            throw new BadRequestException(
                'Tanggal selesai tidak boleh sebelum tanggal mulai'
            );
        }

        const newBudget = this.budgetRepository.create({
            user: { id: budget.userId },
            category: { id: budget.categoryId },
            amount: budget.amount,
            startDate: budget.startDate,
            endDate: budget.endDate
        });

        return await this.budgetRepository.save(newBudget);
    }

    // Mencari budget berdasarkan ID
    async findOne(id: string): Promise<Budget> {
        const budget = await this.budgetRepository.findOne({
            where: { id },
            relations: {
                user: true,
                category: true
            }
        });

        if (!budget) {
            throw new NotFoundException(
                `Budget ${id} tidak ditemukan`
            );
        }

        return budget;
    }

    // Mengubah data budget berdasarkan ID
    async update(
        id: string,
        updateBudget: UpdateBudgetDto
    ): Promise<Budget> {

        const budget = await this.findOne(id);

        const updatedBudget = this.budgetRepository.merge(
            budget,
            updateBudget
        );

        if (updateBudget.userId) {
            updatedBudget.user = {
                id: updateBudget.userId
            } as any;
        }

        if (updateBudget.categoryId) {
            updatedBudget.category = {
                id: updateBudget.categoryId
            } as any;
        }

        if (updatedBudget.amount <= 0) {
            throw new BadRequestException(
                'Jumlah budget harus lebih dari 0'
            );
        }

        if (updatedBudget.endDate < updatedBudget.startDate) {
            throw new BadRequestException(
                'Tanggal selesai tidak boleh sebelum tanggal mulai'
            );
        }

        return await this.budgetRepository.save(updatedBudget);
    }

    // Menghapus data budget berdasarkan ID
    async remove(
        id: string
    ): Promise<{ message: string; deleteId: string }> {

        await this.findOne(id);

        await this.budgetRepository.delete(id);

        return {
            message: `Budget ${id} berhasil dihapus`,
            deleteId: id
        };
    }

    // Menampilkan ringkasan dan realisasi anggaran
    async getSummary(id: string) {

        const budget = await this.findOne(id);

        const result = await this.budgetRepository
            .createQueryBuilder('budget')
            .leftJoin(
                'transactions',
                'transaction',
                `transaction.category_id = budget.category_id
                AND transaction.transaction_date BETWEEN budget.start_date AND budget.end_date
                AND transaction.type = :type`,
                { type: 'expense' }
            )
            .leftJoin(
                'accounts',
                'account',
                'account.id = transaction.account_id'
            )
            .select(
                'COALESCE(SUM(transaction.amount), 0)',
                'realization'
            )
            .where('budget.id = :id', { id })
            .andWhere('account.user_id = budget.user_id')
            .getRawOne();

        const totalBudget = Number(budget.amount);
        const realization = Number(result.realization);

        return {
            budgetId: budget.id,
            userId: budget.user.id,
            category: budget.category.name,
            totalBudget,
            realization,
            remaining: totalBudget - realization,
            percentage: totalBudget > 0
                ? Number(
                    ((realization / totalBudget) * 100).toFixed(2)
                )
                : 0,
            startDate: budget.startDate,
            endDate: budget.endDate
        };
    }
}
