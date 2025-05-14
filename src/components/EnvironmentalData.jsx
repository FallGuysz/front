import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Thermometer, Droplets, Clock, AlertTriangle, CheckCircle, Bed } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/components/EnvironmentalData.css';

const API_BASE_URL = 'http://localhost:3000';

const EnvironmentalData = () => {
    const [roomsData, setRoomsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [floors, setFloors] = useState([]);
    const [selectedFloor, setSelectedFloor] = useState('1');
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [metric, setMetric] = useState('temperature');
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_BASE_URL}/environmental`);
                const data = res.data.data.map((room) => ({
                    roomId: room.room_id,
                    roomName: room.room_name,
                    temperature: Number(room.room_temp).toFixed(1),
                    humidity: room.humidity,
                    totalBeds: room.total_beds,
                    occupiedBeds: room.occupied_beds,
                    status: room.status,
                }));

                setRoomsData(data);

                const floorNums = data.map((item) => {
                    const num = parseInt(item.roomName.replace(/[^0-9]/g, ''), 10);
                    return Math.floor(num / 100);
                });
                const maxFloor = Math.max(...floorNums);
                setFloors(Array.from({ length: maxFloor }, (_, i) => (i + 1).toString()));

                if (data.length > 0 && !selectedRoomId) {
                    const firstFloorRooms = data.filter((room) => {
                        const num = parseInt(room.roomName.replace(/[^0-9]/g, ''), 10);
                        return !isNaN(num) && Math.floor(num / 100).toString() === '1';
                    });
                    if (firstFloorRooms.length > 0) {
                        setSelectedRoomId(firstFloorRooms[0].roomId);
                    } else if (data.length > 0) {
                        setSelectedRoomId(data[0].roomId);
                    }
                }
                setError(null);
            } catch (err) {
                console.error(err);
                setError('환경 데이터를 불러오는 중 문제가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
        const interval = setInterval(fetchRooms, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!selectedRoomId) return;

        const fetchRoomDetail = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/environmental/${selectedRoomId}`);
                const roomDetail = res.data.data;

                setRoomsData((prev) =>
                    prev.map((room) =>
                        room.roomId === selectedRoomId
                            ? { ...room, roomCapacity: roomDetail.room_capacity, patients: roomDetail.patients }
                            : room
                    )
                );
            } catch (err) {
                console.error('Error fetching room detail:', err);
            }
        };

        fetchRoomDetail();
    }, [selectedRoomId]);

    useEffect(() => {
        if (!selectedRoomId) return;
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/environmental/${selectedRoomId}/history`);
                setHistoryData(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();
    }, [selectedRoomId]);

    const filteredRooms = useMemo(() => {
        if (!roomsData || roomsData.length === 0) return [];

        if (selectedFloor === 'all') return roomsData;
        if (selectedFloor === 'warning') return roomsData.filter((item) => item.status === '경고');

        return roomsData.filter((item) => {
            const num = parseInt(item.roomName.replace(/[^0-9]/g, ''), 10);
            if (isNaN(num)) return false;
            return Math.floor(num / 100).toString() === selectedFloor;
        });
    }, [roomsData, selectedFloor]);

    if (loading) return <div className="loading-container">로딩 중...</div>;
    if (error) return <div className="error-message">{error}</div>;

    const selectedRoom = roomsData.find((r) => r.roomId === selectedRoomId);
    if (!selectedRoom && roomsData.length > 0) {
        if (filteredRooms.length > 0 && !selectedRoomId) {
            setSelectedRoomId(filteredRooms[0].roomId);
            return <div className="loading-container">병실 정보 로딩 중...</div>;
        } else if (!selectedRoomId) {
            return (
                <div className="main-detail">
                    <div className="error-message">사이드바에서 병실을 선택하세요.</div>
                </div>
            );
        } else {
            return (
                <div className="main-detail">
                    <div className="error-message">선택된 병실 정보를 찾을 수 없습니다.</div>
                </div>
            );
        }
    } else if (!selectedRoom && roomsData.length === 0 && !loading) {
        return (
            <div className="main-detail">
                <div className="error-message">표시할 병실 데이터가 없습니다.</div>
            </div>
        );
    } else if (!selectedRoom) {
        return <div className="loading-container">병실 상세 정보 로딩 중...</div>;
    }

    const currentValue = selectedRoom[metric];
    const statusColor = selectedRoom.status === '경고' ? 'warning' : 'normal';
    const range = metric === 'temperature' ? { min: 18, max: 32 } : { min: 20, max: 80 };
    const widthPercent = ((currentValue - range.min) / (range.max - range.min)) * 100;

    return (
        <div className="environmental-data-page">
            <div className="environmental-data-container">
                <div className="sidebar">
                    <h2 className="sidebar-title">모니터링 병실</h2>
                    <div className="filter-floor">
                        <label htmlFor="floor-select">층 선택:</label>
                        <select
                            id="floor-select"
                            value={selectedFloor}
                            onChange={(e) => setSelectedFloor(e.target.value)}
                            className="floor-select"
                        >
                            <option value="all">모든 층</option>
                            <option value="warning">경고</option>
                            {floors.map((floor) => (
                                <option key={floor} value={floor}>
                                    {floor}층
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="room-list">
                        {floors.map((floor) => {
                            const floorRooms = filteredRooms.filter((room) => {
                                const roomNumber = parseInt(room.roomName.replace(/[^0-9]/g, ''), 10);
                                return Math.floor(roomNumber / 100).toString() === floor;
                            });

                            if (floorRooms.length === 0) return null;

                            return (
                                <div key={floor} className="floor-group">
                                    <div className="floor-header">{floor}층</div>
                                    {floorRooms.map((room) => (
                                        <div
                                            key={room.roomId}
                                            className={`room-item ${selectedRoomId === room.roomId ? 'selected' : ''} ${
                                                room.status === '경고' ? 'warning' : ''
                                            }`}
                                            onClick={() => setSelectedRoomId(room.roomId)}
                                        >
                                            <div className="room-header">
                                                <span className="room-name">{room.roomName}</span>
                                                <span
                                                    className={`room-status ${
                                                        room.status === '경고' ? 'warning' : 'normal'
                                                    }`}
                                                >
                                                    {room.status}
                                                </span>
                                            </div>
                                            <div className="room-metrics">
                                                <div className="metric">
                                                    <Thermometer size={16} style={{ color: 'rgb(234,179,8)' }} />
                                                    <span>{room.temperature}°C</span>
                                                </div>
                                                <div className="metric">
                                                    <Droplets size={16} style={{ color: '#3b82f6' }} />
                                                    <span>{room.humidity}%</span>
                                                </div>
                                                <div className="metric">
                                                    <Bed size={16} />
                                                    <span>
                                                        {room.occupiedBeds}/{room.totalBeds}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="main-detail">
                    <div className="detail-header">
                        <div className="detail-title">
                            <h1>{selectedRoom.roomName}호 환경 상태</h1>
                        </div>
                        <div className="toggle-input-group">
                            <div
                                className={`toggle-input ${metric === 'temperature' ? 'active' : ''}`}
                                onClick={() => setMetric('temperature')}
                            >
                                온도
                            </div>
                            <div
                                className={`toggle-input ${metric === 'humidity' ? 'active' : ''}`}
                                onClick={() => setMetric('humidity')}
                            >
                                습도
                            </div>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="current-info">
                            <h3 className="stats-label">현재 {metric === 'temperature' ? '온도' : '습도'}</h3>
                            <div className="current-display">
                                {metric === 'temperature' ? (
                                    <Thermometer
                                        size={36}
                                        color={currentValue > 26 || currentValue < 20 ? '#f44336' : '#4caf50'}
                                    />
                                ) : (
                                    <Droplets
                                        size={36}
                                        color={currentValue > 60 || currentValue < 40 ? '#f44336' : '#4caf50'}
                                    />
                                )}
                                <span className="current-text">
                                    {currentValue}
                                    {metric === 'temperature' ? '°C' : '%'}
                                </span>
                            </div>
                            <div className="stats-subdesc">
                                적정 {metric === 'temperature' ? '온도' : '습도'}:{' '}
                                {metric === 'temperature' ? '22.0°C ~ 26.0°C' : '40.0% ~ 60.0%'}
                            </div>
                        </div>
                        <div className="range-info">
                            <h3 className="stats-label">{metric === 'temperature' ? '온도 수준' : '습도 수준'}</h3>
                            <div className="progress-wrapper">
                                <div className="level-bar">
                                    <div
                                        className="level-fill"
                                        style={{ width: `${widthPercent}%`, backgroundColor: 'rgb(25,72,144)' }}
                                    />
                                </div>
                                <div className="level-labels">
                                    <span>
                                        {range.min}
                                        {metric === 'temperature' ? '°C' : '%'}
                                    </span>
                                    <span>{metric === 'temperature' ? '25°C' : '50%'}</span>
                                    <span>
                                        {range.max}
                                        {metric === 'temperature' ? '°C' : '%'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <div className={`status-box ${statusColor}`}>
                        {statusColor === 'normal' ? (
                            <CheckCircle size={16} className="status-box-icon" />
                        ) : (
                            <AlertTriangle size={16} className="status-box-icon" />
                        )}
                        <span className="status-text">
                            {statusColor === 'normal' ? '정상 상태' : '경고 상태'} –{' '}
                            {statusColor === 'normal'
                                ? '모든 환경 지표가 정상 범위 내에 있습니다.'
                                : '모든 환경 지표가 비정상 범위 내에 있습니다.'}
                        </span>
                    </div> */}

                    <div className="cctv-monitoring-section">
                        <div className="cctv-video-wrapper">
                            <img
                                src="http://192.168.1.102:5050/stream"
                                alt="실시간 CCTV 스트리밍"
                                className="cctv-stream-image"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnvironmentalData;
