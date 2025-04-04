// product-extra.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProductExtraGroup } from './product-extra-group.entity';

@Entity()
export class ProductExtra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', default: 0 })
  price: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  available: boolean;

  @ManyToOne(() => ProductExtraGroup, (group) => group.extras, { onDelete: 'CASCADE' })
  group: ProductExtraGroup;
}