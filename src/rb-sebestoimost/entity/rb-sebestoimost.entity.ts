// import {
//     Column,
//     CreateDateColumn,
//     Entity,
//     JoinColumn,
//     ManyToOne,
//     PrimaryGeneratedColumn,
// } from 'typeorm';
// import { ApiProperty } from '@nestjs/swagger';

// // import { Company } from '../../company/entity/company.entity';

// @Entity({ name: 'referencebook_cost' })
// export class ReferencebookCost {
//     @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
//     @PrimaryGeneratedColumn('increment')
//     id: number;

//     // @ApiProperty({example: '2024-11-21 20:14:33.437058', description: 'Дата'})
//     // @CreateDateColumn() 
//     // date: Date;
//     @ApiProperty({example: '', description: 'Дата'})
//     @Column({ type: 'date' })
//     date: Date;

//     // @ApiProperty({example: 1, description: 'Id '})
//     // @ManyToOne(() => Company, (item) => item.seller_id) 
//     // @JoinColumn({ name: 'company_id', referencedColumnName: 'id'})
//     // company_id: number;

//     @ApiProperty({example: 1111111111, description: 'Число'})
//     @Column("bigint")
//     article: number; 

//     @ApiProperty({example: 1111111111, description: 'Число'})
//     @Column("bigint")
//     article_seller: number; 

//     @ApiProperty({example: '1234Sa34', description: 'Cтрока'})
//     @Column("varchar")
//     barcode?: string;

//     @ApiProperty({example: 1111111111, description: 'Число'})
//     @Column("bigint")
//     cost: number;
// }

