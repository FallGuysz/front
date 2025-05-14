import React, { useState, useEffect } from 'react';
import {
    Bell,
    Search,
    Filter,
    CheckCircle2,
    AlertCircle,
    Clock,
    ChevronDown,
    ChevronUp,
    BellRing,
    Megaphone,
    Plus,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const Notifications = () => {
    const [activeTab, setActiveTab] = useState('notices'); // 'notices' or 'notifications'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); // 'add', 'edit', 'delete'
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        date: '',
        important: false,
        type: 'info',
        time: '',
    });

    const [notices, setNotices] = useState([
        {
            id: 1,
            title: '시스템 점검 안내',
            message: '2024년 3월 15일 02:00 ~ 04:00 동안 시스템 점검이 진행됩니다.',
            date: '2024-03-10',
            important: true,
        },
        {
            id: 2,
            title: '신규 기능 업데이트',
            message: '환자 모니터링 시스템에 새로운 기능이 추가되었습니다.',
            date: '2024-03-08',
            important: false,
        },
        {
            id: 3,
            title: '의료진 교육 안내',
            message: '3월 20일 오후 2시, 신규 시스템 사용법 교육이 진행됩니다.',
            date: '2024-03-05',
            important: true,
        },
        {
            id: 4,
            title: '보안 정책 업데이트',
            message:
                '개인정보보호법 개정에 따른 시스템 보안 정책이 업데이트되었습니다. 모든 직원은 새로운 보안 가이드라인을 숙지해주세요.',
            date: '2024-02-28',
            important: true,
        },
        {
            id: 5,
            title: '인사 발령 안내',
            message: '김영수 의사가 내과 진료부장으로 임명되었습니다. 3월 1일부터 새로운 직책으로 업무를 시작합니다.',
            date: '2024-02-25',
            important: false,
        },
        {
            id: 6,
            title: '연차 휴가 사용 안내',
            message:
                '2023년도 미사용 연차는 2024년 6월 30일까지 소진해주시기 바랍니다. 자세한 사항은 인사팀에 문의하세요.',
            date: '2024-02-20',
            important: false,
        },
        {
            id: 7,
            title: '병원 시설 공사 안내',
            message: '3월 10일부터 15일까지 주차장 확장 공사가 진행됩니다. 해당 기간 동안 임시 주차장을 이용해주세요.',
            date: '2024-02-15',
            important: true,
        },
        {
            id: 8,
            title: '건강검진 프로그램 변경',
            message: '4월부터 직원 건강검진 프로그램이 확대됩니다. 추가 검진 항목 및 일정은 공지사항을 참고하세요.',
            date: '2024-02-10',
            important: false,
        },
        {
            id: 9,
            title: '네트워크 업그레이드 안내',
            message: '병원 내 Wi-Fi 네트워크가 업그레이드됩니다. 3월 5일부터 새로운 접속 정보를 사용해주세요.',
            date: '2024-02-05',
            important: false,
        },
        {
            id: 10,
            title: '감염병 예방 수칙 변경',
            message:
                '최근 호흡기 감염병 확산에 따라 병원 내 마스크 착용이 의무화됩니다. 모든 직원 및 방문객은 반드시 마스크를 착용해주세요.',
            date: '2024-02-01',
            important: true,
        },
        {
            id: 11,
            title: '전자의무기록 시스템 업데이트',
            message:
                '2024년 4월 1일부터 새로운 전자의무기록 시스템이 도입됩니다. 사용법 교육에 모든 의료진이 참석해주세요.',
            date: '2024-01-25',
            important: true,
        },
        {
            id: 12,
            title: '구내식당 메뉴 개편',
            message:
                '3월부터 구내식당 메뉴가 개편됩니다. 직원들의 의견을 반영하여 더 다양한 건강식이 제공될 예정입니다.',
            date: '2024-01-20',
            important: false,
        },
    ]);

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'alert',
            title: '낙상 감지',
            message: '202호실 장성용 환자에게서 낙상이 감지되었습니다. 즉시 확인이 필요합니다.',
            time: '10:23',
            read: false,
        },
        {
            id: 2,
            type: 'alert',
            title: '환자 상태 이상',
            message: '204호실 조경구 환자의 심박수가 비정상적으로 높습니다. (현재 120회/1분)',
            time: '09:45',
            read: false,
        },
        {
            id: 3,
            type: 'alert',
            title: '환경 알림',
            message: '103호실의 온도가 28°C를 초과했습니다. 실내 온도 조절이 필요합니다.',
            time: '09:30',
            read: true,
        },
        {
            id: 4,
            type: 'info',
            title: '의료진 호출',
            message: '301호실 박민준 환자가 의료진 호출 버튼을 눌렀습니다.',
            time: '09:15',
            read: true,
        },
        {
            id: 5,
            type: 'info',
            title: '투약 알림',
            message: '102호실 박한문 환자의 오전 투약 시간입니다.',
            time: '09:00',
            read: true,
        },
        {
            id: 7,
            type: 'info',
            title: '검사 결과',
            message: '202호실 이충만 환자의 혈액검사 결과가 도착했습니다.',
            time: '08:30',
            read: true,
        },
        {
            id: 8,
            type: 'alert',
            title: '환자 이동',
            message: '308호실 이동 중인 환자가 감지되었습니다. 확인이 필요합니다.',
            time: '08:15',
            read: false,
        },
    ]);

    const [noticeSearchTerm, setNoticeSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // 페이지네이션 상태 추가
    const [currentNoticePage, setCurrentNoticePage] = useState(1);
    const [currentNotificationPage, setCurrentNotificationPage] = useState(1);
    const itemsPerPage = 10; // 고정값으로 변경

    // 페이지 변경 시 1페이지로 리셋
    useEffect(() => {
        setCurrentNoticePage(1);
        setCurrentNotificationPage(1);
    }, [noticeSearchTerm, searchTerm]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedNotifications = React.useMemo(() => {
        if (!sortConfig.key) return notifications;
        return [...notifications].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }, [notifications, sortConfig]);

    const filteredNotifications = sortedNotifications.filter(
        (notification) =>
            notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredNotices = notices.filter(
        (notice) =>
            notice.title.toLowerCase().includes(noticeSearchTerm.toLowerCase()) ||
            notice.message.toLowerCase().includes(noticeSearchTerm.toLowerCase())
    );

    // 페이지네이션 계산
    const indexOfLastNotice = currentNoticePage * itemsPerPage;
    const indexOfFirstNotice = indexOfLastNotice - itemsPerPage;
    const currentNotices = filteredNotices.slice(indexOfFirstNotice, indexOfLastNotice);

    const indexOfLastNotification = currentNotificationPage * itemsPerPage;
    const indexOfFirstNotification = indexOfLastNotification - itemsPerPage;
    const currentNotifications = filteredNotifications.slice(indexOfFirstNotification, indexOfLastNotification);

    const totalNoticePages = Math.ceil(filteredNotices.length / itemsPerPage);
    const totalNotificationPages = Math.ceil(filteredNotifications.length / itemsPerPage);

    // 페이지 변경 함수
    const paginate = (type, pageNumber) => {
        if (type === 'notice') {
            setCurrentNoticePage(pageNumber);
        } else {
            setCurrentNotificationPage(pageNumber);
        }
    };

    // 페이지 네비게이션 렌더링 함수
    const renderPagination = (type, totalPages, currentPage) => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '16px',
                    gap: '8px',
                }}
            >
                <button
                    onClick={() => paginate(type, Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                        padding: '4px 8px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 1 ? 0.5 : 1,
                    }}
                >
                    <ChevronLeft size={16} />
                </button>

                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => paginate(type, 1)}
                            style={{
                                padding: '4px 8px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                            }}
                        >
                            1
                        </button>
                        {startPage > 2 && <span>...</span>}
                    </>
                )}

                {pageNumbers.map((number) => (
                    <button
                        key={number}
                        onClick={() => paginate(type, number)}
                        style={{
                            padding: '4px 10px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            backgroundColor: currentPage === number ? 'rgb(25, 72, 144)' : 'white',
                            color: currentPage === number ? 'white' : '#64748b',
                            cursor: 'pointer',
                        }}
                    >
                        {number}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span>...</span>}
                        <button
                            onClick={() => paginate(type, totalPages)}
                            style={{
                                padding: '4px 8px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                            }}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => paginate(type, Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    style={{
                        padding: '4px 8px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1,
                    }}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        );
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleAdd = () => {
        setModalType('add');
        setFormData({
            title: '',
            message: '',
            date: new Date().toISOString().split('T')[0],
            important: false,
            type: 'info',
            time: '',
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        if (activeTab === 'notices') {
            setModalType('edit');
            setSelectedItem(item);
            setFormData({
                title: item.title,
                message: item.message,
                date: item.date || '',
                important: item.important || false,
                type: item.type || 'info',
                time: item.time || '',
            });
            setIsModalOpen(true);
        }
    };

    const handleDelete = (item) => {
        setModalType('delete');
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (modalType === 'add') {
            const newItem = {
                id: Date.now(),
                ...formData,
            };
            setNotices([...notices, newItem]);
        } else if (modalType === 'edit') {
            setNotices(notices.map((item) => (item.id === selectedItem.id ? { ...item, ...formData } : item)));
        } else if (modalType === 'delete') {
            if (activeTab === 'notices') {
                setNotices(notices.filter((item) => item.id !== selectedItem.id));
            } else {
                setNotifications(notifications.filter((item) => item.id !== selectedItem.id));
            }
        }
        setIsModalOpen(false);
    };

    const handleMarkAllAsRead = () => {
        setNotifications(
            notifications.map((notification) => ({
                ...notification,
                read: true,
            }))
        );
    };

    return (
        <div className="dashboard-container">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                {/* 헤더 섹션 */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 className="dashboard-title">알림 관리</h1>
                    <p className="dashboard-subtitle">모든 알림을 한 곳에서 관리하세요</p>
                </div>

                {/* 네비게이션 탭 */}
                <div
                    style={{
                        display: 'flex',
                        gap: '16px',
                        borderBottom: '1px solid #e2e8f0',
                        marginBottom: '24px',
                    }}
                >
                    <button
                        onClick={() => setActiveTab('notices')}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            borderBottom: activeTab === 'notices' ? '2px solid rgb(25, 72, 144)' : 'none',
                            backgroundColor: 'transparent',
                            color: activeTab === 'notices' ? 'rgb(25, 72, 144)' : '#64748b',
                            fontWeight: activeTab === 'notices' ? '600' : '400',
                            cursor: 'pointer',
                        }}
                    >
                        공지사항
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            borderBottom: activeTab === 'notifications' ? '2px solid rgb(25, 72, 144)' : 'none',
                            backgroundColor: 'transparent',
                            color: activeTab === 'notifications' ? 'rgb(25, 72, 144)' : '#64748b',
                            fontWeight: activeTab === 'notifications' ? '600' : '400',
                            cursor: 'pointer',
                        }}
                    >
                        알림 목록
                    </button>
                </div>

                {/* 통계 카드 */}
                {/* <div className="stats-overview">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <BellRing size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>전체 알림</h3>
                            <p className="stat-value">{notifications.length}개</p>
                            <p className="stat-description">오늘의 알림</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <AlertCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>읽지 않은 알림</h3>
                            <p className="stat-value">{unreadCount}개</p>
                            <p className="stat-change">{unreadCount > 0 ? '확인이 필요합니다' : '모두 확인했습니다'}</p>
                        </div>
                    </div>
                </div> */}

                {activeTab === 'notices' ? (
                    // 공지사항 섹션
                    <div className="room-detail-section" style={{ marginTop: '24px' }}>
                        <div
                            className="section-header"
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <h2>공지사항</h2>
                            <button
                                onClick={handleAdd}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'rgb(25, 72, 144)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                }}
                            >
                                <Plus size={16} />
                                공지사항 추가
                            </button>
                        </div>

                        {/* 검색 필드 */}
                        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search
                                        size={20}
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94a3b8',
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="공지사항 검색..."
                                        value={noticeSearchTerm}
                                        onChange={(e) => setNoticeSearchTerm(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px 8px 40px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '16px' }}>
                            {currentNotices.map((notice) => (
                                <div
                                    key={notice.id}
                                    style={{
                                        padding: '16px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        marginBottom: '12px',
                                        backgroundColor: notice.important ? '#fff1f2' : 'white',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '8px',
                                            }}
                                        >
                                            <Megaphone size={20} color={notice.important ? '#ef4444' : '#64748b'} />
                                            <h3
                                                style={{
                                                    fontSize: '16px',
                                                    fontWeight: '500',
                                                    color: notice.important ? '#ef4444' : '#1e293b',
                                                }}
                                            >
                                                {notice.title}
                                            </h3>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleEdit(notice)}
                                                style={{
                                                    padding: '4px',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#64748b',
                                                }}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(notice)}
                                                style={{
                                                    padding: '4px',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#ef4444',
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{ color: '#64748b', marginBottom: '8px' }}>{notice.message}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Clock size={16} color="#64748b" />
                                        <span style={{ color: '#64748b', fontSize: '14px' }}>{notice.date}</span>
                                    </div>
                                </div>
                            ))}

                            {/* 페이지네이션 추가 */}
                            {filteredNotices.length > 0 ? (
                                renderPagination('notice', totalNoticePages, currentNoticePage)
                            ) : (
                                <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                    검색 결과가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // 알림 목록 섹션
                    <div className="room-detail-section" style={{ marginTop: '24px' }}>
                        <div
                            className="section-header"
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <h2>알림 목록</h2>
                            <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="action-button"
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#f1f5f9',
                                        color: '#64748b',
                                        border: 'none',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Bell size={16} />
                                    <span>모두 읽음 처리</span>
                                </button>
                            </div>
                        </div>

                        {/* 검색 및 필터 */}
                        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search
                                        size={20}
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94a3b8',
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="알림 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px 8px 40px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                        }}
                                    />
                                </div>
                                <button
                                    style={{
                                        padding: '8px 16px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: '#64748b',
                                        backgroundColor: 'white',
                                    }}
                                >
                                    <Filter size={20} />
                                    필터
                                </button>
                            </div>
                        </div>

                        {/* 알림 테이블 */}
                        <div style={{ overflowX: 'auto' }}>
                            <table
                                className="data-table"
                                style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}
                            >
                                <thead>
                                    <tr style={{ height: '48px', background: 'rgb(25, 72, 144)' }}>
                                        <th
                                            style={{
                                                width: '60px',
                                                color: 'white',
                                                fontWeight: 'normal',
                                                fontSize: '15px',
                                                textAlign: 'center',
                                                verticalAlign: 'middle',
                                                padding: 0,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: '48px',
                                                }}
                                            >
                                                상태
                                            </div>
                                        </th>
                                        <th
                                            style={{
                                                width: '110px',
                                                color: 'white',
                                                fontWeight: 'normal',
                                                fontSize: '15px',
                                                textAlign: 'center',
                                                verticalAlign: 'middle',
                                                padding: 0,
                                            }}
                                        >
                                            시간
                                        </th>
                                        <th
                                            style={{
                                                width: '160px',
                                                color: 'white',
                                                fontWeight: 'normal',
                                                fontSize: '15px',
                                                textAlign: 'center',
                                                verticalAlign: 'middle',
                                                padding: 0,
                                            }}
                                        >
                                            제목
                                        </th>
                                        <th
                                            style={{
                                                minWidth: '320px',
                                                color: 'white',
                                                fontWeight: 'normal',
                                                fontSize: '15px',
                                                textAlign: 'center',
                                                verticalAlign: 'middle',
                                                padding: 0,
                                            }}
                                        >
                                            내용
                                        </th>
                                        <th
                                            style={{
                                                width: '70px',
                                                color: 'white',
                                                fontWeight: 'normal',
                                                fontSize: '15px',
                                                textAlign: 'center',
                                                verticalAlign: 'middle',
                                                padding: 0,
                                            }}
                                        >
                                            관리
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentNotifications.map((notification) => (
                                        <tr
                                            key={notification.id}
                                            style={{
                                                backgroundColor: !notification.read ? '#f8fafc' : 'white',
                                                height: '48px',
                                                fontSize: '15px',
                                            }}
                                        >
                                            <td style={{ verticalAlign: 'middle', padding: 0 }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        height: '48px',
                                                    }}
                                                >
                                                    {notification.type === 'alert' ? (
                                                        <AlertCircle size={20} color="#ef4444" />
                                                    ) : (
                                                        <CheckCircle2 size={20} color="#22c55e" />
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: 0 }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        height: '48px',
                                                    }}
                                                >
                                                    <Clock size={16} color="#64748b" />
                                                    <span>{notification.time}</span>
                                                </div>
                                            </td>
                                            <td
                                                style={{
                                                    fontWeight: !notification.read ? '500' : '400',
                                                    textAlign: 'center',
                                                    verticalAlign: 'middle',
                                                    padding: 0,
                                                }}
                                            >
                                                {notification.title}
                                            </td>
                                            <td
                                                style={{
                                                    textAlign: 'left',
                                                    verticalAlign: 'middle',
                                                    padding: '0 12px',
                                                }}
                                            >
                                                {notification.message}
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: 0 }}>
                                                <button
                                                    onClick={() => handleDelete(notification)}
                                                    style={{
                                                        padding: '4px',
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#ef4444',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        margin: '0 auto',
                                                    }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* 페이지네이션 추가 */}
                            {filteredNotifications.length > 0 ? (
                                renderPagination('notification', totalNotificationPages, currentNotificationPage)
                            ) : (
                                <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                    검색 결과가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 모달 */}
            {isModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '24px',
                            borderRadius: '8px',
                            width: '100%',
                            maxWidth: '500px',
                        }}
                    >
                        <h2 style={{ marginBottom: '16px' }}>
                            {modalType === 'add'
                                ? '새로운 ' + (activeTab === 'notices' ? '공지사항' : '알림') + ' 추가'
                                : modalType === 'edit'
                                  ? (activeTab === 'notices' ? '공지사항' : '알림') + ' 수정'
                                  : (activeTab === 'notices' ? '공지사항' : '알림') + ' 삭제'}
                        </h2>

                        {modalType !== 'delete' ? (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmit();
                                }}
                            >
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px' }}>제목</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '4px',
                                        }}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px' }}>내용</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '4px',
                                            minHeight: '100px',
                                        }}
                                        required
                                    />
                                </div>
                                {activeTab === 'notices' ? (
                                    <>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px' }}>날짜</label>
                                            <input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '4px',
                                                }}
                                                required
                                            />
                                        </div>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.important}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, important: e.target.checked })
                                                    }
                                                />
                                                중요 공지사항
                                            </label>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px' }}>시간</label>
                                            <input
                                                type="time"
                                                value={formData.time}
                                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '4px',
                                                }}
                                                required
                                            />
                                        </div>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px' }}>알림 유형</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '4px',
                                                }}
                                            >
                                                <option value="info">일반</option>
                                                <option value="alert">경고</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: '12px',
                                        marginTop: '24px',
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#f1f5f9',
                                            color: '#64748b',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: 'rgb(25, 72, 144)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {modalType === 'add' ? '추가' : '수정'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <p style={{ marginBottom: '24px' }}>
                                    정말로 이 {activeTab === 'notices' ? '공지사항' : '알림'}을 삭제하시겠습니까?
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#f1f5f9',
                                            color: '#64748b',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
