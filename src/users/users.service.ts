import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Users } from './entities/users-entity.js';
import { CreateUsersDto } from './dto/create-users.dto.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
    ) {}

    // mencari semua data user (tanpa password)
    async findAll(): Promise<Users[]> {
        return await this.userRepository.find({
            select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
            order: { createdAt: 'DESC' },
        });
    }

    // mencari data user berdasarkan id
    async findOne(id: string): Promise<Users> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
        });

        if (!user) {
            throw new NotFoundException(`User ${id} tidak ditemukan`);
        }
        return user;
    }

    // membuat data user baru
    async create(dto: CreateUsersDto): Promise<Users> {
        const exist = await this.userRepository.findOneBy({ email: dto.email });
        if (exist) {
            throw new ConflictException('Email sudah terdaftar');
        }

        const hashed = await bcrypt.hash(dto.password, 10);
        const saved = await this.userRepository.save(
            this.userRepository.create({ ...dto, password: hashed }),
        );
        return await this.findOne(saved.id);
    }

    // mengupdate data user berdasarkan id
    async update(id: string, dto: CreateUsersDto): Promise<Users> {
        const user = await this.findOne(id);

        if (dto.email !== user.email) {
            const exist = await this.userRepository.findOneBy({ email: dto.email });
            if (exist) {
                throw new ConflictException('Email sudah terdaftar');
            }
        }

        const hashed = await bcrypt.hash(dto.password, 10);
        await this.userRepository.save(
            this.userRepository.merge(user, { ...dto, password: hashed }),
        );
        return await this.findOne(id);
    }

    // menghapus data user berdasarkan id
    async remove(id: string): Promise<{ message: string; deletedId: string }> {
        await this.findOne(id);
        await this.userRepository.softDelete(id);

        return {
            message: `User ${id} berhasil dihapus`,
            deletedId: id,
        };
    }
}