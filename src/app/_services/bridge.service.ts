import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { BluetoothService } from './bluetooth/bluetooth.service';


@Injectable({
  providedIn: 'root'
})
export class BridgeService {

  constructor(
    private bluetoothService: BluetoothService,
    private http: HttpClient,
    private authService: AuthService
    ) { }

 
  authoriseOrder(code: number): Observable<any>{
   
    // get challenge and initiate authentication
    return this.getChallenge(code)
    .pipe(switchMap(response => {
  
    console.log("Received challenge: ", response)


    // pass challenge and get authorisation signature from server
    return this.passChallenge(response, code)
    .pipe(switchMap((httpResponse: any) =>{
  


      
     // send sigature back to device
    return this.passSignature(httpResponse);//.subscribe(response => console.log("Devices response:  ", response));
      }));

    }));



  }


  getChallenge(code){
    let message = JSON.stringify({s: "null", c: String(code)});
    return this.bluetoothService.ble.order(message);
  }

  passChallenge(deviceResponse, code){
    return this.http.post
    (
      `${environment.apiUrl}/authorizeRemoteOrder`,
      {response: deviceResponse, code: String(code)}
    )

  }

  passSignature(httpResponse){
    return this.bluetoothService.ble.order(JSON.stringify(httpResponse))
  }

}
