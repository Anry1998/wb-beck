import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';

import { Company } from './entity/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompaniesGroupService } from '../companies-group/companies-group.service';
import { checkUniquenessTwoArrays, getArrValueByKeyInArrObjects } from '../@helpers/converted-arrs.helper';
import { AccountService } from '../account/account.service';
import { MarketplaceService } from '../marketplace/marketplace.service';

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(Company) private companyRepository: Repository<Company>,  
        @InjectDataSource() private dataSource: DataSource,
        // @InjectDataSource('secondaryDB') private dataSource2: DataSource,
        // private companiesGroupService: CompaniesGroupService,
        private accountService: AccountService,
        private marketplaceService: MarketplaceService,
    ) {}

    async getCompanyById(id: number) {
        const arr = await this.dataSource
            .query(`
                SELECT "seller_id", "seller_name", "group_id", "is_deleted", "inn", "forma_naloga", "nalog", "dni_vsego", "dni_wb", "marketplace_id",
                "marketplace_name"
                FROM ${process.env.DB_SCHEMA}.sellers   
                RIGHT JOIN ${process.env.DB_SCHEMA}.marketplace ON sellers."marketplace_id" = marketplace."id"
                WHERE "is_deleted"=false
                AND "seller_id"=${id}
            `)

        if (!arr[0]) {
            throw new HttpException(`Компания c id: ${id} не найдена`, HttpStatus.NOT_FOUND)
        }

        const groupName = await this.dataSource
            .query(`
                SELECT "group_name"
                FROM ${process.env.DB_SCHEMA}.group  
                WHERE "group_id"=${arr[0].group_id}
            `)
        const totalAccounts = await this.accountService.getAllAccountsLengthByCompanyId(id)

        arr[0] = {
            ...arr[0], 
            group_name: groupName[0].group_name,
            totalAccounts
        }

        return arr[0] 
    }

    async getCompanyByIdGuard(id: number, accountGroupId: number) {

        const arr = await this.dataSource
        .query(`
            SELECT "seller_id", "seller_name", "group_id", "is_deleted", "inn", "forma_naloga", "nalog", "dni_vsego", "dni_wb", "marketplace_id",
            "marketplace_name"
            FROM ${process.env.DB_SCHEMA}.sellers  
            RIGHT JOIN ${process.env.DB_SCHEMA}.marketplace ON sellers."marketplace_id" = marketplace."id"
            WHERE "is_deleted"=false
            AND "seller_id"=${id}
        `)

        if (!arr[0]) {
            throw new HttpException(`Компания c id: ${id} не найдена`, HttpStatus.NOT_FOUND)
        }

        if (Number(arr[0].group_id)  !== accountGroupId) {
            throw new HttpException(`Нет разрешения на просмотр  компания c id: ${id}`, HttpStatus.FORBIDDEN)
        }

        const groupName = await this.dataSource
            .query(`
                SELECT "group_name"
                FROM ${process.env.DB_SCHEMA}.group  
                WHERE "group_id"=${arr[0].group_id}
            `)
        const totalAccounts = await this.accountService.getAllAccountsLengthByCompanyId(id)

        arr[0] = {
            ...arr[0], 
            group_name: groupName[0].group_name,
            totalAccounts
        }

        return arr[0] 
    }

    // async getCompanyByName(name: string) {
    //     const arr = await this.dataSource2
    //         .query(`
    //             SELECT * FROM portal.fn_sellers_get
    //             (_seller_id := NULL, _seller_name := '${name}', _group_id := NULL, _limit := NULL, _offset := 0, _is_deleted := FALSE);
    //         `
    //     )
    //     if (arr.length < 1) {
    //         throw new HttpException(`Компания c названием: ${name} не найдена`, HttpStatus.NOT_FOUND)
    //     }
    //     return arr[0]
    // }

    async getAllCompanyesByGroupId(id: number) {

        const arrAll = await this.dataSource
        .query(`
            SELECT "seller_id", "seller_name", "group_id", "inn", "forma_naloga", "nalog",
            "dni_vsego", "dni_wb", "marketplace_id",  "marketplace_name" 
            FROM ${process.env.DB_SCHEMA}.sellers  
            RIGHT JOIN ${process.env.DB_SCHEMA}.marketplace ON sellers."marketplace_id" = marketplace."id"
            WHERE "is_deleted"=false
            AND "group_id"=${id}
        `)

        for (let i=0; i < arrAll.length; i++) {
            const groupName = await this.dataSource
            .query(`
                SELECT "group_name"
                FROM ${process.env.DB_SCHEMA}.group  
                WHERE "group_id"=${arrAll[i].group_id} 
            `)
            const totalAccounts = await this.accountService.getAllAccountsLengthByCompanyId(arrAll[i].seller_id)

            arrAll[i] = {
                ...arrAll[i], 
                group_name: groupName[0].group_name,
                totalAccounts
            }
        }

        return arrAll
    }

    async getAllCompanyesByGroupIdLimitOffset(id: number, page: number, limit: number) {

        if (limit <= 0) {
            limit = 1
        }
        if (page <= 0) {
            page = 1
        }

        let offset = (page - 1) * limit

        const arrAll = await this.dataSource
        .query(`
            SELECT * FROM ${process.env.DB_SCHEMA}.sellers  
            WHERE "is_deleted"=false
            AND "group_id"=${id}
        `)

        let totalPages = Math.ceil(arrAll.length / limit)

        if (limit === 0) {
            limit = null
            page=1
            offset = 0
            totalPages = 1
        }

        const arrLimit = await this.dataSource
        .query(`
            SELECT "seller_id", "seller_name", "group_id", "inn", "forma_naloga", "nalog",
            "dni_vsego", "dni_wb", "marketplace_id",  "marketplace_name"
            FROM ${process.env.DB_SCHEMA}.sellers  
            RIGHT JOIN ${process.env.DB_SCHEMA}.marketplace ON sellers."marketplace_id" = marketplace."id"
            WHERE "is_deleted"=false
            AND "group_id"=${id}
            LIMIT ${limit} 
            OFFSET ${offset}
        `)


        for (let i=0; i < arrLimit.length; i++) {
            const groupName = await this.dataSource
            .query(`
                SELECT "group_name"
                FROM ${process.env.DB_SCHEMA}.group  
                WHERE "group_id"=${arrLimit[i].group_id} 
            `)
            const totalAccounts = await this.accountService.getAllAccountsLengthByCompanyId(arrLimit[i].seller_id)

            arrLimit[i] = {
                ...arrLimit[i], 
                group_name: groupName[0].group_name,
                totalAccounts
            }
        }
        
        const res = {
            items: arrLimit,
            meta: {
                totalPages: totalPages
            }
        }
        return res
    }

    // async getAllCompanyes() {
    //     const arr = await this.dataSource2
    //         .query(`
    //             SELECT * FROM portal.fn_sellers_get
    //             (_seller_id := NULL, _seller_name := NULL, 
    //             _group_id := NULL, _limit := NULL, _offset := 0, _is_deleted := FALSE);
    //         `) 

    //     return arr
    // }

    async getAllCompanyesLimitOffset(page: number, limit: number) {

        if (limit <= 0) {
            limit = 1
        }
        if (page <= 0) {
            page = 1
        }
        let offset = (page - 1) * limit

        const arrAll = await this.dataSource
        .query(`
            SELECT * FROM ${process.env.DB_SCHEMA}.sellers  
            WHERE "is_deleted"=false
        `)

        let totalPages = Math.ceil(arrAll.length / limit) 

        if (limit === 0) {
            limit = null
            page=1
            offset = 0
            totalPages = 1
        }

        const arrLimit = await this.dataSource
        .query(`
            SELECT "seller_id", "seller_name", "group_id", "inn", "forma_naloga", "nalog",
            "dni_vsego", "dni_wb", "marketplace_id",  "marketplace_name"
            FROM ${process.env.DB_SCHEMA}.sellers  
            RIGHT JOIN ${process.env.DB_SCHEMA}.marketplace ON sellers."marketplace_id" = marketplace."id"
            WHERE "is_deleted"=false
            LIMIT ${limit} 
            OFFSET ${offset}
        `)

        for (let i=0; i < arrLimit.length; i++) {
            const groupName = await this.dataSource
            .query(`
                SELECT "group_name"
                FROM ${process.env.DB_SCHEMA}.group  
                WHERE "group_id"=${arrLimit[i].group_id} 
            `)
            const totalAccounts = await this.accountService.getAllAccountsLengthByCompanyId(arrLimit[i].seller_id)

            arrLimit[i] = {
                ...arrLimit[i], 
                group_name: groupName[0].group_name,
                totalAccounts
            }
        }
        
        const res = {
            items: arrLimit,
            meta: {
                totalPages: totalPages
            }
        }
        return res
    }

    async getAllCompanyesLimitOffsetGuard(arr: any, page: number, limit: number) {
        if (limit <= 0) {
            limit = 1
        }
        if (page <= 0) {
            page = 1
        }

        let offset = (page - 1) * limit

        const arrAll = await this.dataSource
        .query(`
            SELECT * FROM ${process.env.DB_SCHEMA}.sellers  
            WHERE "is_deleted"=false
            AND "seller_id"=ANY(ARRAY[${arr}])
        `)
        
        let totalPages = Math.ceil(arrAll.length / limit) 

        if (limit === 0) {
            limit = null
            page=1
            offset = 0
            totalPages = 1
        }

        const arrLimit = await this.dataSource
        .query(`
            SELECT "seller_id", "seller_name", "group_id", "inn", "forma_naloga", "nalog",
            "dni_vsego", "dni_wb", "marketplace_id",  "marketplace_name"
            FROM ${process.env.DB_SCHEMA}.sellers  
            RIGHT JOIN ${process.env.DB_SCHEMA}.marketplace ON sellers."marketplace_id" = marketplace."id"
            WHERE "is_deleted"=false
            AND "seller_id"=ANY(ARRAY[${arr}])
            LIMIT ${limit} 
            OFFSET ${offset}
        `)

        for (let i=0; i < arrLimit.length; i++) {
            const groupName = await this.dataSource
            .query(`
                SELECT "group_name"
                FROM ${process.env.DB_SCHEMA}.group  
                WHERE "group_id"=${arrLimit[i].group_id} 
            `)
            const totalAccounts = await this.accountService.getAllAccountsLengthByCompanyId(arrLimit[i].seller_id)

            arrLimit[i] = {
                ...arrLimit[i], 
                group_name: groupName[0].group_name,
                totalAccounts
            }
        }

        const res = {
            items: arrLimit,
            meta: {
                totalPages: totalPages
            }
        }
        return res
    }

    async createCompany(dto: CreateCompanyDto): Promise<any> {
        let validateArr = []

        if (Number.isInteger(dto.nalog) === false) {
            validateArr.push(`Содержание поля 'nalog' должно быть целым числом`)
        }
        
        if (Number.isInteger(dto.dni_vsego) === false) {
            validateArr.push(`Содержание поля 'dni_vsego' должно быть целым числом`)
        }

        if (Number.isInteger(dto.dni_wb) === false) {
            validateArr.push(`Содержание поля 'dni_wb' должно быть целым числом`)
        }

        if (validateArr.length > 0) {
            throw new HttpException(`${validateArr}`, HttpStatus.BAD_REQUEST)
        }

        if (dto.marketplace_id) {
            await this.marketplaceService.getMarketplaceById(dto.marketplace_id)
        }

        if (dto.accounts_id) {
            for(let i: number = 0; i < dto.accounts_id.length; i++) {
                const account = await this.accountService.findAccountById(dto.accounts_id[i])
                if (!account) {
                    throw new HttpException(`Аккаунта с id: ${dto.accounts_id[i]}, не найден`, HttpStatus.NOT_FOUND)
                }
                if (Number(account.group_id) !== dto.group_id) {
                    throw new HttpException(`Вы не можете привязать аккаунт с id: ${dto.accounts_id[i]} к компании, так как указаныый аккаунт привязан к другой группе либо не закреплен ни за одной группой`, HttpStatus.FORBIDDEN)
                }
            }
        }


        let seller = await this.companyRepository.save(dto)

        if (dto.accounts_id) {
            for(let i: number = 0; i < dto.accounts_id.length; i++) {
                await this.dataSource
                    .query(`
                        INSERT INTO ${process.env.DB_SCHEMA}.account_company  
                        (account_id,  company_id)
                        VALUES (${dto.accounts_id[i]}, ${seller.seller_id})
                    `
                )
            }
        }

        return await this.getCompanyById(seller.seller_id)
    }

    async updateCompany(id: number, dto: UpdateCompanyDto) {
        let validateArr = []

        if (dto.nalog) {
            if (Number.isInteger(dto.nalog) === false) {
                validateArr.push(`Содержание поля 'nalog' должно быть целым числом`)
            }
        }

        if (dto.dni_vsego) {
            if (Number.isInteger(dto.dni_vsego) === false) {
                validateArr.push(`Содержание поля 'dni_vsego' должно быть целым числом`)
            }
        }

        if (dto.dni_wb) {
            if (Number.isInteger(dto.dni_wb) === false) {
                validateArr.push(`Содержание поля 'dni_wb' должно быть целым числом`)
            }
        }

        if (validateArr.length > 0) {
            throw new HttpException(`${validateArr}`, HttpStatus.BAD_REQUEST)
        }

        if (dto.marketplace_id) {
            await this.marketplaceService.getMarketplaceById(dto.marketplace_id)
        }

        const company = await this.getCompanyById(id)

        if (dto.accounts_id) {
            if (dto.accounts_id) {
                for(let i: number = 0; i < dto.accounts_id.length; i++) {
                    const account = await this.accountService.findAccountById(dto.accounts_id[i])
                    if (!account) {
                        throw new HttpException(`Аккаунта с id: ${dto.accounts_id[i]}, не найден`, HttpStatus.NOT_FOUND)
                    }
                    if (Number(account.group_id) !== dto.group_id) {
                        throw new HttpException(`Вы не можете привязать аккаунт с id: ${dto.accounts_id[i]} к компании, так как указаныый аккаунт привязан к другой группе либо не закреплен ни за одной группой`, HttpStatus.FORBIDDEN)
                    }
                }
            }
    
        }

        await this.companyRepository.update({ seller_id: id }, { 
            marketplace_id: dto.marketplace_id ? dto.marketplace_id : company.marketplace_id,
            group_id: dto.group_id ? dto.group_id : company.group_id,
            inn: dto.inn ? dto.inn : company.inn,
            seller_name: dto.seller_name ? dto.seller_name : company.seller_name,

            forma_naloga: dto.forma_naloga ? dto.forma_naloga : company.forma_naloga,
            nalog: dto.nalog ? dto.nalog : company.nalog,
            dni_vsego: dto.dni_vsego ? dto.dni_vsego : company.dni_vsego,
            dni_wb: dto.dni_wb ? dto.dni_wb : company.dni_wb,
        }) 

        const currentAccount = await this.dataSource
            .query(`
                SELECT account_id FROM ${process.env.DB_SCHEMA}.account_company  
                WHERE company_id=${id}
            `
        ) 
        const convertedCurrentArr = getArrValueByKeyInArrObjects(currentAccount, 'account_id')
        let  addItem 
        let deletedItem
        if (dto.accounts_id) {
            addItem = checkUniquenessTwoArrays(dto.accounts_id, convertedCurrentArr) 
            deletedItem = checkUniquenessTwoArrays(convertedCurrentArr, dto.accounts_id)

            for (let i =0; i < deletedItem.length; i++) {
                await this.dataSource
                    .query(`
                        DELETE FROM ${process.env.DB_SCHEMA}.account_company 
                        WHERE account_id=${deletedItem[i]} AND company_id=${id}
                    `
                )
            }
    
            for (let i =0; i < addItem.length; i++) {
                await this.dataSource
                    .query(`
                        INSERT INTO ${process.env.DB_SCHEMA}.account_company  
                        (account_id,  company_id) 
                        VALUES (${addItem[i]}, ${id})
                    `
                )
            }
        } 

        return await this.getCompanyById(id)
    }

    async deleteCompany(id: number) {
        await this.getCompanyById(id)

        await this.companyRepository.update({ seller_id: id }, { 
            is_deleted: true,

        })
        
        await this.dataSource
            .query(`
                DELETE FROM ${process.env.DB_SCHEMA}.account_company  
                WHERE company_id=${id}
            `
        )

        return `Компания удалена`
    }


