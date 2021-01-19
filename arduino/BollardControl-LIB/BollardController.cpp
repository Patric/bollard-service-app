#include <string.h>
#include "BollardController.h"

// BLUETOOTH CONNECTION

void BollardControllerClass::initBluetooth()
{
  while (!Serial);

  if (!BLE.begin())
  {
    Serial.println("Starting BLE failed");
    while (1)
      ;
  }

  this->controlService = new BLEService("1101");
  this->statusChar = new BLEStringCharacteristic("3100", BLERead | BLEIndicate, 128);
  this->orderChar = new BLEStringCharacteristic("3101", BLENotify | BLEWrite, 256);
  this->responseChar = new BLEStringCharacteristic("3102", BLERead | BLEIndicate, 256);

  // initiate bluetooth

  BLE.setLocalName(deviceName);
  Serial.print("Device name set to ");
  Serial.println(deviceName);

  BLE.setAdvertisedService(*this->controlService);
  Serial.println("Advertised service set.");

  controlService->addCharacteristic(*this->statusChar);
  controlService->addCharacteristic(*this->orderChar);
  controlService->addCharacteristic(*this->responseChar);
  BLE.addService(*this->controlService);
  Serial.println("Service added.");

  BLE.advertise();
  Serial.println("Bluetooth device active.");
  this->statusChar->writeValue("Waiting");
  this->initArray(this->lastConnected, arrSize);
  this->initArray(this->lastExecuted, arrSize);


  this->central = BLEDevice();
  randomSeed(analogRead(0));
};

void BollardControllerClass::sendResponse(String response)
{
  this->responseChar->writeValue(response);
  // empty orderChar
  this->orderChar->writeValue("");
  this->statusChar->writeValue("Written");
  delay(1000 * 0.5);
  this->statusChar->writeValue("Waiting");
  Serial.print("Response ");
  Serial.print(response);
  Serial.println(" sent.");
}

boolean BollardControllerClass::waitForConnection()
{

  central = BLE.central();
  Serial.println("Waitining for connection...");
  wait4response = false;
  challengeBuffer = "";
  codeBuffer = "";
  userIdBuffer = "";

  if (central)
  {
    Serial.print("Connected to central: ");
    Serial.println(central.address());

    // Save central MAC ADDRESS

    while (central.connected())
    {
      Serial.println("Waiting for orders...");
      Serial.print("Status is now: ");
      Serial.println(this->statusChar->value());

      if (this->orderChar->written())
      {
        Serial.print("Received order is: ");
        Serial.println(this->orderChar->value());
        this->sendResponse(handleJSONOrder(this->orderChar->value()));
      }
      delay(200 * 2);
    }
  }


  //digitalWrite(LED_BUTTON, LOW);
  if (central.address() != "00:00:00:00:00:00")
  {

    Serial.print("Disconnected from central; ");
    Serial.println(central.address());


    this->pushArray(this->lastConnected,
    String(" | " + central.address() + "|" + String(userIdBuffer)), 
    arrSize);
  }
}

// JSON ORDER HANDLING

String BollardControllerClass::handleJSONOrder(String JSONOrder)
{
  JSONVar order_json = JSON.parse(JSONOrder);

  String signature = (const char *)order_json["s"];

  JSONVar response;

  Serial.print("Received message: ");
  Serial.println(JSONOrder);
  //if signature is null then challenge is generated
  if (signature == null)
  {
    response = this->initialiseJSONOrder(order_json);
  }
  // if correct signature
  else if (this->verifySignature(signature))
  {
    response = this->handleAuthenticatedOrder(codeBuffer);
    this->pushArray(this->lastExecuted,
    String(" | " + central.address() + "|" + String(userIdBuffer)+ "|" + codeBuffer), 
    6);
  }
  // FOR NATIVE FLOW TESTS WITHOUT HTTPS, WITHOUT HASHING
  else if (signature == "SIGNATURE_FROM_CODE_150")
  {
    response = this->order150();
     this->pushArray(this->lastExecuted,
    String(" | "+ central.address() + "|" + central.deviceName() + "|" + String(userIdBuffer)+ "|" + codeBuffer), 
    6);
  }
  // for incorrect signature
  else
  {
    response = this->unauthorized();
     this->pushArray(this->lastExecuted,
    String(" | " + central.address() + "|" + String(userIdBuffer)+ "|" + "unauthorized"), 
    6);
  }

  return JSON.stringify(response);
}

