import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
  } from 'typeorm';
  
  @Entity()
  export class AuditLog {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    action: string;
  
    @Column()
    actorId: number;
  
    @Column({ nullable: true })
    targetStoreId?: number;
  
    @Column({ nullable: true })
    targetUserId?: number;
  
    @Column('text', { nullable: true })
    description?: string;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  