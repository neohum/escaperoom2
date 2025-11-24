#!/bin/bash
# 서버 포트
FRONTEND_PORT=6263
BACKEND_PORT=4000

# 프로세스가 해당 포트에서 실행 중이면 종료
function kill_port() {
  local PORT=$1
  PID=$(lsof -ti :$PORT)
  if [ ! -z "$PID" ]; then
    echo "포트 $PORT에서 실행 중인 프로세스(PID: $PID)를 종료합니다."
    kill -9 $PID
  else
    echo "포트 $PORT에서 실행 중인 프로세스가 없습니다."
  fi
}

echo "[1/3] 프론트엔드 서버 확인 및 종료..."
kill_port $FRONTEND_PORT

echo "[2/3] 백엔드 서버 확인 및 종료..."
kill_port $BACKEND_PORT

sleep 2
echo "[3/3] 서버 재시작..."
# 백엔드와 프론트엔드 dev 스크립트 실행 (백그라운드)
npm run dev &

echo "모든 서버가 재시작되었습니다."
