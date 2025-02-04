import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDate, IsOptional } from 'class-validator';
export class ChangeReferencebookCostDto {

    @ApiProperty({example: '2024-11-21 20:14:33.437058', description: 'Дата'})
    @IsOptional()
    @IsDate({message: 'Содержание поля должно быть датой'})
    readonly new_date?: Date

    @ApiProperty({example: 1111111111, description: 'Число'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly artikul: number


    @ApiProperty({example: 'barcode234', description: 'Cтрока'})
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly barkod: string

    @ApiProperty({example: 1111111111, description: 'Число'})
    @IsOptional()
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly new_sebestoimost?: number;
}
