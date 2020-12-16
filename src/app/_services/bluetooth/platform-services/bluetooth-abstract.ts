import { BehaviorSubject, Observable } from 'rxjs';



/**
  * @description
  * Describes the current state of the connection: 
  * CONNECTING, CONNECTED, DISCONNECTED.
  *@usage
  * ```
  * import {BluetoothAbstract, STATUS } from 'ionic-angular';
  *
  * @Component({...})
  * export class BluetoothPlatformService {
  *   connectionInfo$: BehaviorSubject<{address: string,name: string, status: STATUS}>;
  *   constructor(...) {
  *     // This will create a new JSON object with status: DISCONNECTED
  *      this.connectionInfo$ = new BehaviorSubject<{address: string,name: string, status: STATUS}>({address: null, name: null, status: STATUS.DISCONNECTED})
  *   }
  * }
  * ```
  */
export enum STATUS{
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    DISCONNECTED = "DISCONNECTED"
}


/**
  * @description
  * Interface for Bluetooth communication.
  * @usage
  * ```
  * import { ConnectionInfo } from 'bluetooth-abstract';
  *
  * @Injectable({
  * providedIn: 'root'
  *  })
  * export class BluetoothWebService implements BluetoothAbstract{
  * connectionInfo$: BehaviorSubject<ConnectionInfo>;
  * constructor({...}){}
  * 
  * startScanning();

    connect(dvc_address?: string){...}

    request(code: number): Observable<any>{...}

    getMessage(): Observable<any>{...}

    getConnectionInfo(): Observable<ConnectionInfo>{...}

    getConnectedDevice(): Observable<any>{...}

    getDevicesFound(): Observable<any>{...}

    disconnect(): Promise<any>{...}

    // DEL LATER
    closeConnection(dvc_address: string): Observable<any>{...}
  * 
  * ```
  */
export interface  BluetoothAbstract{

    /**
   * @description
   * Starts scanning for available devices. 
   */
    startScanning(): Observable<any>;


    /**
   * @description
   * @param dvc_address - MAC Address of the device that should be connected
   */
    connect(dvc_address?: string);


    /**
   * @description
   * @param code - Request code. Received by the peripheral to execute a specific action
   * @returns ```Observable<any>```
   */
    sendMessage(code: number): Observable<any>;

    /**
   * @description
   * @param code - Reads message from the peripheral
   * @returns ```Observable<any>```
   */
    getMessage(): Observable<any>;


    /**
   * @description
   * Returns ```Observable``` of JSON containing info of the device. Provides information of connection over time
   *    
   *    
   * @param address - MAC Addres of the Bluetooth device
   * @param name - Name of the Bluetooth device
   * @param status - Connection status: CONNECTED | CONNECTING | DISCONNECTED
   * 
   * @returns ```Observable<{address: string,name: string, status: STATUS}>```
   * 
   * 
   * @usage
    * ```
    * import {BluetoothAbstract, STATUS } from 'ionic-angular';
    *
    * @Component({...})
    * export class BluetoothPlatformService {
    *   connectionInfo$: BehaviorSubject<{address: string,name: string, status: STATUS}>;
    *   constructor(...) {
    *     // This will create a new JSON object with status: DISCONNECTED
    *     this.connectionInfo$ = 
    *       new BehaviorSubject<{address: string,name: string, status: STATUS}>({
    *       address: null,
    *       name: null, 
    *       status: STATUS.DISCONNECTED})}
    * 
    * 
    *  getConnectionInfo(): Observable<{address: string,name: string, status: STATUS}> {
    *   return this.connectionInfo$.asObservable();}
    * 
    * 
    * }
    * ```
    */
    getConnectionInfo(): Observable<{address: string,name: string, status: STATUS}>;

    /**
   * @description
   * Returs devices found in ```startScanning()```
   * @returns ```Observable<any>```
   */
    getDevicesFound(): Observable<any>;


     /**
   * @description
   * Disconnects from currently connected device``
   */
    disconnect(): Observable<{address: string,name: string, status: STATUS}>;

    debugButton();
   
}



