#include <ArduinoBLE.h>
#include <Arduino_JSON.h>


BLEService controlService("1101");
//BLEUnsignedCharCharacteristic batteryLevelChar("2101", BLERead | BLENotify | BLEWrite);
BLEStringCharacteristic batteryLevelChar("2101", BLERead | BLENotify | BLEWrite, 20);
BLEStringCharacteristic statusChar("3100", BLERead | BLENotify , 128);
BLEStringCharacteristic orderChar("3101", BLENotify | BLEWrite, 256);
BLEStringCharacteristic responseChar("3102", BLERead | BLENotify, 256);

JSONVar myObject;

void reinitiate(){

}


void setup() 
{
  Serial.begin(9600);
  //while(!Serial);
  //pinMode(LED_BUTTON, OUTPUT);

  if(!BLE.begin()){
    Serial.println("Starting BLE failed");
    while(1);
  }
  

 BLE.setLocalName("Rising_Bollard_#001");
 BLE.setAdvertisedService(controlService);

 controlService.addCharacteristic(batteryLevelChar);
 controlService.addCharacteristic(statusChar);
 controlService.addCharacteristic(orderChar);
 controlService.addCharacteristic(responseChar);


 BLE.addService(controlService);


 BLE.advertise();
 Serial.println("Bluetooth device active, waiting for connection...");
statusChar.writeValue("Waiting");

}

void loop()
{
  char output[100];
  //String output;
  BLEDevice central = BLE.central();
  int i = 0;
  if(central){
    
    

    Serial.print(output);
    Serial.print("Connected to central: ");
    Serial.println(central.address());
    //digitalWrite(LED_BUTTON, HIGH);
 
    while(central.connected()){

      int battery = analogRead(A0);
      int batteryLevel = map(battery, 0,1023, 0, 100);
      Serial.print("Battery Level % is now: ");
      Serial.println(batteryLevel);
      batteryLevelChar.writeValue(String(batteryLevel));
     // statusChar.writeValue("Waiting");
      Serial.print("The incoming message is: ");
      Serial.println(orderChar.value());
      Serial.print("Status now is: ");
      Serial.println(statusChar.value());
      //orderChar.writeValue("1234567890123456789011115");

      //Json failed on mobile
      
      if(orderChar.written()){
        i++;
        myObject = JSON.parse(orderChar.value());
        Serial.print("CODE is: ");
        Serial.println((const char*)myObject["code"]);
        myObject = null;
        //myObject["challenge"] = "9WVXEG3B0D8rhG8zBrIFI2kF7a627kP88FHkcJxloaZlzoXKeYm6EpS7v5QBxcwPnXRHGvhy1pXvac";
        myObject["challenge"] = String(i);
        myObject["status"] = "received";
        responseChar.writeValue(JSON.stringify(myObject));
        statusChar.writeValue("Written");
        Serial.print("Status now is: ");
        //Char.writeValue("Value has changed and this message should now be sent");
        delay(200 * 1);
        statusChar.writeValue("Waiting");
       // orderChar.writeValue("123456789012345");
       
      }
      
      delay(200 * 2);
    }

    
  }
  //digitalWrite(LED_BUTTON, LOW);
  Serial.print("Disconnected from central; ");
  Serial.println(central.address());


}




