import { Injectable } from '@nestjs/common';
import {readFileSync} from 'fs';

import { PermissionService } from '../permission/permission.service';
import { CreatePermissionDto } from '../permission/dto/create-permission.dto';
import { RoleService } from '../role/role.service';
import { CreateRoleDto } from '../role/dto/create-role.dto';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { CreateMarketplaceDto } from '../marketplace/dto/create-marketplace.dto';
import { CompaniesGroupService } from '../companies-group/companies-group.service';
import { CreateCompaniesGroupDto } from '../companies-group/dto/create-companies-group.dto';
import { CompanyService } from '../company/company.service';
import { CreateCompanyDto } from '../company/dto/create-company.dto';
import { AccountService } from '../account/account.service';
import { CreateAccountDto } from '../account/dto/create-account.dto';

@Injectable()
export class SeedersService {
    constructor(
        private permissionService: PermissionService,
        private roleService: RoleService,
        private marketplaceService: MarketplaceService,
        private companiesGroupService: CompaniesGroupService,
        private companyService: CompanyService,
        private accountService: AccountService,
    ) {}

    async seedPermissions() {
        const data: CreatePermissionDto[] = [
            { permission_type: 'Создание маркетплейса' },             // 1
            { permission_type: 'Получение списка маркетплейсов' },    // 2
            { permission_type: 'Получение маркетплейса по id' },     // 3
            { permission_type: 'Обновление маркетплейса' },          // 4
            { permission_type: 'Удаление маркетплейса' },            // 5

            { permission_type: 'Создание группы компаний' },                                       // 6+
            { permission_type: 'Получение списка всех групп компаний' },                           // 7+- limit 0 не возвращает все группы
            { permission_type: 'Получение любой группы компаний по id' },                          // 8+
            { permission_type: 'Получение группы компаний по id, за которой закреплен аккаунт' },  // 9+
            { permission_type: 'Обновление любой группы компаний' },                               // 10+
            { permission_type: 'Обновление группы компаний, за которой закреплен аккаунт' },       // 11+
            // { permission_type: 'Удаление любой группы компаний' },                                 
            // { permission_type: 'Удаление группы компаний, за которой закреплен аккаунт' },       
 
            { permission_type: 'Создание любой компании' },                                                // 12+                                                             
            { permission_type: 'Создание компании с привязкой к группе, за которой закреплен аккаунт' },   // 13 +
            { permission_type: 'Получение списка всех компаний' },                                         // 14 +- limit 0 не возвращает все группы, если пустой массив last_page=?
            { permission_type: 'Получение списка всех компаний, входящих в группу, за которой закреплен аккаунт' },// 15 portal.fn_sellers_get_bygroup  не предусмотрен limit page
            { permission_type: 'Получение списка компаний, сотрудником которых является аккаунт' },        // 16 +- не предусмотрен limit page нет lastPage
            // либой аккаунт может получить компанию по id, если закреплен за ней, см. permission.guard.ts 
            { permission_type: 'Получение любой компании по id' },                                         // 17
            { permission_type: 'Получение любой компании из группы, за которой закреплен аккаунт' },      // 18
            { permission_type: 'Обновление любой компании' },                                              // 19 +
            { permission_type: 'Обновление компании, входящей в группу, за которой закреплен аккаунт' },   // 20
            { permission_type: 'Удаление любой компании' },                                                // 21
            { permission_type: 'Удаление компании, входящей в группу, за которой закреплен аккаунт' },     // 22

            { permission_type: 'Получение списка разрешений' },      // 23

            { permission_type: 'Создание роли' },                                    // 24
            { permission_type: 'Получение списка всех ролей' },                      // 25
            { permission_type: 'Получение списка ролей c меткой "Доступна всем"' },  // 26
            { permission_type: 'Получение любой роли по id' },                       // 27
            { permission_type: 'Получение роли по id c меткой "Доступна всем"' },   // 28
            { permission_type: 'Обновление роли' },                                 // 29
            { permission_type: 'Удаление роли' },                                   // 30

            { permission_type: 'Создание аккаунта' },                                                                           // 31 +
            { permission_type: 'Создание аккаунта, с привязкой к группе компаний и компаниям, за которыми закреплен аккаунт' }, // 32 +
            { permission_type: 'Получение списка аккаунтов' },                                                                  // 33 +
            { permission_type: 'Получение списка аккаунтов, привязанных к одной группе' },                                      // 34 +
            { permission_type: 'Получение любого аккаунта по id' },                                                             // 35 +
            { permission_type: 'Получение аккаунта по id, привязанного к одной группе' },                                       // 36 +
            { permission_type: 'Обновление любого аккаунта' },                                                                  // 37 +
            { permission_type: 'Обновление аккаунта, привязанного к одной группе' },                                            // 38 +
            { permission_type: 'Удаление любого аккаунта' },                                                                    // 39 +
            { permission_type: 'Удаление аккаунта, привязанного к одной группе' },                                              // 40 +


            { permission_type: 'Проверка файла перед загрузкой в справочник Себестоимость (по любой компании)' },                                              // 41
            { permission_type: 'Проверка файла перед загрузкой в справочник Себестоимость (по всем компаниям, входящим в группу)' },                           // 42
            { permission_type: 'Проверка файла перед загрузкой в справочник Себестоимость (только по компаниям, сотрудником которых является пользователь)' }, // 43

            { permission_type: 'Загрузка json в справочник Себестоимость (по любой компании)' },                                                               // 44
            { permission_type: 'Загрузка json в справочник Себестоимость (по всем компаниям, входящим в группу)' },                                            // 45
            { permission_type: 'Загрузка json в справочник Себестоимость (только по компаниям, сотрудником которых является пользователь)' },                  // 46

            { permission_type: 'Получение информации из справочника Себестоимость (по любой компании)' },                                                      // 47
            { permission_type: 'Получение информации из справочника Себестоимость (по всем компаниям, входящим в группу)' },                                   // 48
            { permission_type: 'Получение информации из справочника Себестоимость (только по компаниям, сотрудником которых является пользователь)' },         // 49

            { permission_type: 'Скачивание excel файла - справочник Себестоимость (по любой компании)' },                                                      // 50
            { permission_type: 'Скачивание excel файла - справочник Себестоимость (по всем компаниям, входящим в группу)' },                                   // 51
            { permission_type: 'Скачивание excel файла - справочник Себестоимость (только по компаниям, сотрудником которых является пользователь)' },         // 52


                       // Не распределенные
            { permission_type: 'Поиск аккаунта(ов)' },                                       // 53
            { permission_type: 'Поиск аккаунта(ов), привязанного(ых) к одной группе' },      // 54

        ];

        for(let i =0; i < data.length; i++) {
            await this.permissionService.createPermission(data[i]);
        }
    }

