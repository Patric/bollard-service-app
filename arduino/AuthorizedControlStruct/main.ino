#include <ArduinoBLE.h>
#include <Arduino_JSON.h>
#include <sha256.h>
#include <rBase64.h>

uint8_t hmacKey[]={
  0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c
};

String salt = "9U01j34NVW06kzb1uVyMIoqCi";

JSONVar myObject;

JSONVar response;
 //std::list<String> codeBuffer;       


String codeBuffer;
String solutionBuffer;


int deviceId = 1;


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

BLEStringCharacteristic batteryLevelChar("2101", BLERead | BLEIndicate | BLEWrite, 20);
BLEStringCharacteristic statusChar("3100", BLERead | BLEIndicate , 128);
BLEStringCharacteristic orderChar("3101", BLENotify | BLEWrite, 256);
BLEStringCharacteristic responseChar("3102", BLERead | BLEIndicate, 256);


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
  randomSeed(analogRead(0));
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


    String signature = (const char*)order_json["s"];
    String challenge = (const char*)order_json["ch"];
    String code = (const char*)order_json["c"];
    
    
    // challenge required
    if(challenge == "requested")
    {
      wait4response = true;
      // cache code
     // codeBuffer = code;
      Serial.print("CODE is: ");
     Serial.println(code);
      
    String challenge = generateChallenge();



      Serial.print("Challenge ");
      Serial.println(challenge);
      // generate challenge

      // solve and cache challenge
      //solutionBuffer = authenticate(challenge);
      //Serial.print("Solution");
      //Serial.println(solutionBuffer);
    
      response = null;
      response["id"] = deviceId;
      response["ch"] = challenge;
      response["c"] = code;
     
      responseChar.writeValue(JSON.stringify(response));
      statusChar.writeValue("Written");
      delay(1000 * 0.5);
      statusChar.writeValue("Waiting");

      // write response
    }
    else if(authenticate(challenge, code, signature))
    {
     if(code == "100"){
       execute_100();
     }
     else if(code == "200"){
       execute_200();
     }
     else{
       unknown();
     }
    }
    // FOR NATIVE TESTS WITHOUT HASHING
    else if(signature == "SIGNATURE_FROM_CODE_150"){
      execute_150();
    }
    else{
    Serial.print("Received signature is incorrect: ");
    Serial.println(signature);
    //Serial.print("Proper signature is: ");
    //Serial.println(solutionBuffer);
    unauthorized();
    }
 


    

}
void execute_200(){
  wait4response = false;
      response = null;
      response["status"] = "executed";
      int battery = analogRead(A0);
      int batteryLevel = map(battery, 0,1023, 0, 100);
      Serial.print("Battery Level % is now: ");
      Serial.println(batteryLevel);
    
      response["batteryLevel"] = String(batteryLevel);
      responseChar.writeValue(JSON.stringify(response));
      statusChar.writeValue("Written");
      delay(1000 * 0.5);
      statusChar.writeValue("Waiting");
      // empty order char
      orderChar.writeValue("");
  Serial.println("Task 200 executed");
}

void execute_150(){
  wait4response = false;
      response = null;
      response["status"] = "executed";  
      response["message"] = "NON HASHED SIGNATURE RECEIVED. TEST COMPLETED";
      responseChar.writeValue(JSON.stringify(response));
      statusChar.writeValue("Written");
      delay(1000 * 0.5);
      statusChar.writeValue("Waiting");
      // empty order char
      orderChar.writeValue("");
  Serial.println("Task 150 executed");
}


void execute_100(){
    wait4response = false;
      response = null;
      response["status"] = "executed";
      responseChar.writeValue(JSON.stringify(response));
      statusChar.writeValue("Written");
      delay(1000 * 0.5);
      statusChar.writeValue("Waiting");
      // empty order char
      orderChar.writeValue("");
Serial.println("Task 100 executed");
}


void unauthorized(){
   wait4response = false;
      response = null;
      response["status"] = "unauthorized";
      responseChar.writeValue(JSON.stringify(response));
      statusChar.writeValue("Written");
      delay(1000 * 0.5);
      statusChar.writeValue("Waiting");
      // empty order char
      orderChar.writeValue("");
}


void unknown(){
   wait4response = false;
      response = null;
      response["status"] = "unknown";
      responseChar.writeValue(JSON.stringify(response));
      statusChar.writeValue("Written");
      delay(1000 * 0.5);
      statusChar.writeValue("Waiting");
      // empty order char
      orderChar.writeValue("");
}

String generateChallenge(){
   char challenge[81];
  
 
    
  memset(challenge, '\0', sizeof(challenge));

  uint8_t cnt = 0;
  while (cnt != sizeof(challenge) -1)
  {
    challenge[cnt] = random(48, 122);
    if (isAlphaNumeric(challenge[cnt]) == true)
    {
      cnt++;
    }
    else
    {
      challenge[cnt] = random(65, 90);
    }
  }

   return challenge;
}

boolean authenticate(String challenge, String code, String signature){
  Serial.print("challenge");
  Serial.println(challenge);

  Sha256.initHmac(hmacKey, sizeof(hmacKey));
  Sha256.print(challenge + salt + code);

  Serial.print("Correct signature is: ");
  String result = stringifyHash(Sha256.resultHmac());
  Serial.print(stringifyHash(Sha256.resultHmac()));
  Serial.println();
  if(result.equals(signature)){
    return true;
  }
  return false;

}







