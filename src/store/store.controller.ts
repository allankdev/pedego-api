import { Controller, Get, Param } from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get(':subdomain')
  async getStore(@Param('subdomain') subdomain: string) {
    const store = await this.storeService.findBySubdomain(subdomain);
    return store;
  }
}
