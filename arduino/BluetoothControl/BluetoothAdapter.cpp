#include "BluetoothAdapter.h"


BluetoothAdapter::~BluetoothAdapter(){
delete this->statusChar;
delete this->orderChar;
delete this->responseChar;
delete this->controlService;
}


void BluetoothAdapter::setup(){
  

    if(!BLE.begin()){
    Serial.println("Starting BLE failed");
    while(1);
     }
    BLE.setLocalName("Rising_Bollard_#001");
    BLE.setAdvertisedService(*this->controlService);
    this->controlService->addCharacteristic(*this->statusChar);
    this->controlService->addCharacteristic(*this->orderChar);
    this->controlService->addCharacteristic(*this->responseChar);
    BLE.addService(*this->controlService);

    BLE.advertise();
    Serial.println("Bluetooth device active, waiting for connection...");

}

BluetoothAdapter::BluetoothAdapter(){
this->statusChar = new BLEStringCharacteristic("3100", BLERead | BLENotify , 128);
this->orderChar = new BLEStringCharacteristic("3101", BLENotify | BLEWrite, 256);
this->responseChar = new BLEStringCharacteristic("3102", BLERead | BLENotify, 256);
this->controlService = new BLEService("1101");

this->setup();
}

void BluetoothAdapter::sendResponse(){


}

// TO DO: set timeout and disconnect after timeout
String BluetoothAdapter::waitForOrder(){

while(true){

    BLEDevice central = BLE.central();
    if(central)
    {
        Serial.print("Connected to central: ");
        Serial.println(central.address());
         while(central.connected())
         {
            int battery = analogRead(A0);
            int batteryLevel = map(battery, 0,1023, 0, 100);
            Serial.print("Battery Level % is now: ");
            Serial.println(batteryLevel);
            Serial.print("The incoming message is: ");
            Serial.println(this->orderChar->value());
            Serial.print("Status now is: ");
            Serial.println(this->statusChar->value());
             if(this->orderChar->written())
             {
                 Serial.println("Returned order");
                 return this->orderChar->value();
             }
            delay(200);
         }
    }

    Serial.print("Disconnected from central; ");
    Serial.println(central.address());
}

}
void BluetoothAdapter::run(){




}
