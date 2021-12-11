#!/usr/bin/env bash
source .env

cargo test -- --nocapture
[ $? -eq 0 ] || exit 1

cargo build --target wasm32-unknown-unknown --release
[ $? -eq 0 ] || exit 1

mkdir -p out/ && cp target/wasm32-unknown-unknown/release/main.wasm out/
near deploy $CN --wasmFile out/main.wasm