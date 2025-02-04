import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({example: 'Login', description: 'login'})
  @IsNotEmpty({message: 'Поле не должно быть пустым'})
  @IsString({message: 'Содержание поля должно быть строкой'})
  login: string;

  @ApiProperty({example: 'Password1!', description: 'password'})
  @IsNotEmpty({message: 'Поле не должно быть пустым'})
  @IsString({message: 'Содержание поля должно быть строкой'})
  password: string;
}