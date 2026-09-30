import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DataSource, EntityManager, In } from 'typeorm';
import { AppModule } from '../app.module';
import { Expense } from '../expenses/entities/expense.entity';
import { User } from '../users/entities/user.entity';

interface SeedExpense {
  paidBy: string; // creditor (who paid money)
  paidFor: string; // debtor (who should pay back money)
  amount: number; // based on Dolor $
  description: string;
  daysAgo: number;
}

interface SeedData {
  users: string[];
  expenses: SeedExpense[];
}

const logger = new Logger('Seeder');

const loadSeedData = (): SeedData => {
  const file = join(__dirname, 'data', 'seed.json');
  return JSON.parse(readFileSync(file, 'utf-8')) as SeedData;
};

const daysAgo = (days: number): Date =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);

async function seedUsers(
  manager: EntityManager,
  names: string[],
): Promise<Map<string, User>> {
  await manager
    .createQueryBuilder()
    .insert()
    .into(User)
    .values(names.map((name) => ({ name })))
    .orIgnore()
    .execute();

  const users = await manager.findBy(User, { name: In(names) });
  logger.log(`Users ready: ${users.length}`);

  return new Map(users.map((user) => [user.name, user]));
}

async function seedExpenses(
  manager: EntityManager,
  usersByName: Map<string, User>,
  seedExpenses: SeedExpense[],
): Promise<void> {
  const existing = await manager.count(Expense);
  if (existing > 0) {
    logger.log(
      `Expenses skipped: ${existing} already exist (use seed:fresh to reset)`,
    );
    return;
  }

  const getUserId = (name: string): number => {
    const user = usersByName.get(name);
    if (!user) throw new Error(`Unknown user in seed data: ${name}`);
    return user.id;
  };

  const expenses = seedExpenses.map((expense) =>
    manager.create(Expense, {
      paidById: getUserId(expense.paidBy),
      paidForId: getUserId(expense.paidFor),
      amount: expense.amount,
      description: expense.description,
      createdAt: daysAgo(expense.daysAgo),
    }),
  );

  await manager.save(expenses);
  logger.log(`Expenses created: ${expenses.length}`);
}

async function seed(): Promise<void> {
  const data = loadSeedData();
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const isFresh = process.argv.includes('--fresh');
    const nodeEnv = app.get(ConfigService).getOrThrow<string>('app.nodeEnv');

    if (isFresh && nodeEnv === 'production') {
      throw new Error('--fresh is not allowed in production');
    }

    await app.get(DataSource).transaction(async (manager) => {
      if (isFresh) {
        await manager.clear(Expense);
        logger.warn('Existing expenses removed (--fresh)');
      }

      const usersByName = await seedUsers(manager, data.users);
      await seedExpenses(manager, usersByName, data.expenses);
    });
  } finally {
    await app.close();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
