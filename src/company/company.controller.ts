import { Body, Controller, DefaultValuePipe, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, Request } from '@nestjs/common';
import {ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiResponse} from "@nestjs/swagger";

import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
// import { Company } from './entity/company.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Permission } from '../auth/decorators/permission.decorator';
import { AccountService } from '../account/account.service';

@Controller('company')
export class CompanyController {
   constructor(
      private companyService: CompanyService,
      private accountService: AccountService,
   ) {}

   @Permission('Создание любой компании', 'Создание компании с привязкой к группе, за которой закреплен аккаунт')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Создание компании'})
   @ApiResponse({status: 201})
   @ApiBadRequestResponse()
   @Post('create')
   async create(
      @Body() dto: CreateCompanyDto,
      @Request() req : any, 
   ) {
      if (req.account.permissionArr.includes('Создание компании с привязкой к группе, за которой закреплен аккаунт')) {
         const account = await this.accountService.findAccountById(req.account.payload.id)
         if (Number(account.group_id) !== dto.group_id) {
            throw new HttpException(`Нет доступа на создание компании с привязкой к указанной группе`, HttpStatus.FORBIDDEN)
         }
      } 
      return this.companyService.createCompany(dto)
   }

   @Permission(
      'Получение списка всех компаний', 
      'Получение списка компаний, сотрудником которых является аккаунт',
      'Получение списка всех компаний, входящих в группу, за которой закреплен аккаунт',
   )
   @ApiBearerAuth()
   @ApiOperation({summary: 'Получение списка компаний'})
   @ApiResponse({status: 200})
   @ApiNotFoundResponse()
   @Get('all') 
   async getAll (
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 5,
      @Request() req : any, 
   ) {
      limit = limit > 100 ? 100 : limit;

      if (req.account.permissionArr.includes('Получение списка компаний, сотрудником которых является аккаунт')) {
         const companiesArr = await this.accountService.getAccountCompanyes(req.account.payload.id)
         if (companiesArr.length == 0) {
            throw new HttpException(`За вашим аккаунтом не закреплены компании`, HttpStatus.FORBIDDEN)
         }
         return await this.companyService.getAllCompanyesLimitOffsetGuard(companiesArr, page, limit);
      }    

      if (req.account.permissionArr.includes('Получение списка всех компаний, входящих в группу, за которой закреплен аккаунт')) {
         const account = await this.accountService.findAccountById(req.account.payload.id)
         if (!account.group_id) {
            throw new HttpException(`За вашим аккаунтом не закреплена группа`, HttpStatus.FORBIDDEN)
         }
         return await this.companyService.getAllCompanyesByGroupIdLimitOffset(account.group_id, page, limit)
      } 
      
      return await this.companyService.getAllCompanyesLimitOffset(page, limit)
   } 

   @Permission('Получение любой компании по id', 'Получение любой компании из группы, за которой закреплен аккаунт')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Получение компании по id'})
   @ApiResponse({status: 200})
   @ApiNotFoundResponse()
   @Get(':id')
   async getById (
      @Param('id', new ParseIntPipe) id: number,
      @Request() req : any, 
   ) {

      if (req.account.permissionArr.includes('Получение любой компании из группы, за которой закреплен аккаунт')) {
         const account = await this.accountService.findAccountById(req.account.payload.id)
         const accountGroupId = Number(account.group_id)
         if (accountGroupId == 0) {
            throw new HttpException(`За вами не закреплена ни одна группа`, HttpStatus.FORBIDDEN)
         }
         return this.companyService.getCompanyByIdGuard(id, accountGroupId)
      } 
      return this.companyService.getCompanyById(id)
   }

   @Permission('Обновление любой компании', 'Обновление компании, входящей в группу, за которой закреплен аккаунт')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Обновление компании'})
   @ApiResponse({status: 200})
   @ApiBadRequestResponse() 
   @Patch('/:id')
   async update(
      @Body() dto: UpdateCompanyDto,
      @Param('id', new ParseIntPipe) id: number,
      @Request() req : any, 
   ) {
      if (req.account.permissionArr.includes('Обновление компании, входящей в группу, за которой закреплен аккаунт')) {
         const account = await this.accountService.findAccountById(req.account.payload.id)
         const company = await this.companyService.getCompanyById(id)
         if (Number(account.group_id) !== company.group_id) {
            throw new HttpException(`Нет доступа на редактирование компании`, HttpStatus.FORBIDDEN)
         }
      }
      return await this.companyService.updateCompany(id, dto);
   }

   @Permission('Удаление любой компании', 'Удаление компании, входящей в группу, за которой закреплен аккаунт')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Удаление компании'})
   @ApiResponse({status: 200})
   @Delete('/:id')
   async delete(
      @Param('id', new ParseIntPipe) id: number,
      @Request() req : any, 
   ) {
      if (req.account.permissionArr.includes('Удаление компании, входящей в группу, за которой закреплен аккаунт')) {
         const account = await this.accountService.findAccountById(req.account.payload.id)
         const company = await this.companyService.getCompanyById(id)
         if (Number(account.group_id) !== company.group_id) {
            throw new HttpException(`Нет доступа на удаление компании`, HttpStatus.FORBIDDEN)
         }
      }
     return await this.companyService.deleteCompany(id);
   }
}

