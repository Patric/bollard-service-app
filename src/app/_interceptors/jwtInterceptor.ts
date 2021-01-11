import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable, of, throwError } from 'rxjs';
import { AuthService } from '../_services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  
  constructor( private authService: AuthService) {}
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {

        let currentUser = this.authService.currentUserValue;
        //console.log(currentUser);
        if (currentUser && currentUser.token)
        {
            
            request = request.clone({
                setHeaders: { Authorization: `${currentUser.token}`, id: `${currentUser.id}`}
            })

           // console.log(request.headers.keys().forEach(key =>console.log(key)));
        }
        console.log(request.headers);
        return next.handle(request);

    }
}