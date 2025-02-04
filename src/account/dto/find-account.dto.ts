import { ApiProperty } from '@nestjs/swagger';
import {  IsOptional, IsString,  } from 'class-validator';
export class FindAccountDto {
    @ApiProperty({example: 'Иван', description: 'Имя, фамилия, отчетсво или логин', required: false})
    @IsOptional()
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly text: string
}