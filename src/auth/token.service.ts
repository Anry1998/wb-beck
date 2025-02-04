import {  HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { GenerateTokensDto } from './dto/generate-tokens.dto';
import { Account } from '../account/entity/account.entity';
@Injectable()
export class TokenService {

    constructor(
        @InjectRepository(Account) private accountRepository: Repository<Account>,
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectDataSource() private dataSource: DataSource,
    ) {} 

    async generateTokens(payload: GenerateTokensDto) {
        const accessToken = await this.jwtService.signAsync({payload}, 
            {
                secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'), 
                expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
            }
        )
        const refreshToken = await this.jwtService.signAsync({payload}, 
            {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'), 
                expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION'),
            }
        )
        return {accessToken, refreshToken} 
    }

    async updateRefreshTokenInDb (id: number, refreshToken: string) {
        await this.accountRepository.update({ id: id }, { refresh_token: refreshToken }) 
        console.log(`Рефреш токен у пользователя с id ${id} был обновлен`)
    }

    async removeRefreshToken (refresh: string) {
        try {
            const account = await this.accountRepository.findOne({where: {refresh_token: refresh}})
            if (!account) {
                throw new HttpException('Токен отсутствует', HttpStatus.UNAUTHORIZED)
            }
            await this.dataSource
                .query(`UPDATE ${process.env.DB_SCHEMA}.account SET refresh_token ='${null}' WHERE "id"=${account.id}`)
            console.log(`Рефреш токен у пользователя был стерт`)
            return
        } catch (e) {
            console.log(e)
        }
    }

    validateAccessToken(token: string) {
        try {
            const userData = this.jwtService.verify(token, {secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')})
            return userData
        } catch(e) {
            return null
        }
    }

    validateRefreshToken(token: string) {
        try {
            const userData = this.jwtService.verify(token, {secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')})
            return userData
        } catch(e) {
            return null
        }
    }
}
 