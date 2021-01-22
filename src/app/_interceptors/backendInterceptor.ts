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
      "device": null,
      personalDetails: {
        username: "user_1",
        id: "TE-386",
        name: "Patryk",
        surname: "Sulej",
        teamID: "1",
        role: "Technician",
        phoneNumber: "435 654 5456"
      }

    },
    {
      "id": "2",
      "email": "user_2",
      "pass": "test",
      "token": null,
      "device": null,
      personalDetails: {
        username: "user_2",
        id: "TE-544",
        name: "Alfred",
        surname: "Statford",
        teamID: "5",
        role: "Technician",
        phoneNumber: "434 54 5456"
      }

    },
    {
      "id": "3",
      "email": "user_3",
      "pass": "test",
      "token": null,
      "device": null,
      personalDetails: {
        username: "user_1",
        id: "TE-386",
        name: "John",
        surname: "Smith",
        teamID: "1",
        role: "Technician",
        phoneNumber: "445 654 5456"
      }
    },
  ]
}



// For further development - upload from Client app to server
const devicesData = [
  {
    // Actual device
    "id": "1",
    "key": new Uint8Array([0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c]),
    "salt": "9U01j34NVW06kzb1uVyMIoqCi",
    "userID": null,
    "isProcessed": false,
    "ready": true,
    details: {
      uploadingDate: "18-02-2021",
      currentUser: {name: "Kellan	Morrison", id: "793"},
      state: "locked",
      lastUsers: [
        { user: "Walter	Morrison", date: "22-02-2021" },
        { user: "Aldus	Carroll", date: "03-02-2021" },
        { user: "Jordan	Hamilton", date: "01-02-2021" },
        { user: "Sienna	Williams", date: "04-02-2021" },
        { user: "George	Tucker", date: "06-02-2021" },
        { user: "Alford	Martin", date: "07-02-2021" },
        { user: "Maya	Allen", date: "01-08-2021" },
        { user: "Brianna	Sullivan", date: "09-02-2021" },
        { user: "Jordan	Montgomery", date: "03-02-2021" },
        { user: "Heather	Parkerz", date: "09-02-2021" }],
        batteryLevel: {value: "67%", uploadDate: "18-02-2021"}
    }

  },

  // FAKE ADDRESS
  {
    "id": "2",
    "state": "locked",
    "key": new Uint8Array([0x0c, 0x0c, 0x1c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c]),
    "salt": "9U01j34NVW0fdfMIoqCi",
    "userID": null,
    "isProcessed": false,
    "ready": true,
    details: {
      uploadingDate: "18-02-2021",
      state: "locked",
      currentUser: {name: null, id: null},
      lastUsers: [
      {user: "Belinda	Reed", date: "03-02-2021"},
      {user:"Carlos	Evans", date: "05-02-2021"},
      {user:"Albert	Martin", date: "06-02-2021"},
      {user:"Jacob	Anderson", date: "05-02-2021"},
      {user:"Caroline	Ellis", date: "07-02-2021"},
      {user:"Nicole	Spencer", date: "03-02-2021"},
      {user:"Connie	Hamilton", date: "02-02-2021"},
      {user:"Florrie	Farrell", date: "01-02-2021"},
      {user:"Kate	Edwards", date: "01-06-2021"},
      {user:"Dominik	Chapman", date: "01-02-2021"}],
      batteryLevel: {value: "67%", uploadDate: "18-02-2021"}
    }


  },
  // FAKE ADDRESS
  {
    "id": "3",
    "state": "locked",
    "key": new Uint8Array([0x1c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c]),
    "salt": "9U01j34NVW06kzb1bnuVyMIoqCi",
    "userID": null,
    "isProcessed": false,
    "ready": true,
    details: {
      uploadingDate: "18-02-2021",
      state: "unlocked",
      currentUser: {name: "Kellan	Morrison", id: "793"},
      lastUsers: [
        {user:"Kellan	Morrison", date: "01-02-2021"},
        {user:"Anna	Richardson", date: "01-02-2021"},
        {user:"Ted	Scott", date: "01-02-2021"},
        {user:"Caroline	Carroll", date: "01-02-2021"},
        {user:"Sydney	Reed", date: "01-02-2021"},
        {user:"Ellia	Payne", date: "01-02-2021"},
        {user:"Caroline	Ellis", date: "01-02-2021"},
        {user:"Nicole	Spencer", date: "01-02-2021"},
        {user:"Connie	Hamilton", date: "01-02-2021"},
        {user:"Florrie	Farrell", date: "01-02-2021"}],
        batteryLevel: {value: "67%", uploadDate: "18-02-2021"}
    }
  }

]

const orderCodes = [
  {
    value: "200",
    name: "FETCH DEVICE INFO",
    description:"Fetches device's MacAddress, ID, name, current rssi and battery level from the device.",
    icon: 'information-circle-outline'
  },
  {
    value: "202",
    name: "FETCH 5 LAST CONNECTED USERS",
    description:"Fetches 5 last connected users in format | MacAddress | UserID |. Registered after disconnection.",
    icon: 'arrow-down'
  },
  {
    value: "205",
    name: "FETCH 5 LAST USER EXECUTIONS",
    description:"Fetches 5 last users that tried to execute codes in format | MacAddress | UserID | Code/Info |. Does not contain the current fetching order. ",
    icon: 'download-outline'
  },
  {
    value: "101",
    name: "LOCK BOLLARD",
    description:"Locks bollard.",
    icon: 'lock-closed-outline'
  },
  {
    value: "102",
    name: "UNLOCK BOLLARD",
    description:"Unlocks bollard.",
    icon: 'lock-open-outline'
  },
  {
    value: "130",
    name: "INVERT INTERNAL LOCK STATE",
    description:"Forcefully changes internal lock state to the inversed one.",
    icon: 'hand-right-outline'
  },
];




