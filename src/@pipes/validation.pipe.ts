import {ArgumentMetadata, Injectable, Logger, PipeTransform} from '@nestjs/common'
import {plainToClass} from 'class-transformer'
import { validate } from 'class-validator'
import { ValidationException } from '../@exceptions/validation.exception'
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    private readonly logger = new Logger();

    async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        const obj = plainToClass(metadata.metatype, value)
        const errors = await validate(obj)

        if (errors.length) {
            let messages = errors.map(err => {
                return `${err.property} - ${Object.values(err.constraints).join(', ')}`
            })
            this.logger.verbose(messages);
            throw new ValidationException(messages)
        }
        return value
    }
}