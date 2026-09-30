import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpensesPageDto } from './dto/expenses-page.dto';
import { ListExpensesQueryDto } from './dto/list-expenses-query.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({
    summary: 'Record a new expense',
    description:
      'Alice (paidBy) → Bob (paidFor) → 50 means Bob owes Alice $50.',
  })
  @ApiCreatedResponse({ type: Expense })
  @ApiBadRequestResponse({
    description: 'Invalid payload or same user on both sides',
  })
  @ApiNotFoundResponse({ description: 'One of the users does not exist' })
  create(@Body() dto: CreateExpenseDto): Promise<Expense> {
    return this.expensesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List expenses, newest first' })
  @ApiOkResponse({ type: ExpensesPageDto })
  findAll(@Query() query: ListExpensesQueryDto): Promise<ExpensesPageDto> {
    return this.expensesService.findAll(query);
  }
}
