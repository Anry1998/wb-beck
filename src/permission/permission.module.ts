import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { Permission } from './entity/permission.entity';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService],
  imports: [
    TypeOrmModule.forFeature([Permission]),
  ],
  exports: [
    PermissionService
  ]
})
export class PermissionModule {}
