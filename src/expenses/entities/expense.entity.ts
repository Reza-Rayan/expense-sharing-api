import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/entities/abstract.entity';
import { moneyTransformer } from '../../common/transformers/money.transformer';
import { User } from '../../users/entities/user.entity';

@Entity('expenses')
@Check('CHK_expenses_amount_positive', '"amount" > 0')
@Check('CHK_expenses_different_users', '"paidById" <> "paidForId"')
export class Expense extends AbstractEntity {
  @Column({ type: 'integer', transformer: moneyTransformer })
  amount!: number;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Index()
  @Column()
  paidById!: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'paidById' })
  paidBy!: User;

  @Index()
  @Column()
  paidForId!: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'paidForId' })
  paidFor!: User;
}
