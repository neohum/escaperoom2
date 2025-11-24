#!/bin/bash

echo "🔧 MySQL Root 비밀번호 재설정"
echo "================================"
echo ""
echo "이 스크립트는 MySQL root 비밀번호를 재설정합니다."
echo ""

# 새 비밀번호 입력받기
read -sp "새 MySQL root 비밀번호를 입력하세요: " NEW_PASSWORD
echo ""
read -sp "비밀번호를 다시 입력하세요: " NEW_PASSWORD_CONFIRM
echo ""

if [ "$NEW_PASSWORD" != "$NEW_PASSWORD_CONFIRM" ]; then
    echo "❌ 비밀번호가 일치하지 않습니다."
    exit 1
fi

echo ""
echo "MySQL을 안전 모드로 재시작합니다..."

# MySQL 중지
brew services stop mysql

# 안전 모드로 MySQL 시작 (백그라운드)
mysqld_safe --skip-grant-tables &
MYSQLD_PID=$!

# MySQL이 시작될 때까지 대기
sleep 5

# 비밀번호 변경
echo "비밀번호를 변경합니다..."
mysql -u root << EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';
FLUSH PRIVILEGES;
EOF

# mysqld_safe 종료
kill $MYSQLD_PID 2>/dev/null
sleep 2

# MySQL 정상 재시작
brew services start mysql
sleep 3

# 연결 테스트
echo ""
echo "연결을 테스트합니다..."
if mysql -u root -p"$NEW_PASSWORD" -e "SELECT 'Connection successful!' as status;" 2>/dev/null; then
    echo ""
    echo "✅ 비밀번호가 성공적으로 변경되었습니다!"
    echo ""
    echo "이제 backend/.env 파일의 DB_PASSWORD를 업데이트하세요:"
    echo "DB_PASSWORD=$NEW_PASSWORD"
else
    echo ""
    echo "❌ 비밀번호 변경에 실패했습니다."
    echo "수동으로 재설정이 필요할 수 있습니다."
fi
