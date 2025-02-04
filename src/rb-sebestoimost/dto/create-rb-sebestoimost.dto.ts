import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDate, IsOptional } from 'class-validator';
export class CreateReferencebookCostDto {
    // @ApiProperty({example: '2024-11-21 20:14:33.437058', description: 'Дата'})
    // @IsNotEmpty({message: 'Поле не должно быть пустым'})
    // @IsDate({message: 'Содержание поля должно быть датой'})
    // readonly date: Date

    @ApiProperty({example: '2024-11-21 20:14:33.437058', description: 'Дата'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsDate({message: 'Содержание поля должно быть датой'})
    readonly date: Date

    @ApiProperty({example: 1, description: 'Id'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly company_id: number;

    @ApiProperty({example: 1111111111, description: 'Число'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly article: number

    @ApiProperty({example: 1111111111, description: 'Число'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly article_seller: number

    @ApiProperty({example: 'barcode234', description: 'Cтрока'})
    @IsOptional()
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly barcode?: string

    @ApiProperty({example: 1111111111, description: 'Число'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsNumber({}, {message: 'Содержание поля должно быть числом'})
    readonly cost: number;
}
