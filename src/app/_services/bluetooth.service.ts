import { Injectable } from '@angular/core';

import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

@Injectable({
  providedIn: 'root'
})
export class BluetoothService {

  constructor(private bluetoothSerial: BluetoothSerial) { }

  test_bt(){
    // Write a string
    //this.bluetoothSerial.write('hello world').then(success, failure);   
  }
  

}
