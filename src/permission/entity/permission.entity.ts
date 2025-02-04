import {
    Column,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Role } from '../../role/entity/role.entity';
@Entity({ name: 'permission', schema: 'portal' })
export class Permission {
    @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @ApiProperty({example: 'CREATE_ROLES', description: 'permission_type'})
    @Column("varchar", {unique: true})
    permission_type: string;

    @ManyToMany(() => Role, role => role.id)
    role: Role[]
}

