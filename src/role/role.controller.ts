import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request } from '@nestjs/common';
import {ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiResponse} from "@nestjs/swagger";
import { SkipThrottle, Throttle } from '@nestjs/throttler';

import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Permission } from '../auth/decorators/permission.decorator';
import { Role } from './entity/role.entity';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('role')
export class RoleController {
   constructor(private roleService: RoleService) {}

   // @SkipThrottle() // ghjgecnbnm
   // @Throttle({})
   // @Permission('USER_PERMISSIONS', "ADMIN_PERMISSIONS")
   // @Throttle({ default: { limit: 1, ttl: 10000 } })
   // @Get('view-account')
   // async testRoleUser () {
   //    return 'Роут для просмотра аккаунта'
   // }

   @Permission('Создание роли')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Создание роли'})
   @ApiResponse({status: 201, type: Role})
   @ApiBadRequestResponse()
   @Post('create')
   async create (@Body() dto: CreateRoleDto) {
      return this.roleService.createRole(dto)
   }

   @Permission('Получение списка всех ролей', 'Получение списка ролей c меткой "Доступна всем"')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Получение списка ролей'})
   @ApiResponse({status: 200, type: [Role]})
   @ApiNotFoundResponse()
   @Get('all')
   async getAll (
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 5,
      @Request() req : any, 
   ) {
      limit = limit > 100 ? 100 : limit;

      if (req.account.permissionArr.includes('Получение списка ролей c меткой "Доступна всем"')) {
         return await this.roleService.getAllLimitOffsetGuard(page, limit);
      } 
      return await this.roleService.getAllLimitOffset(page, limit);
   }

   @SkipThrottle()
   @Permission('Получение любой роли по id', 'Получение роли по id c меткой "Доступна всем"')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Получение роли по id'})
   @ApiResponse({status: 200, type: Role})
   @ApiNotFoundResponse()
   @Get(':id')
   async getRoleById (
      @Param('id', new ParseIntPipe) id: number,
      @Request() req : any, 
   ) {
      if (req.account.permissionArr.includes('Получение роли по id c меткой "Доступна всем"')) {
         return this.roleService.getByIdGuard(id)
      } 
      return this.roleService.getById(id)
   }

   @Permission('Обновление роли')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Обновление названия роли и (или) списка ее разрешений роли'})
   @ApiResponse({status: 200, type: Role})
   @ApiBadRequestResponse()
   @Patch('/:id')
   async update(
      @Body() dto: UpdateRoleDto,
      @Param('id', new ParseIntPipe) id: number,
   ) {
      return await this.roleService.updateRole(id, dto);
   }

   @Permission('Удаление роли')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Удаление роли'})
   @ApiResponse({status: 200})
   @Delete('/:id')
   async delete(@Param('id', new ParseIntPipe) id: number) {
     return await this.roleService.deleteRole(id);
   }
}


