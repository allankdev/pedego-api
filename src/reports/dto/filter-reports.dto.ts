import { IsOptional, IsDateString } from 'class-validator';

export class FilterReportsDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
