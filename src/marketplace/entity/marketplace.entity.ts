import {
    Column,
    Entity, 
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Company } from '../../company/entity/company.entity';

@Entity({ name: 'marketplace', schema: 'portal' })
export class Marketplace {
    @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
    @PrimaryGeneratedColumn('increment')
    id: number; 

    @ApiProperty({example: 'Wildberries', description: 'Название маркетплейса'})
    @Column("varchar", {unique: true})
    marketplace_name: string;

    @OneToMany(() => Company, (item) => item.marketplace_id)
    companies: Company[]
}

 