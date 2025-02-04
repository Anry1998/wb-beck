import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import * as uuid  from 'uuid';
import * as path  from 'path';

import { Marketplace } from './entity/marketplace.entity';
import { CreateMarketplaceDto } from './dto/create-marketplace.dto';
import { UpdateMarketplaceDto } from './dto/update-marketplace.dto';

@Injectable()
export class MarketplaceService {
    constructor(
        @InjectRepository(Marketplace) private marketplaceRepository: Repository<Marketplace>, 
        @InjectDataSource() private dataSource: DataSource, 
        // @InjectDataSource('secondaryDB') private dataSource2: DataSource,
    ) {}

    async createMarketplace(dto: CreateMarketplaceDto) {
        const marketplace = await this.marketplaceRepository.findOne({where: [
            {marketplace_name: dto.name},
        ]})
        if (marketplace) {
            throw new HttpException(`Маркетплейс: ${dto.name} уже существует`, HttpStatus.BAD_REQUEST)
        } 
        return await this.marketplaceRepository.save({marketplace_name: dto.name})
    }

    async getAllMarketplace(options: IPaginationOptions) {
        const res = await paginate<Marketplace>(this.marketplaceRepository, options);
        return res
    }

    async getMarketplaceById(id: number) {
        const marketplace = await this.marketplaceRepository.findOne({where: [{id: id}]})
        if (!marketplace) {
            throw new HttpException(`Маркетплейс c id: ${id} не найден`, HttpStatus.BAD_REQUEST) 
        }
        return marketplace

    }   

    async updateMarketplace(id: number, dto: UpdateMarketplaceDto) {
        await this.getMarketplaceById(id)
        await this.marketplaceRepository.update({ id: id }, { marketplace_name: dto.name}) 
        return await this.getMarketplaceById(id)

    } 

    async deleteMarketplace(id: number) {
        await this.getMarketplaceById(id)
        await this.marketplaceRepository.delete({ id: id });
        return 'Маркетплейс удален'
    }
}
