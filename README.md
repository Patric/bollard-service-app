# bollard-service-app

Część webowa rozwijana w Visual Studio Code z dodatkiem Angular Snippets (Version 9)
Aktualnie sprawdzone na Android. W przypadku iOS prawdopodobnie będzie trzeba dokonać małych poprawek jeśli chodzi o plugin bluetooth. Na windows plugin bluetooth nie działa.

# Zainstalowane dodatki

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

W celu uruchomienia w przeglądarce

`ionic serve --lab`
w katalogu projektu

# Arduino

Zainstalowane biblioteki Arduino:
+ ArduinoBLE

Kod arduino kompilowany i wgrywany przy pomocy:

Arduino IDE 1.8.13
https://www.arduino.cc/en/software

Kod programu Arduinio w katalogu arduino/sketch_oct26a.ino


Do debugowania połączenia bluetooth asysta nRF Connect ze sklepu Play na Android(Weryfikowanie zgodności z pluginem cordovy)




# Wymagania:
Należy spełniać pełne wymagania, aby zbudować aplikację na urządzeniu fizycznym:

Cordova:
https://cordova.apache.org/docs/en/latest/guide/platforms/android/ 

bluetoothle:
https://github.com/randdusing/cordova-plugin-bluetoothle



#  Aby zbudować aplikację natywną:

Aby wyświetlać logi w Visual Studio Code: (aplikacja nie działa po odłączeniu od komputera):
`ionic cordova run android --livereload --consolelogs --serverlogs`
(może wystąpić błąd net:: Należy wówczas spróbować odłączyć urządzenie, bądź zamknąć terminal i w nowym terminalu spróbować wywołać tę samą komendę)


Aby uruchomić aplikację na urządzeniu bez logów(aplikacja działa po odłączeniu od komputera) 

`ionic cordova run android --device`

Urządzenie musi być oczywiście w trybie deweloperskim.



# Testowanie aplikacji.

Zalogować się testowymi danymi:
username: user_1 
password: test

Następnie nastąpi przekierowanie do "profilu".

Przycisk Action odpowiada za przykładowe pobranie danych z backendu(aktualnie pobierana lista użytkowników) Służy do tego aby sprawdzić, czy użytkownik jest zalogowany(przy logowaniu backend przydziela użytkownikowi token, który jest przesyłany w nagłówkach authorization i id(//TO DO wprowadzić zmiany, aby id i token był przekazywany w jednym nagłówku authorization) i weryfikowany po stronie backendu. Jeśli użytkownik nie będzie upoważniony do pobrania zawartości, bądź jego sesja wygaśnie to dane nie zostaną mu wysłane z serwera i nastąpi automatyczne przekierowanie do strony logowania.(//TO DO upewnić się, że aplikacja nie zachowuje tokenu oraz id w BehaviorSubject w authService po wylogowaniu. Sprawdzić, czy w przypadku budowania aplikacji natywnych jest w ogóle sens wykorzystywania localStorage, cookeis i sessionStorage). 

Przycisk Check status głównie pomaga przy debugowaniu(aktualnie odpowiada za funkcję czytania danych z charakterystyki serwisu bluetooth)

Przycisk Start scan rozpoczyna 3 sekundowe skanowanie urządzeń w pobliżu, które powinny być wyświetlane niżej na liście(name oraz address).

W tym momencie powinniśmy mieć uruchomione Arduino z załadowanym przez nas programem, które będzie widoczne na liście zeskanowanych urządzeń pod nazwą "Rising Bollard#001". Należy wcisnąć przycisk "Connect" obok pozycji tego urządzenia oraz poczekać aż zostanie nawiązane połączenie. W przypadku problemów należy włączyć i wyłączyć bluetooth i ponowić próbę. Próba łączenia z innymi urządzenia powoduje zbugowanie aplikacji.(Aktualnie wykomentowany jest filtr, który odrzuca wszystkie inne serwisy niż ten z arduino. W normalnym wypadku wyświetlać się powinny tylko urządzenia, które oferują serwis o przyznanym przez nas UID i tak się dzieje, bo odkomentowaniu filtra)

Po nawiązaniu połączenia przycisk "Connect" zamieni się w przycisk "Disconnect", a pooniżej zostaje wyświetlony stan naładowania, który będzie się zmieniał w czasie rzeczywistym. W celu rozłączenia urządzeń należy wcisnąć "Disconnect". Wówczas znów otrzymamy przycisk "Connect" obok danej pozycji.

Przycisk Reset domyślnie służyć ma zerowaniu wszystkich ustawień i rozłączaniu urządzeń, jednak na tę chwilę powoduje tylko problemy.

Przycisk logout powoduje wylogowanie i przeniesienie do root directory
