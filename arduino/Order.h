

class Order{


    public:
    static int ID;
    Order(String code, String solution);

    virtual boolean execute() = 0;

    private:
    
    boolean wasExecuted();
    boolean isAuthorised(String solution);

    boolean wasExecuted;
    String solution;
    String code;

    protected:

};