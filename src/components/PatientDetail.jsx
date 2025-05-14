import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X, User } from 'lucide-react';
import axios from 'axios';
import '../styles/components/PatientDetail.css';
import HumanModel3D from './HumanModel3D';

const API_BASE_URL = 'http://localhost:3000';

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [editedPatient, setEditedPatient] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatientDetail = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/patients/${id}`);
                const patientData = response.data.data;

                // 프로필 이미지 URL이 있는 경우 이미지 데이터 가져오기
                if (patientData.profile_image) {
                    try {
                        const imageResponse = await axios.get(`${API_BASE_URL}/patients/${id}/profile-image`, {
                            responseType: 'blob',
                        });
                        patientData.profile_image = URL.createObjectURL(imageResponse.data);
                    } catch (imageError) {
                        console.error('Error fetching profile image:', imageError);
                        patientData.profile_image = null;
                    }
                }

                setPatient(patientData);
                setEditedPatient(patientData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching patient details:', err);
                setError('환자 정보를 불러오는데 실패했습니다.');
                setLoading(false);
            }
        };

        fetchPatientDetail();

        // Cleanup function
        return () => {
            // URL.createObjectURL()로 생성된 URL 해제
            if (patient?.profile_image) {
                URL.revokeObjectURL(patient.profile_image);
            }
        };
    }, [id]);

    const handleInputChange = (field, value) => {
        setEditedPatient((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleMedicationChange = (index, field, value) => {
        setEditedPatient((prev) => ({
            ...prev,
            medications: prev.medications.map((med, i) => (i === index ? { ...med, [field]: value } : med)),
        }));
    };

    const addMedication = () => {
        setEditedPatient((prev) => ({
            ...prev,
            medications: [
                ...(prev.medications || []),
                {
                    med_name: '',
                    med_dosage: '',
                    med_cycle: '',
                    med_start_dt: '',
                    med_end_dt: '',
                    notes: '',
                },
            ],
        }));
    };

    const removeMedication = (index) => {
        setEditedPatient((prev) => ({
            ...prev,
            medications: prev.medications.filter((_, i) => i !== index),
        }));
    };

    const handleSave = async () => {
        try {
            // 날짜 필드 변환
            const payload = { ...editedPatient };
            if (payload.patient_birth) payload.patient_birth = payload.patient_birth.split('T')[0];
            if (payload.medications) {
                payload.medications = payload.medications.map((med) => ({
                    ...med,
                    med_start_dt: med.med_start_dt ? med.med_start_dt.split('T')[0] : '',
                    med_end_dt: med.med_end_dt ? med.med_end_dt.split('T')[0] : '',
                }));
            }

            // 이미지가 base64 문자열인 경우 (새로 업로드된 이미지)
            if (
                typeof editedPatient.profile_image === 'string' &&
                editedPatient.profile_image.startsWith('data:image')
            ) {
                // FormData 사용
                const formData = new FormData();

                // Base64 문자열을 Blob으로 변환
                const base64Response = await fetch(editedPatient.profile_image);
                const blob = await base64Response.blob();

                // Blob 객체를 파일로 변환
                const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });

                // 이미지 파일 추가
                formData.append('profile_image', file);

                // 기타 필드도 추가
                Object.keys(payload).forEach((key) => {
                    if (key !== 'profile_image') {
                        if (typeof payload[key] === 'object' && payload[key] !== null) {
                            formData.append(key, JSON.stringify(payload[key]));
                        } else if (payload[key] !== null && payload[key] !== undefined) {
                            formData.append(key, payload[key]);
                        }
                    }
                });

                // FormData로 서버에 전송
                const response = await axios.put(`${API_BASE_URL}/patients/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // 응답 데이터로 상태 업데이트
                const updatedPatient = response.data.data;

                // 프로필 이미지 URL이 있는 경우 이미지 데이터 가져오기
                if (updatedPatient.profile_image) {
                    try {
                        const imageResponse = await axios.get(`${API_BASE_URL}/patients/${id}/profile-image`, {
                            responseType: 'blob',
                        });
                        updatedPatient.profile_image = URL.createObjectURL(imageResponse.data);
                    } catch (imageError) {
                        console.error('Error fetching updated profile image:', imageError);
                        updatedPatient.profile_image = null;
                    }
                }

                setPatient(updatedPatient);
            } else {
                // 기존 방식 사용 (이미지 변경 없음)
                const response = await axios.put(`${API_BASE_URL}/patients/${id}`, payload);
                setPatient(response.data.data);
            }

            setIsEditing(false);
        } catch (err) {
            console.error('Error updating patient:', err);
            alert('환자 정보 수정에 실패했습니다.');
        }
    };

    const handleCancel = () => {
        setEditedPatient(patient);
        setIsEditing(false);
    };

    const handleSymptomAdd = (point) => {
        const newSymptom = {
            x: point.x,
            y: point.y,
            description: prompt('증상을 입력하세요:') || '증상 없음',
        };
        handleInputChange('symptoms', [...(editedPatient.symptoms || []), newSymptom]);
    };

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!patient) return <div className="error">환자 정보를 찾을 수 없습니다.</div>;

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="patient-detail-container">
            <div className="detail-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} />
                    돌아가기
                </button>
                <h1>
                    <span>{patient.patient_name}</span>님의 상세 정보
                </h1>
                <div className="header-buttons">
                    {!isEditing ? (
                        <button className="edit-button" onClick={() => setIsEditing(true)}>
                            <Edit2 size={16} />
                            수정
                        </button>
                    ) : (
                        <>
                            <button className="save-button" onClick={handleSave}>
                                <Save size={16} />
                                저장
                            </button>
                            <button className="cancel-button" onClick={handleCancel}>
                                <X size={16} />
                                취소
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="medical-record">
                <div className="left-panel">
                    <div className="patient-basic-info">
                        <h3>기본 정보</h3>
                        <div className="profile-section">
                            <div className="profile-image-container">
                                {patient.profile_image ? (
                                    <img
                                        src={patient.profile_image}
                                        alt={`${patient.patient_name}의 프로필`}
                                        className="profile-image"
                                    />
                                ) : (
                                    <div className="profile-placeholder">
                                        <User size={40} />
                                    </div>
                                )}
                            </div>
                            {isEditing && (
                                <input
                                    type="file"
                                    id="profile-upload"
                                    accept="image/*"
                                    className="profile-upload-button"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                handleInputChange('profile_image', reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            )}
                        </div>
                        <div className="info-row">
                            <span>이름</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedPatient.patient_name || ''}
                                    onChange={(e) => handleInputChange('patient_name', e.target.value)}
                                />
                            ) : (
                                <span>{patient.patient_name || '-'}</span>
                            )}
                        </div>
                        <div className="info-row">
                            <span>생년월일</span>
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={editedPatient.patient_birth?.split('T')[0] || ''}
                                    onChange={(e) => handleInputChange('patient_birth', e.target.value)}
                                />
                            ) : (
                                <span>
                                    {patient.patient_birth
                                        ? `${formatDate(patient.patient_birth)} (${calculateAge(
                                              patient.patient_birth
                                          )}세)`
                                        : '-'}
                                </span>
                            )}
                        </div>
                        <div className="info-row">
                            <span>혈액형</span>
                            {isEditing ? (
                                <select
                                    value={editedPatient.patient_blood || ''}
                                    onChange={(e) => handleInputChange('patient_blood', e.target.value)}
                                >
                                    <option value="">선택</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="O">O</option>
                                    <option value="AB">AB</option>
                                </select>
                            ) : (
                                <span>{patient.patient_blood ? `${patient.patient_blood}형` : '-'}</span>
                            )}
                        </div>
                        <div className="info-row">
                            <span>성별</span>
                            {isEditing ? (
                                <select
                                    value={editedPatient.patient_sex || ''}
                                    onChange={(e) => handleInputChange('patient_sex', e.target.value)}
                                >
                                    <option value="">선택</option>
                                    <option value="Male">남성</option>
                                    <option value="Female">여성</option>
                                </select>
                            ) : (
                                <span>{patient.patient_sex || '-'}</span>
                            )}
                        </div>
                    </div>

                    <div className="vital-signs">
                        <h3>신체 정보</h3>
                        <div className="info-row">
                            <span>키</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={editedPatient.patient_height || ''}
                                    onChange={(e) => handleInputChange('patient_height', e.target.value)}
                                    placeholder="cm"
                                />
                            ) : (
                                <span>{patient.patient_height ? `${patient.patient_height}cm` : '-'}</span>
                            )}
                        </div>
                        <div className="info-row">
                            <span>체중</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={editedPatient.patient_weight || ''}
                                    onChange={(e) => handleInputChange('patient_weight', e.target.value)}
                                    placeholder="kg"
                                />
                            ) : (
                                <span>{patient.patient_weight ? `${patient.patient_weight}kg` : '-'}</span>
                            )}
                        </div>
                        <div className="info-row">
                            <span>BMI</span>
                            <span>
                                {patient.patient_height && patient.patient_weight
                                    ? (patient.patient_weight / Math.pow(patient.patient_height / 100, 2)).toFixed(1)
                                    : '-'}
                            </span>
                        </div>
                    </div>

                    <div className="hospital-info">
                        <h3>입원 정보</h3>
                        <div className="info-row">
                            <span>병실</span>
                            <span>{patient.room_name ? `${patient.room_name}호` : '-'}</span>
                        </div>
                        <div className="info-row">
                            <span>침상 번호</span>
                            <span>{patient.bed_num ? `${patient.bed_num}번` : '-'}</span>
                        </div>
                        <div className="info-row">
                            <span>위험도</span>
                            {isEditing ? (
                                <select
                                    value={editedPatient.patient_status || '정상'}
                                    onChange={(e) => handleInputChange('patient_status', e.target.value)}
                                >
                                    <option value="정상">정상</option>
                                    <option value="주의">주의</option>
                                    <option value="위험">위험</option>
                                </select>
                            ) : (
                                <span className={`status ${patient.patient_status || 'normal'}`}>
                                    {patient.patient_status || '정상'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="guardian-info">
                        <h3>보호자 정보</h3>
                        <div className="info-row">
                            <span>연락처</span>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={editedPatient.guardian_tel || ''}
                                    onChange={(e) => handleInputChange('guardian_tel', e.target.value)}
                                    placeholder="010-0000-0000"
                                />
                            ) : (
                                <span>{patient.guardian_tel || '보호자 정보가 없습니다.'}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="right-panel">
                    <div className="medication-info">
                        <div className="section-header">
                            <h3>투약 정보</h3>
                            {isEditing && (
                                <button className="add-button" onClick={addMedication}>
                                    + 투약 정보 추가
                                </button>
                            )}
                        </div>
                        {isEditing ? (
                            editedPatient.medications?.map((med, index) => (
                                <div key={index} className="medication-item">
                                    <button className="remove-med-button" onClick={() => removeMedication(index)}>
                                        <X size={16} />
                                    </button>
                                    <div className="info-row">
                                        <span>약품명</span>
                                        <input
                                            type="text"
                                            value={med.med_name || ''}
                                            onChange={(e) => handleMedicationChange(index, 'med_name', e.target.value)}
                                        />
                                    </div>
                                    <div className="info-row">
                                        <span>투약량</span>
                                        <input
                                            type="text"
                                            value={med.med_dosage || ''}
                                            onChange={(e) =>
                                                handleMedicationChange(index, 'med_dosage', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="info-row">
                                        <span>투약 주기</span>
                                        <input
                                            type="text"
                                            value={med.med_cycle || ''}
                                            onChange={(e) => handleMedicationChange(index, 'med_cycle', e.target.value)}
                                        />
                                    </div>
                                    <div className="info-row">
                                        <span>시작일</span>
                                        <input
                                            type="date"
                                            value={med.med_start_dt?.split('T')[0] || ''}
                                            onChange={(e) =>
                                                handleMedicationChange(index, 'med_start_dt', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="info-row">
                                        <span>종료일</span>
                                        <input
                                            type="date"
                                            value={med.med_end_dt?.split('T')[0] || ''}
                                            onChange={(e) =>
                                                handleMedicationChange(index, 'med_end_dt', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="info-row">
                                        <span>비고</span>
                                        <input
                                            type="text"
                                            value={med.notes || ''}
                                            onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : patient.medications && patient.medications.length > 0 ? (
                            patient.medications.map((med, index) => (
                                <div key={index} className="medication-item">
                                    <div className="info-row">
                                        <span>약품명</span>
                                        <span>{med.med_name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>투약량</span>
                                        <span>{med.med_dosage || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>투약 주기</span>
                                        <span>{med.med_cycle || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>시작일</span>
                                        <span>{med.med_start_dt ? formatDate(med.med_start_dt) : '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>종료일</span>
                                        <span>{med.med_end_dt ? formatDate(med.med_end_dt) : '-'}</span>
                                    </div>
                                    {med.notes && (
                                        <div className="info-row">
                                            <span>비고</span>
                                            <span>{med.notes}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="medication-item">
                                <div className="info-row">
                                    <span>투약 정보가 없습니다.</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="body-diagram">
                        <h3>증상 체크</h3>
                        <div className="body-model">
                            <HumanModel3D
                                symptoms={patient.symptoms}
                                onSymptomAdd={isEditing ? handleSymptomAdd : undefined}
                            />
                        </div>
                    </div>

                    <div className="memo-info">
                        <h3>메모</h3>
                        {isEditing ? (
                            <textarea
                                value={editedPatient.patient_memo || ''}
                                onChange={(e) => handleInputChange('patient_memo', e.target.value)}
                                placeholder="메모를 입력하세요"
                            />
                        ) : (
                            <div className="memo-content">{patient.patient_memo || '메모가 없습니다.'}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetail;
