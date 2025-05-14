import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, Thermometer, Monitor, UserPlus, Calendar, Map, Mail } from 'lucide-react';
import axios from 'axios';
import '../styles/components/dashboard/Home.css';

const Home = () => {
    const [weather, setWeather] = useState({
        temperature: 'N/A',
        weather: ' 로딩중...',
    });

    const [currentBanner, setCurrentBanner] = useState(0);
    const banners = [
        {
            id: 1,
            title: '경력 의사진과 산뢰파해연구를 위한 전진의 성공 전달',
            subtitle: '전문적인 의료 서비스로 환자의 건강을 책임집니다',
            description: '전문적인 의료 서비스로 환자의 건강을 책임집니다',
            bgColor: '#FEF2FF',
        },
        {
            id: 2,
            title: '환자 안전을 최우선으로 생각합니다',
            subtitle: '24시간 모니터링 시스템으로 안전한 병원 환경을 제공합니다',
            description: '최신 기술을 활용한 환자 모니터링으로 안전한 병원 환경을 조성합니다',
            bgColor: '#E0F2FE',
        },
        {
            id: 3,
            title: '어르신들과 사랑으로 함께 합니다',
            subtitle: '환자 중심의 케어로 더 나은 삶의 질을 제공합니다',
            description: '환자 한 분 한 분을 소중히 여기는 맞춤형 케어 서비스를 제공합니다',
            bgColor: '#ECFDF5',
        },
    ];

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await axios.get('http://localhost:3000/weather');
                setWeather(response.data.data);
            } catch (error) {
                console.error('날씨 정보 조회 실패:', error);
                setWeather({
                    temperature: 'N/A',
                    weather: '🌈 날씨 정보 없음',
                });
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 600000); // 10분마다 갱신

        // 배너 자동 전환
        const bannerInterval = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => {
            clearInterval(interval);
            clearInterval(bannerInterval);
        };
    }, []);

    const quickLinks = [
        {
            title: '대시보드',
            icon: LayoutDashboard,
            iconBg: '#F5F3FF',
            iconColor: '#7C3AED',
            link: '/dashboard',
            linkLabel: '대시보드 확인',
        },
        {
            title: '낙상감지',
            icon: Monitor,
            iconBg: '#E0F2FE',
            iconColor: '#0284C7',
            link: '/fall-incidents',
            linkLabel: '낙상 감지 페이지',
        },
        {
            title: '환경 모니터링',
            icon: Thermometer,
            iconBg: '#ECFDF5',
            iconColor: '#22C55E',
            link: '/environmental',
            linkLabel: '환경 모니터링',
        },
        {
            title: '병실 및 환자 관리',
            icon: Calendar,
            iconBg: '#ECFDF5',
            iconColor: '#22C55E',
            link: '/rooms',
            linkLabel: '환자 관리',
        },
        {
            title: '환자목록',
            icon: Activity,
            iconBg: '#FFF7ED',
            iconColor: '#EA580C',
            link: '/patients',
            linkLabel: '환자 목록',
        },
        {
            title: '주간식단표',
            icon: Calendar,
            iconBg: '#FEF2F2',
            iconColor: '#DC2626',
            link: '/menu',
            linkLabel: '식단표 보기',
        },
        {
            title: '찾아오시는길',
            icon: Map,
            iconBg: '#F0F9FF',
            iconColor: '#0369A1',
            link: '/location',
            linkLabel: '위치 안내',
        },
    ];

    return (
        <div className="dashboard-home-container">
            <div className="top-header">
                <div className="system-title">
                    <h1>병원 모니터링 시스템</h1>
                    {/* <p>환영합니다. 이 시스템은 환자의 낙상 사고를 감지하고 환경을 모니터링합니다.</p> */}
                </div>
                <div className="weather-widget">
                    <span className="temperature">{weather.temperature}</span>
                    <span className="weather">{weather.weather}</span>
                </div>
            </div>

            <div className="home-banner-container">
                <div className="home-banner" style={{ backgroundColor: banners[currentBanner].bgColor }}>
                    <div className="banner-content">
                        <h1 className="banner-title">{banners[currentBanner].title}</h1>
                        <p className="banner-subtitle">{banners[currentBanner].subtitle}</p>
                        <div className="banner-description">
                            <p>{banners[currentBanner].description}</p>
                        </div>
                    </div>
                    <div className="banner-image">{/* 이미지는 CSS에서 배경으로 처리 */}</div>
                </div>
                <div className="banner-indicators">
                    {banners.map((banner, index) => (
                        <button
                            key={banner.id}
                            className={`indicator ${index === currentBanner ? 'active' : ''}`}
                            onClick={() => setCurrentBanner(index)}
                        />
                    ))}
                </div>
            </div>

            <div className="quick-links-container">
                {quickLinks.map((link, index) => (
                    <NavLink to={link.link} key={index} className="quick-link">
                        <div className="quick-link-icon" style={{ backgroundColor: link.iconBg }}>
                            <link.icon size={24} color={link.iconColor} />
                        </div>
                        <span className="quick-link-title">{link.title}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default Home;
