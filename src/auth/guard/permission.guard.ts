import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let requiredPermission = this.reflector.getAllAndOverride<number[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermission) {
      return true;
    }

    const req = context.switchToHttp().getRequest()

    for (let i=0; i<requiredPermission.length; i++) {
      if (requiredPermission[i].toString() == 'Получение любого аккаунта по id') {
        if (Number(req.params.id) === req.account.payload.id) {
          return true
        }
      }
    }

    for (let i=0; i<requiredPermission.length; i++) {
      if (requiredPermission[i].toString() == 'Получение любой роли по id') {
        if (req.account.payload.roles_id.includes(Number(req.params.id))) {
          return true
        } 
      }
    }

    for (let i=0; i<requiredPermission.length; i++) {
      if (requiredPermission[i].toString() == 'Получение любой компании по id') {
        if (req.account.companiesArr.includes(Number(req.params.id))) {
          return true
        }
      }
    }

    for (let i=0; i<requiredPermission.length; i++) {
      if (requiredPermission[i].toString() == 'Получение любой группы компаний по id') {

        // req.account.payload.id

        // if (req.account.companiesArr.includes(Number(req.params.id))) {
        //   return true
        // }

      }
    }

    return req.account.permissionArr.some((permission: any)  => requiredPermission.includes(permission));
  }
}