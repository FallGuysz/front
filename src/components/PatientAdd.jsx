import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/components/PatientAdd.css';
import { X, User, ArrowLeft } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000';

const initialFormState = {
    patient_name: '',
    patient_birth: '',
    patient_height: '',
    patient_weight: '',
    patient_blood: '',
    patient_img: null,
    patient_memo: '',
    patient_status: '무위험군',
    guardian_tel: '',
    bed_id: '',
    patient_sex: '',
    patient_in: '',
    patient_out: '',
};

const PatientAdd = () => {
    const navigate = useNavigate();
    const [newPatient, setNewPatient] = useState(initialFormState);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [availableBeds, setAvailableBeds] = useState([]);
    const [selectedFloor, setSelectedFloor] = useState('');
    const leftPanelRef = useRef(null);
    const hospitalInfoRef = useRef(null);
    const [memoHeight, setMemoHeight] = useState(300);
    const [step, setStep] = useState(1);

    // 기존 useEffect 유지
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/rooms`);
                if (response.data.code === 0) {
                    setRooms(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };
        fetchRooms();
    }, []);

    // 메모 높이 조절을 위한 useEffect 추가
    useEffect(() => {
        if (leftPanelRef.current && hospitalInfoRef.current) {
            const leftHeight = leftPanelRef.current.offsetHeight;
            const hospitalHeight = hospitalInfoRef.current.offsetHeight;
            setMemoHeight(Math.max(220, leftHeight - hospitalHeight - 32));
        }
    }, [newPatient, imagePreview]);

    // 병실 선택 시 빈 침대 정보 가져오기
    const handleRoomChange = async (roomName) => {
        setSelectedRoom(roomName);
        if (!roomName) {
            setAvailableBeds([]);
            return;
        }

        try {
            const roomNum = parseInt(roomName.replace(/\D/g, '')); // "201호" → 201
            const baseId = (Math.floor(roomNum / 100) - 1) * 16 + ((roomNum % 100) - 1) * 4 + 1;

            console.log('roomNum:', roomNum); // ← 201 확인
            console.log('baseId:', baseId); // ← 17 확인

            const response = await axios.get(`${API_BASE_URL}/rooms/${roomNum}`);

            if (response.data.code === 0) {
                const roomData = response.data.data;

                if (roomData.patient_count >= roomData.room_capacity) {
                    alert('이 병실은 현재 만실입니다.');
                    setSelectedRoom('');
                    setAvailableBeds([]);
                    return;
                }

                const occupiedBedIds = new Set(roomData.patients.map((p) => p.bed_id));

                const emptyBeds = [];
                for (let i = 0; i < roomData.room_capacity; i++) {
                    const currentBedId = baseId + i;
                    if (!occupiedBedIds.has(currentBedId)) {
                        emptyBeds.push({
                            bed_id: currentBedId,
                            bed_num: String.fromCharCode(65 + i),
                        });
                    }
                }

                console.log('emptyBeds:', emptyBeds); // ✅ bed_id가 17~20인지 확인
                setAvailableBeds(emptyBeds);
            }
        } catch (error) {
            console.error('Error fetching beds:', error);
            setAvailableBeds([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPatient((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setNewPatient((prev) => ({
                    ...prev,
                    patient_img: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // handleSubmit 함수의 FormData 생성 부분 수정
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();

            // bed_id가 유효한 숫자인지 확인
            if (!newPatient.bed_id || isNaN(newPatient.bed_id)) {
                alert('올바른 침대를 선택해주세요.');
                return;
            }

            Object.keys(newPatient).forEach((key) => {
                if (key === 'bed_id') {
                    formData.append(key, parseInt(newPatient.bed_id));
                } else if (key === 'guardian_id') {
                    formData.append(key, parseInt(newPatient.guardian_id));
                } else if (key !== 'patient_img' || !newPatient[key]) {
                    formData.append(key, newPatient[key]);
                }
            });

            if (imageFile) {
                formData.append('patient_img', imageFile);
            }

            const response = await axios.post(`${API_BASE_URL}/patients`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.code === 0) {
                alert('환자가 성공적으로 등록되었습니다.');
                navigate('/patients');
            }
        } catch (error) {
            console.error('Error adding patient:', error);
            alert('환자 등록에 실패했습니다.');
        }
    };

    return (
        <div className="patient-detail-container">
            <div className="detail-header">
                <button className="back-button" onClick={() => navigate('/patients')}>
                    <ArrowLeft size={16} />
                    돌아가기
                </button>
                <h1>환자 등록</h1>
                <div className="header-buttons">
                    <button className="cancel-button" onClick={() => navigate('/patients')}>
                        <X size={16} />
                        취소
                    </button>
                    {step === 2 ? (
                        <button className="submit-button" onClick={handleSubmit}>
                            환자 등록
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="form-container">
                <div className="patient-info-container">
                    <div className="profile-upload-section">
                        <div className="profile-image-area">
                            <div className="profile-image-large" style={{ margin: 0 }}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="환자 프로필 미리보기" className="profile-image" />
                                ) : (
                                    <div className="profile-placeholder">
                                        <span>?</span>
                                    </div>
                                )}
                            </div>
                            <div className="profile-upload">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    id="profile-upload"
                                    className="profile-input"
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="profile-upload"
                                    className="profile-upload-button"
                                    style={{
                                        display: 'inline-block',
                                        padding: '10px 20px',
                                        backgroundColor: '#3498db',
                                        color: 'white',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        marginTop: '10px',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    프로필 사진 업로드
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form-content">
                        {step === 1 ? (
                            <div className="patient-basic-info">
                                <h3>기본 정보</h3>
                                <div className="info-row">
                                    <span>이름</span>
                                    <input
                                        type="text"
                                        name="patient_name"
                                        value={newPatient.patient_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="info-row gender-row">
                                    <span>성별</span>
                                    <div
                                        className="gender-radio-group"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'flex-start',
                                            width: '100%',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <label
                                            className={`gender-radio-label${
                                                newPatient.patient_sex === 'Male' ? ' selected' : ''
                                            }`}
                                            style={{
                                                marginRight: '15px',
                                                float: 'left',
                                                minWidth: '120px',
                                                height: '45px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                padding: '10px 20px',
                                                borderRadius: '10px',
                                            }}
                                        >
                                            <div className="gender-content">
                                                <span className="gender-icon male">&#9794;</span>
                                                <span className="gender-text">남</span>
                                            </div>
                                            <input
                                                type="radio"
                                                name="patient_sex"
                                                value="Male"
                                                checked={newPatient.patient_sex === 'Male'}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </label>
                                        <label
                                            className={`gender-radio-label${
                                                newPatient.patient_sex === 'Female' ? ' selected' : ''
                                            }`}
                                            style={{
                                                marginRight: '15px',
                                                float: 'left',
                                                minWidth: '120px',
                                                height: '45px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                padding: '10px 20px',
                                                borderRadius: '50px',
                                            }}
                                        >
                                            <div className="gender-content">
                                                <span className="gender-icon female">&#9792;</span>
                                                <span className="gender-text">여</span>
                                            </div>
                                            <input
                                                type="radio"
                                                name="patient_sex"
                                                value="Female"
                                                checked={newPatient.patient_sex === 'Female'}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </label>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <span>생년월일</span>
                                    <input
                                        type="date"
                                        name="patient_birth"
                                        value={newPatient.patient_birth}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="info-row">
                                    <span>혈액형</span>
                                    <select
                                        name="patient_blood"
                                        value={newPatient.patient_blood}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">선택하세요</option>
                                        <option value="A">A형</option>
                                        <option value="B">B형</option>
                                        <option value="O">O형</option>
                                        <option value="AB">AB형</option>
                                    </select>
                                </div>
                                <div className="info-row">
                                    <span>키</span>
                                    <input
                                        type="number"
                                        name="patient_height"
                                        value={newPatient.patient_height}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="cm"
                                    />
                                </div>
                                <div className="info-row">
                                    <span>체중</span>
                                    <input
                                        type="number"
                                        name="patient_weight"
                                        value={newPatient.patient_weight}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="kg"
                                    />
                                </div>
                                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                    <button type="button" className="next-step-btn" onClick={() => setStep(2)}>
                                        다음 단계 →
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="hospital-info" ref={hospitalInfoRef}>
                                <h3>입원 정보</h3>
                                <div className="info-row">
                                    <span>입원 날짜</span>
                                    <input
                                        type="date"
                                        name="patient_in"
                                        value={newPatient.patient_in}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="info-row">
                                    <span>퇴원 예정일</span>
                                    <input
                                        type="date"
                                        name="patient_out"
                                        value={newPatient.patient_out}
                                        onChange={handleInputChange}
                                        min={newPatient.patient_in}
                                    />
                                </div>
                                <div className="info-row">
                                    <span>층수 선택</span>
                                    <div
                                        className="floor-select-group"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'flex-start',
                                            width: '100%',
                                            textAlign: 'left',
                                        }}
                                    >
                                        {Array.from(
                                            new Set(rooms.map((room) => String(room.room_name).slice(0, 1)))
                                        ).map((floor) => (
                                            <button
                                                key={floor}
                                                type="button"
                                                className={`floor-btn${selectedFloor === floor ? ' selected' : ''}`}
                                                onClick={() => {
                                                    setSelectedRoom('');
                                                    setAvailableBeds([]);
                                                    setNewPatient((prev) => ({ ...prev, bed_id: '' }));
                                                    setSelectedFloor(floor);
                                                }}
                                                style={{
                                                    marginRight: '10px',
                                                    float: 'left',
                                                    width: '60px',
                                                    height: '36px',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {floor}층
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="info-row">
                                    <span>병실 선택</span>
                                    {selectedFloor ? (
                                        <div
                                            className="room-select-group"
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'flex-start',
                                                width: '100%',
                                                textAlign: 'left',
                                            }}
                                        >
                                            {rooms
                                                .filter((room) => String(room.room_name).startsWith(selectedFloor))
                                                .map((room) => (
                                                    <button
                                                        key={room.room_name}
                                                        type="button"
                                                        className={`room-btn${
                                                            selectedRoom === room.room_name ? ' selected' : ''
                                                        }${room.room_capacity === 0 ? ' disabled' : ''}`}
                                                        onClick={() => {
                                                            if (room.room_capacity === 0) return;
                                                            handleRoomChange(room.room_name);
                                                        }}
                                                        disabled={room.room_capacity === 0}
                                                        style={{
                                                            marginRight: '10px',
                                                            float: 'left',
                                                            width: '70px',
                                                            height: '36px',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        {room.room_name}호{room.room_capacity === 0 ? ' (만실)' : ''}
                                                    </button>
                                                ))}
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                color: '#aaa',
                                                padding: '8px 0',
                                                textAlign: 'left',
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'flex-start',
                                                marginLeft: 0,
                                            }}
                                        >
                                            먼저 층수를 선택하세요
                                        </div>
                                    )}
                                </div>
                                <div className="info-row">
                                    <span>침대 번호</span>
                                    <div
                                        className="bed-radio-group"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'flex-start',
                                            width: '100%',
                                            textAlign: 'left',
                                        }}
                                    >
                                        {availableBeds.length === 0 ? (
                                            <div
                                                style={{
                                                    color: '#aaa',
                                                    padding: '8px 0',
                                                    textAlign: 'left',
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    marginLeft: 0,
                                                }}
                                            >
                                                선택 가능한 침대 없음
                                            </div>
                                        ) : (
                                            availableBeds.map((bed) => {
                                                const isSelected = String(newPatient.bed_id) === String(bed.bed_id);
                                                return (
                                                    <label
                                                        key={`${selectedRoom}-${bed.bed_num}`}
                                                        className={`bed-radio-label${isSelected ? ' selected' : ''}`}
                                                        style={{
                                                            marginRight: '10px',
                                                            float: 'left',
                                                            width: '60px',
                                                            height: '36px',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="bed_id"
                                                            value={bed.bed_id}
                                                            checked={isSelected}
                                                            onChange={handleInputChange}
                                                            required
                                                            disabled={!selectedRoom}
                                                        />
                                                        <span style={{ textAlign: 'center' }}>{bed.bed_num}</span>
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                                <div className="info-row">
                                    <span>위험도</span>
                                    <div
                                        className="risk-radio-group"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'flex-start',
                                            width: '100%',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <label
                                            className={`risk-radio-label low${
                                                newPatient.patient_status === '무위험군' ? ' selected' : ''
                                            }`}
                                            style={{
                                                marginRight: '10px',
                                                float: 'left',
                                                width: '100px',
                                                height: '36px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div className="risk-content">무위험군</div>
                                            <input
                                                type="radio"
                                                name="patient_status"
                                                value="무위험군"
                                                checked={newPatient.patient_status === '무위험군'}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </label>
                                        <label
                                            className={`risk-radio-label mid${
                                                newPatient.patient_status === '저위험군' ? ' selected' : ''
                                            }`}
                                            style={{
                                                marginRight: '10px',
                                                float: 'left',
                                                width: '100px',
                                                height: '36px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div className="risk-content">저위험군</div>
                                            <input
                                                type="radio"
                                                name="patient_status"
                                                value="저위험군"
                                                checked={newPatient.patient_status === '저위험군'}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </label>
                                        <label
                                            className={`risk-radio-label high${
                                                newPatient.patient_status === '고위험군' ? ' selected' : ''
                                            }`}
                                            style={{
                                                marginRight: '10px',
                                                float: 'left',
                                                width: '100px',
                                                height: '36px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div className="risk-content">고위험군</div>
                                            <input
                                                type="radio"
                                                name="patient_status"
                                                value="고위험군"
                                                checked={newPatient.patient_status === '고위험군'}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </label>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <span>보호자 전화</span>
                                    <input
                                        type="tel"
                                        name="guardian_tel"
                                        value={newPatient.guardian_tel}
                                        onChange={handleInputChange}
                                        placeholder="010-0000-0000"
                                        pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}"
                                    />
                                </div>
                                <div className="info-row">
                                    <span>보호자 ID</span>
                                    <input
                                        type="text"
                                        name="guardian_id"
                                        value={newPatient.guardian_id}
                                        onChange={handleInputChange}
                                        placeholder="보호자 ID를 입력하세요"
                                        required
                                    />
                                </div>
                                <div className="memo-info" style={{ height: memoHeight }}>
                                    <h3>메모</h3>
                                    <textarea
                                        name="patient_memo"
                                        value={newPatient.patient_memo}
                                        onChange={handleInputChange}
                                        rows="5"
                                        placeholder="환자에 대한 메모를 입력하세요"
                                    />
                                </div>
                                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <button type="button" className="prev-step-btn" onClick={() => setStep(1)}>
                                        ← 기본 정보
                                    </button>
                                    <button className="submit-button" onClick={handleSubmit}>
                                        환자 등록
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientAdd;
