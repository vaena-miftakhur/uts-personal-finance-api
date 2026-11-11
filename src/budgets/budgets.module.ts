import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller.js';
import { BudgetsService } from './budgets.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entities/budget-entity.js';
import { Users } from '../users/entities/users-entity.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { Category } from '../categories/entities/category-entity.js';


@Module({
  imports: [TypeOrmModule.forFeature([Budget, Users, Category, Transaction])],
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService]
})
export class BudgetsModule {}
