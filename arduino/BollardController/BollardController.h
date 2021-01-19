#ifndef BollardController_h
#define BollardController_h

#include <Arduino.h>
#include <ArduinoBLE.h>
#include <Arduino_JSON.h>
#include <sha256.h>
#include <rBase64.h>



  
class BollardControllerClass
{
  public:
    // INITIALISATION AND CONNECTION MANAGING
    void initBluetooth();

    void initBluetoothCustom(const char* deviceName, int deviceId, String salt,
    const char*  controlServiceUID, const char*  statusCharUID, const char*  orderCharUID,const char*  responseCharUID,
     bool lockedInitially);

    boolean waitForConnection();

  private:
    // BLUETOOTH
    BLEService* controlService;
    BLEStringCharacteristic* statusChar;
    BLEStringCharacteristic* orderChar;
    BLEStringCharacteristic* responseChar;
    BLEDevice central;
    void sendResponse(String response);

 
    // BUFFERS
    String codeBuffer;
    String challengeBuffer;
    String userIdBuffer;

    // FLAGS
    bool wait4response;
    bool locked = false;



    // DEVICE PARAMETEERS
    int deviceId = 1;
    const char* deviceName = "Bollard_#001";

    // UTILS
    int arrSize = 6;
    String lastConnected[6];
    String lastExecuted[6];
    void pushArray(String array[], String value, int length);
    void initArray(String array[], int length);
    String strArrayToString(String array[], int length);


    // SECURITY PARAMETERS
      uint8_t hmacKey[20] = {
        0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c};
    String salt = "9U01j34NVW06kzb1uVyMIoqCi";
    uint8_t* hmacKey2[20] ;

 
    // CACHING METHODS
    void cacheCodeAndUserID(String code, String userID);
    void cacheChallenge(String challenge);


    // SECURITY METHODS
    String SHA256HMAC(String challenge, String salt, String code, String userID);
    boolean verifySignature(String userSignature);
    String stringifyHash(uint8_t* hash);
    String generateChallenge();



    // JSON ORDER METHODS
    String handleJSONOrder(String order);
    JSONVar initialiseJSONOrder(JSONVar JSONOrder);
    JSONVar handleAuthenticatedOrder(String code);

  
    // Device Information
    JSONVar order200();

    // Lock bollard
    JSONVar order101();

    // Unlock
    JSONVar order102();

    // Manual change of internal lock flag
    JSONVar order130();

   // Last 5 users that connected
    JSONVar order202();
   
    // Last 5 users that executed
    JSONVar order205();
   
    JSONVar unauthorized();
    JSONVar unknown();

     // TEST FLOW without authorising
    JSONVar order150();
   
};
extern BollardControllerClass BollardController;

#endif