#include <ArduinoBLE.h>
#include <BluetoothControl.h>

BLEService bollardService("1101");

// Characteristics
BLEUnsignedIntCharacteristic peripheralChallenge("3101", BLERead | BLENotify);
BLEUnsignedIntCharacteristic peripheralResponse("3102", BLERead | BLENotify);

BLEUnsignedIntCharacteristic webServerSyncChallenge("4101", BLEWrite);
BLEUnsignedIntCharacteristic peripheralSyncResponse("4102", BLERead | BLENotify);

BLEUnsignedIntCharacteristic webServerChallenge("5101", BLEWrite);
BLEUnsignedIntCharacteristic webServerResponse("5102", BLEWrite);


boolean shallWait4Disconnect = false;

long solutionLockRef;
long solutionUnlockRef;


// Will be a value gathered from hardware
boolean isBollardLocked = true;

void reinitiate(){


shallWait4Disconnect = false;

long solutionLockRef = 0;
long solutionUnlockRef = 0;

// NOT SURE ABOUT THAT

peripheralChallenge.setValue(0);

peripheralResponse.setValue(0);

webServerSyncChallenge.setValue(0);
peripheralSyncResponse.setValue(0);

webServerChallenge.setValue(0);
webServerResponse.setValue(0);

Serial.println("Reinitiated values.");

}

void setup() 
{
// Lock bollard

  Serial.begin(9600);

  //works only when serial is opened
 // while(!Serial);
  //pinMode(LED_BUTTON, OUTPUT);

  if(!BLE.begin()){
    Serial.println("Starting BLE failed");
    while(1);
  }

 BLE.setLocalName("Bollard_#001");
 BLE.setAdvertisedService(bollardService);

bollardService.addCharacteristic(peripheralChallenge);
bollardService.addCharacteristic(peripheralResponse);

bollardService.addCharacteristic(webServerSyncChallenge);
bollardService.addCharacteristic(peripheralSyncResponse);

bollardService.addCharacteristic(webServerChallenge);
bollardService.addCharacteristic(webServerResponse);


BLE.addService(bollardService);

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

      // If cycle is not fished
      if(!shallWait4Disconnect){

        // Wait for synchronisation challenge from Web Server
        Serial.println("Waiting for synchronisation challenge... ");
        while(!webServerSyncChallenge.written()){

          if(!central.connected()){
            Serial.println("Disconnected");
            break;
          }     
        }

        Serial.print("Challenge received: ");
        Serial.println(webServerSyncChallenge.value());


        Serial.println("Writing response for synchronisation challenge to characteristic...");
        if(isBollardLocked){
          peripheralSyncResponse.writeValue(solveChallengeLocked(webServerSyncChallenge.value()));
          Serial.println("Device state is locked. Response written.");
        }
        else if(!isBollardLocked){
          peripheralSyncResponse.writeValue(solveChallengeUnlocked(webServerSyncChallenge.value()));
          Serial.println("Device state is unlocked. Response written.");
        }
        
        Serial.println("Generating challenge for WebServer...");
        peripheralChallenge.writeValue(generateChallenge());

        Serial.println("Challenge written. Waiting for WebServerResponse...");
        while(!webServerResponse.written()){
          
          if(!central.connected()){
            Serial.println("Disconnected");
            break;
          }
          
        }
        Serial.println("Response received. Synchronisation done. Waiting for Web Server challenge...");
  

        while(!webServerChallenge.written() && central.connected()){
          
          if(!central.connected()){
            Serial.println("Disconnected");
            break;
          }
          
        }

        Serial.println("Web server challenge received. Preparing action...");
        if(webServerResponse.value() == solutionLockRef && central.connected()){
          // Lock the device
          isBollardLocked = true;
          peripheralResponse.writeValue(solveChallengeLocked(webServerChallenge.value()));
          shallWait4Disconnect = true;
          Serial.println("Peripheral response written. Waiting for disconnection...");
          
        }
        else if(webServerResponse.value() == solutionUnlockRef && central.connected()) {
          // Unlock the devicce
          isBollardLocked = false;
          peripheralResponse.writeValue(solveChallengeUnlocked(webServerChallenge.value()));
          shallWait4Disconnect = true;
          Serial.println("Peripheral response written. Waiting for disconnection...");
        }
        else{
          Serial.println("Authorisation failed. Disconnecting...");
          // TO CONSIDER: 
          // If authorisation had failed more than 5 times add to banned devices list

          central.disconnect();
          reinitiate();
          break;
        }
      };

      //Add proper timeout

      }

  delay(200);
  }
  //digitalWrite(BOLLARD_BLOCK, LOW);
  delay(200);
  Serial.print("Disconnected from central; ");
  if(shallWait4Disconnect){
  reinitiate();
  };

  Serial.println(central.address());

}


long solveChallengeLocked(long challenge){
  return challenge + 437;
}

long solveChallengeUnlocked(long challenge){
  return challenge - 434;
}

long generateChallenge()
{
  long challenge = random(500, 999999);
  solutionLockRef = solveChallengeLocked(challenge);
  solutionUnlockRef = solveChallengeUnlocked(challenge);

  Serial.print("Locked solution: ");
  Serial.println(solutionLockRef);
  
  Serial.print("Unlocked solution: ");
  Serial.println(solutionUnlockRef);
  

  return challenge;
}





