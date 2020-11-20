# ionic-form-ui

Część webowa rozwijana w Visual Studio Code z dodatkiem Angular Snippets (Version 9)
Aktualnie sprawdzone na Android. W przypadku iOS prawdopodobnie będzie trzeba dokonać małych poprawek jeśli chodzi o plugin bluetooth. Na windows plugin bluetooth nie działa.

Zainstalowane pakiety npm:
+ +-- @angular/cli@10.0.1
+ +-- cordova@9.0.0
+ +-- cordova-res@0.15.2
+ +-- ionic@5.4.16
+ `-- native-run@1.2.2

+ pakiety z package.json

Aby zainstalować wymagane plugin npm install

Pluginy cordova

+ cordova-plugin-bluetoothle 6.1.0 "Bluetooth LE"
+ cordova-plugin-device 2.0.2 "Device"
+ cordova-plugin-ionic-keyboard 2.2.0 "cordova-plugin-ionic-keyboard"
+ cordova-plugin-ionic-webview 4.2.1 "cordova-plugin-ionic-webview"
+ cordova-plugin-splashscreen 5.0.2 "Splashscreen"
+ cordova-plugin-statusbar 2.4.2 "StatusBar"
+ cordova-plugin-whitelist 1.3.3 "Whitelist"


Zainstalowane biblioteki Arduino:
+ ArduinoBLE

Kod arduino kompilowany i wgrywany przy pomocy:

Arduino IDE 1.8.13
https://www.arduino.cc/en/software

Kod programu Arduinio w katalogu arduino/sketch_oct26a.ino


Do debugowania połączenia bluetooth asysta nRF Connect ze sklepu Play na Android(Weryfikowanie zgodności z pluginem cordovy)


W celu uruchomienia w przeglądarce

ionic serve --lab w katalogu projektu

WYMAGANIA:
Należy spełniać pełne wymagania, aby zbudować aplikację na urządzeniu fizycznym:

Cordova:
https://cordova.apache.org/docs/en/latest/guide/platforms/android/ 

bluetoothle:
https://github.com/randdusing/cordova-plugin-bluetoothle


Aby zbudować aplikację natywną:

Aby wyświetlać logi w Visual Studio Code: (aplikacja nie działa po odłącczeniu od komputera)
ionic cordova run android --livereload --consolelogs --serverlogs (może wystąpić błąd net:: Należy wówczas spróbować odłączyć urządzenie, bądź zamknąć terminal i w nowym terminalu spróbować wywołać tę samą komendę)


Aby uruchomić aplikację na urządzeniu bez logów(działa po odłączeniu od komputera) 

ionic cordova run android --device

Urządzenie musi być oczywiście w trybie deweloperskim.

