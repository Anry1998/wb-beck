import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { Company } from '../../company/entity/company.entity';
import { Role } from '../../role/entity/role.entity';

@Entity({ name: 'account', schema: 'portal' })
export class Account {
    @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ApiProperty({example: 'Иванов', description: 'Фамилия'})
    @Column("varchar")
    surname: string;

    @ApiProperty({example: 'Иван', description: 'Имя'})
    @Column("varchar")
    name: string;

    @ApiProperty({example: 'Иваныч', description: 'Отчество'})
    @Column("varchar", {default: null})
    patronymic?: string;

    @ApiProperty({example: 'userLogin', description: 'Логин'})
    @Column("varchar", {unique: true})
    login: string;

    @ApiProperty({example: '@Telegram', description: 'Telegram'})
    @Column("varchar", {default: null})
    telegram: string;

    @Column("varchar")
    password: string;

    @ApiProperty({type: [Role], description: 'Массив ролей'})
    @ManyToMany(() => Role, {
        cascade: true,
        eager: true,
    })
    @JoinTable({
            name: "account_role",
            joinColumn: { name: "account_id", referencedColumnName: "id" },
            inverseJoinColumn: { name: "role_id" }}
    )
    roles_id: Role[];

    @ApiProperty({type: [Company] , description: 'Массив компаний'})
    @ManyToMany(() => Company)
    @JoinTable({
            name: "account_company",
            joinColumn: { name: "account_id", referencedColumnName: "id" },
            inverseJoinColumn: { name: "company_id" }}
    )
    companies_id: Company[];

    @ApiProperty({example: 1, description: 'Id группы'})
    @Column("bigint", {default: null})
    group_id: number;

    @Column("varchar", {default: null})
    refresh_token: string;

    @ApiProperty({example: false, description: 'is_active: boolean'})
    @Column("boolean", {default: false})
    is_active: boolean;

    @ApiProperty({example: null, description: 'date_last_login'})
    @Column("timestamp", {default: null})
    date_last_login: Date;
}
export class SerializationAccount{
    id: number;
    fio: string;
    login: string;
    telegram: string;
    @Exclude()
    password: string
    roles_id: Role[];
    // companies_id: Company[];
    @Exclude()
    refresh_token: string;
    is_active: boolean;
    date_last_login: Date;

    constructor(partial: Partial<SerializationAccount>) {
        Object.assign(this, partial);
    }
}
