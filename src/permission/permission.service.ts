import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permission } from './entity/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission) private permissionRepository: Repository<Permission>,  
    ) {}

    async createPermission(dto: CreatePermissionDto ): Promise<Permission> {
        const permission = await this.permissionRepository.findOne({where: [{permission_type: dto.permission_type}]})
        if (permission) {
            throw new HttpException(`Разрешение: ${dto.permission_type} уже существует`, HttpStatus.BAD_REQUEST)
        }
        return await this.permissionRepository.save(dto)
    }
    async getAllPermission(options: IPaginationOptions): Promise<Pagination<Permission>> {
        return paginate<Permission>(this.permissionRepository, options);
    }

    async findPermissionByType(name: string) {
        const permission = await this.permissionRepository.findOne({where: [{permission_type: name}]})
        if (!permission) {
            throw new HttpException(`Разрешение: ${name} не найдено`, HttpStatus.BAD_REQUEST) 
        }
        return permission
    }

    async findPermissionById(id: number) {
        const permission = await this.permissionRepository.findOne({where: [{id: id}]})
        if (!permission) {
            throw new HttpException(`Разрешение c id: ${id} не найдено`, HttpStatus.BAD_REQUEST) 
        }
        return permission
    }

}
