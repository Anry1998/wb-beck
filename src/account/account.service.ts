import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { hash } from 'bcryptjs';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';

import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entity/account.entity';
import { RoleService } from '../role/role.service';
import { Role } from '../role/entity/role.entity';
//import { Company } from '../company/entity/company.entity';
import { CompanyService } from '../company/company.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { checkUniquenessTwoArrays, getArrValueByKeyInArrObjects } from '../@helpers/converted-arrs.helper';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(Account) private accountRepository: Repository<Account>, 
        private roleService: RoleService,
        @InjectDataSource() private dataSource: DataSource,
        @Inject(forwardRef(() => CompanyService)) private companyService: CompanyService,
    ) {}

    async getAll() {
        return await this.accountRepository.find()
    }

    async getAllLimitOffset(page: number, limit: number) {
        if (limit <= 0) {
            limit = 1
        }
        if (page<=0) {
            page=1
        }
        let offset = (page - 1) * limit

        const arr = await this.getAll()
        let totalPages = Math.ceil(arr.length / limit) 

        if (limit === 0) {
            limit = null
            page=1
            offset = 0
            totalPages = 1
        }

        const arrLimit = await this.dataSource
            .query(`
                SELECT "id","name", "surname", "patronymic", "login", "telegram", "group_id", "is_active", "date_last_login" FROM ${process.env.DB_SCHEMA}.account  
                LIMIT ${limit}
                OFFSET ${offset}
            `)

        for (let i = 0; i < arrLimit.length; i++) {
            const roles = await this.dataSource
                .query(`
                    SELECT "role_id" FROM ${process.env.DB_SCHEMA}.account_role 
                    WHERE "account_id"=${arrLimit[i].id} 
                `)
            const companies = await this.dataSource
                .query(`
                    SELECT "company_id" FROM ${process.env.DB_SCHEMA}.account_company 
                    WHERE "account_id"=${arrLimit[i].id} 
                `)
            arrLimit[i] = {
                ...arrLimit[i],
                roles_id: getArrValueByKeyInArrObjects(roles, 'role_id')  ,
                companies_id: getArrValueByKeyInArrObjects(companies, 'company_id') 
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

    async getAllLimitOffsetGuard(page: number, limit: number, group_id: number) {
        if (page<=0) {
            page=1
        }
        let offset = (page - 1) * limit

        const arr = await this.accountRepository.find({where: {group_id: group_id}})
        let totalPages = Math.ceil(arr.length / limit) 

        if (limit === 0) {
            limit = null
            page=1
            offset = 0
            totalPages = 1
        } 

        const arrLimit = await this.dataSource
            .query(`
                SELECT "id", "name", "surname", "patronymic", "login", "telegram", "group_id", "is_active", "date_last_login" FROM ${process.env.DB_SCHEMA}.account  
                WHERE "group_id"=${group_id}
                LIMIT ${limit}
                OFFSET ${offset}
            `)

        for (let i = 0; i < arrLimit.length; i++) {
            const roles = await this.dataSource
                .query(`
                    SELECT "role_id" FROM ${process.env.DB_SCHEMA}.account_role 
                    WHERE "account_id"=${arrLimit[i].id} 
                `)
            const companies = await this.dataSource
                .query(`
                    SELECT "company_id" FROM ${process.env.DB_SCHEMA}.account_company 
                    WHERE "account_id"=${arrLimit[i].id} 
                `)
            arrLimit[i] = {
                ...arrLimit[i],
                roles_id: getArrValueByKeyInArrObjects(roles, 'role_id')  ,
                companies_id: getArrValueByKeyInArrObjects(companies, 'company_id') 
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

    async hashPasswordFn(password: string) {
        return hash(password, 10);
    }

    async createAccount(dto: CreateAccountDto) {
        if (dto.companies_id) {
            if (!dto.group_id) {
                throw new HttpException(`Если вы хотите привязать аккаунт к компаниям укажите группу`, HttpStatus.BAD_REQUEST)
            }
            for(let i: number = 0; i < dto.companies_id.length; i++) {
                const company = await this.companyService.getCompanyById(dto.companies_id[i])
                if (Number(company.group_id) != dto.group_id ) {
                    throw new HttpException(`Вы не можете привязывать аккаунт к компании с id: ${dto.companies_id[i]}, так как указанная компания не входит в группу c id ${dto.group_id}`, HttpStatus.FORBIDDEN)
                }
            }
        }

        const account = await this.accountRepository.findOne({where: [{login: dto.login}]})
        if (account) {
            throw new HttpException(`Аккаунт с логин: ${dto.login} уже существует`, HttpStatus.BAD_REQUEST)
        }

        const hashPassword = await this.hashPasswordFn(dto.password)

        const newAccount = this.accountRepository.create({
            name: dto.name,
            surname: dto.surname,
            patronymic: dto.patronymic ? dto.patronymic : null,
            login:dto.login,
            telegram: dto.telegram ? dto.telegram : null, 
            password: hashPassword,
            group_id: dto.group_id ? dto.group_id : null
        });

        let arrRole: Role[] = []
        for(let i: number = 0; i < dto.roles_id.length; i++) {
            const role = await this.roleService.getById(dto.roles_id[i])
            arrRole = [...arrRole, role]
        }

        let rolesAccount = {
            ...newAccount,
            roles_id: [...arrRole],
        };



        await this.accountRepository.save(rolesAccount)
        
        let arrCompanies = []
        if (dto.companies_id) {
            for(let i: number = 0; i < dto.companies_id.length; i++) {
                await this.dataSource
                    .query(`
                        INSERT INTO ${process.env.DB_SCHEMA}.account_company  
                        (account_id,  company_id)
                        VALUES (${rolesAccount.id}, ${dto.companies_id[i]})
                    `
                )
                arrCompanies.push(dto.companies_id[i])
            }
        }

        let finalAccount = {
            ...rolesAccount,
            companies_id: [...arrCompanies],
        };

        delete finalAccount.password
        delete finalAccount.refresh_token
        return finalAccount
    }
    async createAccountGuard(dto: CreateAccountDto, group_id: number) {

        if (dto.companies_id) {
            for(let i: number = 0; i < dto.companies_id.length; i++) {
                const company = await this.companyService.getCompanyById(dto.companies_id[i])

                if (Number(company.group_id) != group_id ) {
                    throw new HttpException(`Вы не можете привязывать аккаунт к компании с id: ${dto.companies_id[i]}, так как указанная компания не входит в вашу группу `, HttpStatus.FORBIDDEN)
                }
            }
        }

        const account = await this.accountRepository.findOne({where: [{login: dto.login}]})
        if (account) {
            throw new HttpException(`Аккаунт с логин: ${dto.login} уже существует`, HttpStatus.BAD_REQUEST)
        }
        
        const hashPassword = await this.hashPasswordFn(dto.password)

        const newAccount = this.accountRepository.create({
            name: dto.name,
            surname: dto.surname,
            patronymic: dto.patronymic ? dto.patronymic : null,
            login:dto.login,
            telegram: dto.telegram ? dto.telegram : null, 
            password: hashPassword,
            group_id: group_id
        });

        let arrRole: Role[] = []
        for(let i: number = 0; i < dto.roles_id.length; i++) {
            const role = await this.roleService.getByIdGuard(dto.roles_id[i])
            arrRole = [...arrRole, role]
        }

        let rolesAccount = {
            ...newAccount,
            roles_id: [...arrRole],
        };

        await this.accountRepository.save(rolesAccount)
        
        let arrCompanies = []
        if (dto.companies_id) {
            for(let i: number = 0; i < dto.companies_id.length; i++) {
                await this.dataSource
                    .query(`
                        INSERT INTO ${process.env.DB_SCHEMA}.account_company  
                        (account_id,  company_id)
                        VALUES (${rolesAccount.id}, ${dto.companies_id[i]})
                    `
                )
                arrCompanies.push(dto.companies_id[i])
            }
        }

        let finalAccount = {
            ...rolesAccount,
            companies_id: [...arrCompanies],
        };

        delete finalAccount.password
        delete finalAccount.refresh_token
        return finalAccount
    }

    async findAccountByLogin(login: string ) {
        const account = await this.accountRepository.findOne({where: [{login: login}]})

        if (!account) {
                throw new HttpException(`Пользователь с логин: ${login} не найден`, HttpStatus.BAD_REQUEST) 
        }

        return account 
    }

    async findAccountById(id: number) {
        // const account = await this.dataSource
        //     .query(`
        //         SELECT account."id", "fio", "login", "telegram", "is_active", "date_last_login", 
        //         "role_id" FROM account  
        //         LEFT JOIN account_role ON account."id" = "account_id"
        //         WHERE "id"=${id} 
        //     `
        // )
        const account = await this.dataSource
            .query(`
                SELECT account."id", "name", "surname", "patronymic", "login", "telegram", "group_id", "is_active", "date_last_login" 
                FROM ${process.env.DB_SCHEMA}.account  WHERE "id"=${id} 
            `
        )
        if (!account.length) {
            throw new HttpException(`Пользователь с id: ${id} не найден`, HttpStatus.BAD_REQUEST) 
        }

        const companyes = await this.dataSource
            .query(`
                SELECT company_id FROM ${process.env.DB_SCHEMA}.account_company  
                WHERE "account_id"=${id}
            `
        )
        const roles = await this.dataSource
            .query(`
                SELECT role_id FROM ${process.env.DB_SCHEMA}.account_role  
                WHERE "account_id"=${id}
            `
        )
        console.log(getArrValueByKeyInArrObjects(roles, 'role_id') )
        const joinAccount = {...account[0],  
            companies_id: getArrValueByKeyInArrObjects(companyes, 'company_id'), 
            roles_id:  getArrValueByKeyInArrObjects(roles, 'role_id')
        }
        return joinAccount
    }

    // async findAccountByText(id: number) {
    //     const account = await this.dataSource
    //         .query(`
    //             SELECT account."id", "fio", "login", "telegram", "group_id", "is_active", "date_last_login" 
    //             FROM account  WHERE "id"=${id} 
    //         `
    //     )
    //     if (!account.length) {
    //         throw new HttpException(`Пользователь с id: ${id} не найден`, HttpStatus.BAD_REQUEST) 
    //     }

    //     const companyes = await this.dataSource
    //         .query(`
    //             SELECT company_id FROM account_company  
    //             WHERE "account_id"=${id}
    //         `
    //     )
    //     const roles = await this.dataSource
    //         .query(`
    //             SELECT role_id FROM account_role  
    //             WHERE "account_id"=${id}
    //         `
    //     )
    //     console.log(getArrValueByKeyInArrObjects(roles, 'role_id') )
    //     const joinAccount = {...account[0],  
    //         companies_id: getArrValueByKeyInArrObjects(companyes, 'company_id'), 
    //         roles_id:  getArrValueByKeyInArrObjects(roles, 'role_id')
    //     }
    //     return joinAccount
    // }

    async findAccountByIdGuard(id: number, group_id: number) {

        const account = await this.dataSource
            .query(`
                SELECT account."id", "name", "surname", "patronymic", "login", "telegram", "group_id", "is_active", "date_last_login" 
                FROM ${process.env.DB_SCHEMA}.account  WHERE "id"=${id} 
            `
        )

        if (Number(account[0].group_id !=  group_id) ) {
            throw new HttpException(`Нет доступа на получение пользователя`, HttpStatus.FORBIDDEN)
        }

        const companyes = await this.dataSource
            .query(`
                SELECT company_id FROM ${process.env.DB_SCHEMA}.account_company  
                WHERE "account_id"=${id}
            `
        )
        const roles = await this.dataSource
            .query(`
                SELECT role_id FROM ${process.env.DB_SCHEMA}.account_role  
                WHERE "account_id"=${id}
            `
        )
        const joinAccount = {...account[0],  
            companies_id: getArrValueByKeyInArrObjects(companyes, 'company_id'), 
            roles_id:  getArrValueByKeyInArrObjects(roles, 'role_id')
        }
        return joinAccount
    }

    async searchLimitOffset(page: number, limit: number, text: string) {
        if (page<=0) {
            page=1
        }
        let offset = (page - 1) * limit

        const arr = await this.dataSource
            .query(`
                SELECT "id", "name", "surname", "patronymic", "login", "telegram", "group_id", "is_active", "date_last_login" FROM ${process.env.DB_SCHEMA}.account 
                WHERE UPPER(surname) LIKE '${text.toUpperCase()}%'
            `)
        let totalPages = Math.ceil(arr.length / limit) 

        if (limit === 0) {
            limit = null
            page=1
            offset = 0
            totalPages = 1
        } 

        const arrLimit  = await this.dataSource
            .query(`
                SELECT "id", "name", "surname", "patronymic", "login", "telegram", "group_id", "is_active", "date_last_login" FROM ${process.env.DB_SCHEMA}.account 
                WHERE UPPER(surname) LIKE '${text.toUpperCase()}%'
                LIMIT ${limit}
                OFFSET ${offset}
            `)

        for (let i = 0; i < arrLimit.length; i++) {
            const roles = await this.dataSource
                .query(`
                    SELECT "role_id" FROM ${process.env.DB_SCHEMA}.account_role 
                    WHERE "account_id"=${arrLimit[i].id} 
                `)
            const companies = await this.dataSource
                .query(`
                        SELECT "company_id" FROM ${process.env.DB_SCHEMA}.account_company 
                        WHERE "account_id"=${arrLimit[i].id} 
                `)
            arrLimit[i] = {
                ...arrLimit[i],
                roles_id: getArrValueByKeyInArrObjects(roles, 'role_id')  ,
                companies_id: getArrValueByKeyInArrObjects(companies, 'company_id') 
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


    async searchLimitOffsetGuard(page: number, limit: number, group_id: number, text: string) {
        if (page<=0) {
            page=1
        }
        let offset = (page - 1) * limit

        const arr = await this.dataSource
            .query(`
                SELECT "id", "name", "surname", "patronymic", "login", "telegram", "group_id", "is_active", "date_last_login" FROM ${process.env.DB_SCHEMA}.account 
                WHERE UPPER(surname) LIKE '${text.toUpperCase()}%'
                AND group_id='${group_id}'
            `)
        let totalPages = Math.ceil(arr.length / limit) 

        if (limit === 0) {
            limit = null
            page=1
            offset = 0
            totalPages = 1
        } 

        const arrLimit  = await this.dataSource
            .query(`
                SELECT "id", "name", "surname", "patronymic", "login", "telegram", "group_id", "is_active", "date_last_login" FROM ${process.env.DB_SCHEMA}.account 
                WHERE UPPER(surname) LIKE '${text.toUpperCase()}%'
                AND group_id='${group_id}'
                LIMIT ${limit}
                OFFSET ${offset}
            `)

        for (let i = 0; i < arrLimit.length; i++) {
            const roles = await this.dataSource
                .query(`
                    SELECT "role_id" FROM ${process.env.DB_SCHEMA}.account_role 
                    WHERE "account_id"=${arrLimit[i].id} 
                `)
            const companies = await this.dataSource
                .query(`
                        SELECT "company_id" FROM ${process.env.DB_SCHEMA}.account_company 
                        WHERE "account_id"=${arrLimit[i].id} 
                `)
            arrLimit[i] = {
                ...arrLimit[i],
                roles_id: getArrValueByKeyInArrObjects(roles, 'role_id')  ,
                companies_id: getArrValueByKeyInArrObjects(companies, 'company_id') 
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

    async getAllAccountsLengthByCompanyId(id: number) {
        const companyes = await this.dataSource
            .query(`
                SELECT * FROM ${process.env.DB_SCHEMA}.account_company  
                WHERE "company_id"=${id}
            `
        )

        return companyes.length
    }

    async getAccountCompanyes(id: number) {
        const companyes = await this.dataSource
            .query(`
                SELECT "company_id" FROM ${process.env.DB_SCHEMA}.account_company  
                WHERE "account_id"=${id}
            `
        )
        return getArrValueByKeyInArrObjects(companyes, 'company_id') 
    }

    async updateDateLastLogin (id: number) {
        await this.accountRepository.update({ id: id }, { date_last_login: Date()}) 
    }

    async updateAccount(id: number, dto: UpdateAccountDto) {
        const account = await this.accountRepository.findOne({where: [{id: id}]})
        if (!account) {
            throw new HttpException(`Аккаунт с id: ${id} не найден`, HttpStatus.BAD_REQUEST)
        }

        if (dto.companies_id.length > 0) {
            for(let i = 0; i < dto.companies_id.length; i++) {
                await this.companyService.getCompanyById(dto.companies_id[i])
            }
        }

        let newArrRole: Role[] = []
        if (dto.roles_id.length) {
            for(let i: number = 0; i < dto.roles_id.length; i++) {
                const role = await this.roleService.getById(dto.roles_id[i])
                newArrRole = [...newArrRole, role]
            }
        }

        let newName: string
        if (dto.name) {
            newName = dto.name
        }

        let newSurname: string
        if (dto.surname) {
            newSurname = dto.surname
        }

        let newPatronymic: string
        if (dto.patronymic ) {
            newPatronymic = dto.patronymic 
        }

        let newTelegram: string
        if (dto.telegram) {
            newTelegram = dto.telegram
        }

        let newPassword: string
        if (dto.password) {
            newPassword = await this.hashPasswordFn(dto.password)
        }

        let newGroupId: number
        if (dto.group_id) {
            newGroupId = dto.group_id
        }

        let finalAccount = {
            ...account,
            name: newName ? newName : account.name,
            surname: newSurname ? newSurname : account.surname,
            patronymic: newPatronymic ? newPatronymic  : account.patronymic,
            telegram: newTelegram ? newTelegram : account.telegram,
            password: newPassword ? newPassword : account.password,
            roles_id: [...newArrRole],
            group_id: newGroupId ? newGroupId : account.group_id,
        };
        
        const currentСompany = await this.dataSource
            .query(`
                SELECT company_id FROM ${process.env.DB_SCHEMA}.account_company  
                WHERE account_id=${id}
            `
        ) 
        const convertedCurrentArr = getArrValueByKeyInArrObjects(currentСompany, 'company_id')
        const  addItem  = checkUniquenessTwoArrays(dto.companies_id, convertedCurrentArr)
        const deletedItem = checkUniquenessTwoArrays(convertedCurrentArr, dto.companies_id)

        if (addItem.length > 0) {
            for (let i =0; i < addItem.length; i++) {
                const company = await this.companyService.getCompanyById(addItem[i])
                if (Number(company.group_id) != dto.group_id ) {
                    throw new HttpException(`Вы не можете привязывать аккаунт к компании с id: ${dto.companies_id[i]}, так как указанная компания не входит в группу c id ${dto.group_id}`, HttpStatus.FORBIDDEN)
                }
            }
        }

        for (let i =0; i < deletedItem.length; i++) {
            await this.dataSource
                .query(`
                    DELETE FROM ${process.env.DB_SCHEMA}.account_company 
                    WHERE account_id=${id} AND company_id=${deletedItem[i]}
                `
            ) 
        }

        for (let i =0; i < addItem.length; i++) {
            await this.dataSource
                .query(`
                    INSERT INTO ${process.env.DB_SCHEMA}.account_company  
                    (account_id,  company_id)
                    VALUES (${id}, ${addItem[i]})
                `
            )
        }

        await this.accountRepository.save(finalAccount)
        return  await this.findAccountById(finalAccount.id)
    }

    async updateAccountGuard(id: number, dto: UpdateAccountDto, group_id: number) {
        const account = await this.accountRepository.findOne({where: [{id: id}]})

        if (!account) {
            throw new HttpException(`Аккаунт с id: ${id} не найден`, HttpStatus.NOT_FOUND)
        }
        if (Number(account.group_id) === 0 || Number(account.group_id) !== group_id) {
            throw new HttpException(`Нет прав на редактирование аккаунта с id: ${id}`, HttpStatus.FORBIDDEN)
        }
        
        let newArrRole: Role[] = []
        if (dto.roles_id.length) {
            for(let i: number = 0; i < dto.roles_id.length; i++) {
                const role = await this.roleService.getByIdGuard(dto.roles_id[i])
                newArrRole = [...newArrRole, role]
            }
        }

        let newName: string
        if (dto.name) {
            newName = dto.name
        }

        let newSurname: string
        if (dto.surname) {
            newSurname = dto.surname
        }

        let newPatronymic: string
        if (dto.patronymic ) {
            newPatronymic = dto.patronymic 
        }

        let newTelegram: string
        if (dto.telegram) {
            newTelegram = dto.telegram
        }

        let newPassword: string
        if (dto.password) {
            newPassword = await this.hashPasswordFn(dto.password)
        }

        let finalAccount = {
            ...account,
            name: newName ? newName : account.name,
            surname: newSurname ? newSurname : account.surname,
            patronymic: newPatronymic ? newPatronymic  : account.patronymic,
            telegram: newTelegram ? newTelegram : account.telegram,
            password: newPassword ? newPassword : account.password,
            roles_id: [...newArrRole],
        };
        
        const currentСompany = await this.dataSource
            .query(`
                SELECT company_id FROM ${process.env.DB_SCHEMA}.account_company  
                WHERE account_id=${id}
            `
        ) 
        const convertedCurrentArr = getArrValueByKeyInArrObjects(currentСompany, 'company_id')
        const  addItem  = checkUniquenessTwoArrays(dto.companies_id, convertedCurrentArr)
        const deletedItem = checkUniquenessTwoArrays(convertedCurrentArr, dto.companies_id)

        if (addItem.length > 0) {
            for (let i =0; i < addItem.length; i++) {
                const company = await this.companyService.getCompanyById(addItem[i])
                if (Number(company.group_id) != group_id ) {
                    throw new HttpException(`Вы не можете привязывать аккаунт к компании с id: ${dto.companies_id[i]}, так как указанная компания не входит в группу c id ${dto.group_id}`, HttpStatus.FORBIDDEN)
                }
            }
        }

        for (let i =0; i < deletedItem.length; i++) {
            await this.dataSource
                .query(`
                    DELETE FROM ${process.env.DB_SCHEMA}.account_company 
                    WHERE account_id=${id} AND company_id=${deletedItem[i]}
                `
            )
        }

        for (let i =0; i < addItem.length; i++) {
            await this.dataSource
                .query(`
                    INSERT INTO ${process.env.DB_SCHEMA}.account_company  
                    (account_id,  company_id)
                    VALUES (${id}, ${addItem[i]})
                `
            )
        }

        await this.accountRepository.save(finalAccount)
        return  await this.findAccountById(finalAccount.id)
    }

    async deleteAccount(id: number) {
        await this.dataSource
            .query(`
                DELETE FROM ${process.env.DB_SCHEMA}.account_company  
                WHERE account_id=${id}
            `
        )
        await this.accountRepository.delete({ id: id });
        return 'Аккаунт удален'
    }
}


