import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../user/user.entity';
import { Flower } from '../flower/flower.entity';

@Entity('basket_items')
export class BasketItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.basket, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Flower, (flower) => flower.basketItems, {
    onDelete: 'CASCADE',
  })
  flower: Flower;

  @Column({ default: 1 })
  quantity: number;
}
