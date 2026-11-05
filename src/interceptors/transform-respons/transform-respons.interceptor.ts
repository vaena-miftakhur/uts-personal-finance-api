import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface StandardResponse<T>{
  success: boolean;
  message:string;
  statusCode: number;
  data:T
}

@Injectable()
export class TransformResponsInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>>{
    
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: "Data berhasil diambil",
        statusCode: statusCode,
        data: data ??null
      }))
    );
  }
}



