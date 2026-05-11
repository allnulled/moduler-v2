#!/usr/bin/bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$DIR"

refrescador \
  -w "$(pwd)" \
  -i "**.dist.*" \
  -i "**/dist.*" \
  -i "**/*.dist.*" \
  -i "**/test/files/compilations/**/*" \
  -d 0 \
  -e "sh" \
  -e "ts" \
  -e "tsx" \
  -e "txt" \
  -e "js" \
  -e "json" \
  -e "css" \
  -e "html" \
  -x 'node $(pwd)/build.js' \
  -x 'node $(pwd)/test/test.js @{refrescador.file}'