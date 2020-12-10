#include <ArduinoBLE.h>

BLEService batteryService("1101");
BLEUnsignedCharCharacteristic batteryLevelChar("2101", BLERead | BLENotify);

// BLE LED Switch Characteristic - custom 128-bit UUID, read and writable by central
// BLEByteCharacteristic switchCharacteristic("19b10000-e8f2-537e-4f6c-d104768a1214", BLERead | BLEWrite);


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
 BLE.setAdvertisedService(batteryService);
 batteryService.addCharacteristic(batteryLevelChar);
 BLE.addService(batteryService);

 BLE.advertise();
 Serial.println("Bluetooth device active, waiting for connection...");
 
}

void loop()
{
  BLEDevice central = BLE.central();

  if(central){
    Serial.print("Connected to central: ");
    Serial.println(central.address());
    //digitalWrite(LED_BUTTON, HIGH);

    while(central.connected()){
      int battery = analogRead(A0);
      int batteryLevel = map(battery, 0,1023, 0, 100);
      Serial.print("Battery Level % is now: ");
      Serial.println(batteryLevel);
      batteryLevelChar.writeValue(batteryLevel);
      delay(200);
    }

    
  }
  //digitalWrite(LED_BUTTON, LOW);
  Serial.print("Disconnected from central; ");
  Serial.println(central.address());
  
}
