import { IsOptional, IsString } from 'class-validator'

export class FilterStoresDto {
  @IsOptional()
  @IsString()
  status?: string // ← aceita valores do enum OU "all"

  @IsOptional()
  @IsString()
  plan?: string // ← idem

  @IsOptional()
  @IsString()
  search?: string
}
