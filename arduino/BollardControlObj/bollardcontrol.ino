#include <BollardController.h>


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
     BollardController.initBluetooth();
     started = true;
  }
  BollardController.waitForConnection();
  
}





