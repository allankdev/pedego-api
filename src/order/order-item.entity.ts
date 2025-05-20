import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { Order } from './order.entity'
import { Product } from '../product/product.entity'
import { ProductExtra } from '../product-extra/product-extra.entity'

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  quantity: number

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number // ✅ Preço do produto no momento do pedido

  @ManyToOne(() => Product, { eager: true, onDelete: 'RESTRICT' })
  product: Product

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order

  @ManyToMany(() => ProductExtra, { eager: true })
  @JoinTable()
  extras: ProductExtra[]
}
