
# InkStone

InkStone is a aurelia based micropub client that uses a service worker to allow for full offline editing.

## Install Libs

cd into the main directory

```bash
    npm install aurelia-cli -g
    npm install
```

This will install the client libraries in their correct locations.

## Configure

edit src/config.js and set te client_id and redirect_uri value.

edit worker.js and set the BASE_DIR to whatever the web addressable path to this directlry is

note that some icons are not provided with InkStone.  You may want to change any references to "/svg/", "/png/", and "/ico/" to suit your needs.

## build

```bash
    au build
    composer install
```
The au command will build the scripts directory and the composer command will build the vendor directory

## deploy
The only files needed are 

* index.html
* manifest.json
* worker.js
* scripts/
* php/
* icons/
* vendor/

## Prefilled Posts

InkStone will automatically populate any field given in the URL.  As such you can use tools such as URL-Forwarder on mobile to allow for using the Share menu
Some examples would be

* https://inklings.io/inkstone/#/post?like-of=@url
* https://inklings.io/inkstone/#/post?in-reply-to=@url

## MobilePub 2 and Earlier

Mobilepub was the name for previous versions of this software. These versions still exist as branches on the github repo, but are no longer maintained.

