#include <ArduinoBLE.h>




//using namespace std;


  
// The parameters to the function are put after the comma 



class BluetoothActivity{

    public:


    BluetoothActivity(short executionCode);
    private:
 

    // Execution code
    short* code;
    // Returns true when executed or false when not
    virtual bool execute();
    virtual ~BluetoothActivity();

    protected:



};