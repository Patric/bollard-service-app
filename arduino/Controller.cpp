#include "Controller.h"

Controller::~Controller(){
    delete this->communicationUnit;
};


Controller::Controller(CommunicationUnit* communicationUnit)
{
this->communicationUnit = communicationUnit;
this->orderHandler = OrderHandler();


};

void Controller::handleOrder(String order){



};

void Controller::run(){

    this->communicationUnit->waitForOrder();


};
