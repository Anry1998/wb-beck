import {  HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {  InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { checkUniquenessTwoArrays } from '../@helpers/converted-arrs.helper';
// import { ReferencebookCost } from './entity/referencebook-cost.entity';
import { CreateReferencebookCostDto } from './dto/create-rb-sebestoimost.dto';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { ChangeReferencebookCostDto } from './dto/change-rb-sebestoimost.dto';

@Injectable()
export class ReferencebookCostService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectDataSource('secondaryDB') private dataSource2: DataSource,
  ) {}

  /// download 

  async getAll(company_id: number ) {
    const arr = await this.dataSource2
      .query(`
        SELECT portal.fn_portal_sebes_export(_seller_id := ${company_id}, _limit := -1, _page := 1)
      `
    )
    
    if (arr[0].fn_portal_sebes_export.error) {
      throw new HttpException(`${arr[0].fn_portal_sebes_export.error}`, HttpStatus.BAD_REQUEST)
    }

    if (arr[0].fn_portal_sebes_export.data.products_sebes.length < 1) {
      return [
        {
          seller_name: null,
          sebes_date: null,
          artikul: null,
          artikul_postavschika: null,
          barkod: null,
          sebestoimost: null,
          new_sebestoimost: null,
          new_date: null
        }
      ]
    }

    return arr[0].fn_portal_sebes_export.data.products_sebes
  }

  async deleteUnnecessaryKeyDownload (data: any) {
    const keys_to_keep = ["seller_name", "sebes_date",  "artikul", "artikul_postavschika", "barkod", "sebestoimost"]
    const result = data.map( (el: any) => {
      const obj = {};
      keys_to_keep.forEach(k => {
        if (el.hasOwnProperty(k))
          obj[k] = el[k]
      });
      return obj;
    })

    return result
  }

  async convertObjAfterBd (data: any) {

    const old_key = ["seller_name", "sebes_date",  "artikul", "artikul_postavschika", "barkod", "sebestoimost"]
    const new_key = ["Компания", "Дата",  "Артикул", "Артикул продавца", "Баркод", "Себестоимость"]
    
    for (let i=0; i<data.length; i++) {
      // delete data[i].id
      // delete data[i].company_id

      function convertDate(date: any) {
        var day = date.getDate();
        day = day < 10 ? "0" + day : day;
        var month = date.getMonth() + 1;
        month = month < 10 ? "0" + month : month;
        var year = date.getFullYear();
        return day + "." + month + "." + year;
      }

      if (data[i].sebes_date !== null) {
        data[i].sebes_date = convertDate(new Date(data[i].sebes_date))
      }
      

      for (let j=0; j < old_key.length; j++) {
        if (old_key[j] !== new_key[j]) {
          Object.defineProperty(data[i], new_key[j],
              Object.getOwnPropertyDescriptor(data[i], old_key[j]));
          delete data[i][old_key[j]];
        }
      }
    }

    return data
  }

  async convertObjAfterBdPattern (data: any) {
    const old_key = ["seller_name", "sebes_date",  "artikul", "artikul_postavschika", "barkod", "sebestoimost", "new_sebestoimost", "new_date"]
    const new_key = ["Компания", "Дата",  "Артикул", "Артикул продавца", "Баркод", "Текущая себестоимость", "Новая себестоимость", "Новая дата",]
    
    for (let i=0; i<data.length; i++) {

      function convertDate(date: any) {
        var day = date.getDate();
        day = day < 10 ? "0" + day : day;
        var month = date.getMonth() + 1;
        month = month < 10 ? "0" + month : month;
        var year = date.getFullYear();
        return day + "." + month + "." + year;
      }

      if (data[i].sebes_date !== null) {
        data[i].sebes_date = convertDate(new Date(data[i].sebes_date))
      }
      
      for (let j=0; j < old_key.length; j++) {
        if (old_key[j] !== new_key[j]) {
          Object.defineProperty(data[i], new_key[j],
              Object.getOwnPropertyDescriptor(data[i], old_key[j]));
          delete data[i][old_key[j]];
        }
      }
    }

    return data
  }

  /// pars

  async validateColumn ( worksheet: any) {
    let errColumn = []
 
    if (worksheet?.A1 ) {
      if ( worksheet.A1?.v !== 'Компания') {
        errColumn.push(`Содержание ячейки А1 должно быть 'Компания'`)
      } 
    } else {
      errColumn.push(`Содержание ячейки А1 должно быть 'Компания'`)
    }

    if (worksheet?.B1 ) {
      if ( worksheet.B1?.v !== 'Дата') {
        errColumn.push(`Содержание ячейки B1 должно быть 'Дата'`)
      } 
    } else {
      errColumn.push(`Содержание ячейки B1 должно быть 'Дата'`)
    }

    if (worksheet?.C1) {
      if ( worksheet.C1?.v !== 'Артикул') {
        errColumn.push(`Содержание ячейки C1 должно быть 'Артикул'`)
      } 
    } else {
      errColumn.push(`Содержание ячейки C1 должно быть 'Артикул'`)
    }

    if (worksheet?.D1 ) {
      if ( worksheet.D1?.v !== 'Артикул продавца') {
        errColumn.push(`Содержание ячейки C1 должно быть 'Артикул продавца'`)
      } 
    } else {
      errColumn.push(`Содержание ячейки D1 должно быть 'Артикул продавца'`)
    }

    if (worksheet?.E1 ) {
      if ( worksheet.E1?.v !== 'Баркод') {
        errColumn.push(`Содержание ячейки E1 должно быть 'Баркод'`)
      } 
    } else {
      errColumn.push(`Содержание ячейки E1 должно быть 'Баркод'`)
    }

    if (worksheet?.F1 ) {
      if ( worksheet.F1?.v !== 'Текущая себестоимость') {
        errColumn.push(`Содержание ячейки F1 должно быть 'Текущая себестоимость'`)
      } 
    } else {
      errColumn.push(`Содержание ячейки F1 должно быть 'Текущая себестоимость'`)
    }

    if (worksheet?.G1 ) {
      if ( worksheet.G1?.v !== 'Новая себестоимость') {
        errColumn.push(`Содержание ячейки G1 должно быть 'Новая себестоимость'`)
      } 
    } else {
      errColumn.push(`Содержание ячейки G1 должно быть 'Новая себестоимость'`)
    }

    if (worksheet?.H1 ) {
      if ( worksheet.H1?.v !== 'Новая дата') {
        errColumn.push(`Содержание ячейки H1 должно быть 'Новая дата'`)
      } 
    } else {
      errColumn.push(`Содержание ячейки H1 должно быть 'Новая дата'`)
    }

    if(errColumn.length > 0) {
      errColumn = [`Загружаемый файл не соответствует формату cправочника ${"Себестоимость"}, скачайте шаблон формата справочника ${"Себестоимость"} перед импортом`]
      return errColumn
    }

  }

  async deleteUnnecessaryKey (data: any) {
    const keys_to_keep = ["Компания", "Дата", "Артикул", "Артикул продавца", "Баркод", "Текущая себестоимость", "Новая себестоимость", "Новая дата"]
    const result = data.map( (el: any) => {
      const obj = {};
      keys_to_keep.forEach(k => {
        if (el.hasOwnProperty(k))
          obj[k] = el[k]
      });
      return obj;
    })

    
    return result
  }

  async validateArrItemKey (data: any) {
    const key = ["Компания", "Артикул", "Артикул продавца", "Баркод",]
    let errArr = []

    // удаляю пустые объекты
    for(let i = data.length-1; i >= 0; i--){
      if (Object.keys(data[i]).length === 0) {
        data.splice(data[i], 1);
      }
    }

    for(let i=0; i < data.length; i++) {
      if (Object.keys(data[i]).length !== 0) {
        for(let j=0; j < key.length; j++) {
          if (key[j] in data[i] === false) {
            errArr.push(`Заполните ячейку '${key[j]}' в строке ${i+2}`)
          }
        } 
      }
    }
    
    if (errArr.length > 0) {
      return errArr
    }
  }

  async validateValue (data: any, camponyName: string) {
    let errArr = []

    for(let i=0; i < data.length; i++) {


      // преобразование даты
      function delDays(date: Date, days: number) {
        let result = new Date(date); 
        result.setDate(result.getDate() - days);
        return result;
      } 
  
      const reGoodDate = /^(?:(0[1-9]|[12][0-9]|3[01])[\.](0[1-9]|1[012])[\.](19|20)[0-9]{2})$/;
      
      if (new Date(data[i].Дата).toString() !== 'Invalid Date') {
        if (reGoodDate.test(data[i].Дата) === true) {
          let newDate = data[i].Дата.toString().split(".").reverse().join("-")
          data[i].Дата = delDays(new Date(newDate), 1) 
          console.log('newДата: ', data[i].Дата) 
        }    
      }   
      
      if (new Date(data[i]['Новая дата']).toString() !== 'Invalid Date') {
        if (reGoodDate.test(data[i]['Новая дата']) === true) {
          let newDate = data[i]['Новая дата'].toString().split(".").reverse().join("-")
          data[i]['Новая дата'] = delDays(new Date(newDate), 1)
          console.log('newДата: ', data[i]['Новая дата']) 
        }
      } 

      if (data[i].Дата) {
        if (new Date(data[i].Дата).toString() === 'Invalid Date') { 
          if (reGoodDate.test(data[i].Дата)) {
            let newDate = data[i].Дата.toString().split(".").reverse().join("-")
            data[i].Дата = delDays(newDate, 1)
          } else {
            errArr.push(`Строка ${i+2} столбец 'Дата' значение '${data[i].Дата}' не является датой `)
          }  
        }
      }
      if (data[i]['Новая дата']) {
        if (new Date(data[i]['Новая дата']).toString() === 'Invalid Date') {
          if (reGoodDate.test(data[i]['Новая дата'])) {
            let newDate = data[i]['Новая дата'].toString().split(".").reverse().join("-")
            data[i]['Новая дата'] = delDays(newDate, 1)
          } else {
            errArr.push(`Строка ${i+2} столбец 'Новая дата' значение '${data[i]['Новая дата']}' не является датой `)
          }  
        }
      }
      // ----------------

      Object.entries(data[i]).forEach(el => { 

        if (data[i]['Дата']) {
          if (el[0] === 'Дата') { 
            if (new Date(el[1].toString()).toString() === 'Invalid Date' ) {
              errArr.push(`Строка ${i+2} столбец '${el[0]}' значение '${el[1]}' не является датой `)
            }
            else if ( !(Object.prototype.toString.call(new Date(el[1].toString())) === '[object Date]') ) {
              errArr.push(`Строка ${i+2} столбец '${el[0]}' значение '${el[1]}' не является датой `)
            }
          }  
        }

        if (el[0] === 'Компания' ) {       
          if (el[1] !== camponyName) {
            errArr.push(`Строка - ${i+2} столбец - '${el[0]}' значение - '${el[1]}' должно быть '${camponyName}'`)
          }
        }

        if (el[0] === 'Артикул' ) {   
          if (Number(el[1]).toString()  === 'NaN') {
            errArr.push(`Строка - ${i+2} столбец - '${el[0]}' значение - '${el[1]}' должно быть числом`)
          }
        }

        if (el[0] === 'Артикул продавца' ) {    
          const reg = new RegExp(/^[\w\-]+$/);   
          if (!reg.test(String(el[1]))) {
            errArr.push(`Строка - ${i+2} столбец - '${el[0]}' значение - '${el[1]}' должно состоять из букв и чисел, разрешен знак '-'`)
          }
        }

        if (el[0] === 'Баркод') {       
          if (el[1]) {
            const reg = new RegExp(/^[\w\-\.]+$/);
            if (!reg.test(String(el[1]))) {
             errArr.push(`Строка-${i+2} столбец-'${el[0]}' значение-'${el[1]}' должно состоять из букв и чисел, разрешены знаки '-', '.' `)
            }
          }
        }

        if (el[0] === 'Текущая себестоимость' ) {       
          if (Number(el[1]).toString()  === 'NaN') {
            errArr.push(`Строка - ${i+2} столбец - '${el[0]}' значение - '${el[1]}' должно быть числом`)
          }
        }

        if (el[0] === 'Новая себестоимость') { 
          if (Number(el[1]).toString()  === 'NaN') {
            errArr.push(`Строка - ${i+2} столбец - '${el[0]}' значение - '${el[1]}' должно быть числом`)
          }
        }

        if (el[0] === 'Новая дата') { 
          if (new Date(el[1].toString()).toString() === 'Invalid Date' ) {
            errArr.push(`Строка ${i+2} столбец '${el[0]}' значение '${el[1]}' не является датой `)
          }
          else if ( !(Object.prototype.toString.call(new Date(el[1].toString())) === '[object Date]') ) {
            errArr.push(`Строка ${i+2} столбец '${el[0]}' значение '${el[1]}' не является датой `)
          }

          if (data[i].Дата) {
            if (new Date(el[1].toString()).toString() !== 'Invalid Date' &&  new Date(data[i].Дата.toString()).toString() !== 'Invalid Date') {
              if (el[1] < data[i].Дата ) {
                errArr.push(`Строка ${i+2} '${el[0]}' не может быть меньше текущей даты`)
              }
            }
          }
        }
      })
    }

    if (errArr.length > 0) {
      let unique = errArr.filter((item, i, ar) => ar.indexOf(item) === i);
      return unique
    }
  }

  async convertObj (data: any, company_id: number) {

    function addDays(date: Date, days: number) {
      let result = new Date(date); 
      result.setDate(result.getDate() + days);
      return result;
    } 

    for (let i=0; i < data.length; i++) {
      let newDate = addDays(data[i].Дата, 1) 
      data[i].Дата = newDate
      data[i].Компания = company_id


      if (data[i]['Новая дата']) {
        let newNewDate  = addDays(data[i]['Новая дата'], 1) 
        data[i]['Новая дата'] = newNewDate

        Object.defineProperty(data[i], "new_date",
          Object.getOwnPropertyDescriptor(data[i], 'Новая дата')
        );
        delete data[i]['Новая дата'];
      }

      if (data[i]['Новая себестоимость']) {
        Object.defineProperty(data[i], "new_sebestoimost",
          Object.getOwnPropertyDescriptor(data[i], 'Новая себестоимость')
        );
        delete data[i]['Новая себестоимость'];
      }
    }

    for(let i = 0; i < data.length; i++) {
      // меняю ключи объектов
      Object.entries(data[i]).forEach(el => {

        if (data[i]['Дата']) {
          if (el[0] === 'Дата') { 
            delete Object.assign(data[i], {['sebes_date']: data[i]['Дата'] })['Дата'];
          }  
        }

        if (el[0] === 'Компания' ) {       
          if (el[0] === 'Компания') {
            delete Object.assign(data[i], {['seller_name']: data[i]['Компания'] })['Компания'];
          }
        }

        if (el[0] === 'Артикул' ) {       
          if (el[0] === 'Артикул') {
            delete Object.assign(data[i], {['artikul']: data[i]['Артикул'] })['Артикул'];
          }
        }

        if (el[0] === 'Артикул продавца' ) {       
          if (el[0] === 'Артикул продавца') {
            delete Object.assign(data[i], {['artikul_postavschika']: data[i]['Артикул продавца'] })['Артикул продавца'];
          }
        }

        if (el[0] === 'Баркод' ) {       
          if (el[0] === 'Баркод') {
            delete Object.assign(data[i], {['barkod']: data[i]['Баркод'] })['Баркод'];
          }
        }

        if (el[0] === 'Текущая себестоимость' ) {       
          if (el[0] === 'Текущая себестоимость') {
            delete Object.assign(data[i], {['sebestoimost']: data[i]['Текущая себестоимость'] })['Текущая себестоимость'];
          }
        }

        if (el[0] === 'Новая себестоимость' ) {       
          if (el[0] === 'Новая себестоимость') {
            delete Object.assign(data[i], {['new_sebestoimost']: data[i]['Новая себестоимость'] })['Новая себестоимость'];
          }
        }

        if (el[0] === 'Новая дата' ) {       
          if (el[0] === 'Новая дата') {
            delete Object.assign(data[i], {['new_date']: data[i]['Новая дата'] })['Новая дата'];
          }
        }
      })
    }

    return data
  }

  async checkObj (data: any) {
    // При импорте нужно, чтобы отправляла в хп только те записи, где (sebest_date != null or new_sebes_date != null) and new_sebestoimost != null
    let errArr = []

    for (let i=0; i < data.length; i++) {
      if (
        Boolean(data[i].sebes_date == 'Invalid Date' || data[i].sebes_date == undefined) 
        && Boolean(data[i].new_sebestoimost) 
        && Boolean(data[i].new_date == 'Invalid Date' || data[i].new_date == undefined) 
      ) {
        errArr.push(`Строка ${i+2} при заполнении ячейки 'Новая себестоимость' в случае если  ячейка 'Дата' пустая необхлдимо заполнить ячейку 'Новая дата'`)
      }

      if (errArr.length > 0) {
        return errArr
      }
    }
  }

  async filterItemObj (data: any) {
    let arr = data.filter( (el: any) => {
      if (el['new_sebestoimost']) {
        return  true
      }
    })

    return arr
  }

  /// import-arr

  async importReferencebookArr (dto: ChangeReferencebookCostDto[], compony_id: number) {
    const query = await this.dataSource2
      .query(`
        SELECT portal.fn_portal_sebes_import(_data := 
        '${JSON.stringify(dto)}', 
        _seller_id := ${compony_id}); 
      `
    )
    if (query[0].fn_portal_sebes_import.error) {
      throw new HttpException(`${query[0].fn_portal_sebes_import.error}`, HttpStatus.BAD_REQUEST)
    }
    return 'Данные были успешно импортированы'
  }

  /// all

  async getAllPageLimit(company_id: number, page: number, limit: number ) {
    const arrLimit = await this.dataSource2
      .query(`
        SELECT portal.fn_portal_sebes_export(_seller_id := ${company_id}, _limit := ${limit}, _page := ${page})
      `
    )
    if (arrLimit[0].fn_portal_sebes_export.error) {
      throw new HttpException(`${arrLimit[0].fn_portal_sebes_export.error}`, HttpStatus.BAD_REQUEST)
    }

    let totalPages = arrLimit[0].fn_portal_sebes_export.data.last_page    

    if (arrLimit[0].fn_portal_sebes_export.data.products_sebes.length == 0) {
        totalPages = 0
    }
    
    const res = {
      items: arrLimit[0].fn_portal_sebes_export.data.products_sebes,
      meta: {
          totalPages: totalPages,
          totalItems: arrLimit[0].fn_portal_sebes_export.data.count_elements
      }
    }
    return res
  }


  // async test () {
    
  //   const arr = await this.dataSource2
  //     .query(`
  //       SELECT * FROM portal.fn_sellers_get(_seller_id := 923, _seller_name := NULL, _group_id := NULL, _limit := NULL, _offset := 0);
  //     `
  //   )
  //   console.log('arr: ', arr)
  //   return arr
  // }

  // async validateFirstLastСell (data: any) {
    
  //   let errArr = []
  //   let arr = Object.entries(data)
  //   arr.pop()
  //   // delete arr[arr.length -1]

  //   console.log('arr: ', arr)
    
  //   for(let i = 0; i < arr.length; i++) {
  //     if (Object.entries(arr[i][1])[1][1] === '') {
  //       delete arr[i]
  //     }
  //   }

  //   console.log('arr2: ', arr)

  //   let test = arr[0][1]
  //   console.log('test: ', test)
    
  //   let testArr = []

  //   const lastTest = arr[arr.length - 2][0][0]

  //   console.log('lastTest: ', lastTest)

  //   if (typeof(test) === 'string')  {
  //     testArr = test.split(':')

  //     if (Array.from(testArr[0])[0] !== 'A') {
  //       errArr.push('Первый столбец в таблице должен начинаться с A')
  //     }

  //     if (lastTest !== 'F') {
  //       errArr.push('Последний столбец в таблице должен заканчиваться на F')
  //     }
  //   }

  //   if(errArr.length > 0) {
  //     return errArr
  //   }

  // }

  // async validateEmpty (data: any) {
  //   let errArr = []
  //   let arr = Object.entries(data)
  //   arr.shift()
  //   let currentCellArr = []
     
  //   for (let i=0; i < arr.length-1; i++) {
  //     // let columnName = Object.entries(Object.entries(arr[i])[1][1])[1][1] 
  //     currentCellArr.push(Object.entries(arr[i])[0][1])
  //   }

  //   const maxNum = currentCellArr[currentCellArr.length -1].substring(1)
  //   const firstLetter = ['A', 'B', 'C', 'D', 'F',]

  //   let finalArr = []
  //   for (let i=1; i <= maxNum; i++) {
  //     for(let j=0; j < firstLetter.length; j++) {
  //       finalArr.push(`${firstLetter[j]}${i}`)
  //     }
  //   }

  //   errArr = checkUniquenessTwoArrays(finalArr, currentCellArr)

  //   if(errArr.length > 0) {
  //     return `Заполните следующие ячейки: ${errArr}` 
  //   }
  // }


  // async addBarcode (data: any) {
  //   for(let i = 0; i < data.length; i ++) {
  //     if (!('key' in data[i])) {
  //       let keyValues = Object.entries(data[i])
  //       keyValues.splice(4,0, ["Баркод",""]);
  //       data[i] = Object.fromEntries(keyValues)
  //     }
  //   }
  //   return data
  // }

  // async filterItem (data: any) {
  //   let arr = data.filter( (el: any) => {
  //     if (el['Новая себестоимость'] || el['Новая дата']) {
  //       return  true
  //     }
  //   })
  //   return arr
  // }


  // async changeObj (data: any, company_id: number) {
  //   // console.log('changeObj: ', data)
  //   const old_key = ["Компания", "Дата", "Артикул", "Артикул продавца", "Баркод", "Текущая себестоимость", ]
  //   const new_key = [ "seller_name", "sebes_date", "artikul", "artikul_postavschika", "barkod", "sebestoimost", "new_date", "new_sebestoimost"]

  //   for(let i = 0; i < data.length; i ++) {
  //     if (!('key' in data[i])) {
  //       let keyValues = Object.entries(data[i])
  //       keyValues.splice(1,0, ["Дата",""]);
  //       data[i] = Object.fromEntries(keyValues)
  //     }
  //   }

  //   function addDays(date: Date, days: number) {
  //     let result = new Date(date); 
  //     result.setDate(result.getDate() + days);
  //     return result;
  //   } 
    
  //   for (let i=0; i < data.length; i++) {
      
  //     let newDate = addDays(data[i].Дата, 1) 
  //     data[i].Дата = newDate
  //     data[i].Компания = company_id


  //     if (data[i]['Новая дата']) {
  //       let newNewDate  = addDays(data[i]['Новая дата'], 1) 
  //       data[i]['Новая дата'] = newNewDate

  //       Object.defineProperty(data[i], "new_date",
  //         Object.getOwnPropertyDescriptor(data[i], 'Новая дата')
  //       );
  //       delete data[i]['Новая дата'];
  //     }

  //     if (data[i]['Новая себестоимость']) {
  //       Object.defineProperty(data[i], "new_sebestoimost",
  //         Object.getOwnPropertyDescriptor(data[i], 'Новая себестоимость')
  //       );
  //       delete data[i]['Новая себестоимость'];
  //     }


  //     // for (let j=0; j < old_key.length; j++) {
  //     //   if (old_key[j] !== new_key[j]) {
  //     //     console.log('old_key[j]: ', old_key[j])
  //     //     console.log('new_key[j]: ', new_key[j])
  //     //     Object.defineProperty(data[i], new_key[j],
  //     //       Object.getOwnPropertyDescriptor(data[i], old_key[j])
  //     //     );
  //     //     delete data[i][old_key[j]];
  //     //   }
  //     // }
  //   }



  //   // let arr = data.filter( (el: any) => {
  //   //   if (el['new_date'] || el['new_sebestoimost'] || el['artikul'] || el['barkod']) {
  //   //     return  true
  //   //   }
  //   // })
  //   // console.log(arr)

  //   const keys_to_keep = ["sebes_date", "new_date", "new_sebestoimost", "artikul", "barkod", ]
  //   const result = data.map( (el: any) => {
  //     const obj = {};
  //     keys_to_keep.forEach(k => {
  //       if (el.hasOwnProperty(k))
  //         obj[k] = el[k]
  //     });
  //     return obj;
  //   })

  //   for (let i=0; i < result.length; i++) {

  //   if (result[i].new_date === undefined) {

  //     if (!('key' in result[i])) {
  //       let keyValues = Object.entries(result[i])
  //       keyValues.splice(4,0, ["new_date", null]);
  //       result[i] = Object.fromEntries(keyValues)
  //     }
  //   }
  //   }
  //   return result
  // }


  // async changeObj (data: any, company_id: number) {
  //   // const old_key = ["Дата", "Компания", "Артикул", "Артикул продавца", "Баркод", "Себестоимость"]
  //   // const new_key = ["date", "company_id", "article", "article_seller", "barcode", "cost"]

  //   const old_key = ["Компания", "Дата", "Артикул", "Артикул продавца", "Баркод", "Текущая себестоимость", ]
  //   const new_key = [ "seller_name", "date", "artikul", "artikul_postavschika", "barkod", "sebestoimost", "new_date", "new_sebestoimost"]

  //   function addDays(date: Date, days: number) {
  //     let result = new Date(date); 
  //     result.setDate(result.getDate() + days);
  //     return result;
  //   } 

    

  //   for (let i=0; i < data.length; i++) {
      
  //     let newDate = addDays(data[i].Дата, 1) 
  //     // let newNewDate  = addDays(data[i]['Новая дата'], 1) 

  //     data[i].Дата = newDate
  //     // data[i]['Новая дата'] = newNewDate
  //     data[i].Компания = company_id

  //     // console.log(data[i])

  //     for (let j=0; j < old_key.length; j++) {
  //       if (old_key[j] !== new_key[j]) {
  //         Object.defineProperty(data[i], new_key[j],
  //           Object.getOwnPropertyDescriptor(data[i], old_key[j])
  //         );
  //         delete data[i][old_key[j]];
  //       }
  //     }
  //   }

    
  //   return data
  // }

  // async createReferencebookArr (dto: CreateReferencebookCostDto[], compony: any) {
  //   for (let i =0; i < dto.length; i++) {
  //     if (compony.id !== dto[i].company_id) {
  //       throw new HttpException(`Компания, указанная в массиве не совпадает с компанией указанной в url`, HttpStatus.BAD_REQUEST)
  //     }
  //   }

  //   for (let i =0; i < dto.length; i++) {
  //     await this.referencebookCostRepository.save(dto[i])
  //   }
    
  // }



  // async getAllPagination(options: IPaginationOptions): Promise<Pagination<ReferencebookCost>> {
  //   return paginate<ReferencebookCost>(this.referencebookCostRepository, options);
  // }

  // async getAllPageLimit(company_id: number, page: number, limit: number ) {

  //   if (page<=0) {
  //     page=1
  //   }

  //   const offset = (page - 1)  * limit

  //   const arr = await this.dataSource
  //     .query(`
  //       SELECT * FROM referencebook_cost  
  //       WHERE "company_id"=${company_id}
  //       LIMIT ${limit} 
  //       OFFSET ${offset}
  //     `
  //   )
  //   return arr
  // }

  // async deleteUnnecessaryKeyВownload (data: any) {
  //   const keys_to_keep = ["sebes_date", "seller_id", "artikul", "barkod", "sebestoimost"]
  //   const result = data.map( (el: any) => {
  //     const obj = {};
  //     keys_to_keep.forEach(k => {
  //       if (el.hasOwnProperty(k))
  //         obj[k] = el[k]
  //     });
  //     return obj;
  //   })
  //   return result
  // }
  
  // async convertColumnDate (wb: any) {
  //   const obj = Object.entries(wb.Sheets.Data)
  //   for (let i = 0; i < obj.length; i++) {
  //     if (obj[i][0].startsWith('A')) {
  //       if (obj[i][1].z) {
  //         obj[i][1].z = 'dd/mm/yyyy'
  //       }
        
  //     }
  //   }
  // }

} 