    async seedRoles() {
        const data: CreateRoleDto[] = [
            { name: 'Администратор', vailableEveryone: false, permissions: [
                1, 2, 3, 4, 5, 
                6, 7, 8, 10, 
                12, 14, 17, 19, 21,
                23,
                24, 25, 27, 29, 30,
                31, 33, 35, 37, 39,
                41, 44, 47, 50,
                53
            ] },
            { name: 'Владелец группы компаний', vailableEveryone: true, permissions: [
                2, 3,
                9, 11,
                13, 15, 18, 20, 22,
                26, 28,
                32, 34, 36, 38, 40,
                42, 45, 48, 51,
                54
            ]},
            { name: 'Сотрудник', vailableEveryone: true, permissions: [
                2, 3,
                16, 
                43, 46, 49, 52
            ]}
        ];

        for(let i=0; i < data.length; i++) {
            await this.roleService.createRole(data[i]);
        }
    }

    async seedMarketplaces() {
        const data: CreateMarketplaceDto[] = [
            { name: 'Wildberries' },
            { name: 'OZON'},
        ];


        for(let i=0; i < data.length; i++) {
            await this.marketplaceService.createMarketplace( data[i]);
        }
    }

    async seedCompaniesGroups() {
        const data: CreateCompaniesGroupDto[] = [
            { group_name: 'Test group' },
            { group_name: 'Test group2' },
        ];

        for(let i=0; i < data.length; i++) {
            await this.companiesGroupService.create(data[i]);
        }
    }

    async seedCompanies() {
        enum IFormaNaloga {
            OSHO = 'ОСНО' , 
            YSN = 'УСН',
        }

        const data: CreateCompanyDto[] = [
            { marketplace_id: 1, seller_name: 'Веселый молочник',
            inn: 12345678910, group_id: 1,  forma_naloga: IFormaNaloga.OSHO , nalog: 1,  dni_vsego: 1, dni_wb: 1},
            { marketplace_id: 1, seller_name: 'Любимый',
                inn: 12345678910, group_id: 2,  forma_naloga: IFormaNaloga.YSN , nalog: 1,  dni_vsego: 1, dni_wb: 1},
        ];

        for(let i=0; i < data.length; i++) {
            await this.companyService.createCompany(data[i]);
        }
    }

    async seedAccounts() {
        const data: CreateAccountDto[] = [
            {  surname: 'Иванов', name: 'Иван', patronymic: 'Иванович', login: 'IvanLogin',
            telegram: '@Ivan', password: 'Ivan1!',  roles_id: [1]},
            {  surname: 'Петров', name: 'Петр', patronymic: 'Петрович', login: 'PiotrLogin',
            telegram: '@Piotr', password: 'Piotr1!', group_id: 2,  roles_id: [2], companies_id: [2]},
            {  surname: 'Сидоров', name: 'Сидр', patronymic: 'Сидорович', login: 'SidorLogin',
                telegram: '@Sidor', password: 'Sidor1!', group_id: 2,  roles_id: [3], companies_id: [2]},
        ];

        for(let i=0; i < data.length; i++) {
            await this.accountService.createAccount(data[i]); 
        }
    }

    async seedAll() {
        await this.seedPermissions()
        await this.seedRoles()
        await this.seedMarketplaces()
        await this.seedCompaniesGroups()
        await this.seedCompanies()
        await this.seedAccounts()
    }
}
 