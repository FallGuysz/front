import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from './ui/card';
import StatsOverview from './dashboard/StatsOverview';
import ActiveAlerts from './dashboard/ActiveAlerts';
import FallsChart from './dashboard/FallsChart';
import RecentActivity from './dashboard/RecentActivity';
import RoomGrid from './dashboard/RoomGrid';
import '../styles/components/DashboardPage.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // API 경로 수정 (/api 프리픽스 제거)

export default function Dashboard() {
    const navigate = useNavigate();
    const [fallStats, setFallStats] = useState({
        weeklyFalls: 0,
        weeklyChange: 0,
        riskPatients: 0,
        riskPercentage: 0,
        preventionRate: 0,
        preventionChange: 0,
        fallsThisMonth: 0, // 추가
        monthlyChange: 0, // 추가
    });

    useEffect(() => {
        fetchFallStats();
    }, []);

    const fetchFallStats = async () => {
        try {
            // 1. 낙상사고 통계 (통계 API가 제대로 동작하지 않을 경우 대비)
            // const fallRes = await axios.get(`${API_BASE_URL}/fall-incidents/stats`);
            // const fallData = fallRes.data.data;

            // 2. 전체 환자 목록
            const patientRes = await axios.get(`${API_BASE_URL}/patients`);
            const patients = patientRes.data.data || [];
            const totalPatients = patients.length;
            const riskPatients = patients.filter((p) => p.patient_status === '고위험군').length;
            const riskPercentage = totalPatients > 0 ? ((riskPatients / totalPatients) * 100).toFixed(1) : 0;

            // 3. 낙상사고 전체/예방조치 이행 건수 및 주간 카운트
            const accidentRes = await axios.get(`${API_BASE_URL}/fall-incidents`);
            console.log('Dashboard: fall-incidents API 응답 데이터', accidentRes.data);
            const accidents = accidentRes.data.data || [];

            // accident_YN이 'Y'인 것만 전체 사고로 카운트
            const yAccidents = accidents.filter((a) => a.accident_YN === 'Y');
            console.log('Dashboard: 사고 처리된 사건 (accident_YN===Y):', yAccidents.length);

            const totalAccidents = yAccidents.length;
            // accident_YN이 'Y'이고 ACCIDENT_CHYN이 'Y'인 건수만 카운트
            const checkedAccidents = yAccidents.filter((a) => a.accident_chYN === 'Y').length;
            const preventionRate = totalAccidents > 0 ? ((checkedAccidents / totalAccidents) * 100).toFixed(1) : 0;

            // === 오늘자 낙상사고 카운트 ===
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const todayFalls = yAccidents.filter((a) => {
                const accidentDate = new Date(a.accident_dt || a.created_at);
                return accidentDate >= today && accidentDate < tomorrow;
            }).length;

            // === 이번 달 낙상사고 카운트 ===
            const now = new Date();
            const curMonth = now.getMonth();
            const curYear = now.getFullYear();

            console.log(`Dashboard: 현재 날짜 - ${now.toISOString()}, 현재 연월 - ${curYear}년 ${curMonth + 1}월`);

            // API 응답에서 사용하는 날짜 필드 확인
            if (yAccidents.length > 0) {
                console.log('Dashboard: 첫 번째 레코드 데이터 구조', {
                    accident_YN: yAccidents[0].accident_YN,
                    accident_dt: yAccidents[0].accident_dt,
                    accident_date: yAccidents[0].accident_date,
                    created_at: yAccidents[0].created_at,
                });
            }

            // 수정된 코드: 다양한 날짜 필드 이름 고려 (accident_dt, accident_date, created_at)
            const fallsThisMonth = yAccidents.filter((a) => {
                // 다양한 날짜 필드를 시도
                const dateStr = a.accident_date || a.accident_dt || a.created_at;
                if (!dateStr) {
                    console.warn('Dashboard: 날짜 필드가 없는 레코드:', a);
                    return false;
                }

                const d = new Date(dateStr);
                if (isNaN(d.getTime())) {
                    console.warn('Dashboard: 유효하지 않은 날짜:', dateStr);
                    return false;
                }

                const isThisMonth = d.getMonth() === curMonth && d.getFullYear() === curYear;
                if (isThisMonth) {
                    console.log(`Dashboard: 이번 달 사고 발견 - ${d.toISOString()}`);
                }
                return isThisMonth;
            }).length;

            console.log(`Dashboard: 이번 달 낙상 사고 - ${fallsThisMonth}건`);

            // === 전월 낙상사고 카운트 ===
            const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
            const prevMonthYear = curMonth === 0 ? curYear - 1 : curYear;

            // 수정된 코드: 다양한 날짜 필드 이름 고려
            const fallsLastMonth = yAccidents.filter((a) => {
                const dateStr = a.accident_date || a.accident_dt || a.created_at;
                if (!dateStr) return false;

                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return false;

                return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
            }).length;

            console.log(`Dashboard: 전월 낙상 사고 - ${fallsLastMonth}건`);

            const monthlyChange = fallsThisMonth - fallsLastMonth;
            console.log(`Dashboard: 월간 변화량(monthlyChange) - ${monthlyChange}건`);

            // === 이번주/전주 낙상사고 카운트 ===
            const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 일요일=7
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - dayOfWeek + 1);
            weekStart.setHours(0, 0, 0, 0);

            const lastWeekStart = new Date(weekStart);
            lastWeekStart.setDate(weekStart.getDate() - 7);

            const lastWeekEnd = new Date(weekStart);
            lastWeekEnd.setMilliseconds(-1);

            const weeklyFalls = yAccidents.filter((a) => {
                const accidentDate = new Date(a.accident_dt || a.created_at);
                return accidentDate >= weekStart && accidentDate <= now;
            }).length;

            const lastWeeklyFalls = yAccidents.filter((a) => {
                const accidentDate = new Date(a.accident_dt || a.created_at);
                return accidentDate >= lastWeekStart && accidentDate <= lastWeekEnd;
            }).length;

            setFallStats({
                weeklyFalls,
                weeklyChange: weeklyFalls - lastWeeklyFalls,
                riskPatients,
                riskPercentage,
                preventionRate,
                preventionChange: 0, // 필요시 계산
                fallsThisMonth, // 추가
                monthlyChange, // 추가
            });
        } catch (error) {
            console.error('낙상 통계 데이터 조회 실패:', error);
        }
    };

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1 className="dashboard-title">사랑하는 가족의 하루를 한눈에</h1>
                <p className="dashboard-subtitle">당신의 소중한 가족, 저희가 실시간으로 함께 지킵니다.</p>
            </header>

            {/* 응급 알림 + 개요 통계 + 모니터링 + 사이드바 */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* 좌측 3컬럼: 알림, 통계 개요, 모니터링 */}
                <div className="lg:col-span-3 space-y-6">
                    <ActiveAlerts />
                    <StatsOverview />
                    <Card>
                        <CardHeader>실시간 병실 모니터링</CardHeader>
                        <CardContent>
                            <RoomGrid />
                        </CardContent>
                    </Card>
                </div>

                {/* 우측 1컬럼: 최근 이벤트 */}
                <div className="space-y-4">
                    <Card>
                        <CardContent>
                            <RecentActivity />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 하단: 낙상 통계 + 활동 및 바로가기 */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* 좌측 3컬럼: 낙상 감지 통계 + 요약 카드 */}
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>낙상 감지 통계</CardHeader>
                        <CardContent>
                            <FallsChart />
                            <div className="falls-summary stats-grid">
                                <div className="stat-card">
                                    <p className="stat-title">이번달 낙상 사고</p>
                                    <p className="stat-value">{fallStats.fallsThisMonth}건</p>
                                    <p
                                        className={`stat-change ${
                                            fallStats.monthlyChange >= 0 ? 'positive' : 'negative'
                                        }`}
                                    >
                                        전월 대비 {fallStats.monthlyChange > 0 ? '+' : ''}
                                        {fallStats.monthlyChange}건
                                    </p>
                                </div>
                                <div className="stat-card">
                                    <p className="stat-title">고위험군 환자</p>
                                    <p className="stat-value">{fallStats.riskPatients}명</p>
                                    <p className="stat-change">전체 환자의 {fallStats.riskPercentage}%</p>
                                </div>
                                <div className="stat-card">
                                    <p className="stat-title">낙상 사고 대응률</p>
                                    <p className="stat-value">{fallStats.preventionRate}%</p>
                                    <p
                                        className={`stat-change ${
                                            fallStats.preventionChange >= 0 ? 'positive' : 'negative'
                                        }`}
                                    >
                                        목표 대비 {fallStats.preventionChange > 0 ? '+' : ''}
                                        {fallStats.preventionChange}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* 우측 1컬럼: 오늘의 활동은 상단 RecentEvents에서만 표시됩니다 */}
            </div>
        </div>
    );
}
