# bollard-service-app

https://github.com/Patric/bollard-service-app/

This repository cointains code of BEng graduate project of application for secure communication with an Internet of Things (IoT) device. As an example of such setup a service application for an intelligent parking bollard has been chosen. The application may be a part of more complex system that has not been included in the thesis. The assumptions made for the aforementioned issue concern lack of continues Internet connection of the bollard control device and to this problem a study on Internet of Things, web applications and cybersecurity is addressed.



Web development frameworks and languages: Angular 9, Ionic 5, Typescript

Arduino: C++, sha256, arduino_json, ArduinoBLE



# Installed packages and plugins

npm:
+ +-- @angular/cli@10.0.1
+ +-- cordova@9.0.0
+ +-- cordova-res@0.15.2
+ +-- ionic@5.4.16
+ `-- native-run@1.2.2

+ +packages from package.json

cordova

+ cordova-plugin-bluetoothle 6.1.0 "Bluetooth LE"
+ cordova-plugin-device 2.0.2 "Device"
+ cordova-plugin-ionic-keyboard 2.2.0 "cordova-plugin-ionic-keyboard"
+ cordova-plugin-ionic-webview 4.2.1 "cordova-plugin-ionic-webview"
+ cordova-plugin-splashscreen 5.0.2 "Splashscreen"
+ cordova-plugin-statusbar 2.4.2 "StatusBar"
+ cordova-plugin-whitelist 1.3.3 "Whitelist"

After downloading all npm, angular and ionic packages and addons use


to run application on Android browser (common wi-fi network for PC and smartphone may be needed) or Windows browser:
```
ionic cap run android --livereload --external --ssl
```
to run application on native device use (common wi-fi network for PC and smartphone may be needed). Android Studio will be required.
```
ionic cap run android --livereload --external
```

# Application tests

Test data:
username: user_1 
password: test


