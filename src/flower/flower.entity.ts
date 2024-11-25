import { BasketItem } from 'src/basket/basket.entity';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';

@Entity('flowers')
export class Flower {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  price: string;

  @Column()
  thc: string;

  @Column()
  cbd: string;

  @Column()
  image: string;

  @Column()
  link: string;

  @OneToMany(() => BasketItem, (basketItem) => basketItem.flower)
  basketItems: BasketItem[];
}
