import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './../styles/components/AuthPage.css';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

// axios 기본 설정 추가
axios.defaults.withCredentials = true;

const AuthPage = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        user_email: '',
        user_pw: '',
        user_name: '',
        confirmPassword: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailChecked, setEmailChecked] = useState(false);
    const [emailAvailable, setEmailAvailable] = useState(false);

    // 디버깅용 효과
    useEffect(() => {
        // 서버가 실행 중인지 확인
        axios
            .get('/')
            .then((response) => {
                console.log('서버 연결 확인:', response);
            })
            .catch((error) => {
                console.error('서버 연결 오류:', error);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Reset email check when email changes
        if (name === 'user_email') {
            setEmailChecked(false);
            setEmailAvailable(false);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        console.log('로그인 시도:', formData);

        try {
            // CORS 이슈 디버깅을 위해 전체 URL 사용
            const response = await axios.post(
                'http://localhost:3000/users/login',
                {
                    user_email: formData.user_email,
                    user_pw: formData.user_pw,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('로그인 응답:', response);

            // 응답 데이터가 있는지 확인
            if (response.data) {
                const userData = {
                    user_id: response.data.user_id,
                    user_email: response.data.user_email,
                    user_role: response.data.user_role,
                    user_name: response.data.user_name || response.data.user_email.split('@')[0] || '사용자',
                };

                // 토큰을 로컬 스토리지에 저장
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(userData));

                // AuthContext에 사용자 상태 업데이트
                login(userData);

                navigate('/dashboard');
            } else {
                throw new Error('로그인 응답에 사용자 데이터가 없습니다.');
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            if (error.response && error.response.status === 401) {
                setErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다.');
            } else {
                setErrorMessage(error.response?.data?.message || '로그인 중 오류가 발생했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const checkEmailDuplicate = async () => {
        if (!formData.user_email) {
            setErrorMessage('이메일을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setEmailChecked(true); // 중복 확인 버튼을 클릭했음을 표시

        try {
            // 중복 확인 요청
            const response = await axios.post(
                'http://localhost:3000/users/check-email',
                {
                    user_email: formData.user_email,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('이메일 중복 확인 응답:', response);

            // 200 응답은 이메일이 사용 가능하다는 의미
            setEmailAvailable(true);
            setErrorMessage('사용 가능한 이메일입니다.');
        } catch (error) {
            console.error('이메일 중복 확인 오류:', error);

            if (error.response?.status === 400 && error.response?.data?.message === '이미 존재하는 이메일입니다.') {
                setEmailAvailable(false);
                setErrorMessage('이미 존재하는 이메일입니다.');
            } else {
                // 기타 오류
                setEmailAvailable(false);
                setErrorMessage('이메일 확인 중 오류가 발생했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();

        // 중복 확인 여부 검사
        if (!emailChecked) {
            setErrorMessage('이메일 중복 확인을 해주세요.');
            return;
        }

        // 이메일 사용 가능 여부 검사
        if (!emailAvailable) {
            setErrorMessage('사용할 수 없는 이메일입니다. 다른 이메일을 입력해주세요.');
            return;
        }

        // 비밀번호 일치 여부 검사
        if (formData.user_pw !== formData.confirmPassword) {
            setErrorMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            // 회원가입 요청
            const response = await axios.post(
                'http://localhost:3000/users/signup',
                {
                    user_email: formData.user_email,
                    user_pw: formData.user_pw,
                    user_name: formData.user_name,
                    user_role: 'user',
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('회원가입 응답:', response);

            // 회원가입 성공 시 로그인 화면으로 전환
            setFormData({
                user_email: '',
                user_pw: '',
                user_name: '',
                confirmPassword: '',
            });
            setIsLogin(true);
            setErrorMessage('회원가입이 완료되었습니다. 로그인해주세요.');
        } catch (error) {
            console.error('회원가입 오류:', error);
            setErrorMessage(error.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-left">
                {/* <button type="button" className="home-button" onClick={() => navigate('/')}>
                    홈으로 이동
                </button> */}
                <h1>병원 안전 관리 시스템</h1>
                <p>로그인 또는 계정을 생성하세요</p>
                <div className="auth-tabs">
                    <button className={`auth-tab-button ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>
                        로그인
                    </button>
                    <button className={`auth-tab-button ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>
                        회원가입
                    </button>
                </div>

                {errorMessage && (
                    <div
                        className={`error-message ${
                            errorMessage.includes('완료') || errorMessage.includes('사용 가능') ? 'success' : ''
                        }`}
                    >
                        {errorMessage}
                    </div>
                )}

                {isLogin ? (
                    <form className="auth-form" onSubmit={handleLoginSubmit}>
                        <div className="form-group">
                            <label>이메일</label>
                            <input
                                type="email"
                                name="user_email"
                                value={formData.user_email}
                                onChange={handleChange}
                                placeholder="이메일을 입력하세요"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>비밀번호</label>
                            <input
                                type="password"
                                name="user_pw"
                                value={formData.user_pw}
                                onChange={handleChange}
                                placeholder="비밀번호를 입력하세요"
                                required
                            />
                        </div>
                        <button type="submit" className="submit-button" disabled={isLoading}>
                            {isLoading ? '처리 중...' : '로그인'}
                        </button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={handleSignUpSubmit}>
                        <div className="form-group">
                            <label>이름</label>
                            <input
                                type="text"
                                name="user_name"
                                value={formData.user_name}
                                onChange={handleChange}
                                placeholder="이름을 입력하세요"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>이메일</label>
                            <div className="input-with-button">
                                <input
                                    type="email"
                                    name="user_email"
                                    value={formData.user_email}
                                    onChange={handleChange}
                                    placeholder="이메일을 입력하세요"
                                    required
                                />
                                <button
                                    type="button"
                                    className="check-button"
                                    onClick={checkEmailDuplicate}
                                    disabled={isLoading}
                                >
                                    중복확인
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>비밀번호</label>
                            <input
                                type="password"
                                name="user_pw"
                                value={formData.user_pw}
                                onChange={handleChange}
                                placeholder="비밀번호를 입력하세요"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>비밀번호 확인</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="비밀번호를 다시 입력하세요"
                                required
                            />
                        </div>
                        <button type="submit" className="submit-button" disabled={isLoading}>
                            {isLoading ? '처리 중...' : '회원가입'}
                        </button>
                    </form>
                )}
            </div>
            <div className="auth-right">
                <h2>환자 안전을 위한 지능형 모니터링 시스템</h2>
                <p>
                    인공지능 기반 낙상 감지, 실시간 환자 모니터링, 그리고 24시간 안전 관리 시스템으로 의료진과
                    보호자에게 신속한 알림을 제공합니다.
                </p>
                <ul className="features">
                    <li>AI 기반 낙상 감지 시스템</li>
                    <li>실시간 환경 모니터링</li>
                    <li>의료진과 보호자를 위한 즉각적인 알림</li>
                </ul>
                <div className="image-container">
                    <img src="/images/Doctors-rafiki.png" alt="의사 이미지" />
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
