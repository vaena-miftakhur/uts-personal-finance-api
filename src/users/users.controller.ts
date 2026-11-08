import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUsersDto } from './dto/create-users.dto.js';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // mencari semua data user
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    // mencari data user berdasarkan id
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.findOne(id);
    }

    // menambahkan data user baru
    @Post()
    create(@Body() dto: CreateUsersDto) {
        return this.usersService.create(dto);
    }

    // mengubah data user berdasarkan id
    @Put(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateUsersDto) {
        return this.usersService.update(id, dto);
    }

    // menghapus data user berdasarkan id
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.remove(id);
    }
}