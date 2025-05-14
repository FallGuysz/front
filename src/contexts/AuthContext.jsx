import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 초기화 시 로컬 스토리지에서 사용자 정보 확인 및 API에서 최신 정보 가져오기
    useEffect(() => {
        const loadUserData = async () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (storedUser && token) {
                try {
                    const parsedUser = JSON.parse(storedUser);

                    // 먼저 로컬 스토리지의 데이터로 상태 업데이트
                    setUser(parsedUser);

                    // API에서 최신 사용자 정보 가져오기 시도
                    try {
                        // 백엔드 API 엔드포인트가 없으므로 로그인 시점에 user_name이 저장되도록 수정
                        console.log('API 호출 대신 로컬 저장소의 사용자 정보 확장');

                        // user_name이 없는 경우 기본값 추가 (이메일에서 추출하지 않음)
                        if (!parsedUser.user_name) {
                            parsedUser.user_name = '사용자';
                            // 로컬 스토리지 업데이트
                            localStorage.setItem('user', JSON.stringify(parsedUser));
                            console.log('사용자 정보에 기본 user_name 추가:', parsedUser);
                        }
                    } catch (apiError) {
                        console.error('사용자 정보 처리 실패:', apiError);
                    }
                } catch (error) {
                    console.error('로컬 스토리지 사용자 정보 파싱 오류:', error);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            }

            setLoading(false);
        };

        loadUserData();
    }, []);

    const login = (userData) => {
        setUser(userData);
        console.log('사용자 로그인:', userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        console.log('사용자 로그아웃');
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: !!user,
                user,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
