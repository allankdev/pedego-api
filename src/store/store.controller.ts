import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get(':subdomain')
  async getStore(@Param('subdomain') subdomain: string) {
    try {
      const store = await this.storeService.findBySubdomain(subdomain);
      return store;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Loja '${subdomain}' não encontrada`);
      }
      throw error;  // Lançar outros erros não tratados
    }
  }
}
