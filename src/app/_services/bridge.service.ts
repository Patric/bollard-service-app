import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { BluetoothService } from './bluetooth/bluetooth.service';

/**
* @description
* BridgeService provides integration between Bluetooth Device and HTTP server. It mainly alows sending and authorizing messages between the two parties.
* @usage
* ```
* import { BridgeService } from 'bridge.service';
* 
* @Component({
* selector: 'app-bluetooth',
* templateUrl: './bluetooth.component.html',
* styleUrls: ['./bluetooth.component.scss'],
*  })
*   export class BluetoothComponent{
*   constructor(private bridgeService: BridgeService){...}
*   exampleFunction(){
*   this.bridgeService.order(code: String).subscibe(response => {
*   
*   console.log(response);
*   })}
}
* 
* 
* ```
*/
@Injectable({
  providedIn: 'root'
})
export class BridgeService {

  constructor(
    private bluetoothService: BluetoothService,
    private http: HttpClient,
    private authService: AuthService
    ) { }

 /**
* @description
* Authorizes order sent to the device.
* 
* @returns ```Observable<any>``` of response from the device.
* ```
*/
  authoriseOrder(code: String): Observable<any>{
  
    // get challenge and initiate authentication
    return this.getChallenge(code)
    .pipe(switchMap(response => {
  
    console.log("[BridgeService] Received challenge: ", response)


    // pass challenge and get authorisation signature from server
    return this.passChallenge(response, code)
    .pipe(switchMap((httpResponse: any) =>{
  


      
     // send sigature back to device
    return this.passSignature(httpResponse);//.subscribe(response => console.log("Devices response:  ", response));
      }));

    }));



  }


  getChallenge(code){
    console.log("[BridgeService] Getting challenge from the device with code ", code, " for user ", String(this.authService.currentUserValue.id));
    let message = JSON.stringify({s: null, c: code, uid: String(this.authService.currentUserValue.id) });
    return this.bluetoothService.ble.order(message);
  }

  passChallenge(deviceResponse, code){
    console.log("[BridgeService] Passing challenge: ", deviceResponse, " for code ", code);

    return this.http.post
    (
      `${environment.apiUrl}/authorizeRemoteOrder`,
      {response: deviceResponse, code: code}
    )

  }

  passSignature(httpResponse){
    console.log("[BridgeService] Passing signature..." );
    return this.bluetoothService.ble.order(JSON.stringify(httpResponse))
  }

}
