#ifndef BollardController_h
#define BollardController_h

#include <Arduino.h>
#include <ArduinoBLE.h>
#include <Arduino_JSON.h>
#include <sha256.h>




      /*!
       * Class with basic examples of Bollard control and service.
     */
class BollardControllerClass
{
  public:
   /*!
       * Initiates bluetooth with defalt pvalues
     */
    void initBluetooth();

    /*!
       * Initiates bluetooth with custom values
     */
    void initBluetoothCustom(const char* deviceName, int deviceId, String salt,

     /*!
       * Bluetooth services UID's.
     */
    const char*  controlServiceUID, const char*  statusCharUID, const char*  orderCharUID,const char*  responseCharUID,

      /*!
       * Locked status when initiating device.
     */
     bool lockedInitially);


    /*!
       * Main loop when connected to a device.
     */
    boolean waitForConnection();

  private:
    BLEService* controlService;
    BLEStringCharacteristic* statusChar;
    BLEStringCharacteristic* orderChar;
    BLEStringCharacteristic* responseChar;
    BLEDevice central;

      /*!
       * Writes String response to characteristic
     */
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
     /*!
       * Pushes array of given length with given value.
     */
    void pushArray(String array[], String value, int length);

 /*!
       * Initiates array with "" values.
     */
    void initArray(String array[], int length);

     /*!
       *Converts array to string using commas.
     */
    String strArrayToString(String array[], int length);


    // SECURITY PARAMETERS

        /*!
       * HMAC key used by SHA256HMAC function
     */
      uint8_t hmacKey[20] = {
        0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c, 0x0c};
            /*!
       * Salt added to SHA256HMAC input.
     */
    String salt = "9U01j34NVW06kzb1uVyMIoqCi";
    uint8_t* hmacKey2[20] ;

 
    // CACHING METHODS

  
       /*!
       * Caches code to execute after authentication and userID to generate signature and compare with the signature received from the user
     */
    void cacheCodeAndUserID(String code, String userID);


           /*!
       * 
       * Caches challenge to generate signature and compare with the signature received from the user
     */
    void cacheChallenge(String challenge);


    // SECURITY METHODS
     /*!
       * Hash function HMAC using SHA256. Generates valid signature from given arguments.
     */
    String SHA256HMAC(String challenge, String salt, String code, String userID);

     /*!
       * Verifes given signature with SHA256HMAC using cached arguments from buffers.
     */
    boolean verifySignature(String userSignature);

     /*!
       * Converts SHA256HNAC output to String.
     */
    String stringifyHash(uint8_t* hash);

     /*!
       * Generates 80 bytes logn challenge
     */
    String generateChallenge();



    // JSON ORDER METHODS
     /*!
       * Triggered when order characteristic is written. Handles Order in 3 ways: initiates authentication, executes code or responds with unauthorized or unknown error.
     */
    String handleJSONOrder(String order);
    /*!
       * Initialisises authentication. Caches generated challenge, received userID and order code.
     */

    JSONVar initialiseJSONOrder(JSONVar JSONOrder);

        /*!
       * Used when order is authenticated. Can return unknown if code number is unknown.
     */
    JSONVar handleAuthenticatedOrder(String code);

  
     /*!
       * Returns response with status, MacAddress, DeviceID, Name, RSSI and battery level
     */
    JSONVar order200();

        /*!
       * Returns response with status and bollard locked state. Changes state to locked.
     */
    JSONVar order101();

        /*!
       * Returns response with status and bollard locked state. Changes state to unlocked.
     */
    JSONVar order102();



    /*!
       * Returns response with status and bollard locked state. Manually changes the locked state regardless current state.
     */
    JSONVar order130();

    /*!
       * Returns response with status, last 5 connected users. Counts when users disconnects.
     */
    JSONVar order202();
   
    /*!
       * Returns response with status, 5 users that executed orders on the device along with their id and code or information.
     */
    JSONVar order205();
   

    /*!
       * Returns status unexectued and unauthorized message.
     */
    JSONVar unauthorized();

    /*!
       * Returns status unexectued and unknownd message.
     */
    JSONVar unknown();

     // Does not require signature. Used for testing data flow without security.
    JSONVar order150();
   
};
extern BollardControllerClass BollardController;

#endif