import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from '../expenses/entities/expense.entity';
import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])],
  controllers: [BalancesController],
  providers: [BalancesService],
})
export class BalancesModule {}
