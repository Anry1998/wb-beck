import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Account } from '../../account/entity/account.entity';
import { Marketplace } from '../../marketplace/entity/marketplace.entity';
// import { CompaniesGroup } from '../../companies-group/entity/companies-group.entity';
@Entity({ name: 'sellers', schema: 'portal' })
export class Company {
    @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
    @PrimaryGeneratedColumn('increment')
    seller_id: number;

    // @ApiProperty({example: 1, description: 'Id группы компаний'})
    // @ManyToOne(() => CompaniesGroup, (item) => item.id)
    // @JoinColumn({ name: 'group_id', referencedColumnName: 'id' })
    // group_id: number;

    @ApiProperty({example: 1, description: 'Число'})
    @Column("bigint")
    group_id: number; 

    @ApiProperty({example: 1111111111, description: 'Число'})
    @Column("bigint")
    inn: number; 

    @ApiProperty({example: 'Веселый молочник', description: 'Название компании'})
    @Column("text")
    seller_name: string;

    @ApiProperty({example: 1, description: 'Id маркетплейса'})
    @ManyToOne(() => Marketplace, (item) => item.id, {})
    @JoinColumn({ name: 'marketplace_id', referencedColumnName: 'id'})
    marketplace_id: number;

    //@ApiProperty({example: 11, description: 'Число'})
    @Column("bigint", {default: null})
    foreign_seller_id: number; 

    @ApiProperty({example: 11, description: 'Число'})
    @Column("smallint")
    dni_vsego: number;

    @ApiProperty({example: 'УСН', description: 'forma_naloga'})
    @Column("text")
    forma_naloga: string;

    @ApiProperty({example: 11, description: 'Число'})
    @Column("smallint")
    nalog: number; 

    @ApiProperty({example: 11, description: 'Число'})
    @Column("smallint")
    dni_wb: number; 

    // @ApiProperty({example: 1111111111, description: 'Число'})
    @Column("smallint", {default: 0})
    update_sources: number; 

    // @ApiProperty({example: 1111111111, description: 'Число'})
    @Column("smallint", {default: 0})
    update_weekly_report: number; 

    // @ApiProperty({example: 1111111111, description: 'Число'})
    @Column("smallint", {default: 0})
    update_daily_report: number; 

    // @ApiProperty({example: 1111111111, description: 'Число'})
    @Column("smallint", {default: 0})
    update_advertising: number; 

    // @ApiProperty({example: 1111111111, description: 'Число'})
    @Column("smallint", {default: 0})
    cookies: number; 

    // @ApiProperty({example: 1111111111, description: 'Число'})
    @Column("date", {default: new Date()})
    connection_date: Date; 

    // @ApiProperty({example: 1111111111, description: 'Число'})
    @Column("date", {default: null})
    disconnection_date: Date; 

    // @ApiProperty({example: 'Веселый молочник', description: 'Название компании'})
    @Column("text",{default: 'new'})
    status: string;

    // @ApiProperty({example: 'Веселый молочник', description: 'Название компании'})
    @Column("text",{default: null})
    manager: string;

    // @ApiProperty({example: '2024-11-21 20:14:33.437058', description: 'Число'})
    @Column("date", {default: null})
    call_date_1: Date; 

    // @ApiProperty({example: '2024-11-21 20:14:33.437058', description: 'Число'})
    @Column("date", {default: null})
    call_date_2: Date; 

    // @ApiProperty({example: '2024-11-21 20:14:33.437058', description: 'Дата создания'})
    @CreateDateColumn()
    created_at: Date;

    // @ApiProperty({example: '2024-11-21 20:14:33.437058', description: 'Дата создания'})
    @UpdateDateColumn()
    updated_at: Date;

    // @ApiProperty({example: 1111111111, description: 'Число'})
    @Column("boolean", {default: false})
    is_deleted: boolean; 
  
    @ManyToMany(() => Account, {
    })
    accounts: Account[]; 
}

