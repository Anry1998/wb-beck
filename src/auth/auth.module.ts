import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Account } from '../account/entity/account.entity';
import { AccountModule } from '../account/account.module';
import { TokenService } from './token.service';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    JwtModule,
    AccountModule,
    RoleModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService],
})
export class AuthModule {}
