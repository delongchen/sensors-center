#!/bin/bash

OUT_DIR="./dist"
SRC_DIR="./src"

rm -rf $OUT_DIR
mkdir -p $OUT_DIR

protoc \
  --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=$OUT_DIR \
  --ts_proto_opt=outputServices=grpc-js \
  --ts_proto_opt=outputIndex=true \
  --ts_proto_opt=esModuleInterop=true \
  --ts_proto_opt=env=node \
  --proto_path=$SRC_DIR \
  $SRC_DIR/*.proto
