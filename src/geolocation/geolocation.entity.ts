import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Geolocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  latitude: number;

  @Column()
  longitude: number;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column()
  postalCode: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}