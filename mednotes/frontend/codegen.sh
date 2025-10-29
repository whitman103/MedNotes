#!/bin/sh



docker run --rm -v `pwd`:/workdir -w /workdir \
openapitools/openapi-generator-cli:v7.0.1 generate \
-g typescript-axios -i $1 \
-o $2 \
--global-property skipFormMode=false \
--additional-properties=supportsES6=true \
--enable-post-process-file \
--skip-validate-spec