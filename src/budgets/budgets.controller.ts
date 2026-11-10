import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { BudgetsService } from './budgets.service.js';
import { UpdateBudgetDto } from './dto/update-budget.dto.js';
import { CreateBudgetDto } from './dto/create-budget.dto.js';

@Controller('budgets')
export class BudgetsController {
    constructor(
        private readonly budgetsService: BudgetsService,
    ) {}

    // Mencari semua data budget
    @Get()
    getBudgets() {
        return this.budgetsService.findAll();
    }

    // membuat data budget baru
    @Post()
    createBudget(@Body() createBudgetDto: CreateBudgetDto) {
        return this.budgetsService.create(createBudgetDto);
    }

    // mencari budget berdasarkan ID
    @Get(':id')
    getBudgetsById(@Param('id', ParseUUIDPipe) id: string){
        return this.budgetsService.findOne(id);
    }

    // Mengubah data budget berdasarkan id
    @Put(':id')
    update(@Param('id', ParseUUIDPipe) id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    ) {
        return this.budgetsService.update(id, updateBudgetDto)
    }

    // mengapus data budget berdasarkan id
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string){
        return this.budgetsService.remove(id);
    }

    // menampilkan ringkasan dan realisasi anggaran
    @Get(':id/summary')
    getBudgetSummary(@Param('id', ParseUUIDPipe) id: string){
        return this.budgetsService.getSummary(id);
    }
}
