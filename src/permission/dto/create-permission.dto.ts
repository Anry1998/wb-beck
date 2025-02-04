import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class CreatePermissionDto {
    @ApiProperty({example: 'CREATE_ACCOUNT', description: 'Название разрешения'})
    @IsNotEmpty({message: 'Поле не должно быть пустым'})
    @IsString({message: 'Содержание поля должно быть строкой'})
    readonly permission_type: string
}