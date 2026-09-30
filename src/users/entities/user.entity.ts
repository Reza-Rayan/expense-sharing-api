import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../common/entities/abstract.entity';

@Entity('users')
export class User extends AbstractEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;
}
