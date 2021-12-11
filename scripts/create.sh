#!/usr/bin/env bash
source .env

near delete $CN $ID --force
near create-account $CN --masterAccount $ID