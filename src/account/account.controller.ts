import { Body, ClassSerializerInterceptor, Controller, DefaultValuePipe, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, Request, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse } from '@nestjs/swagger';

import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { Permission } from '../auth/decorators/permission.decorator';
import { Account } from './entity/account.entity';
import { UpdateAccountDto } from './dto/update-account.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { FindAccountDto } from './dto/find-account.dto';

@Controller('account')
export class AccountController {
   constructor(private accountService: AccountService) {}

   @Permission('Поиск аккаунта(ов)', 'Поиск аккаунта(ов), привязанного(ых) к одной группе')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Поиск аккаунта(ов)'})
   @ApiResponse({status: 200})
   @ApiNotFoundResponse()
   @Post('find')
   async getByText (
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 5,
      @Request() req : any, 
      @Body() dto: FindAccountDto,
   ) {
      limit = limit > 100 ? 100 : limit;
   
      if (req.account.permissionArr.includes('Поиск аккаунта(ов), привязанного(ых) к одной группе')) {
         const account = await this.accountService.findAccountById(req.account.payload.id)
         const group_id = Number(account.group_id) 
         if (group_id === 0) {
            throw new HttpException(`За вашим аккаунтом не закреплена группа`, HttpStatus.FORBIDDEN)
         }
         return this.accountService.searchLimitOffsetGuard(page, limit, group_id, dto.text)
      }
      return this.accountService.searchLimitOffset(page, limit, dto.text)
   }

   // @UseInterceptors(ClassSerializerInterceptor)
   // @Get('test-serializer')
   // test(){
   //    return this.accountService.findAccountById(1)
   // }
   // @SkipThrottle()
   // @Permission('Получение аккаунта по id')
   // @ApiBearerAuth()
   // @ApiOperation({summary: 'Получение аккаунта по id'})
   // @ApiResponse({status: 200, type: Account})
   // @ApiNotFoundResponse()

   
   @Permission('Создание аккаунта', 'Создание аккаунта, с привязкой к группе компаний и компаниям, за которыми закреплен аккаунт')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Создание аккаунта'})
   @ApiResponse({status: 201, type: Account})
   @ApiBadRequestResponse()
   @Post('/create')
   async createAccount(
      @Body() dto: CreateAccountDto,
      @Request() req : any, 
   ) {
      if (req.account.permissionArr.includes('Создание аккаунта, с привязкой к группе компаний и компаниям, за которыми закреплен аккаунт')) {
         const account = await this.accountService.findAccountById(req.account.payload.id)
         const group_id = Number(account.group_id) 
         if (group_id === 0) {
            throw new HttpException(`За вашим аккаунтом не закреплена группа`, HttpStatus.FORBIDDEN)
         }
         return this.accountService.createAccountGuard(dto, group_id)
      }

      return this.accountService.createAccount(dto)
   }

   @Permission('Получение списка аккаунтов', 'Получение списка аккаунтов, привязанных к одной группе')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Получение списка аккаунтов'})
   @ApiResponse({status: 200, type: [Account]})
   @ApiNotFoundResponse()
   @Get('all')
   async getAll (
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 5,
      @Request() req : any, 
   ) {
      limit = limit > 100 ? 100 : limit;

      if (req.account.permissionArr.includes('Получение списка аккаунтов, привязанных к одной группе')) {
         const account = await this.accountService.findAccountById(req.account.payload.id)
         const group_id = Number(account.group_id) 
         if (group_id === 0) {
            throw new HttpException(`За вашим аккаунтом не закреплена группа`, HttpStatus.FORBIDDEN)
         }
         return await this.accountService.getAllLimitOffsetGuard(page, limit, group_id);
      }
      return this.accountService.getAllLimitOffset(page, limit);
   }

   @SkipThrottle()
   @Permission('Получение любого аккаунта по id', 'Получение аккаунта по id, привязанного к одной группе')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Получение аккаунта по id'})
   @ApiResponse({status: 200, type: Account})
   @ApiNotFoundResponse()
   @Get(':id')
   async getById (
      @Param('id', new ParseIntPipe) id: number,
      @Request() req : any, 
   ) {
      if (req.account.permissionArr.includes('Получение аккаунта по id, привязанного к одной группе')) {
         const account = await this.accountService.findAccountById(req.account.payload.id)
         const group_id = Number(account.group_id) 
         if (group_id === 0) {
            throw new HttpException(`За вашим аккаунтом не закреплена группа`, HttpStatus.FORBIDDEN)
         }
         return this.accountService.findAccountByIdGuard(id, group_id)
      }
      return this.accountService.findAccountById(id)
   }



   @Permission('Обновление любого аккаунта', 'Обновление аккаунта, привязанного к одной группе')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Обновление аккаунта'})
   @ApiResponse({status: 200, type: Account})
   @ApiBadRequestResponse()
   @Patch('/:id')
   async update (
      @Body() dto: UpdateAccountDto,
      @Param('id', new ParseIntPipe) id: number,
      @Request() req : any,
   ) {
      if (req.account.permissionArr.includes('Обновление аккаунта, привязанного к одной группе')) {
         const account = await this.accountService.findAccountById(req.account.payload.id)
         const group_id = Number(account.group_id) 
         if (group_id === 0) {
            throw new HttpException(`За вашим аккаунтом не закреплена группа`, HttpStatus.FORBIDDEN)
         }
         return await this.accountService.updateAccountGuard(id, dto, group_id);
      }
      return await this.accountService.updateAccount(id, dto);
   }

   @Permission('Удаление любого аккаунта', 'Удаление аккаунта, привязанного к одной группе')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Удаление аккаунта'})
   @ApiResponse({status: 200})
   @Delete('/:id')
   async delete(
      @Param('id', new ParseIntPipe) id: number,
      @Request() req : any,
   ) {
      if (req.account.permissionArr.includes('Удаление аккаунта, привязанного к одной группе')) {
         const account = await this.accountService.findAccountById(req.account.payload.id)
         const deletedAccount = await this.accountService.findAccountById(id)
         const group_id = Number(account.group_id) 
         const group_id2 = Number(deletedAccount.group_id) 
         if (group_id != group_id2) {
            throw new HttpException(`Нет прав на удаление аккаунта с id: ${id}`, HttpStatus.FORBIDDEN)
         }
         return await this.accountService.deleteAccount(id);
      }
     return await this.accountService.deleteAccount(id);
   }


}


