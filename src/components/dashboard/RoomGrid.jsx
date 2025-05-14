import React, { useState, useEffect } from 'react';
import { Thermometer, Droplet, Users } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import '../../styles/components/DashboardPage.css';

const API_BASE_URL = 'http://localhost:3000';

export default function RoomGrid() {
    const [roomsEnv, setRoomsEnv] = useState([]);
    const [roomDetails, setRoomDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        async function loadData() {
            try {
                const [envRes, roomsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/environmental`).then((r) => r.json()),
                    fetch(`${API_BASE_URL}/rooms`).then((r) => r.json()),
                ]);
                setRoomsEnv(envRes.data || []);
                setRoomDetails(roomsRes.data || []);
                if (envRes.data && envRes.data.length) {
                    const floors = Array.from(new Set(envRes.data.map((r) => Math.floor(parseInt(r.room_name) / 100))));
                    setSelectedFloor(floors[0]);
                    setCurrentPage(0);
                }
            } catch (err) {
                console.error('RoomGrid load error:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return <p>로딩 중...</p>;
    }
    if (error) {
        return <p className="text-red-500">병실 모니터링 로드 실패</p>;
    }

    const roomCards = roomsEnv.map((r) => {
        const detail = roomDetails.find((d) => String(d.room_name) === String(r.room_name));
        const patientCount =
            detail && Array.isArray(detail.patients) ? detail.patients.length : parseInt(r.occupied_beds) || 0;

        // 온도와 습도 파싱
        const temp = Number(r.room_temp);
        const humidity = parseInt(r.humidity);

        // 새로운 기준에 따른 경고 상태 설정
        const isTemperatureWarning = temp < 26 || temp > 28;
        const isHumidityWarning = humidity < 48 || humidity > 65;
        const status = isTemperatureWarning || isHumidityWarning ? '경고' : '정상';

        return {
            roomId: r.room_id,
            roomName: r.room_name,
            status: status,
            temperature: `${temp.toFixed(1)}°C`,
            humidity: `${humidity}%`,
            tempValue: temp,
            humidityValue: humidity,
            patients: patientCount,
            floor: Math.floor(parseInt(r.room_name) / 100),
        };
    });
    const floors = Array.from(new Set(roomsEnv.map((r) => Math.floor(parseInt(r.room_name) / 100))));
    const itemsPerPage = 4; // 한 페이지당 보여줄 아이템 수를 4개로 수정 (2열 x 2행)
    const filteredCards = roomCards
        .filter((card) => selectedFloor === 'all' || card.floor === selectedFloor)
        .sort((a, b) => a.roomName.localeCompare(b.roomName));
    const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
    const paginatedCards = filteredCards.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
    const isSingle = paginatedCards.length === 1;

    return (
        <div>
            <div className="floor-tabs">
                {floors.map((floor) => (
                    <button
                        key={floor}
                        className={`floor-tab ${floor === selectedFloor ? 'active' : ''}`}
                        onClick={() => {
                            setSelectedFloor(floor);
                            setCurrentPage(0);
                        }}
                    >
                        {floor}층
                    </button>
                ))}
            </div>

            <div className="room-grid">
                {paginatedCards.map((card) => (
                    <div key={card.roomId} className={`room-card ${card.status === '경고' ? 'warning' : ''}`}>
                        <div className="room-header">
                            <h3 className="room-name">[{card.roomName}호]</h3>
                            <span className={`status-badge ${card.status}`}>{card.status}</span>
                        </div>
                        <div className="room-info-row">
                            <div className="room-info-value">
                                <Thermometer size={40} style={{ color: 'rgb(234,179,8)' }} />
                                <span>
                                    <br></br>
                                    {parseFloat(card.temperature)} °C
                                </span>
                            </div>
                            <div className="room-info-value">
                                <Droplet size={40} style={{ color: '#3b82f6' }} />
                                <span>
                                    <br></br>
                                    {parseInt(card.humidity)}%
                                </span>
                            </div>
                            <div className="room-info-value">
                                <Users size={40} />
                                <span>
                                    <br></br>
                                    {card.patients}명
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
