import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { CompanyModule } from './company/company.module';
import { AccountModule } from './account/account.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesGroupModule } from './companies-group/companies-group.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { SeedersModule } from './seeders/seeders.module';
import { ReferencebookCostModule } from './rb-sebestoimost/rb-sebestoimost.module';
 
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres', 
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'), 
        entities: [  
          __dirname + "/**/**/*.entity{.ts,.js}",
        ],  
        synchronize: configService.get<boolean>('DB_SYNCHRONIZATION'),
        logging: configService.get<boolean>('DB_LOGGING'),

      }),
      inject: [ConfigService],
    }),
    // TypeOrmModule.forRootAsync({  
    //   imports: [ConfigModule], 
    //   name: 'secondaryDB', 
    //   useFactory: async (configService: ConfigService) => ({
    //     type: 'postgres', 
    //     host: configService.get<string>('DB_HOST2'),
    //     port: configService.get<number>('DB_PORT2'),
    //     username: configService.get<string>('DB_USERNAME2'),
    //     password: configService.get<string>('DB_PASSWORD2'),
    //     database: configService.get<string>('DB_NAME2'),
    //     synchronize: configService.get<boolean>('DB_SYNCHRONIZATION2'),
    //     logging: configService.get<boolean>('DB_LOGGING2'),
    //   }),
    //   inject: [ConfigService], 
    // }),
    ThrottlerModule.forRoot([{ 
      ttl: 10000,
      limit: 3,
    }]),
    CompanyModule,
    AccountModule,
    RoleModule,
    PermissionModule,
    AuthModule,
    CompaniesGroupModule,
    MarketplaceModule,
    SeedersModule,
    // ReferencebookCostModule,
  ],
  controllers: [],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard
    // }
  ],
})
export class AppModule {}
