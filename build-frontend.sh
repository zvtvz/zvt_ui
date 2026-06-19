#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

if [[ ! -d node_modules ]]; then
  echo "Missing node_modules — run npm install or yarn in zvt_ui first."
  exit 1
fi

if [[ -f .env.production ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.production
  set +a
elif [[ -f .env.production.example ]]; then
  echo "Tip: copy .env.production.example to .env.production for production env."
fi

# 留空表示与页面同域，由 Nginx 反代 /api；外网静态部署时使用。
: "${NEXT_PUBLIC_SERVER:=}"

export NEXT_PUBLIC_SERVER
export NODE_ENV=production

echo "Building static export (NEXT_PUBLIC_SERVER=${NEXT_PUBLIC_SERVER:-<same-origin>})"
./node_modules/.bin/next build

echo "Done. Static files: ${SCRIPT_DIR}/out/"
echo "Deploy with (zvt_vip root): ../../deploy/deploy.sh"
echo "  or: ../../deploy/deploy-frontend.sh aliyun | windows"
