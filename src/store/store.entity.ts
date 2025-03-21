import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from '../product/product.entity';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ unique: true })
subdomain: string; // Identificador único para o subdomínio da loja

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];
}
