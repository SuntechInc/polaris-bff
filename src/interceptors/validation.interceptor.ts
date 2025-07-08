import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ValidationError } from 'class-validator';

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        if (error instanceof BadRequestException) {
          const response = error.getResponse() as any;
          
          // Se for um erro de validação do class-validator
          if (Array.isArray(response.message)) {
            const validationErrors = response.message.map((err: ValidationError) => {
              if (typeof err === 'string') {
                return err;
              }
              return Object.values(err.constraints || {}).join(', ');
            });
            
            return throwError(
              () => new BadRequestException({
                message: 'Invalid input data',
                errors: validationErrors,
                statusCode: 400,
              })
            );
          }
        }
        
        return throwError(() => error);
      }),
    );
  }
} 