import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Company } from '../../company/entity/company.entity';
@Entity({ name: 'group', schema: 'portal' })
export class CompaniesGroup {
    @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
    @PrimaryGeneratedColumn('increment')
    group_id: number; 

    @ApiProperty({example: 'Название', description: 'Название группы компаний'})
    @Column("varchar")
    group_name: string;

    // @ApiProperty({example: 1111111111, description: 'Число'})
    @Column("boolean", {default: false})
    is_deleted: boolean; 

    @OneToMany(() => Company, (item) => item.group_id, {
    })
    companyes: Company[]
}

