import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserPlus, AlertTriangle, Pill, Thermometer, BookOpen } from 'lucide-react'; // 알약 아이콘 추가
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

// 임시 데이터
const mockActivities = [
    {
        id: 1,
        type: 'fall_alert',
        description: '<strong>최태분</strong> 환자의 오후 투약 시간입니다',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        patientId: 101,
        patientName: '김영희',
        room: '201',
        status: 'detected',
    },
    {
        id: 2,
        type: 'patient_added',
        description: '<strong>박민준</strong> 환자가 등록되었습니다',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        patientId: 102,
        patientName: '이철수',
    },
    {
        id: 3,
        type: 'risk_updated',
        description: '<strong>손도리</strong> 환자의 낙상 위험도가 <strong>고위험군</strong>으로 변경되었습니다',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        patientId: 103,
        patientName: '박지민',
    },
    {
        id: 4,
        type: 'book',
        description: '<strong>교육 안내</strong> <br>6월 20일 10시, 자원봉사자 교육 진행예정',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        status: 'resolved',
    },
    {
        id: 5,
        type: 'temperature_alert',
        description: '<strong>온도 초과</strong> <br>102호 실내 온도 조절이 필요합니다.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
];

export default function RecentActivity() {
    const navigate = useNavigate();
    const [activities] = useState(mockActivities);
    const [isLoading] = useState(false);

    const getActivityIcon = (type) => {
        switch (type) {
            case 'fall_alert':
                return (
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full ring-8 ring-white">
                        <Pill className="w-6 h-6 text-blue-600" /> {/* 알약 아이콘 */}
                    </div>
                );
            case 'patient_added':
                return (
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full ring-8 ring-white">
                        <UserPlus className="w-6 h-6 text-green-600" />
                    </div>
                );
            case 'risk_updated':
                return (
                    <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full ring-8 ring-white">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                );
            case 'temperature_alert':
                return (
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full ring-8 ring-white">
                        <Thermometer className="w-6 h-6 text-red-600" />
                    </div>
                );
            case 'book':
                return (
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full ring-8 ring-white">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                );
            default:
                return (
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full ring-8 ring-white">
                        <Pill className="w-6 h-6 text-gray-600" />
                    </div>
                );
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays === 1) return '어제';
        return `${diffDays}일 전`;
    };

    return (
        <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">최근 활동</h3>
            <div className="flow-root mt-2">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex space-x-3">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="flex-1">
                                    <Skeleton className="w-full h-4 mb-2" />
                                    <Skeleton className="w-1/3 h-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <ul className="-mb-8">
                        {activities.slice(0, 5).map((activity, activityIdx) => (
                            <li key={activity.id}>
                                <div className="relative pb-8">
                                    {activityIdx !== activities.length - 1 ? (
                                        <span
                                            className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                    <div className="relative flex items-start space-x-3">
                                        <div className="relative">{getActivityIcon(activity.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-gray-500">
                                                <span dangerouslySetInnerHTML={{ __html: activity.description }} />
                                                {activity.room && (
                                                    <span className="whitespace-nowrap"> - {activity.room}호실</span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-sm text-gray-500">
                                                {formatTime(activity.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="mt-6">
                <Button
                    variant="outline"
                    className="w-full hover:bg-gray-100"
                    onClick={() => navigate('/notifications')}
                >
                    모두 보기
                </Button>
            </div>
        </div>
    );
}
