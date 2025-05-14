import React, { useState, useEffect, useContext } from 'react';
import { messaging, getToken, onMessage, saveTokenToServer } from './firebase';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import PatientManagement from './components/PatientManagement';
import PatientAdd from './components/PatientAdd';
import RoomManagement from './components/RoomManagement';
import BedManagement from './components/BedManagement';
import FallIncidents from './components/FallIncidents';
import EnvironmentalData from './components/EnvironmentalData';
import Notifications from './components/Notifications';
import RoomDetail from './components/RoomDetail';
import Schedule from './components/Schedule';
import Home from './components/Home';
import PatientDetail from './components/PatientDetail';
import Menu from './components/Menu';
import Location from './components/Location';
import './App.css';

// 알림 컴포넌트
const AlertNotification = ({ notification, onClose }) => {
    if (!notification) return null;

    return (
        <div className="custom-alert-overlay">
            <div className="custom-alert">
                <div className="custom-alert-header">
                    <span>⚠️ {notification.title}</span>
                    <button onClick={onClose}>×</button>
                </div>
                <div className="custom-alert-body">{notification.body}</div>
                <div className="custom-alert-footer">
                    <button onClick={onClose}>확인</button>
                </div>
            </div>
        </div>
    );
};

// 인증이 필요한 라우트를 위한 컴포넌트
const PrivateRoute = ({ element }) => {
    const { isLoggedIn, loading } = useContext(AuthContext);

    // 로딩 중일 때는 아직 리다이렉트하지 않음
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">사용자 인증 확인 중...</p>
            </div>
        );
    }

    // 로그인 상태가 아니면 로그인 페이지로 리다이렉트
    return isLoggedIn ? element : <Navigate to="/login" replace />;
};

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    const handleCloseNotification = () => {
        setNotification(null);
    };

    const showCustomAlert = (title, body) => {
        setNotification({ title, body });

        try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch((err) => console.log('알림 소리 재생 실패:', err));
        } catch (error) {
            console.log('오디오 객체 생성 실패:', error);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    }, []);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/firebase-messaging-sw.js')
                .then((registration) => {
                    console.log('🛡️ Service Worker 등록 성공');

                    navigator.serviceWorker.addEventListener('message', (event) => {
                        console.log('Service Worker로부터 메시지 수신:', event.data);

                        if (event.data && event.data.type === 'FIREBASE_ALERT') {
                            const payload = event.data.payload;
                            let title, body;

                            if (payload.notification) {
                                title = payload.notification.title;
                                body = payload.notification.body;
                            } else if (payload.data) {
                                title = payload.data.title || '낙상 사고 발생';
                                body =
                                    payload.data.body || payload.data.message || `병실에서 낙상 사고가 감지되었습니다.`;
                            } else {
                                title = '알림';
                                body = '새로운 알림이 도착했습니다.';
                            }

                            showCustomAlert(title, body);
                        }
                    });

                    getToken(messaging, {
                        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                        serviceWorkerRegistration: registration,
                    })
                        .then((currentToken) => {
                            if (currentToken) {
                                console.log('📬 FCM Token:', currentToken);
                                saveTokenToServer(currentToken);
                            } else {
                                console.log('알림 권한이 없음');
                            }
                        })
                        .catch((err) => {
                            console.error('토큰 가져오기 실패:', err);
                        });

                    onMessage(messaging, (payload) => {
                        console.log('포그라운드 메시지 수신:', payload);

                        let title, body;

                        if (payload.notification) {
                            title = payload.notification.title;
                            body = payload.notification.body;
                        } else if (payload.data) {
                            title = payload.data.title || '낙상 사고 발생';
                            body = payload.data.body || payload.data.message || `병실에서 낙상 사고가 감지되었습니다.`;
                        } else {
                            title = '알림';
                            body = '새로운 알림이 도착했습니다.';
                        }

                        showCustomAlert(title, body);
                        return false;
                    });
                })
                .catch((err) => {
                    console.error('Service Worker 등록 실패:', err);
                });
        }
    }, []);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">병원 모니터링 시스템 로딩 중...</p>
            </div>
        );
    }

    return (
        <Router>
            <AppContent
                notification={notification}
                onCloseNotification={handleCloseNotification}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
            />
        </Router>
    );
}

export default App;

// AppContent 컴포넌트: 라우트별 레이아웃 제어
function AppContent({ notification, onCloseNotification, isLoading, setIsLoading }) {
    const location = useLocation();
    const hideNavbar = ['/login', '/signup', '/register'].includes(location.pathname);
    return (
        <div className="app">
            {!hideNavbar && <Navbar />}
            <main className={hideNavbar ? '' : 'main-content'}>
                <Routes>
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/signup" element={<AuthPage />} />
                    <Route path="/register" element={<AuthPage />} />

                    {/* 인증이 필요한 라우트 */}
                    <Route path="/" element={<PrivateRoute element={<Home />} />} />
                    <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
                    <Route path="/rooms" element={<PrivateRoute element={<RoomManagement />} />} />
                    <Route path="/rooms/:roomName" element={<PrivateRoute element={<RoomDetail />} />} />
                    <Route path="/patients" element={<PrivateRoute element={<PatientManagement />} />} />
                    <Route path="/patients/add" element={<PrivateRoute element={<PatientAdd />} />} />
                    <Route path="/patients/:id" element={<PrivateRoute element={<PatientDetail />} />} />
                    <Route path="/beds" element={<PrivateRoute element={<BedManagement />} />} />
                    <Route path="/fall-incidents" element={<PrivateRoute element={<FallIncidents />} />} />
                    <Route path="/environmental" element={<PrivateRoute element={<EnvironmentalData />} />} />
                    <Route path="/notifications" element={<PrivateRoute element={<Notifications />} />} />
                    <Route path="/schedule" element={<PrivateRoute element={<Schedule />} />} />
                    <Route path="/menu" element={<PrivateRoute element={<Menu />} />} />
                    <Route path="/location" element={<PrivateRoute element={<Location />} />} />
                </Routes>
            </main>
            <AlertNotification notification={notification} onClose={onCloseNotification} />
        </div>
    );
}
