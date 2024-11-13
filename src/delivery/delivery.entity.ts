// src/delivery/delivery.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from '../order/order.entity';  // Importando a entidade Order

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.deliveries)  // Relacionamento ManyToOne com Order
  order: Order;  // Cada entrega pertence a um pedido
}
