#!/bin/bash

echo "🔧 MySQL 완전 재설정"
echo "===================="
echo ""
echo "⚠️  경고: 이 작업은 모든 MySQL 데이터를 삭제합니다!"
echo ""
read -p "계속하시겠습니까? (y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "취소되었습니다."
    exit 0
fi

echo ""
echo "1. MySQL 서비스 중지..."
brew services stop mysql

echo "2. MySQL 데이터 디렉토리 백업..."
if [ -d "/opt/homebrew/var/mysql" ]; then
    mv /opt/homebrew/var/mysql /opt/homebrew/var/mysql.backup.$(date +%Y%m%d%H%M%S)
fi

echo "3. MySQL 재초기화 (비밀번호 없음)..."
/opt/homebrew/Cellar/mysql/*/bin/mysqld --initialize-insecure --user=$(whoami) --basedir=/opt/homebrew/Cellar/mysql/* --datadir=/opt/homebrew/var/mysql

echo "4. MySQL 서비스 시작..."
brew services start mysql
sleep 3

echo "5. 연결 테스트..."
if mysql -u root -e "SELECT 'MySQL is ready!' as status;" 2>/dev/null; then
    echo ""
    echo "✅ MySQL이 성공적으로 재설정되었습니다!"
    echo ""
    echo "비밀번호가 설정되지 않았습니다."
    echo "보안을 위해 mysql_secure_installation을 실행하세요."
    echo ""
    echo "데이터베이스 생성 명령:"
    echo "mysql -u root -e \"CREATE DATABASE escaperoom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\""
else
    echo ""
    echo "❌ MySQL 연결에 실패했습니다."
    echo "수동 확인이 필요합니다."
fi
