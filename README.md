
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

## build

```bash
    au build
    composer install
    sass src/styles.scss > styles.css
```
The au command will build the scripts directory which is the core javascript needed to run the app.
The composer command will build the vendor directory which is used by the php folder on the server.
The sass command builds an extra copy of the stylesheets, this is needed for those visiting the page without js.

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

## Edit, Delete, and Undelete

* Currently these features are pretty new and so I don't want to put them in the main interface just yet, but you can access them by going to 
  /#/edit/?url=<someurl>
  /#/delete/?url=<someurl>
  /#/undelete/?url=<someurl>

## MobilePub 2 and Earlier

Mobilepub was the name for previous versions of this software. These versions still exist as branches on the github repo, but are no longer maintained.

