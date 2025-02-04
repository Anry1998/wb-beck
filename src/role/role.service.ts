import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entity/role.entity';
import { Permission } from '../permission/entity/permission.entity';
import { PermissionService } from '../permission/permission.service';
import { getArrValueByKeyInArrObjects } from '../@helpers/converted-arrs.helper';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role) private roleRepository: Repository<Role>,
        @InjectDataSource() private dataSource: DataSource,
        private permissionService: PermissionService,
    ) {}

    async getAllLimitOffset(page: number, limit: number) {
        if (page<=0) {
            page=1 
        }
        let offset = (page - 1) * limit

        const arr = await this.roleRepository.find()
        let totalPages = Math.ceil(arr.length / limit) 

        if (limit === 0) {
            limit = null
            page=1
            offset = 0
            totalPages = 1
        }

        const arrLimit = await this.dataSource
            .query(`
                SELECT * FROM ${process.env.DB_SCHEMA}.role  
                LIMIT ${limit} 
                OFFSET ${offset}
            `)

        for(let i =0; i < arrLimit.length; i++) {
            const permissions = await this.dataSource
                .query(`
                    SELECT permission."id", "permission_type" FROM ${process.env.DB_SCHEMA}.role_permissions  
                    RIGHT JOIN ${process.env.DB_SCHEMA}.permission ON role_permissions."permission_id" = permission."id"
                    WHERE "role_id"=${arrLimit[i].id}
                    
                `)
            
            arrLimit[i] = {
                ...arrLimit[i],
                permissions
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

    async getAllLimitOffsetGuard(page: number, limit: number) {
        if (page<=0) {
            page=1 
        }
        let offset = (page - 1) * limit

        const arr = await this.roleRepository.find({where: {vailableEveryone: true}})
        let totalPages = Math.ceil(arr.length / limit) 

        if (limit === 0) {
            limit = null
            page=1
            offset = 0
            totalPages = 1
        }

        const arrLimit = await this.dataSource
            .query(`
                SELECT * FROM ${process.env.DB_SCHEMA}.role  
                WHERE "vailableEveryone"=true
                LIMIT ${limit} 
                OFFSET ${offset}
            `)
        for(let i =0; i < arrLimit.length; i++) {
            const permissions = await this.dataSource
                .query(`
                    SELECT permission."id", "permission_type" FROM ${process.env.DB_SCHEMA}.role_permissions  
                    RIGHT JOIN ${process.env.DB_SCHEMA}.permission ON role_permissions."permission_id" = permission."id"
                    WHERE "role_id"=${arrLimit[i].id}  
                `)
                
            arrLimit[i] = {
                ...arrLimit[i],
                permissions
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
        const role = await this.roleRepository.findOne({where: [{id: id}]})
        if (!role) {
            throw new HttpException(`Роль c id: ${id} не найдена`, HttpStatus.BAD_REQUEST) 
        }
        return role
    }

    async getByIdGuard(id: number) {
        const role = await this.roleRepository.findOne({where: [{id: id}]})
        if (!role) {
            throw new HttpException(`Роль c id: ${id} не найдена`, HttpStatus.BAD_REQUEST) 
        }
        if (role.vailableEveryone === false) {
            throw new HttpException(`У вас нет доступа к роли с id: ${id}`, HttpStatus.FORBIDDEN)
        }
        return role
    }

    async createRole(dto: CreateRoleDto) {
        const role = await this.roleRepository.findOne({where: [{name: dto.name}]})
        if (role) {
            throw new HttpException(`Роль: ${dto.name} уже существует`, HttpStatus.BAD_REQUEST)
        }
        const newRole = this.roleRepository.create({name: dto.name, vailableEveryone: dto.vailableEveryone});
        
        let arrPermission: Permission[] = []
        for(let i: number = 0; i < dto.permissions.length; i++) {
            const permission = await this.permissionService.findPermissionById(dto.permissions[i])
            if (!permission) {
                throw new HttpException(`Разрешения с id: ${dto.permissions[i]} не существует`, HttpStatus.NOT_FOUND)
            }
            arrPermission = [...arrPermission, permission]
        }

        let finalRole = {
            ...newRole,
            permissions: [...arrPermission], 
        };

        return await this.roleRepository.save(finalRole);
    }

    async updateRole(id: number, dto: UpdateRoleDto) {

        if (dto.name === undefined && dto.vailableEveryone === undefined && dto.permissions === undefined) {
            throw new HttpException(`Для изменения роли заполните хотябы одно из полей: name, vailableEveryone или permissions`, HttpStatus.BAD_REQUEST)
        }

        const role = await this.getById(id)
        const checkRoleName = await this.roleRepository.findOne({where: [{name: dto.name}]})
        if (checkRoleName && checkRoleName.id !== id) {
            throw new HttpException(`Роль: ${dto.name} уже существует`, HttpStatus.BAD_REQUEST)
        }

        let arrNewPermission: Permission[] = []
        if(dto.permissions) {
            for(let i: number = 0; i < dto.permissions.length; i++) {
                const permission = await this.permissionService.findPermissionById(dto.permissions[i])
                arrNewPermission = [...arrNewPermission, permission]
            }
        }

        if(dto.name !== undefined || dto.vailableEveryone !== undefined) {
            await this.roleRepository.update({ id: id }, 
                { 
                    name:  dto.name !== undefined ? dto.name : role.name,
                    vailableEveryone: dto.vailableEveryone !== undefined ? dto.vailableEveryone : role.vailableEveryone,
            });
        }

        if(arrNewPermission.length > 0) {
            const role = await this.getById(id)
            let finalRole  = {
                ...role,
                permissions: [...arrNewPermission],
            } 
            await this.roleRepository.save(finalRole);
            return finalRole
        }

        return await this.getById(id)
    }

    async deleteRole(id: number) {
        await this.roleRepository.delete({ id: id });
        return `Роль c id ${id} удалена`
    }

    async getRolePermissions(roleId: number) {
        const role = await this.roleRepository.findOne({where: [{id: roleId}]})
        if (!role) {
            throw new HttpException(`Роль c id: ${roleId} не найдена`, HttpStatus.BAD_REQUEST) 
        }
        return getArrValueByKeyInArrObjects(role.permissions, 'permission_type') 
    }

    async getPermissionsFromRolesIdArr(roleIdArr: number[]) {
        let permissionsArr = []

        for(let i: number = 0; i < roleIdArr.length; i++) {
            let permission = await this.getRolePermissions(roleIdArr[i])
            permissionsArr  = [...permissionsArr, ...permission]
        }

        function uniqueArr(arr: any[]) {
            let result = []
            for (let str of arr) {
              if (!result.includes(str)) {
                result.push(str);
              }
            }
            return result;
        }
        
        return uniqueArr(permissionsArr) 
    }
}
