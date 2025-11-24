import bcrypt from 'bcrypt';
import { connectDB } from '../src/config/database';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createAdminAccount() {
  try {
    const db = await connectDB();
    
    // 비밀번호 해시화
    const password = 'escape2026';
    const passwordHash = await bcrypt.hash(password, 10);
    
    const adminId = uuidv4();
    const email = 'escaperoom@admin.com';
    const username = 'escaperoom';
    
    // 기존 계정 확인
    const [existing] = await db.query<any[]>(
      'SELECT * FROM users WHERE email = ? OR name = ?',
      [email, username]
    );
    
    if (existing.length > 0) {
      // 기존 계정을 admin으로 업데이트
      await db.query(
        'UPDATE users SET role = ?, password_hash = ? WHERE email = ? OR name = ?',
        ['admin', passwordHash, email, username]
      );
      console.log('✅ 기존 계정을 시스템 관리자로 업데이트했습니다.');
    } else {
      // 새 관리자 계정 생성
      await db.query(
        `INSERT INTO users (id, email, password_hash, name, role, provider, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [adminId, email, passwordHash, username, 'admin', 'local']
      );
      console.log('✅ 시스템 관리자 계정이 생성되었습니다.');
    }
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 시스템 관리자 계정 정보');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`이메일/아이디: ${username}`);
    console.log(`비밀번호: ${password}`);
    console.log(`역할: 시스템 전체 관리자 (admin)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('로그인 후 http://localhost:3000/admin 에서 관리자 대시보드를 확인하세요.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 관리자 계정 생성 실패:', error);
    process.exit(1);
  }
}

createAdminAccount();
