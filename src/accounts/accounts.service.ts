import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Accounts } from './entities/accounts-entity.js';
import { Users } from '../users/entities/users-entity.js';
import { CreateAccountsDto } from './dto/create-accounts.dto.js';

@Injectable()
export class AccountsService {
    constructor(
        @InjectRepository(Accounts)
        private accountRepository: Repository<Accounts>,
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
    ) {}

    // mencari semua data akun
    async findAll(): Promise<Accounts[]> {
        return await this.accountRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    // mencari data akun berdasarkan id
    async findOne(id: string): Promise<Accounts> {
        const account = await this.accountRepository.findOne({ where: { id } });

        if (!account) {
            throw new NotFoundException(`Akun ${id} tidak ditemukan`);
        }
        return account;
    }

    // membuat data akun baru
    async create(dto: CreateAccountsDto): Promise<Accounts> {
        await this.checkUser(dto.user_id);
        const newAccount = this.accountRepository.create(dto);
        return await this.accountRepository.save(newAccount);
    }

    // mengupdate data akun berdasarkan id
    async update(id: string, dto: CreateAccountsDto): Promise<Accounts> {
        const account = await this.findOne(id);
        await this.checkUser(dto.user_id);
        const updated = this.accountRepository.merge(account, dto);
        return await this.accountRepository.save(updated);
    }

    // menghapus data akun berdasarkan id
    async remove(id: string): Promise<{ message: string; deletedId: string }> {
        await this.findOne(id);
        await this.accountRepository.softDelete(id);

        return {
            message: `Akun ${id} berhasil dihapus`,
            deletedId: id,
        };
    }

    // memastikan user ada, kalau tidak -> 404
    private async checkUser(userId: string) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException(`User ${userId} tidak ditemukan`);
        }
    }
}