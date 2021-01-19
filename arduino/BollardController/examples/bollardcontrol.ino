#include <BollardController.h>

int deviceId = 1;
const char* deviceName = "Bollard_#001";
String salt = "9U01j34NVW06kzb1uVyMIoqCi";
const char* controlServiceUID = "1101";
const char* statusCharUID = "3100";
const char* orderCharUID = "3101";
const char* responseCharUID = "3102";
bool lockedInitially = false;


boolean started;

void setup() 
{
    delay(1000 * 2);

  Serial.begin(9600);
  while(!Serial);

  //pinMode(LED_BUTTON, OUTPUT);
    started = false;
}

void loop()
{
   if(!started){
     BollardController.initBluetoothCustom(deviceName, deviceId,salt, controlServiceUID, statusCharUID, orderCharUID,  responseCharUID,lockedInitially);
     started = true;
  }
  BollardController.waitForConnection();
  
}





