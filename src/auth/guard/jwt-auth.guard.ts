import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Observable} from "rxjs";
import {JwtService} from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";

import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { RoleService } from "../../role/role.service";
import { AccountService } from "src/account/account.service";
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private reflector: Reflector,
        private roleService: RoleService,
        private accountService: AccountService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const req = context.switchToHttp().getRequest()
        try {
            const authHeader = req.headers.authorization;
            const bearer = authHeader.split(' ')[0]
            const token = authHeader.split(' ')[1]

            if (bearer !== 'Bearer' || !token) {
                throw new UnauthorizedException({message: 'Пользователь не авторизован'})
            }

            const account = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
            });
            
            const permissionArr = await this.roleService.getPermissionsFromRolesIdArr(account.payload.roles_id)
            const companiesArr = await this.accountService.getAccountCompanyes(account.payload.id)
 
            req.account = account;
            req.account.permissionArr = permissionArr;
            req.account.companiesArr = companiesArr

            return true;
        } catch (e) {
            console.log("error", e)
            throw new UnauthorizedException({message: 'Пользователь не авторизован'})
        }
    }

}
