import React, { useState, useEffect } from 'react';
import '../styles/components/Menu.css';

const Menu = () => {
    const [menuList, setMenuList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // 샘플 데이터 생성
        const fetchMenuData = () => {
            setLoading(true);

            // 샘플 메뉴 데이터
            const sampleData = [
                {
                    id: 1,
                    title: '2025년 5월 둘째주 식단표',
                    date: '2025-05-08',
                    writer: '영양사',
                    views: 42,
                },
                {
                    id: 2,
                    title: '2025년 5월 첫째주 식단표',
                    date: '2025-05-02',
                    writer: '영양사',
                    views: 68,
                },
                {
                    id: 3,
                    title: '2025년 4월 다섯째주 식단표',
                    date: '2025-04-24',
                    writer: '영양사',
                    views: 53,
                },
                {
                    id: 4,
                    title: '2025년 4월 넷째주 식단표',
                    date: '2025-04-18',
                    writer: '영양사',
                    views: 61,
                },
                {
                    id: 5,
                    title: '2025년 4월 셋째주 식단표',
                    date: '2025-04-11',
                    writer: '영양사',
                    views: 47,
                },
                {
                    id: 6,
                    title: '2025년 4월 둘째주 식단표',
                    date: '2025-04-05',
                    writer: '영양사',
                    views: 55,
                },
                {
                    id: 7,
                    title: '2025년 4월 첫째주 식단표',
                    date: '2025-03-29',
                    writer: '영양사',
                    views: 72,
                },
                {
                    id: 8,
                    title: '2025년 3월 넷째주 식단표',
                    date: '2025-03-22',
                    writer: '영양사',
                    views: 49,
                },
                {
                    id: 9,
                    title: '2025년 3월 셋째주 식단표',
                    date: '2025-03-15',
                    writer: '영양사',
                    views: 58,
                },
                {
                    id: 10,
                    title: '2025년 3월 둘째주 식단표',
                    date: '2025-03-08',
                    writer: '영양사',
                    views: 63,
                },
            ];

            setMenuList(sampleData);
            setLoading(false);
        };

        fetchMenuData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        // 실제 검색 기능은 구현되지 않았지만, 검색어는 상태에 저장됨
        console.log('검색어:', searchTerm);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(
            2,
            '0'
        )}`;
    };

    return (
        <div className="menu-board-container">
            <h1 className="menu-board-title">주간식단표</h1>

            <div className="menu-board-search">
                <form onSubmit={handleSearch}>
                    <select className="search-category">
                        <option value="제목">제목</option>
                        <option value="내용">내용</option>
                        <option value="작성자">작성자</option>
                    </select>
                    <input
                        type="text"
                        placeholder="검색어(제목)"
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="search-button">
                        검색
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="loading">
                    <p>식단표 목록 불러오는 중...</p>
                </div>
            ) : (
                <>
                    <div className="menu-board-info">
                        <span>전체 {menuList.length}건 1 페이지</span>
                    </div>

                    <table className="menu-board-table">
                        <thead>
                            <tr>
                                <th className="menu-board-no">번호</th>
                                <th className="menu-board-title-col">제목</th>
                                <th className="menu-board-writer">작성자</th>
                                <th className="menu-board-date">작성일</th>
                                <th className="menu-board-views">조회</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuList.map((item) => (
                                <tr key={item.id}>
                                    <td className="menu-board-no">{item.id}</td>
                                    <td className="menu-board-title-col">
                                        <a href={`#/menu/${item.id}`}>{item.title}</a>
                                    </td>
                                    <td className="menu-board-writer">{item.writer}</td>
                                    <td className="menu-board-date">{formatDate(item.date)}</td>
                                    <td className="menu-board-views">{item.views}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="menu-board-pagination">
                        <a href="#" className="pagination-arrow">
                            &lt;
                        </a>
                        <a href="#" className="pagination-number active">
                            1
                        </a>
                        <a href="#" className="pagination-number">
                            2
                        </a>
                        <a href="#" className="pagination-number">
                            3
                        </a>
                        <a href="#" className="pagination-number">
                            4
                        </a>
                        <a href="#" className="pagination-number">
                            5
                        </a>
                        <a href="#" className="pagination-arrow">
                            &gt;
                        </a>
                    </div>
                </>
            )}
        </div>
    );
};

export default Menu;
