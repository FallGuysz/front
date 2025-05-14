import React, { useEffect, useRef } from 'react';
import '../styles/components/Location.css';

const Location = () => {
    const mapContainerRef = useRef(null);

    useEffect(() => {
        // Kakao 맵 API가 로드되었는지 확인
        const kakao = window.kakao;

        if (kakao && kakao.maps) {
            const mapContainer = mapContainerRef.current;
            const mapOption = {
                center: new kakao.maps.LatLng(35.8468, 128.6334), // 대구 좌표 (실제 병원 위치)
                level: 3,
            };

            const map = new kakao.maps.Map(mapContainer, mapOption);

            // 마커 위치
            const markerPosition = new kakao.maps.LatLng(35.8468, 128.6334);

            // 마커 생성
            const marker = new kakao.maps.Marker({
                position: markerPosition,
            });

            // 마커 표시
            marker.setMap(map);

            // 줌 컨트롤 생성
            const zoomControl = new kakao.maps.ZoomControl();
            map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
        } else {
            console.error('Kakao 지도 API가 로드되지 않았습니다.');
        }
    }, []);

    return (
        <div className="location-container">
            <h1 className="location-title">찾아오시는 길</h1>

            <div className="kakao-map-container">
                <div id="kakaomap" ref={mapContainerRef} className="kakao-map">
                    {/* 카카오맵이 로드됩니다 */}
                </div>
                <div className="map-copyright">
                    <span>kakao</span>
                    <span className="map-scale">500m</span>
                </div>
                <div className="map-controls">
                    <a href="#" className="map-control-link">
                        로드뷰
                    </a>
                    <a href="#" className="map-control-link">
                        길찾기
                    </a>
                    <a href="#" className="map-control-link">
                        지도 크게 보기
                    </a>
                </div>
            </div>

            <div className="location-info-container">
                <table className="location-info-table">
                    <tbody>
                        <tr>
                            <th className="info-header">주소</th>
                            <td className="info-content">[42985]대구광역시 달성군 논공읍 논공로 210</td>
                            <th className="info-header">전화</th>
                            <td className="info-content">053)616-2141</td>
                            <th className="info-header">팩스</th>
                            <td className="info-content">053)615-2603</td>
                        </tr>
                    </tbody>
                </table>

                <div className="transportation-container">
                    <div className="transportation-section">
                        <div className="transportation-icon-container">
                            <div className="transportation-icon bus-icon"></div>
                        </div>
                        <div className="transportation-details">
                            <h3 className="transportation-title">대중교통 이용 시</h3>
                            <p className="transportation-subtitle">(성서역곡역에서부터 30분정도 소요)</p>
                            <p className="transportation-info">
                                지하철 1호선 성서역곡역(7번 출구)에서 시내버스(급행4번)으로 환승 →
                            </p>
                            <p className="transportation-info">
                                '성서삼성맨션' 정류장에서 하차 → 도보(100M정도) → 대구가톨릭요양원 도착
                            </p>
                        </div>
                    </div>

                    <div className="transportation-section">
                        <div className="transportation-icon-container">
                            <div className="transportation-icon car-icon"></div>
                        </div>
                        <div className="transportation-details">
                            <h3 className="transportation-title">자가용 이용 시</h3>
                            <p className="transportation-subtitle">(네비게이션에 "대구가톨릭요양원" 검색)</p>
                            <p className="transportation-info">
                                * 자가용 이용 시 (네비게이션에 "대구가톨릭요양원" 검색)
                            </p>
                            <p className="transportation-info">1. 고속도로</p>
                            <p className="transportation-info">
                                대구 → 구마고속도로 → 담실 IC → 담성산업단지 진입로 → 첫 신호등에서 좌회전 → 계속 직진 →
                                대구가톨릭요양원 도착
                            </p>
                            <p className="transportation-info">* 성서삼성맨션 지나 붉은색 벽돌 건물까지 올라오세요!</p>
                            <p className="transportation-info">2. 국도</p>
                            <p className="transportation-info">
                                대구 → 화원 → 의성삼거리에서 현풍방향 → 박석진교 사거리에서 좌회전 → 계속 직진 →
                                대구가톨릭요양원 도착
                            </p>
                            <p className="transportation-info">* 성서삼성맨션 지나 붉은색 벽돌 건물까지 올라오세요!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Location;
