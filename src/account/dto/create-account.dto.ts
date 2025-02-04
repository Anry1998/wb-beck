import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, MinLength, MaxLength, IsArray, Matches, IsOptional } from 'class-validator';
export class CreateAccountDto {

    @ApiProperty({example: 'Иванов', description: 'Фамилия'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly surname: string

    @ApiProperty({example: 'Иван', description: 'Имя'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly name: string

    @ApiProperty({example: 'Иваныч', description: 'Отчество'})
    @IsOptional()
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly patronymic: string

    @ApiProperty({example: 'userLogin', description: 'Логин'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsString({message: 'Содержание поля должно быть строкой'})
    @MinLength(4)
    @MaxLength(20)
    readonly login: string

    @ApiProperty({example: '@Telegram', description: 'Telegram'})
    @IsOptional()
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly telegram?: string

    @ApiProperty({example: 'Password1!', description: 'password длинна 6-16, регулярное выражение: /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsString({message: 'Содержание поля должно быть строкой'})
    @MinLength(5, {message: 'Пароль не менее 5 символов'})
    @MaxLength(20, {message: 'Пароль более 20 символов'})
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'Содержание пароля: 1 строчная буква, 1 строчная заглавная буква, 1 цифра, 1 спец. символ'})
    readonly password: string

    @ApiProperty({example: 1, description: 'Id группы'})
    @IsOptional()
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly group_id?: number

    @ApiPropertyOptional({
        type: [Number],
        description: 'Массив id ролей',
        required: true,
        example: [1,2]
    })
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsArray({message: 'В поле нужно передать массив чисел'})
    readonly roles_id: number[]

    @ApiPropertyOptional({
        type: [Number],
        description: 'Массив id компаний',
        example: [1,2]
    })
    @IsOptional()
    @IsArray({message: 'В поле нужно передать массив чисел'})
    readonly companies_id?: number[]

}