'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showRoleModal, setShowRoleModal] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'user' | 'creator' | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailCheck, setEmailCheck] = useState<{ checking: boolean; available: boolean | null; message: string }>({
    checking: false,
    available: null,
    message: '',
  });
  const [usernameCheck, setUsernameCheck] = useState<{ checking: boolean; available: boolean | null; message: string }>({
    checking: false,
    available: null,
    message: '',
  });

  useEffect(() => {
    // URL 파라미터에서 role을 가져와 자동 선택
    const roleParam = searchParams.get('role') as 'user' | 'creator' | null;
    if (roleParam && (roleParam === 'user' || roleParam === 'creator')) {
      setSelectedRole(roleParam);
      setShowRoleModal(false);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Reset check status when user types
    if (name === 'email') {
      setEmailCheck({ checking: false, available: null, message: '' });
    } else if (name === 'username') {
      setUsernameCheck({ checking: false, available: null, message: '' });
    }
  };

  const checkEmailAvailability = async () => {
    if (!formData.email) {
      setEmailCheck({ checking: false, available: null, message: '이메일을 입력해주세요' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailCheck({ checking: false, available: false, message: '올바른 이메일 형식이 아닙니다' });
      return;
    }

    setEmailCheck({ checking: true, available: null, message: '확인 중...' });

    try {
      const response = await fetch(`${API_URL}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailCheck({
          checking: false,
          available: data.available,
          message: data.message,
        });
      } else {
        setEmailCheck({ checking: false, available: false, message: '확인 실패' });
      }
    } catch (err) {
      setEmailCheck({ checking: false, available: false, message: '확인 실패' });
    }
  };

  const checkUsernameAvailability = async () => {
    if (!formData.username) {
      setUsernameCheck({ checking: false, available: null, message: '사용자명을 입력해주세요' });
      return;
    }

    if (formData.username.length < 2) {
      setUsernameCheck({ checking: false, available: false, message: '사용자명은 최소 2자 이상이어야 합니다' });
      return;
    }

    setUsernameCheck({ checking: true, available: null, message: '확인 중...' });

    try {
      const response = await fetch(`${API_URL}/api/auth/check-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsernameCheck({
          checking: false,
          available: data.available,
          message: data.message,
        });
      } else {
        setUsernameCheck({ checking: false, available: false, message: '확인 실패' });
      }
    } catch (err) {
      setUsernameCheck({ checking: false, available: false, message: '확인 실패' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email and username availability
    if (emailCheck.available === false) {
      setError('이메일 중복을 확인해주세요');
      return;
    }

    if (usernameCheck.available === false) {
      setError('사용자명 중복을 확인해주세요');
      return;
    }

    if (emailCheck.available === null) {
      setError('이메일 중복 확인을 해주세요');
      return;
    }

    if (usernameCheck.available === null) {
      setError('사용자명 중복 확인을 해주세요');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to home
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* 역할 선택 모달 */}
      {showRoleModal && !selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">회원가입</h2>
            <p className="text-center text-gray-600 mb-8">계정 유형을 선택해주세요</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 게임참여자 */}
              <button
                onClick={() => {
                  setSelectedRole('user');
                  setShowRoleModal(false);
                }}
                className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-xl p-6 hover:border-indigo-500 hover:shadow-lg transition-all duration-200"
              >
                <div className="text-5xl mb-4">🎮</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">게임참여자</h3>
                <p className="text-gray-600 text-sm mb-4">
                  방탕출 게임을 플레이하고<br />
                  학습 경험을 즐기세요
                </p>
                <ul className="text-left text-sm text-gray-500 space-y-1">
                  <li>✓ 게임 플레이</li>
                  <li>✓ 배지 획득</li>
                  <li>✓ 순위 경쟁</li>
                  <li>✓ 무료 이용</li>
                </ul>
                <div className="mt-4 text-indigo-600 font-semibold group-hover:text-indigo-700">
                  선택하기 →
                </div>
              </button>

              {/* 컨텐츠 생산자 */}
              <button
                onClick={() => {
                  setSelectedRole('creator');
                  setShowRoleModal(false);
                }}
                className="group bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 hover:border-purple-500 hover:shadow-lg transition-all duration-200"
              >
                <div className="text-5xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">컨텐츠 생산자</h3>
                <p className="text-gray-600 text-sm mb-4">
                  교육용 방탕출 게임을<br />
                  만들고 공유하세요
                </p>
                <ul className="text-left text-sm text-gray-500 space-y-1">
                  <li>✓ 게임 제작</li>
                  <li>✓ 팀 협업</li>
                  <li>✓ 통계 분석</li>
                </ul>
                <div className="mt-4 text-purple-600 font-semibold group-hover:text-purple-700">
                  선택하기 →
                </div>
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm">
                이미 계정이 있으신가요? 로그인
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              setSelectedRole(null);
              setShowRoleModal(true);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ← 뒤로
          </button>
          <div className="flex items-center gap-2 text-sm">
            {selectedRole === 'user' ? (
              <>
                <span className="text-2xl">🎮</span>
                <span className="font-semibold text-indigo-600">게임참여자</span>
              </>
            ) : (
              <>
                <span className="text-2xl">🎨</span>
                <span className="font-semibold text-purple-600">컨텐츠 생산자</span>
              </>
            )}
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">회원가입</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              사용자 이름
            </label>
            <div className="flex gap-2">
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="홍길동"
              />
              <button
                type="button"
                onClick={checkUsernameAvailability}
                disabled={usernameCheck.checking || !formData.username}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {usernameCheck.checking ? '확인 중...' : '중복 확인'}
              </button>
            </div>
            {usernameCheck.message && (
              <p className={`mt-1 text-sm ${usernameCheck.available ? 'text-green-600' : 'text-red-600'}`}>
                {usernameCheck.available ? '✓ ' : '✗ '}{usernameCheck.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <div className="flex gap-2">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="your@email.com"
              />
              <button
                type="button"
                onClick={checkEmailAvailability}
                disabled={emailCheck.checking || !formData.email}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {emailCheck.checking ? '확인 중...' : '중복 확인'}
              </button>
            </div>
            {emailCheck.message && (
              <p className={`mt-1 text-sm ${emailCheck.available ? 'text-green-600' : 'text-red-600'}`}>
                {emailCheck.available ? '✓ ' : '✗ '}{emailCheck.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        {/* Social Login Divider */}
        <div className="mt-8 mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는 소셜 계정으로 시작</span>
            </div>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          {/* Google Login */}
          <a
            href={`${API_URL}/api/auth/google`}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 계속하기
          </a>

          {/* Kakao Login */}
          <a
            href={`${API_URL}/api/auth/kakao`}
            className="w-full flex items-center justify-center gap-3 text-gray-900 py-3 rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: '#FEE500' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.8 6.7-.2.7-.6 2.1-.7 2.5 0 .3.1.3.3.2.2-.1 2.4-1.6 2.8-1.9.6.1 1.2.1 1.8.1 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
            </svg>
            Kakao로 계속하기
          </a>

          {/* Naver Login */}
          <a
            href={`${API_URL}/api/auth/naver`}
            className="w-full flex items-center justify-center gap-3 text-white py-3 rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: '#03C75A' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
            </svg>
            Naver로 계속하기
          </a>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

