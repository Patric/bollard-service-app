#include <ArduinoBLE.h>
#include <Arduino_JSON.h>
#include <sha256.h>



uint8_t hmacKey[]={
  0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c
};

String salt = "9U01j34NVW06kzb1uVyMIoqCi";

String stringifyHash(uint8_t* hash) {
  int i;
  String result = "";
  for (i=0; i<32; i++) {
    result += "0123456789abcdef"[hash[i]>>4];
    result +="0123456789abcdef"[hash[i]&0xf];
  }
  return result;
}


BLEService controlService("1101");

BLEStringCharacteristic batteryLevelChar("2101", BLERead | BLENotify | BLEWrite, 20);
BLEStringCharacteristic statusChar("3100", BLERead | BLENotify , 128);
BLEStringCharacteristic orderChar("3101", BLENotify | BLEWrite, 256);
BLEStringCharacteristic responseChar("3102", BLERead | BLENotify, 256);

JSONVar myObject;

JSONVar response;
 //std::list<String> codeBuffer;       


String codeBuffer;
String solutionBuffer;
bool wait4response;


void reinitiate(){

}

void foo(int a) 
{ 
    // Do something 
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
  
  //String output;
  BLEDevice central = BLE.central();
  wait4response = false;
  solutionBuffer = "";
  codeBuffer = "";

  int id = 0;
  if(central){
    
  
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
      
      if(orderChar.written())
      {
        handleJSONOrder(orderChar.value());
      //   id++;
      //   myObject = JSON.parse(orderChar.value());
      //   Serial.print("CODE is: ");
      //   Serial.println((const char*)myObject["code"]);
      //   myObject = null;
      //   //myObject["challenge"] = "9WVXEG3B0D8rhG8zBrIFI2kF7a627kP88FHkcJxloaZlzoXKeYm6EpS7v5QBxcwPnXRHGvhy1pXvac";
      //   myObject["challenge"] = String(id);
      //   myObject["status"] = "received";
      //   responseChar.writeValue(JSON.stringify(myObject));
      //   statusChar.writeValue("Written");
      //   Serial.print("Status now is: ");
      //   //Char.writeValue("Value has changed and this message should now be sent");
      //   delay(200 * 1);
      //   statusChar.writeValue("Waiting");
      //  // orderChar.writeValue("123456789012345");
      }
      delay(200 * 2);
    }
  }
  //digitalWrite(LED_BUTTON, LOW);
  Serial.print("Disconnected from central; ");
  Serial.println(central.address());
}



void handleJSONOrder(String order){

  
    JSONVar order_json = JSON.parse(order);


    String auth = (const char*)order_json["auth"];
    String code = (const char*)order_json["code"];
    
    
    // challenge required
    if(auth == "000")
    {
      wait4response = true;
      // cache code
      codeBuffer = code;
      Serial.print("CODE is: ");
     Serial.println(code);
      
      String challenge = generateChallenge();



      Serial.print("Challenge ");
      Serial.println(challenge);
      // generate challenge

      // solve and cache challenge
      solutionBuffer = solveChallenge(challenge);
      Serial.print("Solution");
      Serial.println(solutionBuffer);
    
      response = null;
      response["challenge"] = challenge;
      response["id"] = 1;
      responseChar.writeValue(JSON.stringify(response));
      statusChar.writeValue("Written");
      delay(1000 * 0.5);
      statusChar.writeValue("Waiting");

      // write response
    }
    else if(auth == solutionBuffer)
    {
     if(codeBuffer == "100"){
       execute_100();
     }
     else if(codeBuffer == "200"){
       execute_200();
     }
    }
    else{
    Serial.print("Received solution is incorrect: ");
    Serial.println(auth);
    Serial.print("Proper solution is: ");
    Serial.println(solutionBuffer);
    unauthorized();
    }
 


    

}
void execute_200(){
  wait4response = false;
      response = null;
      response["status"] = "executed";
      responseChar.writeValue(JSON.stringify(response));
      statusChar.writeValue("Written");
      delay(1000 * 0.5);
      statusChar.writeValue("Waiting");
  Serial.println("Task 2 executed");
}

void execute_100(){
    wait4response = false;
      response = null;
      response["status"] = "executed";
      responseChar.writeValue(JSON.stringify(response));
      statusChar.writeValue("Written");
      delay(1000 * 0.5);
      statusChar.writeValue("Waiting");
  
Serial.println("Task 1 executed");
}


void unauthorized(){
   wait4response = false;
      response = null;
      response["status"] = "unauthorized";
      responseChar.writeValue(JSON.stringify(response));
      statusChar.writeValue("Written");
      delay(1000 * 0.5);
      statusChar.writeValue("Waiting");
}

String generateChallenge(){
   char challenge[60];
  
       
    
  memset(challenge, '\0', sizeof(challenge));

  uint8_t cnt = 0;
  while (cnt != sizeof(challenge) - 1)
  {
    challenge[cnt] = random(0, 0x7F);
    Serial.println(challenge[cnt]);
    if (challenge[cnt] == 0)
    {
      break;
    }
    if (isAlphaNumeric(challenge[cnt]) == true)
    {
      cnt++;
    }
    else
    {
      challenge[cnt] = '\0';
    }
   Serial.print("Challenge array");
   Serial.println(challenge);
  
  }

   return challenge;
}

String solveChallenge(String challenge){
  Sha256.initHmac(hmacKey, sizeof(hmacKey));
  Sha256.print(challenge + salt);
  //printHash(Sha256.resultHmac());
  Serial.println();


    //char key = '1';
   // challenge[0] = key;
    //for(int i=0; i<challenge.length(); i++){
      //challenge[i] = (char)challenge[i] + 4;
    //}
  return stringifyHash(Sha256.resultHmac());
}






