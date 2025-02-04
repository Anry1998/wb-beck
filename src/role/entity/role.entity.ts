import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Account } from '../../account/entity/account.entity';
import { Permission } from '../../permission/entity/permission.entity';
@Entity({ name: 'role', schema: 'portal' })
export class Role {
    @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @ApiProperty({example: 'ADMIN', description: 'role_name'})
    @Column("varchar", {unique: true})
    name: string;

    @ApiProperty({example: true, description: 'Доступна ли роль всем '})
    @Column("boolean") 
    vailableEveryone: boolean;

    @ManyToMany(() => Account, account => account.id)
    account: Account[] 

    @ApiProperty({type: [Permission], description: 'Массив permissions'})
    @ManyToMany(() => Permission, {
        cascade: true,
        eager: true,
    })
    @JoinTable({
        name: "role_permissions",
        joinColumn: { name: "role_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "permission_id" }
    })
    permissions: Permission[];
}

