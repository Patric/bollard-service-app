import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ErrorService implements ErrorHandler{

  constructor(private injector: Injector) { }

  handleError(error: any){
    if(Error instanceof HttpErrorResponse){
      console.log(error.status);
    }
    else{
      console.error(error);

    }
  }
}
