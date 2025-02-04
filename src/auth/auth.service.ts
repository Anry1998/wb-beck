import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';

import { TokenService } from './token.service';
import { AccountService } from '../account/account.service';
import { LoginDto } from './dto/login.dto';
import { getArrValueByKeyInArrObjects } from '../@helpers/converted-arrs.helper';
import { RoleService } from '../role/role.service';

@Injectable()
export class AuthService {
  constructor (
    private accountService: AccountService,
    private tokenService: TokenService,
    private roleService: RoleService,
  ) {}

  async login(dto: LoginDto) {
    const condidate = await this.accountService.findAccountByLogin(dto.login)
    
    
    if (!condidate) {
      throw new HttpException(`Пользователь с логин: ${dto.login} не был найден`, HttpStatus.UNAUTHORIZED)
    }
    const comparePassword = await this.comparePassword(dto.password, condidate.password)
    if (!comparePassword) {
      throw new HttpException(`Введен неверный пароль`, HttpStatus.UNAUTHORIZED) 
    }

    const tokens = await this.tokenService.generateTokens({
      id: condidate.id, 
      login: condidate.login, 
      roles_id: getArrValueByKeyInArrObjects(condidate.roles_id, 'id'),
      // companies_id: getArrValueByKeyInArrObjects(condidate.companies_id, 'id'), 
    })

    await this.tokenService.updateRefreshTokenInDb(
      condidate.id, 
      tokens.refreshToken
    )
    await this.accountService.updateDateLastLogin(condidate.id)
    delete condidate.password
    delete condidate.refresh_token

    const condidateRoles = getArrValueByKeyInArrObjects(condidate.roles_id, 'id') 
    const condidatePermissions = await this.roleService.getPermissionsFromRolesIdArr(condidateRoles)
    
    const account = await this.accountService.findAccountById(condidate.id)

    const finalCondidate = {
      ...condidate,
      roles_id: condidateRoles,
      companyes_id: account.companies_id,
      permissions: condidatePermissions
    } 
    return {...tokens, ...finalCondidate}
  }

  private comparePassword(userDtoPassword: string, userPassword: string): Promise<boolean> {
    return compare(userDtoPassword, userPassword)
  }

  async logout(refresh: string) {
    return await this.tokenService.removeRefreshToken(refresh)
  }
 
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException('Токен отсутствует', HttpStatus.UNAUTHORIZED)
    }

    const accountData = await this.tokenService.validateRefreshToken(refreshToken)
    
    const account = await this.accountService.findAccountById(accountData.payload.id)
    
    if (!accountData || !account ) {
      throw new HttpException('Ошибка авторизации', HttpStatus.UNAUTHORIZED)
    }

    const tokens = await this.tokenService.generateTokens({
      id: account.id,
      login: account.login, 
      roles_id: account.roles_id,
      // companies_id: getArrValueByKeyInArrObjects(account.companies_id, 'id'),
    }) 

    await this.tokenService.updateRefreshTokenInDb(account.id, tokens.refreshToken)
    delete account.password
    delete account.refresh_token
 
    const accountRoles = account.roles_id 
    const accountPermissions = await this.roleService.getPermissionsFromRolesIdArr(accountRoles)

    const finalAccount = {
      ...account,
      roles_id: account.roles_id,
      companyes_id: account.companyes,
      permissions: accountPermissions
    } 

    delete finalAccount.roles
    delete finalAccount.companyes

    return {...tokens, ...finalAccount}
  }
}
