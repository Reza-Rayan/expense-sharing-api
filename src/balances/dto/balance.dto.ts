export class BalanceUserDto {
  id!: number;
  name!: string;
}

export class BalanceDto {
  debtor!: BalanceUserDto;

  creditor!: BalanceUserDto;

  amount!: number;
}
