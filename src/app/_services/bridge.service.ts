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

  // order -> response -> httppost -> respone -> order -> response -> httppost
  authoriseOrder(code: number): Observable<any>{
    let message = JSON.stringify({s: "null", c: String(code)});

    // send order to bluetooth
    return this.bluetoothService.ble.order(message)
    .pipe(switchMap(response => {
  
    console.log("Received challenge: ", response)
    // get authorisation signature from server
    return this.http.post
    (
      `${environment.apiUrl}/authorizeRemoteOrder`,
      {response: response, code: String(code)},
      this.authService.httpOptions
    ).pipe(switchMap((res: any) =>{
      console.log("Solved challenge ", JSON.stringify(res), "status: ", res.status);
      // if(res.status == "401"){
      //   console.error("Unauthorized");
      // }
      // else if(res.status == "200"){
      //   message = JSON.stringify({auth: res.auth});
      //   this.bluetoothService.ble.order(message).subscribe(response => console.log("got response from bridge after resrver: ", response));
      // }
      // else{
        message = JSON.stringify(res);
        return this.bluetoothService.ble.order(message);//.subscribe(response => console.log("Devices response:  ", response));
      //}
      }));

    }));
    // pass the message to the server
    // get response from the server and pass to the device
    // get response from the device and pass to the server
  }

}