//////////////////////////////////////////////



    // async getAllCompanyesLimitOffset(page: number, limit: number) {
    //     if (page<=0) {
    //         page=1
    //     }
    //     const offset = (page - 1) * limit

    //     const arr = await this.dataSource.query(`SELECT * FROM sellers`)
    //     const totalPages = Math.ceil(arr.length / limit) 

    //     const arrLimit = await this.dataSource
    //         .query(`
    //             SELECT * FROM sellers  
    //             LIMIT ${limit} 
    //             OFFSET ${offset}
    //         `)
        
    //     const res = {
    //         items: arrLimit,
    //         meta: {
    //             totalPages: totalPages
    //         }
    //     }
    //     return res
    // }





    // async createCompany(dto: CreateCompanyDto) {
    //     let validateArr = []

    //     if (Number.isInteger(dto.nalog) === false) {
    //         validateArr.push(`Содержание поля 'nalog' должно быть целым числом`)
    //     }
        
    //     if (Number.isInteger(dto.dni_vsego) === false) {
    //         validateArr.push(`Содержание поля 'dni_vsego' должно быть целым числом`)
    //     }

    //     if (Number.isInteger(dto.dni_wb) === false) {
    //         validateArr.push(`Содержание поля 'dni_wb' должно быть целым числом`)
    //     }

    //     if (validateArr.length > 0) {
    //         throw new HttpException(`${validateArr}`, HttpStatus.BAD_REQUEST)
    //     }
 

    //     const checkCompany = await this.dataSource
    //         .query(`SELECT * FROM sellers WHERE "seller_name"='${dto.seller_name}'`)

    //     if (checkCompany.length > 0) {
    //         throw new HttpException(`Компания: ${dto.seller_name} уже существует`, HttpStatus.BAD_REQUEST)
    //     }

    //     const createCompany = await this.dataSource
    //         .query(`
    //             INSERT INTO sellers  
    //             (group_id, group_name, inn, seller_name, forma_naloga, nalog, dni_vsego, dni_wb, 
    //             update_sources, status )
    //             VALUES (${dto.group_id}, '${dto.group_name}', ${dto.inn}, '${dto.seller_name}', 
    //             '${dto.forma_naloga}', ${dto.nalog}, ${dto.dni_vsego}, ${dto.dni_wb},
    //             1, 'подключен')
    //         `
    //     )

    //     const company = await this.dataSource
    //         .query(`SELECT * from sellers WHERE "seller_name"='${dto.seller_name}'`)
        
    //     return company[0]
    // }

    // async getAllCompanyes(page: number, limit: number) {
    //     if (page<=0) {
    //         page=1
    //     }
    //     const offset = (page - 1) * limit

    //     const arr = await this.dataSource.query(`SELECT * FROM sellers`)
    //     const totalPages = Math.ceil(arr.length / limit) 

    //     const arrLimit = await this.dataSource
    //         .query(`
    //             SELECT * FROM sellers  
    //             LIMIT ${limit} 
    //             OFFSET ${offset}
    //         `)
        
    //     const res = {
    //         items: arrLimit,
    //         meta: {
    //             totalPages: totalPages
    //         }
    //     }
    //     return res
    // }

    // async createCompany(dto: CreateCompanyDto): Promise<Company> {
    //     const company = await this.companyRepository.findOne({where: [
    //         {company_name: dto.company_name},
    //         {api_key: dto.api_key},
    //     ]})
    //     if (company) {
    //         throw new HttpException(`Компания: ${dto.company_name} уже существует или api_key уже используется`, HttpStatus.BAD_REQUEST)
    //     }
    //     if (dto.group_name_id) {
    //         await this.companiesGroupService.getCompaniesGroupById(dto.group_name_id)
    //     }
    //     return await this.companyRepository.save(dto)
    // }

    // async findCompanyByName(name: string) {
    //     const company = await this.companyRepository.findOne({where: [{company_name: name}]})
    //     if (!company) {
    //         throw new HttpException(`Компания: ${name} не найдена`, HttpStatus.BAD_REQUEST) 
    //     }
    //     return company
    // }

    // async checkCompanyById(id: number) {
    //     const company = await this.companyRepository.findOne({where: [{id: id}]})
    //     if (!company) {
    //         throw new HttpException(`Компания с id: ${id} не найдена`, HttpStatus.BAD_REQUEST) 
    //     }
    //     return company 
    // }


    // async getCompanyById(id: number) {

    //     const company = await this.dataSource2
    //         .query(`
    //             SELECT portal.fn_seller_name_get(${id})
    //         `
    //     )
    //     console.log(company)

    //     if (!company.length) {
    //         throw new HttpException(`Компания c id: ${id} не найдена`, HttpStatus.BAD_REQUEST) 
    //     } 

    //     const accounts = await this.dataSource
    //         .query(`
    //             SELECT account_id FROM account_company  
    //             WHERE company_id=${id}
    //         `
    //     )

    //     const joinCompany = {...company[0], accounts}
    //     return joinCompany 
    // }

    // async getAllCompanyes(options: IPaginationOptions) {
    //     // const res = await paginate<any>(this.companyRepository, options);

    //     // for(let i = 0; i < res.items.length; i++) {
    //     //     const accountsLengt = await this.accountService.getAllAccountsLengthByCompanyId(res.items[i].id)
    //     //     res.items[i].accounts_lengt = accountsLengt
    //     // }

    //     // const offset = (options.limit - 1)  * limit

    //     // const res = await this.dataSource
    //     //     .query(`
    //     //         SELECT * FROM sellers  
    //     //         LIMIT ${options.limit} 
    //     //         OFFSET 0
    //     //     `)

    //     // return res
    //     return 'rerer'
    // }

    // async getAllCompanyes(page: number, limit: number) {
    //     if (page<=0) {
    //         page=1
    //     }
    //     const offset = (page - 1) * limit

    //     const arr = await this.dataSource.query(`SELECT * FROM sellers`)
    //     const totalPages = Math.ceil(arr.length / limit) 

    //     const arrLimit = await this.dataSource
    //         .query(`
    //             SELECT * FROM sellers  
    //             LIMIT ${limit} 
    //             OFFSET ${offset}
    //         `)
        
    //     const res = {
    //         items: arrLimit,
    //         meta: {
    //             totalPages: totalPages
    //         }
    //     }
    //     return res
    // }

    // async getAllCompanyesLimit(companiesArr: number[], page: number, limit: number) {
    //     if (page<=0) {
    //         page=1
    //     }
    //     const offset = (page - 1)  * limit

    //     const arr = await this.dataSource.query(`SELECT * FROM sellers`)
    //     const totalPages = Math.ceil(arr.length / limit) 
      
    //     const arrLimit = await this.dataSource
    //         .query(`
    //             SELECT * FROM sellers  
    //             WHERE "seller_id"=ANY(ARRAY [${companiesArr}])
    //             LIMIT ${limit} 
    //             OFFSET ${offset}
    //         `)

    //     const res = {
    //         items: arrLimit,
    //         meta: {
    //             totalPages: totalPages
    //         }
    //     }
    //     return res
    // }

    // async updateCompany(id: number, dto: UpdateCompanyDto) {

    //     const checkCompany = await this.dataSource
    //         .query(`SELECT * FROM sellers WHERE "seller_id"='${id}'`)

    //     if (checkCompany.length = 0) {
    //         throw new HttpException(`Компания: ${dto.seller_name} не найдена`, HttpStatus.BAD_REQUEST)
    //     }

    //     if (dto.seller_name) {
    //         const checkUniqueName = await this.dataSource
    //             .query(`SELECT * FROM sellers WHERE "seller_name"='${dto.seller_name}'`)

    //         if (checkUniqueName[0] && checkUniqueName[0].id != id) {
    //             throw new HttpException(`Компания: ${dto.seller_name} уже существует`, HttpStatus.BAD_REQUEST)
    //         }
    //     }

    //     if (dto.group_id) {
    //         await this.companiesGroupService.getCompaniesGroupById(dto.group_id)
    //     }

    // }

    // async updateCompany(id: number, dto: UpdateCompanyDto) {
    //     if (!dto.marketplace_id && !dto.company_name && !dto.inn
    //         && !dto.group_name_id && !dto.api_key && !dto.accounts) {
    //         throw new HttpException(`Заполните хотя бы одну графу`, HttpStatus.BAD_REQUEST)
    //     }
    //     const company = await this.companyRepository.findOne({where: [
    //         {id: id},
    //     ]})
    //     if (!company) {
    //         throw new HttpException(`Компания c id: ${id} не найдена`, HttpStatus.BAD_REQUEST)
    //     }

    //     if (dto.company_name) {
    //         const checkUniqueName = await this.companyRepository.findOne({where: [
    //             {company_name: dto.company_name},
    //         ]})

    //         if (checkUniqueName && checkUniqueName.id != id) {
    //             throw new HttpException(`Компания: ${dto.company_name} уже существует`, HttpStatus.BAD_REQUEST)
    //         }
    //     }

    //     if (dto.api_key) {
    //         const checkUniqueApiKey = await this.companyRepository.findOne({where: [
    //             {api_key: dto.api_key},
    //         ]})

    //         if (checkUniqueApiKey && checkUniqueApiKey.id != id) {
    //             throw new HttpException(`Api_key уже существует`, HttpStatus.BAD_REQUEST)
    //         }
    //     }

    //     if (dto.group_name_id) {
    //         await this.companiesGroupService.getCompaniesGroupById(dto.group_name_id)
    //     }

    //     if (dto.accounts.length) {
    //         for(let i = 0; i < dto.accounts.length; i++) {
    //             await this.accountService.findAccountById(dto.accounts[i])
    //         }
    //     }

    //     if (dto.marketplace_id) {
    //         await this.marketplaceService.getMarketplaceById(dto.marketplace_id)
    //     }

    //     if (dto.accounts.length) {
    //         const currentAccounts = await this.dataSource
    //             .query(`
    //                 SELECT account_id FROM account_company  
    //                 WHERE company_id=${id}
    //             `
    //         )
    //         const convertedCurrentArr = getArrValueByKeyInArrObjects(currentAccounts, 'account_id')

    //         const  addItem  = checkUniquenessTwoArrays(dto.accounts, convertedCurrentArr)
    //         const deletedItem = checkUniquenessTwoArrays(convertedCurrentArr, dto.accounts)

    //         for (let i =0; i < deletedItem.length; i++) {
    //             await this.dataSource
    //                 .query(`
    //                     DELETE FROM account_company  
    //                     WHERE company_id=${id} AND account_id=${deletedItem[i]}
    //                 `
    //             )
    //         }

    //         for (let i =0; i < addItem.length; i++) {
    //             await this.dataSource
    //                 .query(`
    //                     INSERT INTO account_company  
    //                     VALUES (${addItem[i]}, ${id})
    //                 `
    //             )
    //         }
    //     }

    //     if (dto.marketplace_id) {
    //         await this.companyRepository.update({ id: id }, { marketplace_id:  dto.marketplace_id});
    //     }

    //     if (dto.company_name) {
    //         await this.companyRepository.update({ id: id }, { company_name:  dto.company_name});
    //     }

    //     if (dto.inn) {
    //         await this.companyRepository.update({ id: id }, { inn:  dto.inn});
    //     }
        
    //     if (dto.group_name_id) {
    //         await this.companyRepository.update({ id: id }, { group_name_id:  dto.group_name_id});
    //     }

    //     if (dto.api_key) {
    //         await this.companyRepository.update({ id: id }, { api_key:  dto.api_key});
    //     }

    //     return 'Компания была успешно обновлена'
    // }

    // async deleteCompany(id: number) {
    //     await this.dataSource
    //         .query(`
    //             DELETE FROM account_company  
    //             WHERE company_id=${id}
    //         `
    //     )
    //     await this.companyRepository.delete({ id: id });
    //     return 'Компания удалена'
    // }
}


