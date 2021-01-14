import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../_services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  
  constructor( private authService: AuthService) {}
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {
      
        // lets further interceptors handle the requests and then handles the response. If it's error then throws it
        return next.handle(request).pipe(catchError(err => {
          if (err.status === 401){
              // logotu of 401 unauthenticated from api

              this.authService.logout();
              location.reload(true);
          }
  
          const error = err.error.message || err.statusText;
          return throwError(error);

      }))

    }    
}

