import { Body, Controller, DefaultValuePipe, Delete, FileTypeValidator, Get, Param, ParseFilePipe, ParseFilePipeBuilder, ParseIntPipe, Patch, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import {ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiResponse} from "@nestjs/swagger";
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as uuid  from 'uuid';
import { type Response } from 'express';

import { MarketplaceService } from './marketplace.service';
// import { Marketplace } from './entity/marketplace.entity';
import { CreateMarketplaceDto } from './dto/create-marketplace.dto';
import { UpdateMarketplaceDto } from './dto/update-marketplace.dto';
import { Permission } from '../auth/decorators/permission.decorator';
import { Public } from '../auth/decorators/public.decorator';


@Controller('marketplace')
export class MarketplaceController {
   constructor(private marketplaceService: MarketplaceService) {}

   // @Public()
   // @Get(':name') 
   // async static ( 
   //    @Param('name') name: number,
   //    @Res() res: Response,
   // ) {
   //    console.log('name: ', name)
   //    return res.sendFile(join(`${process.cwd()}/public/${name}`));
   // }


   @Permission('Создание маркетплейса')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Создание маркетплейса'})
   @ApiResponse({status: 200})
   @ApiBadRequestResponse()
   @Post('create')
   create(
      @Body() dto: CreateMarketplaceDto,
   ) {
      return this.marketplaceService.createMarketplace(dto)
   } 

   @Permission('Получение списка маркетплейсов')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Получение списка'})
   @ApiResponse({status: 200})
   @ApiNotFoundResponse()
   @Get('all') 
   async getAllRoles (
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 5,
   ) {
      limit = limit > 100 ? 100 : limit;
      return this.marketplaceService.getAllMarketplace({
         page,
         limit,
      });
   }

   @Permission('Получение маркетплейса по id')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Получение маркетплейса по id'})
   @ApiResponse({status: 200})
   @ApiNotFoundResponse()
   @Get(':id')
   async getRoleById (@Param('id', new ParseIntPipe) id: number) {
      return this.marketplaceService.getMarketplaceById(id)
   }

   @Permission('Обновление маркетплейса')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Обновление маркетплейса'})
   @ApiResponse({status: 200})
   @ApiBadRequestResponse()
   @Patch('/:id')
   async updateRole(
      @Body() dto: UpdateMarketplaceDto,
      @Param('id', new ParseIntPipe) id: number,
   ) {
      return await this.marketplaceService.updateMarketplace(id, dto);
   }

   @Permission('Удаление маркетплейса')
   @ApiBearerAuth()
   @ApiOperation({summary: 'Удаление маркетплейса'})
   @ApiResponse({status: 200})
   @Delete('/:id')
   async deleteRecipe(@Param('id', new ParseIntPipe) id: number) {
     return await this.marketplaceService.deleteMarketplace(id);
   }
}
 