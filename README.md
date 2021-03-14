# bollard-service-app

https://github.com/Patric/bollard-service-app/

This repository cointains code of BEng graduate project of Ionic application for secure communication with an Internet of Things (IoT) device. As an example a service application for IoT device has been chosen. Communication is established via Bluetooth 4.2 protocol between Arduino Nano 33 IoT and Ionic (Angular + TypeScript) using a PWA/Native facade and adapters that has been written exclusively for this problem. Connection is secured with third party mockbackend authentication using HMAC-SHA256 algorithm in one-channel communication device-userApp-backend.


Web development frameworks and languages: Angular 9, Ionic 5, Typescript

Arduino: C++, sha256, arduino_json, ArduinoBLE

Development perspectives:
Node.js + Express.js/Loopback backend with deploy to AWS Cloud.

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

![app_presentation](https://user-images.githubusercontent.com/55952226/111075999-b3483680-84ea-11eb-902a-d705c5d64d63.gif)


https://user-images.githubusercontent.com/55952226/111075113-b2ada100-84e6-11eb-8e29-1c16269dedda.mp4


