import {  Controller, DefaultValuePipe, Get, ParseIntPipe, Query, } from '@nestjs/common';

import { PermissionService } from './permission.service';
// import { CreatePermissionDto } from './dto/create-permission.dto';

import { ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Permission } from './entity/permission.entity';

@Controller('permission')
export class PermissionController {
    constructor( 
        private permissionService: PermissionService,
    ) {}

    @ApiBearerAuth()
    @ApiOperation({summary: 'Получение списка разрешений'})
    @ApiResponse({status: 200, type: [Permission]})
    @ApiNotFoundResponse()
    @Get('all')
    async getAllPermission (
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 5,
    ) {
        limit = limit > 100 ? 100 : limit;
        return this.permissionService.getAllPermission({
            page,
            limit,
        });
    }
}
