import { Body, Controller, DefaultValuePipe, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, Request } from '@nestjs/common';
import {ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiResponse} from "@nestjs/swagger";

import { CompaniesGroupService } from './companies-group.service';
import { CreateCompaniesGroupDto } from './dto/create-companies-group.dto';
import { UpdateCompaniesGroupDto } from './dto/update-companies-group.dto';
import { Permission } from '../auth/decorators/permission.decorator';
import { AccountService } from '../account/account.service';

@Controller('companies-group')
export class CompaniesGroupController {
   constructor(
      private companiesGroupService: CompaniesGroupService,
      private accountService: AccountService,
   ) {}

   @Permission('Создание группы компаний')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Создание группы компаний'})
   @ApiResponse({status: 201})
   @Post('create')
   create(@Body() dto: CreateCompaniesGroupDto) {
      return this.companiesGroupService.create(dto)
   }

   @Permission('Получение списка всех групп компаний')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Получение списка групп компаний'})
   @ApiResponse({status: 200})
   @ApiNotFoundResponse()
   @Get('all')
   async getAll (
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 5,
   ) {
      limit = limit > 100 ? 100 : limit;
      return await this.companiesGroupService.getAllLimitOffset(page, limit)
   }

   @Permission('Получение любой группы компаний по id', 'Получение группы компаний по id, за которой закреплен аккаунт')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Получение группы компаний по id'})
   @ApiResponse({status: 200})
   @ApiNotFoundResponse()
   @Get(':id')
   async getById (
      @Param('id', new ParseIntPipe) id: number,
      @Request() req : any,
   ) {
      if (req.account.permissionArr.includes('Получение группы компаний по id, за которой закреплен аккаунт')) {
         const account = await this.accountService.findAccountById(req.account.payload.id)
         if(Number(account.group_id) !== id) {
            throw new HttpException(`Нет доступа к группе с id: ${id}`, HttpStatus.FORBIDDEN)
         }
         return this.companiesGroupService.getById(id)
      }
      return this.companiesGroupService.getById(id)
   }

   @Permission('Обновление любой группы компаний', 'Обновление группы компаний, за которой закреплен аккаунт')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Обновление группы компаний'})
   @ApiResponse({status: 200})
   @ApiBadRequestResponse()
   @Patch('/:id')
   async update(
      @Body() dto: UpdateCompaniesGroupDto,
      @Param('id', new ParseIntPipe) id: number,
      @Request() req : any,
   ) {
      if (req.account.permissionArr.includes('Обновление группы компаний, за которой закреплен аккаунт')) {
         const account = await this.accountService.findAccountById(req.account.payload.id)
         if(Number(account.group_id) !== id) {
            throw new HttpException(`Нет прав на редактирование группы с id: ${id}`, HttpStatus.FORBIDDEN)
         }
         
      }
      return await this.companiesGroupService.update(id, dto);
   }
}
