import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Account } from './entity/account.entity';
import { RoleModule } from '../role/role.module';
import { CompanyModule } from '../company/company.module';


@Module({
  controllers: [AccountController],
  providers: [AccountService],
  imports: [
    TypeOrmModule.forFeature([Account]),
    RoleModule,
    // CompanyModule,
    forwardRef(() => CompanyModule),   
  ],
  exports: [AccountService, ],
})
export class AccountModule {}
