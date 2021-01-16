import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable, of, throwError } from 'rxjs';
import { AuthService } from '../_services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  
  constructor( private authService: AuthService) {}
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {

        let currentUser = this.authService.currentUserValue;
        
        request = request.clone( {
            headers: new HttpHeaders({'Content-Type': 'application/json'}),
            withCredentials: true
          });

        if (currentUser && currentUser.token)
        {
            
            request = request.clone({
                
                setHeaders: { Authorization: `${currentUser.token}`}
            })

           // console.log(request.headers.keys().forEach(key =>console.log(key)));
        }
        console.log(request.headers);
        return next.handle(request);

    }
}