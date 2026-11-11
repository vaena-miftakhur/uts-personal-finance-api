import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';

import { TransactionsService } from './transactions.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
  ) {}

  // Menampilkan semua transaksi
  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('summary')
  summary() {
    return this.transactionsService.summary();
  }

  // Menampilkan transaksi berdasarkan ID
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.transactionsService.findById(id);
  }

  // Menambahkan transaksi
  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  // Mengubah transaksi
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, dto);
  }

  // Menghapus transaksi
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}