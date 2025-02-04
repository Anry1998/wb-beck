import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
  Request,    
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConsumes, ApiNotFoundResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import * as  XLSX  from  'xlsx' ; 
import {Response} from 'express';
var contentDisposition = require('content-disposition')

import { ReferencebookCostService } from './rb-sebestoimost.service';
import { CompanyService } from '../company/company.service';
import { Permission } from '../auth/decorators/permission.decorator';
import { ChangeReferencebookCostDto } from './dto/change-rb-sebestoimost.dto';
import { AccountService } from '../account/account.service';
import { transliterate } from '../@helpers/transliterate.helper';
 
@Controller('rb-sebestoimost')  
export  class  ReferencebookCostController { 
  constructor(
    private referencebookCostService: ReferencebookCostService,
    private companyService: CompanyService,
    private accountService: AccountService,
  ) {}

  @Permission(
    'Скачивание excel файла - справочник Себестоимость (по любой компании)',
    'Скачивание excel файла - справочник Себестоимость (по всем компаниям, входящим в группу)',
    'Скачивание excel файла - справочник Себестоимость (только по компаниям, сотрудником которых является пользователь)',
  )
  @ApiBearerAuth()
  @ApiOperation({summary: 'Скачивание excel файла - справочник Себестоимость'})
  @ApiResponse({status: 200})
  @ApiNotFoundResponse()
  @Get('download')
  async writeExcelFile (
    @Request() req : any,
    @Res() res: Response,
    @Query('campony_id', ParseIntPipe) campony_id: number,
    @Query('pattern', ParseIntPipe) pattern: number,
  ) {
    const company = await this.companyService.getCompanyById(campony_id)

    if (req.account.permissionArr.includes('Скачивание excel файла - справочник Себестоимость (по всем компаниям, входящим в группу)')) {
      const account = await this.accountService.findAccountById(req.account.payload.id)
      if (Number(account.group_id) !== Number(company.group_id)) {
        throw new HttpException(`Вы не можете скачивать справочник указанной компании, так как она не входит в вашу группу`, HttpStatus.FORBIDDEN)
      }
    } 

    if (req.account.permissionArr.includes('Скачивание excel файла - справочник Себестоимость (только по компаниям, сотрудником которых является пользователь)')) {
      if (!req.account.companiesArr.includes(campony_id)) {
        throw new HttpException(`Вы не являетесь сотрудником указанной компании`, HttpStatus.FORBIDDEN)
      } 
    }

    let data = await this.referencebookCostService.getAll(campony_id)
    let deleteUnnecessaryKeyDownload 
    let convertData 

    const companyName = transliterate(company.seller_name)
    const time = new Date().toISOString().split('.')[0].replace(/:/g, "-");
    let fileName 

    if (!pattern) {
      deleteUnnecessaryKeyDownload = await this.referencebookCostService.deleteUnnecessaryKeyDownload(data)
      convertData = await this.referencebookCostService.convertObjAfterBd(deleteUnnecessaryKeyDownload)
      fileName = `${companyName}_sebestoimost_${time}.xlsx`
    } else {
      convertData = await this.referencebookCostService.convertObjAfterBdPattern(data)
      fileName = `${companyName}_sebestoimost_pattern_${time}.xlsx`
    }
    
    let ws = XLSX.utils.json_to_sheet(convertData);
    let wb = XLSX.utils.book_new(); 
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    const obj = Object.entries(wb.Sheets.Data)
    for (let i = 0; i < obj.length; i++) {
      if (obj[i][0].startsWith('B') || obj[i][0].startsWith('H')) {
        obj[i][1].z = 'dd/mm/yyyy'
      } 
    }

    let buf = XLSX.write(wb, {type: "buffer", bookType: "xlsx"});
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')
    res.setHeader('Content-Disposition', contentDisposition(`${fileName}`))
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return  res.send(buf);
  }

