import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { centsToDollars } from '../common/transformers/money.transformer';
import { Expense } from '../expenses/entities/expense.entity';
import { BalanceDto } from './dto/balance.dto';

interface NetBalanceRow {
  debtorId: number;
  debtorName: string;
  creditorId: number;
  creditorName: string;
  amountCents: string;
}

const NET_BALANCES_SQL = `
    SELECT debtor.id     AS "debtorId",
           debtor.name   AS "debtorName",
           creditor.id   AS "creditorId",
           creditor.name AS "creditorName",
           ABS(pair.net) AS "amountCents"
    FROM (SELECT LEAST(e."paidById", e."paidForId")    AS "lowId",
                 GREATEST(e."paidById", e."paidForId") AS "highId",
                 SUM(
                         CASE WHEN e."paidById" < e."paidForId" THEN e.amount ELSE -e.amount END
                 )                                     AS net
          FROM expenses e
          GROUP BY 1, 2) pair
             JOIN users debtor
                  ON debtor.id = CASE WHEN pair.net > 0 THEN pair."highId" ELSE pair."lowId" END
             JOIN users creditor
                  ON creditor.id = CASE WHEN pair.net > 0 THEN pair."lowId" ELSE pair."highId" END
    WHERE pair.net <> 0
    ORDER BY ABS(pair.net) DESC, debtor.name ASC
`;

@Injectable()
export class BalancesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
  ) {}

  async getNetBalances(): Promise<BalanceDto[]> {
    const rows: NetBalanceRow[] =
      await this.expensesRepository.query(NET_BALANCES_SQL);

    return rows.map((row) => ({
      debtor: { id: row.debtorId, name: row.debtorName },
      creditor: { id: row.creditorId, name: row.creditorName },
      amount: centsToDollars(Number(row.amountCents)),
    }));
  }
}
