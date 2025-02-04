import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCompaniesGroupDto {
    @ApiProperty({example: 'Companies-group', description: 'Название companies-group'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly group_name: string
}
