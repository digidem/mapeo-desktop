#!/bin/bash
(cd vendor/ideditor;
  grep '<script' index.html | grep 'src=' \
  | sed "s/.*src=['\"]//" | sed "s/['\"].*//" \
  | xargs cat
) >  public/ideditor.js
