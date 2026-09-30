import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ListExpensesQueryDto } from './dto/list-expenses-query.dto';
import { ExpensesPageDto } from './dto/expenses-page.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateExpenseDto): Promise<Expense> {
    const { paidById, paidForId, amount, description } = dto;

    //Check both are not same
    if (paidById === paidForId) {
      throw new BadRequestException(
        'An expense cannot be recorded between the same user',
      );
    }

    const users = await this.usersService.findByIds([paidById, paidForId]);
    // Find Users based on IDs in request body
    const paidBy = users.find((user) => user.id === paidById);
    const paidFor = users.find((user) => user.id === paidForId);

    // Validation for 404
    if (!paidBy) {
      throw new NotFoundException(`User with id ${paidById} not found`);
    }
    if (!paidFor) {
      throw new NotFoundException(`User with id ${paidForId} not found`);
    }
    return this.expensesRepository.save(
      this.expensesRepository.create({
        amount,
        description,
        paidById,
        paidForId,
        paidBy,
        paidFor,
      }),
    );
  }

  //   Return All expenses
  async findAll({
    page,
    limit,
  }: ListExpensesQueryDto): Promise<ExpensesPageDto> {
    const [items, total] = await this.expensesRepository.findAndCount({
      relations: { paidBy: true, paidFor: true },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
