#include "Order.h"
#include <list>

class OrderHandler{


    public:
    void handleOrder(String order);
    

    private:
    std::list<Order> orders;
    void execute(Order* order);


    protected:

};