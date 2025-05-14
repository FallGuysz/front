import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/components/PatientManagement.css';
import {
    Plus,
    Search,
    UserPlus,
    FileText,
    Filter,
    ChevronDown,
    ChevronUp,
    Users,
    AlertTriangle,
    Clock,
    Heart,
    X,
    Trash2,
    Upload,
    Download,
    ChevronLeft,
    ChevronRight,
    User,
    Eye,
    RotateCcw,
} from 'lucide-react';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useNavigate } from 'react-router-dom';

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
    guardian_id: '',
    bed_id: '',
};

// 성별 아이콘 매핑 상수 수정
const GENDER_ICONS = {
    Male: '♂', // 남성 심볼
    Female: '♀', // 여성 심볼
};

const PatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        gender: '', // 성별 필터 추가
        bloodType: '',
        hasGuardian: null,
        room: '',
        status: '',
    });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPatients, setSelectedPatients] = useState([]);
    const [stats, setStats] = useState({
        totalPatients: {
            value: '127명',
            description: '전체 환자',
        },
        newPatients: {
            value: '12명',
            description: '신규 입원',
            change: '+2명',
        },
        criticalPatients: {
            value: '5명',
            description: '중환자',
            change: '-1명',
        },
        dischargeScheduled: {
            value: '8명',
            description: '퇴원 예정',
        },
    });

    const navigate = useNavigate();

    // 날짜 포맷팅 함수 추가
    const formatBirthDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    // 이미지 URL 포맷팅 함수 추가
    const formatImageUrl = (imagePath) => {
        if (!imagePath) return '/images/default-patient.png';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL}${imagePath}`;
    };

    // fetchPatients 함수 수정
    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/patients`);
            if (response.data.code === 0) {
                const patients = response.data.data;
                setPatients(patients);

                // 오늘 날짜 기준
                const now = new Date();
                const threeDaysAgo = new Date(now);
                threeDaysAgo.setDate(now.getDate() - 3);
                const threeDaysLater = new Date(now);
                threeDaysLater.setDate(now.getDate() + 3);

                // 통계 계산
                const newAdmissions = patients.filter((patient) => {
                    if (!patient.patient_in) return false;
                    const admissionDate = new Date(patient.patient_in);
                    return admissionDate >= threeDaysAgo && admissionDate <= now;
                }).length;

                const criticalPatients = patients.filter((patient) => patient.patient_status === '고위험군').length;

                const dischargeScheduled = patients.filter((patient) => {
                    if (!patient.patient_out) return false;
                    const dischargeDate = new Date(patient.patient_out);
                    return dischargeDate >= now && dischargeDate <= threeDaysLater;
                }).length;

                setStats((prev) => ({
                    ...prev,
                    totalPatients: {
                        ...prev.totalPatients,
                        value: `${patients.length}명`,
                    },
                    newPatients: {
                        value: `${newAdmissions}명`,
                        description: '신규 입원',
                        change: '', // 변동량 표시 추가 가능
                    },
                    criticalPatients: {
                        value: `${criticalPatients}명`,
                        description: '고위험군',
                        change: '', // 변동량 표시 추가 가능
                    },
                    dischargeScheduled: {
                        value: `${dischargeScheduled}명`,
                    },
                }));
            } else {
                setError('환자 정보를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('Error fetching patients:', err);
            setError('서버 연결에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    // handleAddPatient 함수 수정
    const handleAddPatient = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            // 일반 텍스트 필드 추가
            Object.keys(newPatient).forEach((key) => {
                if (key !== 'patient_img' || !newPatient[key]) {
                    formData.append(key, newPatient[key]);
                }
            });

            // 파일이 있으면 추가
            if (imageFile) {
                formData.append('patient_img', imageFile);
            }

            const response = await axios.post(`${API_BASE_URL}/patients`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.code === 0) {
                // 성공 처리 로직
                setShowAddForm(false);
                fetchPatients();
                setNewPatient(initialFormState); // initialPatientState를 initialFormState로 변경
                alert('환자가 성공적으로 등록되었습니다.');
            }
        } catch (error) {
            console.error('Error adding patient:', error);
            alert('환자 등록에 실패했습니다.');
        }
    };

    const handleDeletePatient = async (patientId) => {
        if (window.confirm('정말로 이 환자를 삭제하시겠습니까?')) {
            try {
                await axios.delete(`${API_BASE_URL}/patients/${patientId}`);
                setPatients(patients.filter((p) => p.patient_id !== patientId));
            } catch (error) {
                console.error('Error deleting patient:', error);
                alert('환자 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPatient((prev) => ({ ...prev, [name]: value }));
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedPatients = React.useMemo(() => {
        if (!sortConfig.key) return patients;
        return [...patients].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }, [patients, sortConfig]);

    // openDetailView 함수 수정
    const openDetailView = (patient) => {
        navigate(`/patients/${patient.patient_id}`);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        // 중첩된 객체 구조 처리 (예: ageRange.min, ageRange.max)
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFilters((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setFilters((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // 필터 초기화 함수 수정
    const resetFilters = () => {
        setFilters({
            gender: '', // 성별 필터 초기화 추가
            bloodType: '',
            hasGuardian: null,
            room: '',
            status: '',
        });
    };

    // 필터링 함수 수정
    const applyFilters = (patients) => {
        return patients.filter((patient) => {
            const matchesGender = !filters.gender || patient.patient_sex === filters.gender; // 성별 필터링 추가
            const matchesBlood = !filters.bloodType || patient.patient_blood === filters.bloodType;
            const matchesGuardian =
                filters.hasGuardian === null ||
                (filters.hasGuardian === true && patient.guardian_tel) ||
                (filters.hasGuardian === false && !patient.guardian_tel);
            const matchesRoom = !filters.room || patient.room_name === filters.room;
            const matchesStatus = !filters.status || patient.patient_status === filters.status;

            return matchesGender && matchesBlood && matchesGuardian && matchesRoom && matchesStatus;
        });
    };

    const filteredPatients = applyFilters(sortedPatients).filter(
        (patient) =>
            patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.patient_id.toString().includes(searchTerm)
    );

    // 이미지 파일 상태 관리를 위한 상태 추가
    const [imageFile, setImageFile] = useState(null);

    // 이미지 업로드 처리 함수
    const handleImageUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            // 파일 상태 저장
            setImageFile(file);

            // 미리보기 생성
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'add') {
                    setNewPatient((prev) => ({
                        ...prev,
                        patient_img: reader.result, // 미리보기용 URL
                    }));
                } else if (type === 'edit') {
                    setEditingPatient((prev) => ({
                        ...prev,
                        patient_img: reader.result, // 미리보기용 URL
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectAll = () => {
        if (selectedPatients.length === patients.length) {
            setSelectedPatients([]);
        } else {
            setSelectedPatients(patients.map((p) => p.patient_id));
        }
    };

    const handleSelectPatient = (patientId) => {
        setSelectedPatients((prev) => {
            if (prev.includes(patientId)) {
                return prev.filter((id) => id !== patientId);
            } else {
                return [...prev, patientId];
            }
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case '고위험군':
                return 'high-risk';
            case '저위험군':
                return 'low-risk';
            case '무위험군':
                return 'no-risk';
            default:
                return '';
        }
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`선택한 ${selectedPatients.length}명의 환자를 삭제하시겠습니까?`)) {
            try {
                await Promise.all(selectedPatients.map((id) => axios.delete(`${API_BASE_URL}/patients/${id}`)));
                setPatients(patients.filter((p) => !selectedPatients.includes(p.patient_id)));
                setSelectedPatients([]);
            } catch (error) {
                console.error('Error deleting patients:', error);
                alert('환자 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const handleBulkExport = () => {
        // 선택된 환자들의 데이터를 CSV로 내보내기
        const selectedPatientsData = patients.filter((p) => selectedPatients.includes(p.patient_id));
        const csvContent = convertToCSV(selectedPatientsData);
        downloadCSV(csvContent, 'patients.csv');
    };

    const convertToCSV = (data) => {
        const headers = ['ID', '이름', '생년월일', '성별', '혈액형', '보호자', '병실', '상태'];
        const rows = data.map((patient) => [
            patient.patient_id,
            patient.patient_name,
            patient.patient_birth,
            patient.gender,
            patient.patient_blood,
            patient.guardian_id,
            patient.bed_id,
            patient.patient_status,
        ]);
        return [headers, ...rows].map((row) => row.join(',')).join('\n');
    };

    const downloadCSV = (content, fileName) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-text">환자 정보를 불러오는 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="error-text">{error}</div>
            </div>
        );
    }

    return (
        <div className="patient-management-container">
            <div className="header">
                <div className="title-section">
                    <h1>환자 관리</h1>
                </div>
            </div>

            {/* 주요 통계 */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>전체 환자</h3>
                        <p className="stat-value">{stats.totalPatients.value}</p>
                        <p className="stat-change">{stats.totalPatients.change}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <UserPlus size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>신규 입원</h3>
                        <p className="stat-value">{stats.newPatients.value}</p>
                        <p className="stat-change">{stats.newPatients.change}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>중환자</h3>
                        <p className="stat-value">{stats.criticalPatients.value}</p>
                        <p className="stat-change negative">{stats.criticalPatients.change}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>퇴원 예정</h3>
                        <p className="stat-value">{stats.dischargeScheduled.value}</p>
                    </div>
                </div>
            </div>

            {/* 필터 모달 */}
            {showFilterModal && (
                <div className="modal-overlay">
                    <div className="modal-content filter-modal">
                        <div className="modal-header">
                            <h2>필터 설정</h2>
                            <div className="modal-header-buttons">
                                <button className="reset-button" onClick={resetFilters} title="필터 초기화">
                                    <RotateCcw size={18} />
                                </button>
                                <button className="close-button" onClick={() => setShowFilterModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="filter-modal-body">
                            <div className="filter-panel">
                                <div className="form-group">
                                    <label>성별</label>
                                    <select name="gender" value={filters.gender} onChange={handleFilterChange}>
                                        <option value="">전체</option>
                                        <option value="Male">남성</option>
                                        <option value="Female">여성</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>혈액형</label>
                                    <select name="bloodType" value={filters.bloodType} onChange={handleFilterChange}>
                                        <option value="">전체</option>
                                        <option value="A">A형</option>
                                        <option value="B">B형</option>
                                        <option value="O">O형</option>
                                        <option value="AB">AB형</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>병실</label>
                                    <select name="room" value={filters.room} onChange={handleFilterChange}>
                                        <option value="">전체</option>
                                        {Array.from(new Set(patients.map((p) => p.room_name)))
                                            .filter(Boolean)
                                            .map((room) => (
                                                <option key={room} value={room}>
                                                    {room}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>환자 상태</label>
                                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                                        <option value="">전체</option>
                                        <option value="고위험군">고위험군</option>
                                        <option value="저위험군">저위험군</option>
                                        <option value="무위험군">무위험군</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="submit-button" onClick={() => setShowFilterModal(false)}>
                                적용
                            </button>
                            <button className="cancel-button" onClick={() => setShowFilterModal(false)}>
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 검색 및 필터 섹션 */}
            <div className="search-filter-section">
                <div className="search-container">
                    {/* <div className="search-icon-wrapper">
                        <Search className="search-icon" />
                    </div> */}
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search patient"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="action-group">
                    <button className="filter-button" onClick={() => setShowFilterModal(true)}>
                        <Filter size={16} />
                        Filter
                    </button>
                    <button className="add-button" onClick={() => navigate('/patients/add')}>
                        <Plus size={16} />
                        Add
                    </button>
                </div>
            </div>

            {/* 테이블 */}
            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="header-label">ID</th>
                            <th className="header-label">사진</th>
                            <th className="header-label">이름</th>
                            <th className="header-label">성별</th> {/* 성별 헤더 추가 */}
                            <th className="header-label">생년월일</th>
                            <th className="header-label">신체 정보</th>
                            <th className="header-label">혈액형</th>
                            <th className="header-label">병실/침대</th>
                            <th className="header-label">상태</th>
                            <th className="header-label">작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients
                            .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                            .map((patient) => (
                                <tr key={patient.patient_id}>
                                    <td>
                                        <span className="patient-id">{patient.patient_id}</span>
                                    </td>
                                    <td>
                                        <div className="patient-avatar">
                                            <img
                                                src={formatImageUrl(patient.patient_img)}
                                                alt={`${patient.patient_name}의 프로필`}
                                                className="patient-avatar-image"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/images/default-patient.png';
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <span className="patient-name">{patient.patient_name}</span>
                                    </td>
                                    <td>
                                        <span
                                            className={`gender-icon ${
                                                patient.patient_sex === 'Male' ? 'male' : 'female'
                                            }`}
                                        >
                                            {GENDER_ICONS[patient.patient_sex]}
                                        </span>
                                    </td>
                                    <td>{formatBirthDate(patient.patient_birth)}</td>
                                    <td>
                                        {patient.patient_height}cm / {patient.patient_weight}kg
                                    </td>
                                    <td>
                                        <span className="status-badge blood-type">{patient.patient_blood}형</span>
                                    </td>
                                    <td>{patient.room_name ? `${patient.room_name}호 - ${patient.bed_num}` : '-'}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(patient.patient_status)}`}>
                                            {patient.patient_status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-button" onClick={() => openDetailView(patient)}>
                                                <ContentPasteSearchIcon sx={{ fontSize: 20 }} />
                                            </button>
                                            <button
                                                className="action-button delete"
                                                onClick={() => handleDeletePatient(patient.patient_id)}
                                            >
                                                <Trash2 size={20} color="#dc2626" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                {/* 페이지네이션 */}
                <div className="table-footer">
                    <div className="rows-per-page">
                        <span>Rows per page:</span>
                        <select value={rowsPerPage} onChange={handleRowsPerPageChange} className="rows-select">
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </select>
                    </div>
                    <div className="pagination-info">
                        {`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                            currentPage * rowsPerPage,
                            filteredPatients.length
                        )} of ${filteredPatients.length}`}
                    </div>
                    <div className="pagination-buttons">
                        <button
                            className="pagination-button"
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            className="pagination-button"
                            onClick={() =>
                                handlePageChange(
                                    Math.min(currentPage + 1, Math.ceil(filteredPatients.length / rowsPerPage))
                                )
                            }
                            disabled={currentPage * rowsPerPage >= filteredPatients.length}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientManagement;
