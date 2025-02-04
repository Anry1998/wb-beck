import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, MinLength, MaxLength, IsEnum, ValidateIf, IsArray, IsOptional } from 'class-validator';

enum IFormaNaloga {
    OSHO = 'ОСНО' , 
    YSN = 'УСН',
}

export class CreateCompanyDto {
    @ApiProperty({example: 1, description: 'Id маркетплейса'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly marketplace_id: number

    // @ApiProperty({example: 'api_key', description: 'Cтрока'})
    // @IsNotEmpty({message: 'Поле не должно быть пустым'})
    // @IsString({message: 'Содержание поля должно быть строкой'})
    // readonly api_key: 

    @ApiProperty({example: 1, description: 'Id group'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly group_id: number

    @ApiProperty({example: 1111111111, description: 'Число от 10 до 12 цифр'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly inn: number

    @ApiProperty({example: 'Веселый молочник', description: 'Название компании'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly seller_name: string

    @ApiProperty({example: 'ОСНО', description: 'ОСНО или УСН'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsEnum(IFormaNaloga, {message: 'Поле должно быть одним из следующих значений: ОСНО, УСН'})
    readonly forma_naloga: IFormaNaloga

    @ApiProperty({example: 1, description: 'Целое число'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    // @ValidateIf((o) => {
    //     console.log('Number.isInteger(o.nalog) : ', Number.isInteger(o.nalog) !== true)
    //     return Number.isInteger(o.nalog) !== true
    // }, {always: true, message: 'Содержание поля должно быть целым числом'})
    readonly nalog: number 

    @ApiProperty({example: 1, description: 'Целое число'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly dni_vsego: number

    @ApiProperty({example: 1, description: 'Целое число'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly dni_wb: number

    @ApiPropertyOptional({
        type: [Number],
        description: 'Массив id компаний',
        example: [1,2]
    })
    @IsOptional()
    @IsArray({message: 'В поле нужно передать массив чисел'})
    readonly accounts_id?: number[]
}

