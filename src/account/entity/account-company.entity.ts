// import {
//     Column,
//     Entity,
//     JoinColumn,
//     ManyToOne,
//     PrimaryGeneratedColumn,
// } from 'typeorm';
// import { Account } from './account.entity';

// @Entity({ name: 'account_company', schema: 'portal' })
// export class AccountCompany {
//     @PrimaryGeneratedColumn('increment')
//     id: number;

//     @ManyToOne(() => Account, (item) => item.id)
//     @JoinColumn({ name: 'account_id', referencedColumnName: 'id',  })
//     account_id: number; 

//     @Column()
//     company_id: number; 
// }