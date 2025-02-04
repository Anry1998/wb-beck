import { Module } from '@nestjs/common';

import { SeedersService } from './seeders.service';
import { PermissionModule } from '../permission/permission.module';
import { RoleModule } from '../role/role.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { CompaniesGroupModule } from '../companies-group/companies-group.module';
import { CompanyModule } from '../company/company.module';
import { AccountModule } from '../account/account.module';

@Module({
  providers: [SeedersService],
  imports: [
    PermissionModule,
    RoleModule,
    MarketplaceModule,
    CompaniesGroupModule,
    CompanyModule,
    AccountModule,
  ],
  exports: [
    SeedersService,
  ]
})
export class SeedersModule {}
