import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMarketplaceDto {
    @ApiProperty({example: 'Wildberries', description: 'Название marketplace'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly name: string
}