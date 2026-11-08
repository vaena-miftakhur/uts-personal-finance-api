import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accounts } from './entities/accounts-entity.js';
import { Users } from '../users/entities/users-entity.js';
import { AccountsService } from './accounts.service.js';
import { AccountsController } from './accounts.controller.js';

@Module({
    imports: [TypeOrmModule.forFeature([Accounts, Users])],
    controllers: [AccountsController],
    providers: [AccountsService],
})
export class AccountsModule {}