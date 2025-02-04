import { Module } from '@nestjs/common';

import { ReferencebookCostController } from './rb-sebestoimost.controller';
import { ReferencebookCostService } from './rb-sebestoimost.service';
import { CompanyModule } from '../company/company.module';
import { AccountModule } from '../account/account.module';

@Module({
  controllers: [ReferencebookCostController],
  providers: [ReferencebookCostService],
  imports: [
    CompanyModule,
    AccountModule,
  ]
})
export class ReferencebookCostModule {}
