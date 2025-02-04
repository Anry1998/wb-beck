import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCompaniesGroupDto {
    @ApiProperty({example: 'New companies-group', description: 'Новое название companies-group', required: false})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly group_name: string
}
