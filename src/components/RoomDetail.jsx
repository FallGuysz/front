import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Thermometer, Droplets, Users, ArrowLeft, Activity, AlertTriangle, BedDouble, Clock } from 'lucide-react';
import '../styles/components/RoomDetail.css';

const API_BASE_URL = 'http://localhost:3000';

const RoomDetail = () => {
    const { roomName } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('환경');

    useEffect(() => {
        fetchRoomDetail();
    }, [roomName]);

    const fetchRoomDetail = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/rooms/${roomName}`);
            if (response.data.code === 0) {
                setRoom(response.data.data);
            } else {
                setError('병실 정보를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            setError('병실 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const getRoomStatus = (temp) => {
        if (temp >= 28) return '높음';
        if (temp >= 26) return '중간';
        return '정상';
    };

    const getBedLabel = (bedNum) => {
        const labels = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' };
        return labels[bedNum] || bedNum;
    };

    const handlePatientDetail = (patientId) => {
        navigate(`/patients/${patientId}`);
    };

    if (loading) return <div className="loading-text">병실 정보를 불러오는 중...</div>;
    if (error) return <div className="error-text">{error}</div>;
    if (!room) return <div className="error-text">병실을 찾을 수 없습니다.</div>;

    return (
        <div className="room-detail-page">
            <div className="page-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    돌아가기
                </button>
                <h1>{room.room_name}호 상세정보</h1>
            </div>

            {/* 주요 통계 */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-icon">
                        <Thermometer size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>현재 온도</h3>
                        <p className="stat-value">{room.room_temp}°C</p>
                        <p className="stat-description">기준: 26°C</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Droplets size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>현재 습도</h3>
                        <p className="stat-value">{room.room_humi}%</p>
                        <p className="stat-description">기준: 60%</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>입원 환자</h3>
                        <p className="stat-value">{room.patient_count}명</p>
                        <p className="stat-description">총 {room.bed_count || 4}개 병상</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>병실 상태</h3>
                        <p className={`stat-value status-${getRoomStatus(room.room_temp).toLowerCase()}`}>
                            {getRoomStatus(room.room_temp)}
                        </p>
                    </div>
                </div>
            </div>

            {/* 상세 정보 탭 */}
            <div className="detail-section">
                <div className="tab-buttons">
                    <button
                        className={`tab-button ${activeTab === '환경' ? 'active' : ''}`}
                        onClick={() => setActiveTab('환경')}
                    >
                        환경 정보
                    </button>
                    <button
                        className={`tab-button ${activeTab === '환자' ? 'active' : ''}`}
                        onClick={() => setActiveTab('환자')}
                    >
                        입원 환자
                    </button>
                    <button
                        className={`tab-button ${activeTab === '이력' ? 'active' : ''}`}
                        onClick={() => setActiveTab('이력')}
                    >
                        관리 이력
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === '환경' && (
                        <div className="environment-info">
                            <div className="info-grid">
                                <div className="info-card">
                                    <h3>온도 변화</h3>
                                    {/* 여기에 온도 그래프나 차트를 추가할 수 있습니다 */}
                                    <div className="temp-history">
                                        <div className="current-value">
                                            <Thermometer size={24} />
                                            <span>{room.room_temp}°C</span>
                                        </div>
                                        <p className="description">지난 24시간 평균: 24.5°C</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <h3>습도 변화</h3>
                                    <div className="humidity-history">
                                        <div className="current-value">
                                            <Droplets size={24} />
                                            <span>{room.room_humi}%</span>
                                        </div>
                                        <p className="description">지난 24시간 평균: 55%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === '환자' && (
                        <div className="patient-info">
                            {/* 병실 구조도 추가 - 테이블 위에 배치 */}
                            <div className="room-container">
                                <div className="room-image">
                                    <img src="/images/room.png" alt="병실 구조도" className="room-layout-image" />
                                </div>
                            </div>

                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>이름</th>
                                        <th>생년월일</th>
                                        <th>혈액형</th>
                                        <th>침상 번호</th>
                                        <th>상태</th>
                                        <th>작업</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {room.patients.map((patient) => (
                                        <tr key={patient.patient_id}>
                                            <td>{patient.patient_name}</td>
                                            <td>{patient.patient_birth}</td>
                                            <td>{patient.patient_blood}형</td>
                                            <td>{getBedLabel(patient.bed_num)}</td>
                                            <td>
                                                <span className="status-badge 정상">안정</span>
                                            </td>
                                            <td>
                                                <button
                                                    className="detail-button"
                                                    onClick={() => handlePatientDetail(patient.patient_id)}
                                                >
                                                    상세보기
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === '이력' && (
                        <div className="history-info">
                            <div className="history-list">
                                <div className="history-item">
                                    <div className="history-icon">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div className="history-content">
                                        <h4>온도 경고 발생</h4>
                                        <p>실내 온도 28°C 초과</p>
                                        <span className="history-time">2024-04-18 14:30</span>
                                    </div>
                                </div>
                                <div className="history-item">
                                    <div className="history-icon">
                                        <BedDouble size={20} />
                                    </div>
                                    <div className="history-content">
                                        <h4>환자 입원</h4>
                                        <p>김환자 님 입원</p>
                                        <span className="history-time">2024-04-18 10:15</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomDetail;
