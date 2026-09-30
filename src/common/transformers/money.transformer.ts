import { ValueTransformer } from 'typeorm';

export const dollarsToCents = (dollars: number): number =>
  Math.round(dollars * 100);

export const centsToDollars = (cents: number): number => cents / 100;

export const moneyTransformer: ValueTransformer = {
  to: (value: number | null | undefined) =>
    value === null || value === undefined ? value : dollarsToCents(value),

  from: (value: number | null | undefined) =>
    value === null || value === undefined ? value : centsToDollars(value),
};
