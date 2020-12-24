

void setup(){
    
    Serial.begin(9600);
    while(!Serial);

    //adapter = BluetoothAdapter();
}



void loop(){
    Serial.println("loop");
    delay(200);
    //adapter.waitForOrder();

}