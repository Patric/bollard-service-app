#ifndef CommunicationUnit_h
#define CommunicationUnit_h

class CommunicationUnit{

public:

    virtual void sendResponse() = 0;
    virtual String waitForOrder() = 0;
    virtual void run() = 0;

};


#endif