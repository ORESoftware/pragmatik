#!/usr/bin/env bash

SUMAN=$(which suman);

if [[ -z ${SUMAN} ]]; then
 npm install -g suman
fi


# given suman.conf.js, this should be setup correctly
suman --default