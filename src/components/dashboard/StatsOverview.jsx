import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Clock, Users, AlertTriangle, Activity } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const API_BASE_URL = 'http://localhost:3000';

export default function StatsOverview() {
    const [stats, setStats] = useState({
        totalPatients: 0,
        highRiskPatients: 0,
        fallsThisMonth: 0,
        avgResponseTime: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadStats() {
            try {
                const [pRes, fRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/patients`).then((r) => r.json()),
                    fetch(`${API_BASE_URL}/fall-incidents`).then((r) => r.json()),
                ]);
                const patients = pRes.data || [];
                const total = patients.length;
                const falls = fRes.data || [];
                const now = new Date();
                const curMonth = now.getMonth();
                const curYear = now.getFullYear();
                const fallsThisMonth = falls.filter((f) => {
                    const d = new Date(f.accident_date);
                    return f.accident_YN === 'Y' && d.getMonth() === curMonth && d.getFullYear() === curYear;
                }).length;
                const highRiskSet = new Set(falls.filter((f) => f.accident_YN === 'Y').map((f) => f.patient_id));
                setStats({
                    totalPatients: total,
                    highRiskPatients: highRiskSet.size,
                    fallsThisMonth: fallsThisMonth,
                    avgResponseTime: null,
                });
            } catch (err) {
                console.error('StatsOverview load error:', err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        }

        loadStats();
    }, []);

    const items = [
        {
            name: '총 환자 수',
            value: stats.totalPatients,
            icon: Users,
            color: 'rgb(25,72,144)',
            bgColor: 'rgba(25,72,144,0.1)',
        },
        {
            name: '낙상 위험 환자',
            value: stats.highRiskPatients,
            icon: AlertTriangle,
            color: 'rgb(220,53,69)',
            bgColor: 'rgba(220,53,69,0.1)',
        },
        {
            name: '이번 달 낙상 횟수',
            value: stats.fallsThisMonth,
            icon: Activity,
            color: 'rgb(139,92,246)',
            bgColor: 'rgba(139,92,246,0.1)',
        },
        {
            name: '평균 대응 시간',
            value: stats.avgResponseTime ?? '—',
            icon: Clock,
            color: 'rgb(249,115,22)',
            bgColor: 'rgba(249,115,22,0.1)',
        },
    ];

    return (
        <div className="pb-5 mt-2 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">개요</h3>
            <div className="grid grid-cols-1 gap-5 mt-2 sm:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    items.map((_, idx) => (
                        <Card key={idx} className="overflow-hidden shadow">
                            <CardContent className="p-5">
                                <Skeleton className="h-8 w-full mb-2" />
                                <Skeleton className="h-8 w-1/2" />
                            </CardContent>
                        </Card>
                    ))
                ) : error ? (
                    <p className="col-span-4 text-center text-red-500">통계 로드 실패</p>
                ) : (
                    items.map((item, index) => (
                        <Card key={index} className="overflow-hidden shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center">
                                    <div className="p-2 mr-6 rounded-full" style={{ backgroundColor: item.bgColor }}>
                                        <item.icon className="w-6 h-6" style={{ color: item.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-500 truncate">{item.name}</p>
                                        <p className="mt-1 text-3xl font-semibold text-gray-900">{item.value}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
