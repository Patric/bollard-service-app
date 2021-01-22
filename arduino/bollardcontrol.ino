#include <BollardController.h>
int deviceId = 1;
const char* deviceName = "Bollard_#001";
String salt = "9U01j34NVW06kzb1uVyMIoqCi";
const char* controlServiceUID = "1101";
const char* statusCharUID = "3100";
const char* orderCharUID = "3101";
const char* responseCharUID = "3102";
bool lockedInitially = false;

void setup() 
{
    delay(1000 * 2);

  Serial.begin(9600);
  while(!Serial);
  
  BollardController.initBluetoothCustom(deviceName, deviceId,salt, controlServiceUID, 
  statusCharUID, orderCharUID,  responseCharUID,lockedInitially);
}
void loop()
{
  BollardController.waitForConnection();
}





