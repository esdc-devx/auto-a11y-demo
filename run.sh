#!/bin/bash

docker run --shm-size=1G \
-e ROEWEB_UNAME=$ROEWEB_UNAME \
-e ROEWEB_PWORD=$ROEWEB_PNAME \
-v src:/app/index.js \
-v screenshots:/app/screenshots/ \
alekzonder/puppeteer