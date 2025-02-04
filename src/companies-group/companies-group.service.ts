import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CompaniesGroup } from './entity/companies-group.entity';
import { CreateCompaniesGroupDto } from './dto/create-companies-group.dto';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { UpdateCompaniesGroupDto } from './dto/update-companies-group.dto';
import { checkUniquenessTwoArrays, getArrValueByKeyInArrObjects } from '../@helpers/converted-arrs.helper';
import { CompanyService } from '../company/company.service';
import { AccountService } from '../account/account.service';

@Injectable()
export class CompaniesGroupService {
    constructor(
        @InjectRepository(CompaniesGroup) private companiesGroupRepository: Repository<CompaniesGroup>,
        @InjectDataSource() private dataSource: DataSource, 
        // @InjectDataSource('secondaryDB') private dataSource2: DataSource,
        @Inject(forwardRef(() => CompanyService)) private companyService: CompanyService, 
        private accountService: AccountService, 
        
    ) {}

    async getAllLimitOffset(page: number, limit: number) {
        if (limit <= 0) {
            limit = 1 
        }

        if (page<=0) {
            page=1
        }

        let offset = (page - 1) * limit

        const arrAll = await this.dataSource
            .query(`
                SELECT "group_id", "group_name" FROM ${process.env.DB_SCHEMA}.group  
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
                SELECT "group_id", "group_name" FROM ${process.env.DB_SCHEMA}.group  
                WHERE "is_deleted"=false
                LIMIT ${limit} 
                OFFSET ${offset}
            `)

        for(let i =0; i < arrLimit.length; i++) {

            const counter = await   this.companyService.getAllCompanyesByGroupId(arrLimit[i].group_id)

            arrLimit[i] = {
                ...arrLimit[i],
                counter: counter.length,
                companies: counter
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

    async getById(id: number) {

        const arr = await this.dataSource
            .query(`
                SELECT "group_id", "group_name" FROM ${process.env.DB_SCHEMA}.group  
                WHERE "is_deleted"=false
                AND "group_id"=${id}
            `)
        console.log("arr: ", arr)

        for(let i =0; i < arr.length; i++) {
            const counter = await   this.companyService.getAllCompanyesByGroupId(arr[i].group_id)
            arr[i] = {
                ...arr[i],
                counter: counter.length,
                companies: counter
            }
        }

        return arr[0]
    }

    async create(dto: CreateCompaniesGroupDto) {
        const group = await this.companiesGroupRepository.findOne({where: [
            {group_name: dto.group_name},
        ]})
        if (group) {
            throw new HttpException(`Группа: ${dto.group_name} уже существует`, HttpStatus.BAD_REQUEST)
        }
        const newGroup = await this.companiesGroupRepository.save(dto)
        return   [newGroup]
    }

    async update(id: number, dto: UpdateCompaniesGroupDto) {
        await this.companiesGroupRepository.findOne({where: [{group_id: id}]})
        await this.companiesGroupRepository.update({ group_id: id }, { group_name: dto.group_name}) 
        const group = await this.getById(id)
        console.log('group: ', [group] )
        return [group]
    }
}
