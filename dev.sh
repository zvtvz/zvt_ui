#!/bin/bash
# 提高文件描述符限制，修复 EMFILE 导致的 hot reload 失效
ulimit -n 10240
exec ./node_modules/.bin/next dev
