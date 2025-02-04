import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';
export class CreateRoleDto {
    @ApiProperty({example: 'ADMIN', description: 'Название роли'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly name: string

    @ApiProperty({example: true, description: 'Доступна ли роль всем'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsBoolean({message: 'Содержание поля должно boolean значением'})
    readonly vailableEveryone: boolean

    @ApiPropertyOptional({
        type: [Number],
        description: 'Массив id разрешений ролей',
        required: true,
        example: [1,2]
    })
    @IsArray({message: 'В поле нужно передать массив чисел'})
    readonly permissions: number[]
}