JSONVar BollardControllerClass::initialiseJSONOrder(JSONVar JSONOrder)
{

  Serial.println("Signature was not provided. Following order initialisation path...");
  String code = (const char *)JSONOrder["c"];
  String uid = (const char *)JSONOrder["uid"];

  wait4response = true;
  // cache code
  this->cacheCodeAndUserID(code, uid);
  Serial.print("Order code is: ");
  Serial.println(code);
  // generate challenge
  String challenge = generateChallenge();
  this->cacheChallenge(challenge);

  JSONVar response;
  response["id"] = deviceId;
  response["ch"] = challenge;

  return response;
}

JSONVar BollardControllerClass::handleAuthenticatedOrder(String code)
{

  wait4response = false;
  JSONVar response;

  if (codeBuffer == "200")
  {
    response = this->order200();
  }
  else if (codeBuffer == "101")
  {
    response = this->order101();
  }
  else if (codeBuffer == "102")
  {
    response = this->order102();
  }
  else if (codeBuffer == "130")
  {
    response = this->order130();
  }
  else if (codeBuffer == "202")
  {
    response = this->order202();
  }
  else if (codeBuffer == "205")
  {
    response = this->order205();
  }
  else
  {
    response = this->unknown();
  }

  return response;
}

// SECURITY
boolean BollardControllerClass::verifySignature(String userSignature)
{
  if (this->SHA256HMAC(challengeBuffer, salt, codeBuffer, userIdBuffer) == userSignature)
  {
    return true;
  }
  Serial.print("Received signature is incorrect: ");
  Serial.println(userSignature);
  return false;
}

String BollardControllerClass::SHA256HMAC(String challenge, String salt, String code, String userID)
{
  Sha256.initHmac(hmacKey, sizeof(hmacKey));
  Serial.print("Generating SHA256HMAC signature from: ");
  Serial.println(challenge + salt + code + userID);
  Sha256.print(challenge + salt + code + userID);

  Serial.print("Correct signature is: ");
  String result = this->stringifyHash(Sha256.resultHmac());
  Serial.println(result);

  return result;
}

String BollardControllerClass::generateChallenge()
{

  Serial.println("Generating 80 bytes challenge....");
  char challenge[81];
  memset(challenge, '\0', sizeof(challenge));
  uint8_t cnt = 0;
  while (cnt != sizeof(challenge) - 1)
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
  Serial.print("Challenge generated: ");
  Serial.println(challenge);

  return challenge;
}

String BollardControllerClass::stringifyHash(uint8_t *hash)
{
  int i;
  String result = "";
  for (i = 0; i < 32; i++)
  {
    result += "0123456789abcdef"[hash[i] >> 4];
    result += "0123456789abcdef"[hash[i] & 0xf];
  }


  return result;
}

// UTILS
void BollardControllerClass::initArray(String array[], int length){
  
  for(int i = 0; i<length; i++){
    array[i] = "";
  }
}

void BollardControllerClass::pushArray(String array[], String value, int length){

  Serial.print("Pushing value ");
  Serial.print(value);
  Serial.println(" to ");


  boolean pushed = false;
  for(int i = length - 1 ; i >= 0; i--){
    Serial.println(array[i]);
    if(array[i] == ""){
      array[i] = value;
      pushed = true;
      Serial.print("Array: ");
      Serial.println(array[i]);
      break;
    }
  }
  if(!pushed){
    for(int i = 0 ; i < length - 1; i++)
    {
      Serial.println(array[i]);
      array[i + 1] = array[i];
    }
    array[0] = value;
  }

  Serial.println("Current array: ");
    for(int i = 0 ; i < length; i++){
    Serial.println(array[i]);
    
  }
  
}

