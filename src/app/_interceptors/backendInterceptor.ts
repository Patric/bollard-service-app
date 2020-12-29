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

        // renting place and finishing renting




        // NEW CHALLENGE
        // {auth: challenge, id: number}
        function authorizeRemoteOrder(){
          console.log("Authorizing remoteo order: ", body);
         
          console.log("Authorizing solution: ", sign(body.challenge, devicesData.find(device => device.id == body.id).key, devicesData.find(device => device.id == body.id).salt));
          return from(sign(body.challenge, devicesData.find(device => device.id == body.id).key, devicesData.find(device => device.id == body.id).salt))
          .pipe(switchMap(value => 
            {
              return ok({auth: value});
            })
          );
        }



        // I
        // =================================================================================================================================================================================
        // body: {MACAdress: macaddress}

        function sign(challenge: string, key: Uint8Array, salt: String){
          let encoder = new TextEncoder();
          return window.crypto.subtle.importKey(
            "raw", // raw format of the key - should be Uint8Array
            //this.encoder.encode("mysecretkey"),
            key,
            { // algorithm details
                name: "HMAC",
                hash: {name: "SHA-256"}
            },
            false, // export = false
            ["sign", "verify"] // what this key can do
        ).then( key => {

            return window.crypto.subtle.sign(
                "HMAC",
                key,
                encoder.encode(challenge + salt)
            ).then(signature => {
                var b = new Uint8Array(signature);
                var str = Array.prototype.map.call(b, x => ('00'+x.toString(16)).slice(-2)).join("");
                console.log("key: ", str);
                return str;
            });
            
        });


        }

        function getRandomArbitrary(min, max) {
          return Math.random() * (max - min) + min;
        }
        
        
        // function generateChallenge(){
        //   if(!isLoggedIn()){    //} || devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].isProcessed){
        //     return unauthorised();
        //   }
          
        //   const MACAdress = body.MACAdress;
          
        //   // var array = new Uint32Array(10);
        //   // window.crypto.getRandomValues(array);
        //   let challenge = getRandomArbitrary(500, 999999);
        //   // save solutions to generated challenge
        //   devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].peripheralSyncResponseLocked = solveChallengeLocked(challenge);
        //   devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].peripheralSyncResponseUnlocked = solveChallengeUnlocked(challenge);
        //   devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].isProcessed = true;

        //   return ok({syncChallenge: challenge});
        // }



        // function solveChallengeLocked(challenge: number){
        //   return challenge + 437;
        // }
        
        // function solveChallengeUnlocked(challenge: number){
        //   return challenge - 434;
        // }
        

        // II
        // =================================================================================================================================================================================
        // body: {MACAdress: macadress, response: solvedChallenge}

        // function synchronize(){
        //   if(!isLoggedIn()){// || devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].isProcessed){
        //     return unauthorised();
        //   }
          
        //   const device = devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)];


        //   // The device is locked
        //   if(body.response == device.peripheralSyncResponseLocked)
        //   {
        //     // Synchronisation is correct
        //     if(device.state == "locked"){
        //       // The device is ready to use
        //       if(device.ready){
        //         devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].availableAction = "unlock";
        //         return ok({message: "Available action is to start renting this device.", availableAction: "unlock"});
        //       }
        //       // The device requires service or there is other problem with the device
        //       else{
        //         return error("Device unavailable");
        //       }
        //     }


        //     // Synchronisation is incorrect
        //     else if(device.state == "unlocked"){
              
        //       // The device is assigned to user
        //       if(device.userID == headers.get('id')){
        //         // TO DO:
        //           // Stop timer
        //           // Calculate amount due
        //           return error("Synchronization error has occured. You have been using this spot for HH:mm and you have been charged $$$. If you had been charged wrongly please contact us +00 321 342 323.")
        //       }
        //       else{
        //         // The device is not assigned to user
        //           return error("Synchronization error has occured.")
        //       }

              
        //     }
        //     else{
        //       throw error("Unknown device state");
        //     }
        //   }

        //   // The device is unlocked
        //  else if(body.response == device.peripheralSyncResponseUnlocked){

        //   // Synchronisation is correct
        //   if(device.state == "unlocked"){
        //     if(device.userID == headers.get('id')){
        //       devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].availableAction = "lock";
        //       return ok({message: "Available action is to stop renting this device.", availableAction: "lock"});
        //     }
        //     else{
        //       return error("Device unavailable.");
        //     }




        //   }
        //   // Synchronisation is incorrect(should not happen)
        //   else if(device.state == "locked"){
        //     return error("Unknown error occured");
        //   }
        //   else{
        //     throw error("Unknown device state");

        //   };

        //   }
        //   // Incorrect solution
        //   else{
        //     return unauthorised();
        //   }
        // }

        // III
        // =================================================================================================================================================================================
        // body: {peripheralChallenge: challenge, MACADress: macadress}


        // function changeDeviceState(){
        //   if(!isLoggedIn()){// || devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].isProcessed){
        //     return unauthorised();
        //   }

        //   const device = devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)];
        //   let challenge = getRandomArbitrary(500, 999999);
        //   // save solutions to generated challenge
        //   devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].peripheralResponseLocked = solveChallengeLocked(challenge);
        //   devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].peripheralResponseUnlocked = solveChallengeUnlocked(challenge);

        //   if(device.availableAction == "lock"){
        //     return ok({message: "Time counter will stop after locking confirmation.", webServerResponse: solveChallengeUnlocked(body.peripheralChallenge), webServerChallenge: challenge});
            
        //   }
        //   else if(device.availableAction == "unlock"){
        //     devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].state = "unlocked";
        //     devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].availableAction = "lock";
        //     devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].userID = headers.get('id');
      
        //     return ok({message: "Renting started. Timer is on.", webServerResponse: solveChallengeLocked(body.peripheralChallenge), webServerChallenge: challenge});
        //   }
        //   else{
        //     throw error("Unknown availableAction.")
        //   }

        // }

        // IV
        // =================================================================================================================================================================================
        // body: {peripheralResponse: response, MACADress: macadress}


        // function confirmAction(){
        //   if(!isLoggedIn()){// || devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].isProcessed){
        //     return unauthorised();
        //   }
        //   const device = devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)];
        //   if(body.peripheralResponse == device.peripheralResponseLocked)
        //   {
        //      // STOP COUNTING TIME. 
        //      devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].peripheralResponseLocked = null;
        //      devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].peripheralResponseUnlocked = null;
        //      devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].peripheralSyncResponseLocked = null;
        //      devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].peripheralSyncResponseUnlocked = null;
        //      devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].availableAction = null;
        //      devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].userID = null;
        //      devicesData[devicesData.findIndex(device => device.MAC == body.MACAdress)].state = "locked";

        //      return ok({message: "Renting stopped. You have been using this spot for HH:mm and you have been charged $$$. If you had been charged wrongly please contact us +00 321 342 323."})
           
        //   }
        //   else if(body.peripheralResponse == device.peripheralResponseUnlocked)
        //   {
        //     // NOTE DEVICE LOCK
        //     return ok({message: "Unlock confirmed."});
        //   }
        //   else{
        //     return unauthorised();
        //   }


        // }
        


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
          return headers.get('Authorization') === usersData.users.find(user => user.id === headers.get('id')).token;
        };

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

