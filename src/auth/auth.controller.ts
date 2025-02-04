import { Body, Controller, Get, Post, Put, Req, Res, } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { ApiBearerAuth, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Public() 
  @ApiResponse({status: 201})
  @ApiUnauthorizedResponse()
  @Post('login')
  async login( 
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const login = await this.authService.login(dto); 
    response.cookie('wbbro-refresh-token', login.refreshToken, {maxAge:30*24*60*60*1000, httpOnly: true, })
    return login
  }

  @Public()
  @ApiResponse({status: 200})
  @ApiUnauthorizedResponse()
  @Get('refresh') 
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) { 
    try{
      const refresh = request.cookies['wbbro-refresh-token']
      const tokens = await this.authService.refresh(refresh)
      response.cookie('wbbro-refresh-token', tokens.refreshToken, {maxAge:30*24*60*60*1000, httpOnly: true})
      return tokens
    } catch(e) { 
      console.log(e)
    }
  }
 
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @Put('logout') 
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    try{
      const refresh = request.cookies['wbbro-refresh-token']
      await this.authService.logout(refresh)
      response.clearCookie('wbbro-refresh-token')
      return       
    } catch(e) {
      console.log(e)
    }
  }
 

}
