import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, Injector } from "@angular/core";
import { from, Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize, switchMap } from 'rxjs/operators';

const usersData = {
    "users": [
    {
      "id": "1",
      "email": "user_1",
      "pass": "test",
      "token": null,
      "device": null
      
    },
    {
      "id": "2",
      "email": "user_2",
      "pass": "test",
      "token": null,
      "device": null
    },
    {
      "id": "3",
      "email": "user_3",
      "pass": "test",
      "token": null,
      "device": null
    },
    {
      "id": "4",
      "email": "user_4",
      "pass": "test",
      "token": null,
      "device": null
    
    },
    {
      "id": "5",
      "email": "user_5",
      "pass": "test",
      "token": null,
      "device": null
    },
    ]
   }

   


const devicesData = [
  {
    // Actual device
    "id": "1",
    "state": "locked",
    "key": new Uint8Array([0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c]),
    "salt": "9U01j34NVW06kzb1uVyMIoqCi",
    "userID": null,
    "isProcessed": false,
    "ready": true,
    
  },

  // FAKE ADDRESS
  {
    "id": "2",
    "state": "locked",
    "key": new Uint8Array([0x0c,0x0c,0x1c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c]),
    "salt": "9U01j34NVW0fdfMIoqCi",
    "userID": null,
    "isProcessed": false,
    "ready": true,
    
    
  },
  // FAKE ADDRESS
  {
    "id": "3",
    "state": "locked",
    "key": new Uint8Array([0x1c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c]),
    "salt": "9U01j34NVW06kzb1bnuVyMIoqCi",
    "userID": null,
    "isProcessed": false,
    "ready": true,
    
  }
  
]




@Injectable()
export class BackendInterceptor implements HttpInterceptor {

  
  constructor( private injector: Injector) {}
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {

      const { url, method, headers, body } = request;
      //console.log("Method intercept called");
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
            case url.endsWith('logout') && method === 'GET':
              return logout();
            case url.endsWith('someInfo') && method === 'GET':
              return testFunc();
            // case url.endsWith('getSyncChallenge') && method === 'POST':
            //   return generateChallenge();
            // case url.endsWith('synchronize') && method === 'POST':
            //   return synchronize();
            // case url.endsWith('changeDeviceState') && method === 'POST':
            //   return changeDeviceState();
            // case url.endsWith('confirmAction') && method === 'POST':
            //   return confirmAction();
            case url.endsWith('authorizeRemoteOrder') && method === 'POST':
              return authorizeRemoteOrder();
            default:
              return next.handle(request)
          }

        }

        //routeFunctions
        function authenticate(){
          //console.log(headers, body);
          const {email, pass} = body;
         // console.log("found: ", usersData.users.find(x => x.email === email && x.pass === pass ));
          const user = usersData.users.find(x => x.email === email && x.pass === pass );
          const userID = usersData.users.findIndex(x => x.email === email && x.pass === pass );
          


          if(!user){
            return error("Email or password is incorrect");
          }
          // TO DO
          // Hash user id
          const generatedToken = getRandomString(121);
          usersData.users[userID].token = generatedToken;
          console.log(usersData.users[userID]);
          return ok({
            id: user.id,//hashed user id
            token: generatedToken
          });

        }

        function logout(){
          if(usersData.users[usersData.users.findIndex(user => user.id === headers.get('id'))].token){
            usersData.users[usersData.users.findIndex(user => user.id === headers.get('id'))].token = null;
            return ok("User logged out");
          }
          else{
            return error("Error during logout. User was not logged in.");
          }
        }


        function testFunc(){

          
          if(isLoggedIn())
          {
            return ok(usersData)
          }
          else{
            return unauthorised();
   
          }

          
        }


        // NEW CHALLENGE
        // {response: "{auth: challenge, id: number}", orderCode: "code"}
        function authorizeRemoteOrder(){
            
          // if(isLoggedIn())
          // {
          console.log("Authorizing remote order: ", body.response);
          let jsonbody = JSON.parse(body.response);
          let jsoncode = body.code;

          console.log("Authorizing solution: ", sign(jsonbody.ch, jsoncode, devicesData.find(device => device.id == jsonbody.id).key, devicesData.find(device => device.id == jsonbody.id).salt));
          return from(sign(jsonbody.ch, jsoncode, devicesData.find(device => device.id == jsonbody.id).key, devicesData.find(device => device.id == jsonbody.id).salt))
          .pipe(switchMap(value => 
            {
              return ok({s: value});
            })
          );

          // }
          // else{
          //   return unauthorised();
   
          // }



          
        }

        // repleace crypto api with something else
        function sign(challenge: string, code: string, key: Uint8Array, salt: String){
 
          if(code == "150"){
            return new Promise((resolve, reject) => {
             resolve("SIGNATURE_FROM_CODE_150");             
              });
          }

          let encoder = new TextEncoder();
          return window.crypto.subtle.importKey(
            "raw", // raw format of the key - should be Uint8Array
            key,
            { // algorithm details
                name: "HMAC",
                hash: {name: "SHA-256"}
            },
            false, // export = false
            ["sign"] // what this key can do
        ).then( key => {
            console.log("Generating key...");
            return window.crypto.subtle.sign(
                "HMAC",
                key,
                encoder.encode(challenge + salt + code)
            ).then(signature => {
                var b = new Uint8Array(signature);
                var str = Array.prototype.map.call(b, x => ('00'+x.toString(16)).slice(-2)).join("");
                return str;
            });
            
        });

        }

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
          return headers.get('Authorization') === usersData.users.find(user => user.id === headers.get('id')).token;
        };
        // use crypto API for JWT auth
        function getRandomString(length: number){
          var result = "";

          var randomChars = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890';
          
          for(let i = 0; i <length; i++){
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
          };
          
          return result;
        }

    }




}