String BollardControllerClass::strArrayToString(String array[], int length){
  String merged = "";
  for(int i = 0; i< length; i++){
    merged += array[i];
  }
  return merged;
}

void BollardControllerClass::cacheCodeAndUserID(String code, String userID)
{
  userIdBuffer = userID;
  codeBuffer = code;
}

void BollardControllerClass::cacheChallenge(String challenge)
{
  challengeBuffer = challenge;
}

// CODES AND RESPONSES

JSONVar BollardControllerClass::unauthorized()
{
  JSONVar response;
  Serial.print("Order unauthorized.");
  response["status"] = "unexecuted";
  response["message"] = "unauthorized";

  return response;
}

JSONVar BollardControllerClass::unknown()
{
  JSONVar response;
  Serial.print("Order unknown.");
  response["status"] = "unexecuted";
  response["message"] = "unknown";

  return response;
}

JSONVar BollardControllerClass::order200()
{
  int battery = analogRead(A0);
  JSONVar response;
  int batteryLevel = map(battery, 0, 1023, 0, 100);
  Serial.print("Executing order 200... Battery Level % is now: ");
  Serial.println(batteryLevel);
  response["status"] = "executed";
  response["batteryLevel"] = String(batteryLevel);
  Serial.println("Order 200 executed");
  return response;
}

JSONVar BollardControllerClass::order101()
{
  JSONVar response;
  Serial.print("Executing order 101... Bollard's locked flag is now: ");
  Serial.println(locked);
  if (!locked)
  {
    // USE PROPER DIGITAL PIN TO LOCK BOLLARD
    this->locked = true;
    response["status"] = "executed";
    response["message"] = "Bollard locked";
    Serial.println("Task 101 executed. Bollard locked");
  }
  else
  {
    response["status"] = "unexecuted";
    response["message"] = "Bollard is already locked. If that is not true try changing the state manually using adequate order";
    Serial.println("Task 101 not executed. Bollard already locked");
  }

  return response;
}

JSONVar BollardControllerClass::order102()
{
  JSONVar response;
  Serial.print("Executing order 102... Bollard's locked flag is now: ");
  Serial.println(locked);
  if (locked)
  {
    // USE PROPER DIGITAL PIN TO UNLOCK BOLLARD
    this->locked = false;
    response["status"] = "executed";
    response["message"] = "Bollard unlocked";
    Serial.println("Task 102 executed. Bollard unlocked");
  }
  else
  {
    response["status"] = "unexecuted";
    response["message"] = "Bollard is already unlocked. If that is not true try changing the state manually using adequate order";
    Serial.println("Task 102 not executed. Bollard already unlocked");
  }
  return response;
}

JSONVar BollardControllerClass::order150()
{
  JSONVar response;
  Serial.print("Executing test order 150...");
  response["status"] = "executed";
  response["message"] = "NON HASHED SIGNATURE RECEIVED. TEST COMPLETED";
  Serial.println("Order 150 executed.");

  return response;
}

JSONVar BollardControllerClass::order130()
{
  JSONVar response;
  Serial.print("Executing order 130... Bollard's locked flag is now: ");
  Serial.println(locked);
  if (locked)
  {
    // USE PROPER DIGITAL PIN TO UNLOCK BOLLARD
    this->locked = false;
    response["status"] = "executed";
    response["message"] = "Bollard internal state changed to unlocked";
    Serial.println("Task 130 executed. Bollard internal state changed to unlocked");
  }
  else
  {
    this->locked = true;
    response["status"] = "executed";
    response["message"] = "Bollard internal state changed to locked";
    Serial.println("Task 130 executed. Bollard internal state changed to locked");
  }
  return response;
}

JSONVar BollardControllerClass::order202()
{
  JSONVar response;
  response["status"] = "executed";
  response["message"] = this->strArrayToString(this->lastConnected, arrSize);
  // LAST 5 that connected

  return response;
}

JSONVar BollardControllerClass::order205()
{
  JSONVar response;
  response["status"] = "executed";
  response["message"] = this->strArrayToString(this->lastExecuted, arrSize);
  // LAST 5 that executed, code and status

  return response;
}

BollardControllerClass BollardController;
