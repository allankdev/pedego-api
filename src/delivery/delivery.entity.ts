// src/delivery/delivery.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from '../order/order.entity'; // Importando a entidade Order

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;  // ID único para cada entrega

  @Column()
  address: string;  // Endereço da entrega

  @Column()
  status: string;  // Status da entrega (ex: 'pendente', 'entregue', etc.)

  @ManyToOne(() => Order, (order) => order.id)
  order: Order;  // Relacionamento ManyToOne com Order, cada entrega pertence a um pedido

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  deliveryDate: Date;  // Data de entrega, com valor padrão de timestamp atual
}
