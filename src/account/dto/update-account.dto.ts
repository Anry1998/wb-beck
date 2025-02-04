import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
export class UpdateAccountDto {

    @ApiProperty({example: 'Иванов', description: 'Фамилия'})
    @IsOptional()
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly surname: string

    @ApiProperty({example: 'Иван', description: 'Имя'})
    @IsOptional()
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly name: string

    @ApiProperty({example: 'Иваныч', description: 'Отчество'})
    @IsOptional()
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly patronymic: string

    @ApiProperty({example: '@Telegram', description: 'Telegram'})
    @IsOptional()
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly telegram?: string

    @ApiProperty({example: 'Password1!', description: 'password длинна 6-16, регулярное выражение: /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/'})
    @IsOptional()
    @IsString({message: 'Содержание поля должно быть строкой'})
    @MinLength(5, {message: 'Пароль не менее 5 символов'})
    @MaxLength(20, {message: 'Пароль более 20 символов'})
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'Содержание пароля: 1 строчная буква, 1 строчная заглавная буква, 1 цифра, 1 спец. символ'})
    readonly password?: string

    @ApiProperty({example: [1,2], description: 'Новый массив id ролей', required: true})
    @IsArray({message: 'В поле нужно передать массив чисел'})
    readonly roles_id: number[]

    @ApiProperty({example: 1, description: 'Id группы'})
    @IsOptional()
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly group_id?: number

    @ApiProperty({example: [1,2], description: 'Новый массив id компаний', required: false})
    @IsOptional()
    @IsArray({message: 'В поле нужно передать массив чисел'})
    readonly companies_id?: number[]
}