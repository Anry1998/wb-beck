import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { Marketplace } from './entity/marketplace.entity';

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  imports: [
    TypeOrmModule.forFeature([Marketplace]),
  ],
  exports: [
    MarketplaceService
  ]
})
export class MarketplaceModule {}
