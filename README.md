
# How to build

Assuming you have nodejs, npm, and a development environment already installed, building MobilePub is quite simple.


1. Install Cordova
```
sudo npm install -g cordova
```

2. Install your target platform(s)
```
cordova platforms add android
cordova platforms add ios
```

3. Build for your target platforms
```
cordova build android
cordova build ios
```

Your built files will be stored under /platforms, and the output will tell you the exact location.


