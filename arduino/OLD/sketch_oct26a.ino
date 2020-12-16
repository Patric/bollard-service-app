#include <ArduinoBLE.h>
#include <Arduino_JSON.h>


BLEService controlService("1101");
//BLEUnsignedCharCharacteristic batteryLevelChar("2101", BLERead | BLENotify | BLEWrite);
BLEStringCharacteristic batteryLevelChar("2101", BLERead | BLENotify | BLEWrite, 20);
BLEStringCharacteristic statusChar("3100", BLERead | BLEIndicate | BLENotify , 128);
BLEStringCharacteristic messageChar("3101", BLERead | BLEIndicate| BLENotify | BLEWrite, 256);


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
 controlService.addCharacteristic(messageChar);


 BLE.addService(controlService);


 BLE.advertise();
 Serial.println("Bluetooth device active, waiting for connection...");
}

void loop()
{
  char output[100];
  //String output;
  BLEDevice central = BLE.central();
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
      statusChar.writeValue("Waiting");
      Serial.print("The message is: ");
      Serial.println(messageChar.value());
      Serial.print("Status now is: ");
      Serial.println(statusChar.value());
      //messageChar.writeValue("1234567890123456789011115");

      //Json failed on mobile
      if(messageChar.written()){
        myObject = JSON.parse(messageChar.value());
        Serial.print("CODE is: ");
        Serial.println((const char*)myObject["code"]);
        myObject = null;
        myObject["challenge"] = "someChallenge";
        myObject["status"] = "received";
        messageChar.writeValue(JSON.stringify(myObject));
        delay(200 * 1);
       // messageChar.writeValue("123456789012345");
       
      }
      
      delay(200 * 2);
    }

    
  }
  //digitalWrite(LED_BUTTON, LOW);
  Serial.print("Disconnected from central; ");
  Serial.println(central.address());


}




