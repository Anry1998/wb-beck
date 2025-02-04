import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role } from './entity/role.entity';
import { PermissionModule } from '../permission/permission.module';

@Module({
  controllers: [RoleController],
  providers: [RoleService],
  imports: [
    TypeOrmModule.forFeature([Role]),
    PermissionModule
  ],
  exports: [
    RoleService
  ]
})
export class RoleModule {}
