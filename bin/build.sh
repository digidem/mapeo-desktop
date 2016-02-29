#!/bin/bash
make -C vendor/ideditor clean all
(
  echo 'module=undefined;require=undefined;'
  cat vendor/ideditor/dist/iD.js
) > public/ideditor.js

browserify browser/main.js > public/bundle.js
