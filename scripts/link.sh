#!/usr/bin/env bash

cd $(dirname "$0")
npm link . &&
npm link pragmatik &&
echo "linked successfully"