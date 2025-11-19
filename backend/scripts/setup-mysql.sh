#!/bin/bash

# MySQL 초기 설정 스크립트
# 방탈출 교육 플랫폼

echo "🚀 MySQL 데이터베이스 초기 설정을 시작합니다..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# MySQL 설치 확인
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL이 설치되어 있지 않습니다.${NC}"
    echo "Homebrew로 설치: brew install mysql"
    exit 1
fi

echo -e "${GREEN}✅ MySQL이 설치되어 있습니다.${NC}"
mysql --version
echo ""

# 데이터베이스 생성
echo "📦 데이터베이스를 생성합니다..."
echo "MySQL root 비밀번호를 입력하세요 (비밀번호가 없으면 Enter):"

mysql -u root -p << EOF
-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS escaperoom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 데이터베이스 선택
USE escaperoom;

-- 현재 데이터베이스 확인
SELECT DATABASE() AS current_database;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 데이터베이스 'escaperoom'이 생성되었습니다.${NC}"
else
    echo -e "${RED}❌ 데이터베이스 생성에 실패했습니다.${NC}"
    exit 1
fi

echo ""

# 스키마 적용
echo "📋 스키마를 적용합니다..."
echo "MySQL root 비밀번호를 다시 입력하세요:"

mysql -u root -p escaperoom < ../migrations/001_initial_schema.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 스키마가 성공적으로 적용되었습니다.${NC}"
else
    echo -e "${RED}❌ 스키마 적용에 실패했습니다.${NC}"
    exit 1
fi

echo ""

# 테이블 확인
echo "📊 생성된 테이블을 확인합니다..."
echo "MySQL root 비밀번호를 다시 입력하세요:"

mysql -u root -p escaperoom << EOF
SHOW TABLES;
EOF

echo ""
echo -e "${GREEN}✅ MySQL 초기 설정이 완료되었습니다!${NC}"
echo ""
echo "다음 단계:"
echo "1. backend/.env 파일에서 DB_PASSWORD 설정"
echo "2. 백엔드 서버 실행: cd backend && npm run dev"
echo "3. 프론트엔드 서버 실행: cd frontend && npm run dev"
echo ""

