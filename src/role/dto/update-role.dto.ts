import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
export class UpdateRoleDto {
    @ApiProperty({example: 'NEW_ADMIN', description: 'Новое название роли', required: false})
    @IsOptional()
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly name?: string

    @ApiProperty({example: true, description: 'Доступна ли роль всем'})
    @IsOptional()
    @IsBoolean({message: 'Содержание поля должно boolean значением'})
    readonly vailableEveryone?: boolean

    @ApiPropertyOptional({
        type: [Number],
        description: 'Новый массив id разрешений ролей',
        required: false,
        example: [1,2]
    })
    @IsOptional()
    @IsArray({message: 'В поле нужно передать массив чисел'})
    readonly permissions?: number[]
}