#include <ArduinoBLE.h>
#include <BluetoothActivity.h>

class BluetoothControl{

public:
    static BluetoothControl* getInstance(){
        static BluetoothControl FInstance;
        return &FInstance;
    }
    
    void addCharacteristic(BLECharacteristic characteristic);
    

private:
    BLEService controlService;
    BluetoothActivity activities[];

    virtual ~BluetoothControl();
    BluetoothControl(const BluetoothControl&) = delete;
    BluetoothControl();
protected:
    

};