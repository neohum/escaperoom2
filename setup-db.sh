 #!/bin/bash

# MySQL 데이터베이스 초기 설정 스크립트
# 방탈출 교육 플랫폼

echo "🚀 MySQL 데이터베이스 초기 설정"
echo "================================"
echo ""

# 1. 데이터베이스 생성
echo "📦 1단계: 데이터베이스 생성"
mysql -u root -proot << 'EOF'
CREATE DATABASE IF NOT EXISTS escaperoom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES LIKE 'escaperoom';
EOF

if [ $? -ne 0 ]; then
    echo "❌ 데이터베이스 생성 실패"
    exit 1
fi

echo ""
echo "✅ 데이터베이스 생성 완료"
echo ""

# 2. 스키마 적용
echo "📋 2단계: 스키마 적용"
mysql -u root -proot escaperoom < backend/migrations/001_initial_schema.sql

if [ $? -ne 0 ]; then
    echo "❌ 스키마 적용 실패"
    exit 1
fi

echo ""
echo "✅ 스키마 적용 완료"
echo ""

# 3. 테이블 확인
echo "📊 3단계: 생성된 테이블 확인"
mysql -u root -proot escaperoom << 'EOF'
SHOW TABLES;
EOF

echo ""
echo "🎉 MySQL 초기 설정이 완료되었습니다!"
echo ""
echo "다음 단계:"
echo "1. backend/.env 파일에서 DB_PASSWORD를 설정하세요"
echo "2. 백엔드 서버 실행: cd backend && npm run dev"
echo "3. 프론트엔드 서버 실행: cd frontend && npm run dev"
echo ""

