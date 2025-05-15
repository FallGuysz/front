import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Thermometer, Droplets, PenSquare, Users, AlertTriangle, Clock, X, User } from 'lucide-react';
import '../styles/components/RoomManagement.css';

const API_BASE_URL = 'http://localhost:3000';

const RoomManagement = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState('1');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [floorList, setFloorList] = useState([]);
    const [activeTab, setActiveTab] = useState('상세정보');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientDetailModal, setShowPatientDetailModal] = useState(false);
    const [assignModal, setAssignModal] = useState({ phase: null, patientId: null, roomName: '', freeBeds: [] });
    const [stats, setStats] = useState({
        totalBeds: {
            value: '150개',
            description: '전체 병상',
        },
        occupiedBeds: {
            value: '127개',
            description: '사용 중인 병상',
            change: '85%',
        },
        alerts: {
            value: '3건',
            description: '현재 경고',
            change: '+1건',
        },
        temperature: {
            value: '2실',
            description: '온도 주의',
        },
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/rooms`);
            if (response.data.code === 0) {
                const roomsData = response.data.data.map((room) => ({
                    ...room,
                    room_humidity: room.room_humi,
                    current_patients: parseInt(room.occupied_beds) || 0,
                    total_beds: parseInt(room.total_beds) || 0,
                    occupied_beds: parseInt(room.occupied_beds) || 0,
                }));
                setRooms(roomsData);

                const totalBeds = roomsData.reduce((sum, room) => sum + (Number(room.total_beds) || 0), 0);
                const occupiedBeds = roomsData.reduce((sum, room) => sum + (Number(room.occupied_beds) || 0), 0);
                const warningRooms = roomsData.filter(
                    (room) =>
                        room.room_temp > 28 || room.room_temp < 26 || room.room_humidity > 65 || room.room_humidity < 48
                ).length;

                const percentage = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0.0';

                setStats((prevStats) => ({
                    ...prevStats,
                    totalBeds: {
                        ...prevStats.totalBeds,
                        value: `${totalBeds}개`,
                    },
                    occupiedBeds: {
                        ...prevStats.occupiedBeds,
                        value: `${occupiedBeds}개`,
                        change: `${percentage}%`,
                    },
                    alerts: {
                        ...prevStats.alerts,
                        value: `${warningRooms}실`,
                        change: warningRooms > 0 ? `+${warningRooms}건` : '0건',
                    },
                    temperature: {
                        ...prevStats.temperature,
                        value: `${warningRooms}실`,
                    },
                }));
            } else {
                setError(response.data.message || '병실 정보를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('Error fetching rooms:', err);
            setError('병실 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoomDetail = async (roomName) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/rooms/${roomName}`);
            if (response.data.code === 0) {
                const roomData = response.data.data;
                setSelectedRoom({
                    ...roomData,
                    patients: roomData.patients || [],
                });
            }
        } catch (err) {
            console.error('Error fetching room details:', err);
            setError('병실 정보를 불러오는데 실패했습니다.');
        }
    };

    const fetchPatientDetail = (patientId) => {
        navigate(`/patients/${patientId}`); // 팝업 대신 페이지 이동
    };

    const groupRoomsByFloor = () => {
        const grouped = {};
        rooms.forEach((room) => {
            const floorMatch = room.room_name.match(/^(\d+)/);
            const floor = floorMatch ? floorMatch[1][0] : '1';
            if (!grouped[floor]) {
                grouped[floor] = [];
            }
            grouped[floor].push(room);
        });
        return grouped;
    };

    // 온도 상태 체크 함수 수정
    const getRoomStatus = (room_temp) => {
        if (room_temp > 28 || room_temp < 26) return '경고';
        return '정상';
    };

    // 습도 상태 체크 함수 수정
    const getHumidityStatus = (humidity) => {
        if (humidity > 65 || humidity < 48) return '경고';
        return '정상';
    };

    const floorRooms = groupRoomsByFloor();
    const floors = Object.keys(floorRooms).sort();

    // 병실 클릭 핸들러 수정
    const handleRoomClick = (room) => {
        setSelectedRoom(room);
        fetchRoomDetail(room.room_name);
    };

    const handleDetailClick = (roomName) => {
        navigate(`/rooms/${roomName}`);
    };

    // 핸들러 함수 추가
    const handlePatientAssignment = (patientId, originalBed) => {
        // 1단계: 병실 선택 모달 오픈, originalBed 저장
        setAssignModal({ phase: 'selectRoom', patientId, originalBed, roomName: '', allBeds: [], occupiedMap: {} });
    };

    if (loading) {
        return <div className="loading-text">병실 정보를 불러오는 중...</div>;
    }

    if (error) {
        return <div className="error-text">{error}</div>;
    }

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">병실 상태 모니터링</h1>
            <p className="dashboard-subtitle">입원 중인 가족의 병실 정보를 실시간으로 제공합니다</p>

            {/* 주요 통계 */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>전체 병상</h3>
                        <p className="stat-value">{stats.totalBeds.value}</p>
                        <p className="stat-description">{stats.totalBeds.description}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>사용 중인 병상</h3>
                        <p className="stat-value">{stats.occupiedBeds.value}</p>
                        <p className="stat-change positive">{stats.occupiedBeds.change}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>현재 경고</h3>
                        <p className="stat-value">{stats.alerts.value}</p>
                        <p className="stat-change">{stats.alerts.change}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Thermometer size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>온도 주의</h3>
                        <p className="stat-value">{stats.temperature.value}</p>
                        <p className="stat-description">{stats.temperature.description}</p>
                    </div>
                </div>
            </div>

            <div className="room-management-content">
                <div className="room-list-section">
                    <div className="section-header">
                        <h2>병실 관리</h2>
                        <p className="dashboard-subtitle">병실 정보 및 배치</p>
                    </div>

                    <div className="floor-tabs">
                        {floors.map((floor) => (
                            <button
                                key={floor}
                                className={`floor-button ${selectedFloor === floor ? 'active' : ''}`}
                                onClick={() => setSelectedFloor(floor)}
                            >
                                {floor}층
                            </button>
                        ))}
                    </div>

                    <ul className="room-list">
                        {floorRooms[selectedFloor]?.map((room) => {
                            const status = getRoomStatus(room.room_temp);
                            return (
                                <li
                                    key={room.room_name}
                                    className={`room-list-item ${status.toLowerCase()} ${
                                        selectedRoom?.room_name === room.room_name ? 'selected' : ''
                                    }`}
                                    onClick={() => handleRoomClick(room)}
                                >
                                    <div className="info-left">
                                        <span className="room-name">{room.room_name}호</span>
                                        <span className="info-item">
                                            <Thermometer size={14} className="temp-icon" />
                                            {Number(room.room_temp).toFixed(1)}°C
                                        </span>
                                        <span className="info-item">
                                            <Droplets size={14} className="humi-icon" />
                                            {room.room_humi}%
                                        </span>
                                    </div>
                                    <div className="info-right">
                                        <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
                                        <span className="patient-count">{room.current_patients} 환자</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {selectedRoom && (
                    <div className="room-detail-section">
                        <div className="section-header">
                            <h2>{selectedRoom.room_name}호 상세정보</h2>
                            <button className="action-button" onClick={() => handleDetailClick(selectedRoom.room_name)}>
                                <PenSquare size={16} />
                                <span>상세정보</span>
                            </button>
                        </div>

                        <div className="detail-content">
                            <div className="detail-tabs">
                                <button
                                    className={`tab-button ${activeTab === '상세정보' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('상세정보')}
                                >
                                    상세정보
                                </button>
                                <button
                                    className={`tab-button ${activeTab === '환자' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('환자')}
                                >
                                    환자
                                </button>
                            </div>

                            {activeTab === '상세정보' && (
                                <div className="status-cards">
                                    <div className="detail-card">
                                        <h3>온도</h3>
                                        <div className="detail-value">
                                            <Thermometer size={20} className="temp-icon" />
                                            <span>{Number(selectedRoom.room_temp).toFixed(1)}°C</span>
                                        </div>
                                        <p className="detail-reference">기준: 26°C ~ 28°C</p>
                                    </div>
                                    <div className="detail-card">
                                        <h3>습도</h3>
                                        <div className="detail-value">
                                            <Droplets size={20} className="humi-icon" />
                                            <span>{selectedRoom.room_humi}%</span>
                                        </div>
                                        <p className="detail-reference">기준: 48% ~ 65%</p>
                                    </div>
                                    <div className="detail-card">
                                        <h3>상태</h3>
                                        <div
                                            className={`status-indicator ${getRoomStatus(
                                                selectedRoom.room_temp
                                            ).toLowerCase()}`}
                                        >
                                            {getRoomStatus(selectedRoom.room_temp)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === '환자' && (
                                <div className="patient-list">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>이름</th>
                                                <th>병상</th>
                                                <th>생년월일</th>
                                                <th>혈액형</th>
                                                <th>상세정보</th>
                                                <th>환자 배정</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedRoom.patients && selectedRoom.patients.length > 0 ? (
                                                selectedRoom.patients.map((patient) => (
                                                    <tr key={patient.patient_id}>
                                                        <td>{patient.patient_name}</td>
                                                        <td>{patient.bed_num}</td>
                                                        <td>
                                                            {patient.patient_birth
                                                                ? new Date(patient.patient_birth).toLocaleDateString()
                                                                : '-'}
                                                        </td>
                                                        <td>{patient.patient_blood || '-'}</td>
                                                        <td>
                                                            <button
                                                                className="link-button"
                                                                onClick={() => fetchPatientDetail(patient.patient_id)}
                                                            >
                                                                상세정보
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="action-button small"
                                                                onClick={() =>
                                                                    handlePatientAssignment(
                                                                        patient.patient_id,
                                                                        parseInt(patient.bed_num)
                                                                    )
                                                                }
                                                            >
                                                                재배정
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr className="empty-row">
                                                    <td colSpan="6" className="empty-message">
                                                        배정된 환자가 없습니다.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 환자 상세정보 모달 */}
            {showPatientDetailModal && selectedPatient && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>환자 상세정보</h2>
                            <button className="close-button" onClick={() => setShowPatientDetailModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="patient-detail-content">
                            <div className="profile-section">
                                <div className="profile-image-large">
                                    {selectedPatient.patient_img ? (
                                        <img
                                            src={selectedPatient.patient_img}
                                            alt={`${selectedPatient.patient_name}의 프로필`}
                                            className="profile-image"
                                        />
                                    ) : (
                                        <div className="profile-placeholder large">
                                            <User size={48} />
                                        </div>
                                    )}
                                </div>
                                <div className="profile-info">
                                    <h3>{selectedPatient.patient_name}</h3>
                                    <p>환자 ID: {selectedPatient.patient_id}</p>
                                </div>
                            </div>
                            <div className="patient-details">
                                <div className="detail-row">
                                    <span className="detail-label">이름:</span>
                                    <span className="detail-value">{selectedPatient.patient_name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">생년월일:</span>
                                    <span className="detail-value">
                                        {selectedPatient.patient_birth
                                            ? new Date(selectedPatient.patient_birth).toLocaleDateString()
                                            : '-'}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">키:</span>
                                    <span className="detail-value">
                                        {selectedPatient.patient_height ? `${selectedPatient.patient_height}cm` : '-'}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">몸무게:</span>
                                    <span className="detail-value">
                                        {selectedPatient.patient_weight ? `${selectedPatient.patient_weight}kg` : '-'}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">혈액형:</span>
                                    <span className="detail-value">
                                        {selectedPatient.patient_blood ? `${selectedPatient.patient_blood}형` : '-'}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">침대 번호:</span>
                                    <span className="detail-value">{selectedPatient.bed_id || '-'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">상태:</span>
                                    <span className="detail-value">
                                        {selectedPatient.patient_status === 'active'
                                            ? '입원중'
                                            : selectedPatient.patient_status === 'discharged'
                                              ? '퇴원'
                                              : selectedPatient.patient_status === 'deceased'
                                                ? '사망'
                                                : '-'}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">보호자 ID:</span>
                                    <span className="detail-value">{selectedPatient.guardian_id || '-'}</span>
                                </div>
                            </div>
                            {selectedPatient.patient_memo && (
                                <div className="patient-memo">
                                    <h4>메모</h4>
                                    <p>{selectedPatient.patient_memo}</p>
                                </div>
                            )}
                            {selectedPatient.patient_medic && (
                                <div className="patient-memo medication">
                                    <h4>투약 정보</h4>
                                    <p>{selectedPatient.patient_medic}</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="submit-button" onClick={() => setShowPatientDetailModal(false)}>
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 클릭식 재배정 모달 */}
            {assignModal.phase === 'selectRoom' && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>재배정할 병실 선택</h3>
                        <ul className="assign-list">
                            {rooms.map((r) => (
                                <li key={r.room_name} className="assign-list-item">
                                    <button
                                        className="assign-btn"
                                        disabled={r.total_beds === 0}
                                        onClick={async () => {
                                            // 선택한 병실 상세 조회
                                            const res = await axios.get(`${API_BASE_URL}/rooms/${r.room_name}`);
                                            const roomDetail = res.data.data;
                                            // 병실 bed 정보 맵 생성
                                            const allBeds = Array.from(
                                                { length: Number(r.total_beds) },
                                                (_, i) => i + 1
                                            );
                                            const occupiedMap = {};
                                            roomDetail.patients.forEach((p) => {
                                                occupiedMap[Number(p.bed_num)] = p.patient_id;
                                            });
                                            setAssignModal({
                                                phase: 'selectBed',
                                                patientId: assignModal.patientId,
                                                originalBed: assignModal.originalBed,
                                                roomName: r.room_name,
                                                allBeds,
                                                occupiedMap,
                                            });
                                        }}
                                    >
                                        {r.room_name}호
                                    </button>
                                </li>
                            ))}
                            <li className="assign-list-item">
                                <button
                                    className="cancel-btn"
                                    onClick={() =>
                                        setAssignModal({ phase: null, patientId: null, roomName: '', freeBeds: [] })
                                    }
                                >
                                    취소
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
            {assignModal.phase === 'selectBed' && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{assignModal.roomName}호에서 배정할 침대 선택</h3>
                        {assignModal.allBeds.length === 0 ? (
                            <div>
                                <p>배정 가능한 침대가 없습니다.</p>
                                <button
                                    className="cancel-btn"
                                    onClick={() =>
                                        setAssignModal({
                                            phase: null,
                                            patientId: null,
                                            roomName: '',
                                            allBeds: [],
                                            occupiedMap: {},
                                        })
                                    }
                                >
                                    취소
                                </button>
                            </div>
                        ) : (
                            <div className="bed-list">
                                {assignModal.allBeds.map((bedNum) => {
                                    const isOccupied = assignModal.occupiedMap[bedNum] != null;
                                    return (
                                        <button
                                            key={bedNum}
                                            className="bed-btn"
                                            disabled={false}
                                            onClick={async () => {
                                                try {
                                                    // swap 로직: 이미 점유 중인 경우 기존 환자와 교체
                                                    const targetPatient = assignModal.occupiedMap[bedNum];
                                                    if (targetPatient) {
                                                        // 기존 환자를 원래 침대로 이동
                                                        await axios.put(`${API_BASE_URL}/patients/${targetPatient}`, {
                                                            bed_id: assignModal.originalBed,
                                                        });
                                                    }
                                                    // 재배정 대상 환자를 선택 침대로 이동
                                                    await axios.put(
                                                        `${API_BASE_URL}/patients/${assignModal.patientId}`,
                                                        { bed_id: bedNum }
                                                    );
                                                    alert('환자 재배정(스왑) 완료');
                                                    fetchRooms();
                                                    if (selectedRoom) fetchRoomDetail(selectedRoom.room_name);
                                                } catch (e) {
                                                    console.error('Swap error', e);
                                                    alert('재배정 중 오류가 발생했습니다.');
                                                } finally {
                                                    setAssignModal({
                                                        phase: null,
                                                        patientId: null,
                                                        roomName: '',
                                                        allBeds: [],
                                                        occupiedMap: {},
                                                    });
                                                }
                                            }}
                                        >
                                            {bedNum}
                                            {isOccupied && ' (교체)'}
                                        </button>
                                    );
                                })}
                                <button
                                    className="cancel-btn"
                                    onClick={() =>
                                        setAssignModal({
                                            phase: null,
                                            patientId: null,
                                            roomName: '',
                                            allBeds: [],
                                            occupiedMap: {},
                                        })
                                    }
                                >
                                    취소
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;
