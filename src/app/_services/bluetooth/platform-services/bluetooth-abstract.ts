import { Observable } from 'rxjs';


enum Status{
    CONNECTING,
    CONNECTED,
    CLOSED,
    DISCONNECTED
}

export class ConnectionStatus{

    public static readonly status = Status;
    private _deviceAddress: string;
    private _deviceName: string;
    private _status: Status;

    constructor(deviceAddress: string, deviceName: string, status: Status){
        this._deviceAddress = deviceAddress;
        this._deviceName = deviceName;
        this._status = status;
        
    }

    
public get deviceAddress(): string{
    return this._deviceAddress;
}   

public get deviceName(): string{
    return this._deviceName;
    }   

public get status(): Status{
    return this._status;
 }  


}


export interface BluetoothAbstract{


   connectionStatus$: Observable<ConnectionStatus>;

    startScanning();

    connect(dvc_address?: string);

    request(code: number): Observable<any>;

    getMessage(): Observable<any>;

    getConnectedDevice(): Observable<any>;

    getDevicesFound(): Observable<any>;

    disconnect(): Promise<any>;

    // DEL LATER
    closeConnection(dvc_address: string): Observable<any>;
    //updateConnectionStatus(status: ConnectionStatus);
    
}
