import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

enum IFormaNaloga {
    OSHO = 'ОСНО' , 
    YSN = 'УСН',
}

export class UpdateCompanyDto {

    @ApiProperty({example: 1, description: 'Id маркетплейса'})
    @IsOptional()
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly marketplace_id?: number
    
    @ApiProperty({example: 1, description: 'Id group'})
    @IsOptional()
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly group_id?: number
    
    @ApiProperty({example: 1111111111, description: 'Число от 10 до 12 цифр'})
    @IsOptional()
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly inn?: number
    
    @ApiProperty({example: 'Веселый молочник', description: 'Название компании'})
    @IsOptional()
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly seller_name?: string
    
    @ApiProperty({example: 'ОСНО', description: 'ОСНО или УСН'})
    @IsOptional()
    @IsEnum(IFormaNaloga, {message: 'Поле должно быть одним из следующих значений: ОСНО, УСН'})
    readonly forma_naloga?: IFormaNaloga
    
    @ApiProperty({example: 1, description: 'Целое число'})
    @IsOptional()
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly nalog?: number 
    
    @ApiProperty({example: 1, description: 'Целое число'})
    @IsOptional()
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly dni_vsego?: number
    
    @ApiProperty({example: 1, description: 'Целое число'})
    @IsOptional()
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly dni_wb?: number

    @ApiPropertyOptional({
        type: [Number],
        description: 'Новый массив id разрешений ролей',
        required: false,
        example: [1,2]
    })
    @IsOptional()
    @IsArray({message: 'Содержание поля должно быть массивом чисел'})
    readonly accounts_id?: number[]


    // @ApiProperty({example: 'NEW', description: 'Новое название компании', required: false})
    // readonly company_name?: string

    // @IsOptional()
    // @ApiProperty({example: 1234567890, description: 'Новое название компании', required: false})
    // readonly inn?: number

    // @ApiProperty({example: 1, description: 'Новое название компании', required: false})
    // readonly group_name_id?: number

    // @ApiProperty({example: 'NEW_NAME', description: 'Новое название компании', required: false})
    // readonly api_key?: string
 
    // @ApiPropertyOptional({
    //     type: [Number],
    //     description: 'Новый массив id разрешений ролей',
    //     required: false,
    //     example: [1,2]
    // })
    // readonly accounts?: number[]
}