import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompaniesGroupController } from './companies-group.controller';
import { CompaniesGroupService } from './companies-group.service';
import { CompaniesGroup } from './entity/companies-group.entity';
import { CompanyModule } from '../company/company.module';
import { AccountModule } from '../account/account.module';

@Module({
  controllers: [CompaniesGroupController],
  providers: [CompaniesGroupService],
  imports: [
    TypeOrmModule.forFeature([CompaniesGroup]),
    forwardRef(() => CompanyModule), 
    AccountModule,
    
  ],
  exports: [
    CompaniesGroupService
  ]
})
export class CompaniesGroupModule {}
