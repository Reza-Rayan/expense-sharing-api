import { ValueTransformer } from 'typeorm';

export const moneyTransformer: ValueTransformer = {
  // app -> database: dollars to cents
  to: (value: number | null | undefined) =>
    value === null || value === undefined ? value : Math.round(value * 100),

  // database -> app: cents to dollars
  from: (value: number | null | undefined) =>
    value === null || value === undefined ? value : value / 100,
};