  @Permission(
    'Проверка файла перед загрузкой в справочник Себестоимость (по любой компании)',
    'Проверка файла перед загрузкой в справочник Себестоимость (по всем компаниям, входящим в группу)',
    'Проверка файла перед загрузкой в справочник Себестоимость (только по компаниям, сотрудником которых является пользователь)'
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Проверка файла xlsx перед загрузкой в справочник Себестоимость',
    requestBody: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
          },
        },
      },
    },
  })
  @ApiResponse({status: 201,})
  @ApiConsumes('multipart/form-data')
  @Post('pars') 
  @UseInterceptors (FileInterceptor('file')) 
  async  uploadFile (
    @UploadedFile() file: Express.Multer.File,
    @Query('campony_id', ParseIntPipe) campony_id: number,
    @Request() req : any,
  ) { 
    const checkCompany = await this.companyService.getCompanyById(campony_id)

    if (req.account.permissionArr.includes('Проверка файла перед загрузкой в справочник Себестоимость (по всем компаниям, входящим в группу)')) {
      const account = await this.accountService.findAccountById(req.account.payload.id)
      if (Number(account.group_id) !== Number(checkCompany.group_id)) {
        throw new HttpException(`Вы не можете получать информацию из справочника указанной компании, так как она не входит в вашу группу`, HttpStatus.FORBIDDEN)
      }
    } 

    if (req.account.permissionArr.includes('Проверка файла перед загрузкой в справочник Себестоимость (только по компаниям, сотрудником которых является пользователь)')) {
      if (!req.account.companiesArr.includes(campony_id)) {
        throw new HttpException(`Вы не являетесь сотрудником указанной компании`, HttpStatus.FORBIDDEN)
      } 
    }

    if (file.mimetype !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      throw new HttpException(`Выберите файл формата *.xlsx`, HttpStatus.BAD_REQUEST)
    }

    const workbook = XLSX.read(file.buffer, {type :'buffer', cellDates: true}); 
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]; 

    const data = XLSX.utils.sheet_to_json(worksheet);    

    const validateColumn = await this.referencebookCostService.validateColumn(worksheet)
    if (validateColumn) {
      throw new HttpException(`${validateColumn}`, HttpStatus.BAD_REQUEST)
    }

    const deleteUnnecessaryKey = await this.referencebookCostService.deleteUnnecessaryKey(data)

    const validateArrItemKey = await this.referencebookCostService.validateArrItemKey(deleteUnnecessaryKey)
    if (validateArrItemKey) {
      throw new HttpException(`${validateArrItemKey}`, HttpStatus.BAD_REQUEST)
    }
    
    const validateValue = await this.referencebookCostService.validateValue(deleteUnnecessaryKey, checkCompany.seller_name)
    if (validateValue) {
      throw new HttpException(`${validateValue}`, HttpStatus.BAD_REQUEST)
    }

    const convertObj = await this.referencebookCostService.convertObj(deleteUnnecessaryKey, campony_id)

    // При импорте нужно, чтобы отправляла в хп только те записи, где (sebest_date != null or new_sebes_date != null) and new_sebestoimost != null
    const checkObj = await this.referencebookCostService.checkObj(convertObj)
    if (checkObj) {
      throw new HttpException(`${checkObj}`, HttpStatus.BAD_REQUEST)
    }

    const filterItemObj = await this.referencebookCostService.filterItemObj(convertObj)
    
    return filterItemObj
  } 

  @Permission(
    'Загрузка json в справочник Себестоимость (по любой компании)',
    'Загрузка json в справочник Себестоимость (по всем компаниям, входящим в группу)',
    'Загрузка json в справочник Себестоимость (только по компаниям, сотрудником которых является пользователь)'
  )
  @ApiBearerAuth()
  @ApiOperation({summary: 'Загрузка json в справочник Себестоимость'})
  @ApiResponse({status: 201})
  @ApiBadRequestResponse()
  @Post('import-arr')
  async changeArr(
    @Query('campony_id', ParseIntPipe) campony_id: number,
    @Body() dto: ChangeReferencebookCostDto[],
    @Request() req : any,
  ) {
    const company = await this.companyService.getCompanyById(campony_id)

    if (req.account.permissionArr.includes('Загрузка json в справочник Себестоимость (по всем компаниям, входящим в группу)')) {
      const account = await this.accountService.findAccountById(req.account.payload.id)
      if (Number(account.group_id) !== Number(company.group_id)) {
        throw new HttpException(`Вы не можете загружать json в справочник Себестоимость указанной компании, так как она не входит в вашу группу`, HttpStatus.FORBIDDEN)
      }
    } 

    if (req.account.permissionArr.includes('Загрузка json в справочник Себестоимость (только по компаниям, сотрудником которых является пользователь)')) {
      if (!req.account.companiesArr.includes(campony_id)) {
        throw new HttpException(`Вы не являетесь сотрудником указанной компании`, HttpStatus.FORBIDDEN)
      } 
    }
    
    return this.referencebookCostService.importReferencebookArr(dto, campony_id)
  }

  @Permission(
    'Получение информации из справочника Себестоимость (по любой компании)',
    'Получение информации из справочника Себестоимость (по всем компаниям, входящим в группу)',
    'Получение информации из справочника Себестоимость (только по компаниям, сотрудником которых является пользователь)',
  )
  @ApiBearerAuth()
  @ApiOperation({summary: 'Получение списка'})
  @ApiResponse({status: 200})
  @ApiNotFoundResponse()
  @Get('all')
  async getAll (
    @Query('campony_id', ParseIntPipe) campony_id: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Request() req : any,
  ) {

    const company = await this.companyService.getCompanyById(campony_id)

    if (req.account.permissionArr.includes('Получение информации из справочника Себестоимость (по всем компаниям, входящим в группу)')) {
      const account = await this.accountService.findAccountById(req.account.payload.id)

      console.log('account: ', account.group_id)
      console.log('company.group_id: ', company.group_id)
      if (Number(account.group_id) !== Number(company.group_id)) {
        throw new HttpException(`Вы не можете получать информацию из справочника указанной компании, так как она не входит в вашу группу`, HttpStatus.FORBIDDEN)
      }
    } 

    if (req.account.permissionArr.includes('Получение информации из справочника Себестоимость (только по компаниям, сотрудником которых является пользователь)')) {
      if (!req.account.companiesArr.includes(campony_id)) {
        throw new HttpException(`Вы не являетесь сотрудником указанной компании`, HttpStatus.FORBIDDEN)
      } 
    }

    limit = limit > 100 ? 100 : limit;
    return this.referencebookCostService.getAllPageLimit(campony_id, page, limit)
  }
}