@Injectable()
export class BackendInterceptor implements HttpInterceptor {


  constructor(private injector: Injector) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const { url, method, headers, body } = request;
    //we return an observable of null since we want to decide in handleRoute what we want to do instead of returning anything in the first place

    return of(null)
      .pipe(mergeMap(handleRoute))
      .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
      .pipe(delay(500))
      .pipe(dematerialize());



    function handleRoute() {
      switch (true) {
        case url.endsWith('users') && method === 'GET':
          return testFunc();
        case url.endsWith('authenticate') && method === 'POST':
          return authenticate();
        case url.endsWith('logout') && method === 'GET':
          return logout();
        case url.includes('getUserData') && method === 'GET':
          return getUserData();
        case url.endsWith('authorizeRemoteOrder') && method === 'POST':
          return authorizeRemoteOrder();
        case url.endsWith('getOrderCodes') && method === 'GET':
          return getOrderCodes();
        default:
          return next.handle(request)
      }

    }

    //routeFunctions ====================================================================================

    function authenticate() {

      const { email, pass } = body;
      const user = usersData.users.find(x => x.email === email && x.pass === pass);
      const userID = usersData.users.findIndex(x => x.email === email && x.pass === pass);


      // If user cannot be found
      if (!user) {
        console.error("Email or password is incorrect");
        return errorHTTP(401, "Email or password is incorrect");
      }
      const generatedToken = generateJWT(121, user.id);
      usersData.users[userID].token = generatedToken;
      console.log(usersData.users[userID]);
      return ok({
        id: user.id,
        token: generatedToken
      });
    }

    function logout() {
      if (getUser().token) {
        usersData.users[usersData.users.findIndex(user => user.id === headers.get('Authorization')[0])].token = null;

        return ok("User logged out");
      }
      else {
        return loginTimeOut();
      }
    }


    function getUserData() {
      if (isLoggedIn()) {
        return ok(getUser().personalDetails)
      }
      else {
        return loginTimeOut();
      }
    }

    function getOrderCodes() {
      if (isLoggedIn()) {
        // Real server can send only codes restricted to user's access level
        return ok(orderCodes);
      }
      else {
        return loginTimeOut();
      }
    }



    function testFunc() {
      if (isLoggedIn()) {

        return ok(usersData)
      }
      else {
        return loginTimeOut();
      }
    }
    function getUser() {
      return usersData.users.find(user => user.id === headers.get('Authorization')[0]);
    }

    // NEW CHALLENGE
    // {response: "{auth: challenge, id: number}", orderCode: "code"}
    function authorizeRemoteOrder() {
      if(isLoggedIn())
      {
      console.log("[BACKEND MOCK] Signing remote order: ", body.response);
      let jsonbody = JSON.parse(body.response);
      let jsoncode = body.code;


      console.log("[BACKEND MOCK] Generated signature: ", sign(jsonbody.ch, jsoncode, devicesData.find(device => device.id == jsonbody.id).key, devicesData.find(device => device.id == jsonbody.id).salt));
      return from(sign(jsonbody.ch, jsoncode, devicesData.find(device => device.id == jsonbody.id).key, devicesData.find(device => device.id == jsonbody.id).salt))
        .pipe(switchMap(value => {
          return ok({ s: value });
        })
        );
      }
      else{
        return unauthorised();
      }
    }

  
    function sign(challenge: string, code: string, key: Uint8Array, salt: String) {
 
      console.log("[BACKEND MOCK] Payload to hash: ", challenge + salt + code + String(getUser().id));

      if (code == "150") {
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
          hash: { name: "SHA-256" }
        },
        false, // export = false
        ["sign"] // what this key can do
      ).then(key => {
        console.log("Generating key...");
        return window.crypto.subtle.sign(
          "HMAC",
          key, 
          encoder.encode(challenge + salt + code + String(getUser().id)) //getUser().id from incoming JWT
        ).then(signature => {
          var b = new Uint8Array(signature);
          var str = Array.prototype.map.call(b, x => ('00' + x.toString(16)).slice(-2)).join("");
          return str;
        });
      });
    }


    // Helper functions ==================================================================================

    function ok(body?: any) {
      return of(new HttpResponse({ status: 200, body: body }))
    }

    function errorHTTP(statusCode: number, body?: any) {
      return of(new HttpResponse({ status: statusCode, body: {error: body} }))
    }

    function error(message: string) {
      return throwError({ error: { message } })
    }

    function loginTimeOut() {
      return throwError({ status: 440, error: { message: 'User timed out' } });
    }


    function unauthorised() {
      return throwError({ status: 401, error: { message: 'Unauthorised' } });
    }

    function isLoggedIn() {
      //return true of false based on given condition
      console.log("headers get ", headers.get('Authorization')[0]);

      return true;
      return headers.get('Authorization') === getUser().token;

    };


    function generateJWT(length: number, userID: String) {
      var result = "";

      var randomChars = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890';

      for (let i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      };

      result = userID + result;
      return result;
    }

  }




}

