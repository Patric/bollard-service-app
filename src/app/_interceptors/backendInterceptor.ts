import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, Injector } from "@angular/core";
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
const usersData = {
    "users": [
    {
      "email": "user_1",
      "pass": "test"
    },
    {
      "email": "user_2",
      "pass": "test"
    },
    {
      "email": "user_3",
      "pass": "test"
    },
    {
      "email": "user_4",
      "pass": "test"
    },
    {
      "email": "user_5",
      "pass": "test"
    },
    ]
   }


@Injectable()
export class BackendInterceptor implements HttpInterceptor {

  
  constructor( private injector: Injector) {}
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {
      console.log(request);
      const { url, method, headers, body } = request;
      console.log("Method intercept called");
      //we return an observable of null since we want to decide in handleRoute what we want to do instead of returning anything in the first place
 
      return of(null)
          .pipe(mergeMap(handleRoute))
          .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
          .pipe(delay(500))
          .pipe(dematerialize());
  

        // console.log("Method intercept called");
        // if(request.method === "GET" && request.url === "http://localhost:8100/users")
        // {
        //     return of(new HttpResponse({ status: 200, body: usersData }))
        // }
        // next.handle(request);


        function handleRoute(){
          switch(true){
            case url.endsWith('users') && method === 'GET':
              return testFunc();
            case url.endsWith('authenticate') && method === 'POST':
              return authenticate();
            default:
              return next.handle(request)
          }

        }

        //routeFunctions
        function authenticate(){
          //console.log(headers, body);
          const {email, pass} = body;
          console.log("found: ", usersData.users.find(x => x.email === email && x.pass === pass ));
          const user = usersData.users.find(x => x.email === email && x.pass === pass );
          if(!user){
            return error("Email or password is incorrect");
          }
          // TO DO
          // generate token
          return ok({
            message: "Credentials authenticated",
            email: user.email,
            token: "fake-jwt-token"
          });

        }

        function testFunc(){
          return ok(usersData)
        }


        //helper functions

        function ok(body?: any){
          return of(new HttpResponse({status: 200, body: body}))
        }

        function error(message: string){
          return throwError ({error: { message }})
        }

        function unauthorised(){
          return throwError ({ status: 401, error: {message: 'Unauthorised'} });
        }

        function isLoggedIn(){
          //return true of false based on given condition
          return headers.get('Authorization') === 'fake-jwt-token';
        };


    }


    
  // authenticate() {
  //   const { username, password } = body;
  //   const user = this.users.find(x => x.username === username && x.password === password);
  //   if (!user) return error('Username or password is incorrect');
  //   return ok({
  //       id: user.id,
  //       username: user.username,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       token: 'fake-jwt-token'
  //   })
  // }
/*
 function handleRoute() {
            switch (true) {
                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/register') && method === 'POST':
                    return register();
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                case url.match(/\/users\/\d+$/) && method === 'GET':
                    return getUserById();
                case url.match(/\/users\/\d+$/) && method === 'PUT':
                    return updateUser();
                case url.match(/\/users\/\d+$/) && method === 'DELETE':
                    return deleteUser();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }    
        }

*/


}

