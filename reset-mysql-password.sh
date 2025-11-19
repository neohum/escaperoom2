#!/bin/bash

echo "🔐 MySQL root 비밀번호 재설정"
echo "=============================="
echo ""
echo "이 스크립트는 MySQL root 비밀번호를 'root'로 재설정합니다."
echo "개발 환경에서 편리하게 사용할 수 있습니다."
echo ""

# MySQL 중지
echo "1️⃣ MySQL 서비스 중지..."
brew services stop mysql
sleep 2

# 안전 모드로 MySQL 시작 (백그라운드)
echo "2️⃣ MySQL을 안전 모드로 시작..."
mysqld_safe --skip-grant-tables --skip-networking &
MYSQL_PID=$!
sleep 5

# 비밀번호 정책 확인 및 재설정
echo "3️⃣ 비밀번호 정책 변경 및 root 비밀번호 재설정..."
mysql -u root << 'EOF'
FLUSH PRIVILEGES;
UNINSTALL COMPONENT 'file://component_validate_password';
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo "✅ 비밀번호 재설정 완료!"
else
    echo "❌ 비밀번호 재설정 실패"
fi

# MySQL 안전 모드 종료
echo "4️⃣ MySQL 안전 모드 종료..."
kill $MYSQL_PID 2>/dev/null
killall mysqld 2>/dev/null
sleep 2

# MySQL 정상 재시작
echo "5️⃣ MySQL 정상 재시작..."
brew services start mysql
sleep 3

# 접속 테스트
echo "6️⃣ 접속 테스트..."
mysql -u root -proot -e "SELECT 'MySQL 접속 성공!' AS status;"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 완료! MySQL root 비밀번호가 'root'로 설정되었습니다."
    echo ""
    echo "backend/.env 파일을 업데이트합니다..."
    sed -i '' 's/DB_PASSWORD=.*/DB_PASSWORD=root/' backend/.env
    echo "✅ DB_PASSWORD=root 설정 완료"
    echo ""
    echo "다음 명령어로 데이터베이스를 설정하세요:"
    echo "  ./setup-db.sh"
else
    echo ""
    echo "❌ 접속 테스트 실패. 수동으로 재설정이 필요합니다."
fi

