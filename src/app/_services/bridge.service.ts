import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
  authoriseOrder(code: number){
    let message = JSON.stringify({auth: "000", code: code});
    this.bluetoothService.ble.order(message).subscribe(response => {
      console.log("Received challenge: ", response)

      this.http.post
    (
      `${environment.apiUrl}/authorizeRemoteOrder`,
      JSON.parse(response),
      this.authService.httpOptions
    ).subscribe((res: any) =>{

      console.log("Solved challenge ", JSON.stringify(res), "status: ", res.status);
      if(res.status == "401"){
        console.error("Unauthorized");
      }
      else if(res.status == "200"){
        message = JSON.stringify({auth: res.auth});
        this.bluetoothService.ble.order(message).subscribe(response => console.log("got response from bridge after resrver: ", response));
      }
      else{
        message = JSON.stringify({auth: res.auth});
        this.bluetoothService.ble.order(message).subscribe(response => console.log("Devices response:  ", response));
      }
      
      });



      
     
      // send response to server
    });
    // pass the message to the server
    // get response from the server and pass to the device
    // get response from the device and pass to the server
  }

}
