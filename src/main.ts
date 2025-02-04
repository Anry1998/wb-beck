import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as basicAuth from 'express-basic-auth';
import {readFileSync} from 'fs';
import { join } from 'path';
import { SshTunnel } from 'ssh-tunneling';
import type { SshConfig } from 'ssh-tunneling';


// import { doubleCsrf } from 'csrf-csrf';
// import helmet from 'helmet';

import { AppModule } from './app.module';
import { ValidationPipe } from './@pipes/validation.pipe';
import { HttpExceptionFilter } from './@global-filters/http-exception.filter';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { PermissionGuard } from './auth/guard/permission.guard';
import { RoleService } from './role/role.service';
import { AccountService } from './account/account.service';


// import { ExpressAdapter } from '@nestjs/platform-express';
 
async function bootstrap() {   
// --------- ssh-tunnel --------- //
  // const sshConfig: SshConfig = {
  //   host: 'portal.rask.pro', 
  //   port: 2223, 
  //   username: 'master',
  //   privateKey: readFileSync('c:/Users/Andrysha/.ssh/key-wbbro-rsa'),
  // }; 
  // const client = new SshTunnel(sshConfig);
  // const forwardInfo1 = await client.forwardOut('5432:portal.rask.pro:5432'); 
  // console.log('forwardInfo1: ', forwardInfo1);   
  //                 // secondaryDB //   
  // const sshConfig: SshConfig = { 
  //   host: 'portal.rask.pro',      
  //   port: 2223,   
  //   username: 'master',   
  //   privateKey: readFileSync('c:/Users/Andrysha/.ssh/key-wbbro-rsa'),
  // };    
  // const client = new SshTunnel(sshConfig);
  // const forwardInfo = await client.forwardOut('5432:172.16.1.22:5432'); 
  // console.log('forwardInfo: ', forwardInfo);  


  // const sshConfig2: SshConfig = { 
  //   host: 'portal.rask.pro',     
  //   port: 2223,  
  //   username: 'master',   
  //   privateKey: readFileSync('c:/Users/Andrysha/.ssh/key-wbbro-rsa'),
  // };  
  // const client2 = new SshTunnel(sshConfig2);
  // const forwardInfo2 = await client2.forwardOut('5433:172.16.1.20:5432'); 
  // console.log('forwardInfo2: ', forwardInfo2); 
// --------- --------- --------- //   

  const PORT = process.env.APP_PORT || 5000  

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors( {
    credentials: true,   
    origin: [
      `${process.env.VITE_CLIENT_URL}`,
      'http://localhost:5173',
    ]
  }) 


  
  // app.use(helmet());
  // const {
  //   invalidCsrfTokenError, // This is provided purely for convenience if you plan on creating your own middleware.
  //   generateToken, // Use this in your routes to generate and provide a CSRF hash, along with a token cookie and token.
  //   validateRequest, // Also a convenience if you plan on making your own middleware.
  //   doubleCsrfProtection, // This is the default CSRF protection middleware.
  // } = doubleCsrf(doubleCsrfProtection);
  // app.use(doubleCsrfProtection);

// --------- Swagger --------- //
  app.use(['/docs', '/docs-json'], basicAuth({
    challenge: true,
    users: {
      [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
    },
  }));
  const config = new DocumentBuilder()
  .setTitle('Wbbro server-nest') 
  .setDescription('Документация REST API')
  .setVersion('1.0.0')
  .addTag('V1.0.0')
  .addBearerAuth()
  .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)
// --------- --------- --------- //
  const configServise = app.get(ConfigService) 
  const roleServise = app.get(RoleService)
  const accountServise = app.get(AccountService)
  const hhtpAdapterHost = app.get(HttpAdapterHost)

  app.useGlobalGuards( 
    new JwtAuthGuard(new JwtService(), configServise, new Reflector(), roleServise, accountServise),
    new PermissionGuard(new Reflector()),
  ) 

  app.useGlobalPipes(new ValidationPipe()) 
  app.useGlobalFilters(
    new HttpExceptionFilter(configServise, hhtpAdapterHost),
  )

  await app.listen(PORT, () => console.log(`Сервер стартовал на порту ${PORT}`));
}
bootstrap();

