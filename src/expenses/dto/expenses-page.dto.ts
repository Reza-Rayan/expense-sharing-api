import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { Expense } from '../entities/expense.entity';

export class ExpensesPageDto {
  items!: Expense[];
  meta!: PageMetaDto;
}