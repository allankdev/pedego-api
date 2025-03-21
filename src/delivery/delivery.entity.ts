// src/delivery/delivery.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from '../order/order.entity'; // Importando a entidade Order

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column({ default: 'pendente' }) // Agora tem valor padrão
  status: string;

  @ManyToOne(() => Order, (order) => order.id)
  order: Order;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  deliveryDate: Date;
}
