#ifndef BluetoothAdapter_h
#define BluetoothAdapter_h

#include "Arduino.h"
#include "CommunicationUnit.h"
#include <ArduinoBLE.h>

// #ifndef Included_NameModel_H

// #define Included_NameModel_H

class BluetoothAdapter : private CommunicationUnit{

public:
BluetoothAdapter();
virtual ~BluetoothAdapter();
void sendResponse();
String waitForOrder();
void run();


private:
BLEStringCharacteristic* statusChar;
BLEStringCharacteristic* orderChar;
BLEStringCharacteristic* responseChar;
BLEService* controlService;


void setup();

protected:


    
};

#endif