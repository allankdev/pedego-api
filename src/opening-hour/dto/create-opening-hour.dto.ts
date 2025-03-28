// src/opening-hour/dto/create-opening-hour.dto.ts
import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOpeningHourDto {
  @ApiProperty({ example: 'segunda', description: 'Dia da semana' })
  @IsString()
  @IsNotEmpty()
  day: string;

  @ApiProperty({ example: '08:00', description: 'Horário de abertura (formato HH:mm)' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, {
    message: 'Formato de hora inválido (ex: 08:00)',
  })
  open: string;

  @ApiProperty({ example: '18:00', description: 'Horário de fechamento (formato HH:mm)' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, {
    message: 'Formato de hora inválido (ex: 18:00)',
  })
  close: string;
}
