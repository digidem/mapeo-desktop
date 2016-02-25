#!/bin/bash
(cd vendor/ideditor;
  echo 'module=undefined;require=undefined'
  grep '<script' index.html | grep 'src=' \
  | sed "s/.*src=['\"]//" | sed "s/['\"].*//" \
  | xargs cat \
  | perl -pe"s/('[^']*)www\.openstreetmap.org/\$1'+location.host+'/" \
  | perl -pe"s/('[^']*)openstreetmap.org/\$1'+location.host+'/" \
) > public/ideditor.js
