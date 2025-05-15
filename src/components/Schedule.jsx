import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import '../styles/components/schedule.css';

// 3교대 Shift 옵션
const SHIFT_OPTIONS = ['DAY', 'EVE', 'NGT', 'OFF'];

// 교대 표시를 위한 라벨 맵 (영문)
const SHIFT_LABELS = { DAY: 'D', EVE: 'E', NGT: 'N', OFF: 'O' };

const Schedule = () => {
    // 로컬 스토리지에서 일정 불러오기
    const [schedules, setSchedules] = useState(() => {
        const stored = localStorage.getItem('schedules');
        return stored ? JSON.parse(stored) : [];
    });
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [newSchedule, setNewSchedule] = useState({
        title: '',
        date: '',
        time: '',
        type: '',
        description: '',
    });

    // 직원 목록 (로컬스토리지 기반, 기본 더미)
    const [staffList, setStaffList] = useState(() => {
        const stored = localStorage.getItem('staffList');
        return stored
            ? JSON.parse(stored)
            : [
                  { id: 1, name: '홍길동' },
                  { id: 2, name: '김철수' },
                  { id: 3, name: '이영희' },
              ];
    });
    const [newStaffName, setNewStaffName] = useState('');
    // shiftData: { 'YYYY-MM-DD': { staffId: shiftCode, ... }, ... }
    const [shiftData, setShiftData] = useState(() => {
        const stored = localStorage.getItem('shiftData');
        return stored ? JSON.parse(stored) : {};
    });

    // 달력 관련 함수들
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 달력 날짜 배열 생성
    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // 이전 달의 날짜들
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: '', isCurrentMonth: false });
        }

        // 현재 달의 날짜들
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
            const daySchedules = schedules.filter((schedule) => schedule.date === dateStr);
            days.push({
                day: i,
                isCurrentMonth: true,
                schedules: daySchedules,
                date: dateStr,
            });
        }

        return days;
    };

    // 월 이동 함수
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleAddSchedule = () => {
        let updated;
        if (selectedSchedule) {
            // 수정
            updated = schedules.map((schedule) =>
                schedule.id === selectedSchedule.id ? { ...newSchedule, id: schedule.id } : schedule
            );
        } else {
            // 추가
            updated = [...schedules, { ...newSchedule, id: Date.now() }];
        }
        setSchedules(updated);
        // 로컬 스토리지에 저장
        localStorage.setItem('schedules', JSON.stringify(updated));
        handleCloseDialog();
    };

    const handleDeleteSchedule = (id) => {
        const updated = schedules.filter((schedule) => schedule.id !== id);
        setSchedules(updated);
        localStorage.setItem('schedules', JSON.stringify(updated));
    };

    const handleOpenDialog = (schedule = null) => {
        if (schedule) {
            setSelectedSchedule(schedule);
            setNewSchedule(schedule);
        } else {
            setSelectedSchedule(null);
            setNewSchedule({
                title: '',
                date: '',
                time: '',
                type: '',
                description: '',
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedSchedule(null);
        setNewSchedule({
            title: '',
            date: '',
            time: '',
            type: '',
            description: '',
        });
    };

    // 월 이동 후 shiftData 유지
    useEffect(() => {
        localStorage.setItem('shiftData', JSON.stringify(shiftData));
    }, [shiftData]);

    // 직원 목록을 로컬스토리지에 저장
    useEffect(() => {
        localStorage.setItem('staffList', JSON.stringify(staffList));
    }, [staffList]);

    // 직원 추가 함수
    const handleAddStaff = () => {
        if (!newStaffName.trim()) return;
        const newId = Date.now();
        const updated = [...staffList, { id: newId, name: newStaffName.trim() }];
        setStaffList(updated);
        setNewStaffName('');
    };

    // 직원 삭제 함수
    const handleDeleteStaff = (staffId) => {
        if (window.confirm('정말로 이 직원을 삭제하시겠습니까?')) {
            const updatedStaffList = staffList.filter((staff) => staff.id !== staffId);
            setStaffList(updatedStaffList);

            // 해당 직원의 근무 데이터도 삭제
            const updatedShiftData = { ...shiftData };
            Object.keys(updatedShiftData).forEach((date) => {
                if (updatedShiftData[date][staffId]) {
                    delete updatedShiftData[date][staffId];
                }
            });
            setShiftData(updatedShiftData);
        }
    };

    // 로스터용 월 선택 상태
    const [rosterMonth, setRosterMonth] = useState(() => new Date());
    // 월값 포맷 YYYY-MM
    const formatMonthValue = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
    };
    // 로스터용 날짜 배열 생성 (해당 월 1~말일)
    const generateRosterDays = () => {
        const year = rosterMonth.getFullYear();
        const month = rosterMonth.getMonth();
        const daysInMonth = getDaysInMonth(rosterMonth);
        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = formatDate(new Date(year, month, i));
            days.push({ day: i, date: dateStr });
        }
        return days;
    };

    return (
        <div className="schedule-container">
            <h1 className="schedule-title">일정표</h1>
            <p className="schedule-subtitle">진료, 활동, 행사 일정을 간편하게 확인할 수 있습니다.</p>

            <div className="schedule-content">
                {/* 캘린더 카드 */}
                <div className="schedule-card calendar-card">
                    <div className="card-header">
                        <span className="card-title">캘린더</span>
                        <div className="calendar-nav">
                            <button onClick={handlePrevMonth}>&lt;</button>
                            <span className="nav-title">
                                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                            </span>
                            <button onClick={handleNextMonth}>&gt;</button>
                        </div>
                    </div>
                    <div className="calendar-weekdays">
                        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                            <div key={day} className="calendar-weekday">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="calendar-days">
                        {generateCalendarDays().map((dayData, index) => {
                            const dateStr = dayData.date;
                            const selectedStr = formatDate(selectedDate);
                            const isSelected = dateStr === selectedStr;
                            return (
                                <div
                                    key={index}
                                    className={
                                        `calendar-day ${dayData.isCurrentMonth ? 'current' : 'other'}` +
                                        `${isSelected ? ' selected-date' : ''}` +
                                        `${dayData.schedules && dayData.schedules.length > 0 ? ' has-schedule' : ''}`
                                    }
                                    onClick={() => {
                                        if (!dayData.isCurrentMonth) return;
                                        // 날짜 선택만 처리, 폼은 열리지 않음
                                        setSelectedDate(new Date(dayData.date));
                                        setSelectedSchedule(null);
                                        setIsDialogOpen(false);
                                    }}
                                >
                                    <div className="day-header">
                                        <span className="day-number">{dayData.day}</span>
                                    </div>
                                    <div className="day-schedules">
                                        {dayData.schedules?.map((schedule) => (
                                            <div key={schedule.id} className="day-schedule">
                                                <div className="schedule-summary">
                                                    <span className="schedule-time">{schedule.time}</span>
                                                    <span className="schedule-title">{schedule.title}</span>
                                                    <div
                                                        className="schedule-actions"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSchedule(schedule);
                                                                setNewSchedule(schedule);
                                                                setIsDialogOpen(true);
                                                            }}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button onClick={() => handleDeleteSchedule(schedule.id)}>
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="schedule-desc">{schedule.description || '설명 없음'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 일정 상세 카드 */}
                <div className="schedule-card events-card">
                    <div className="card-header">
                        <span className="card-title">
                            {selectedDate.getFullYear()}년 {String(selectedDate.getMonth() + 1).padStart(2, '0')}월{' '}
                            {String(selectedDate.getDate()).padStart(2, '0')}일 일정
                        </span>
                        <button
                            className="add-events-btn"
                            onClick={() => {
                                setSelectedSchedule(null);
                                setNewSchedule({
                                    title: '',
                                    date: formatDate(selectedDate),
                                    time: '',
                                    type: '',
                                    description: '',
                                });
                                setIsDialogOpen(true);
                            }}
                        >
                            <Plus className="plus-icon" />
                            일정 추가
                        </button>
                    </div>
                    <div className="events-content">
                        {/* 등록된 일정 목록 */}
                        {schedules.filter((s) => s.date === formatDate(selectedDate)).length > 0 ? (
                            schedules
                                .filter((s) => s.date === formatDate(selectedDate))
                                .map((s) => (
                                    <div key={s.id} className="day-schedule">
                                        <div className="schedule-summary">
                                            <span className="schedule-time">{s.time}</span>
                                            <span className="schedule-title">{s.title}</span>
                                            <div className="schedule-actions" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedSchedule(s);
                                                        setNewSchedule(s);
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    ✏️
                                                </button>
                                                <button onClick={() => handleDeleteSchedule(s.id)}>🗑️</button>
                                            </div>
                                        </div>
                                        <p className="schedule-desc">{s.description || '설명 없음'}</p>
                                    </div>
                                ))
                        ) : (
                            <p className="no-schedule-text">등록된 일정이 없습니다.</p>
                        )}
                        {/* 폼: 추가 또는 수정 */}
                        {isDialogOpen && (
                            <div className="inline-form">
                                <div className="form-group">
                                    <label className="form-label">제목</label>
                                    <input
                                        className="form-input"
                                        value={newSchedule.title}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                                    />
                                </div>
                                <div className="time-inputs">
                                    <div className="form-group">
                                        <label className="form-label">시간</label>
                                        <input
                                            className="form-input"
                                            type="time"
                                            value={newSchedule.time}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">유형</label>
                                        <select
                                            className="form-select"
                                            value={newSchedule.type}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, type: e.target.value })}
                                        >
                                            <option value="">선택</option>
                                            <option value="회의">회의</option>
                                            <option value="점검">점검</option>
                                            <option value="교육">교육</option>
                                            <option value="기타">기타</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">설명</label>
                                    <input
                                        className="form-input"
                                        value={newSchedule.description}
                                        onChange={(e) =>
                                            setNewSchedule({ ...newSchedule, description: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-actions">
                                    <button className="button-cancel" onClick={() => setIsDialogOpen(false)}>
                                        취소
                                    </button>
                                    <button className="button-submit" onClick={handleAddSchedule}>
                                        {selectedSchedule ? '수정' : '추가'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* 근무표 카드 추가 */}
            <div className="roster-card">
                <div className="card-header">
                    <span className="card-title">근무표</span>
                </div>
                <div className="roster-content">
                    {/* 월 선택 */}
                    <div className="roster-month-select">
                        <input
                            type="month"
                            value={formatMonthValue(rosterMonth)}
                            onChange={(e) => {
                                const [y, m] = e.target.value.split('-');
                                setRosterMonth(new Date(Number(y), Number(m) - 1, 1));
                            }}
                            className="roster-month-picker"
                        />
                    </div>
                    <div className="staff-add">
                        <input
                            type="text"
                            placeholder="이름 입력"
                            value={newStaffName}
                            onChange={(e) => setNewStaffName(e.target.value)}
                            className="staff-input"
                        />
                        <button onClick={handleAddStaff} className="staff-add-btn">
                            추가
                        </button>
                    </div>
                    <table className="roster-table">
                        <thead>
                            <tr>
                                <th>이름</th>
                                {generateRosterDays().map((d) => (
                                    <th key={d.date}>{d.day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map((staff) => (
                                <tr key={staff.id}>
                                    <td>
                                        {staff.name}
                                        <button
                                            className="delete-staff-btn"
                                            onClick={() => handleDeleteStaff(staff.id)}
                                            title="직원 삭제"
                                        >
                                            <X size={16} />
                                        </button>
                                    </td>
                                    {generateRosterDays().map((d) => {
                                        const dateKey = d.date;
                                        const cellData = shiftData[dateKey] || {};
                                        const currentShift = cellData[staff.id] || '';
                                        return (
                                            <td
                                                key={d.date}
                                                className={`roster-cell ${
                                                    formatDate(selectedDate) === d.date ? 'selected-col' : ''
                                                }`}
                                                onClick={() => {
                                                    // 다음 shift 옵션으로 순환
                                                    const idx = SHIFT_OPTIONS.indexOf(currentShift);
                                                    const next = SHIFT_OPTIONS[(idx + 1) % SHIFT_OPTIONS.length];
                                                    const updated = { ...shiftData };
                                                    if (!updated[dateKey]) updated[dateKey] = {};
                                                    updated[dateKey][staff.id] = next;
                                                    setShiftData(updated);
                                                }}
                                            >
                                                {currentShift && (
                                                    <span
                                                        className={`shift-label ${currentShift === 'OFF' ? 'off' : ''}`}
                                                    >
                                                        {SHIFT_LABELS[currentShift]}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
