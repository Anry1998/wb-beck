import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { Company } from './entity/company.entity';
import { CompaniesGroupModule } from '../companies-group/companies-group.module';
import { AccountModule } from '../account/account.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService],
  imports: [
    TypeOrmModule.forFeature([Company]),
    forwardRef(() => CompaniesGroupModule), 
    forwardRef(() => AccountModule), 
    MarketplaceModule,
  ],
  exports: [
    CompanyService
  ]
})
export class CompanyModule {}
