#include "CommunicationUnit.h"
#include "BluetoothAdapter.h"
#include "AuthorizationGuard.h"
#include "OrderHandler.h"



class Controller{


    public:
    Controller(CommunicationUnit* communicationUnit);
    void handleOrder(String order);
    void run();

    private:
    CommunicationUnit* communicationUnit;    
    OrderHandler orderHandler;

    virtual ~Controller();

    protected:

};