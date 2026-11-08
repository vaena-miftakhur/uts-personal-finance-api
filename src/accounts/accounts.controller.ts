import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AccountsService } from './accounts.service.js';
import { CreateAccountsDto } from './dto/create-accounts.dto.js';

@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @Get()
    findAll() {
        return this.accountsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.accountsService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateAccountsDto) {
        return this.accountsService.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: CreateAccountsDto) {
        return this.accountsService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.accountsService.remove(id);
    }
}