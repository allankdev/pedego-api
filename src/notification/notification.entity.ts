import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  message: string;
  
  @Column({ default: false })
  read: boolean;
  

  @CreateDateColumn({ type: 'timestamp' }) // 🔥 insere a data automaticamente
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // 🔄 atualiza sempre que editar
  updatedAt: Date;
}