import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ScraperData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column()
  link: string;

  @Column({ nullable: true })
  genetic: string;

  @Column({ nullable: true })
  thc: string;

  @Column({ nullable: true })
  cbd: string;

  @Column({ nullable: true })
  availability: string;

  @Column({ nullable: true })
  price: string;
}
