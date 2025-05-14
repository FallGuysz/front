import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Home,
    Users,
    BedDouble,
    Activity,
    Thermometer,
    Bell,
    ClipboardList,
    Calendar,
    Eye,
    Settings,
    UserCog,
    MessageSquare,
    LogOut,
    User,
    LogIn,
    Utensils,
    Map,
    AlertTriangle,
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

const navItems = [
    {
        title: null,
        items: [
            { path: '/', label: '홈', icon: Home },
            { path: '/dashboard', label: '대시보드', icon: LayoutDashboard },

            { path: '/fall-incidents', label: '낙상 감지', icon: AlertTriangle },
            { path: '/environmental', label: '생활실 모니터링', icon: Thermometer },
        ],
    },
    {
        title: '병동 관리',
        items: [
            { path: '/rooms', label: '병실 관리', icon: BedDouble },
            { path: '/patients', label: '환자 목록', icon: Users },
            { path: '/schedule', label: '일정 관리', icon: Calendar },
        ],
    },
    {
        title: '소식',
        items: [
            { path: '/notifications', label: '공지사항', icon: Eye },
            { path: '/menu', label: '주간 식단표', icon: Utensils },
            { path: '/location', label: '찾아오시는 길', icon: Map },
            { path: '/settings', label: '설정', icon: Settings },
        ],
    },
];

const styles = {
    nav: {
        width: '280px',
        height: '100vh',
        backgroundColor: '#ffffff',
        boxShadow: '1px 0 0 0 rgba(0,0,0,0.05)',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
    },
    brand: {
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
    },
    brandIcon: {
        width: '32px',
        height: '32px',
        backgroundColor: '#f1f5f9',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#2563eb',
    },
    brandTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b',
        margin: 0,
    },
    section: {
        padding: '16px 0',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
    },
    sectionTitle: {
        fontSize: '12px',
        fontWeight: '500',
        color: '#64748b',
        padding: '0 20px 8px 20px',
        margin: 0,
    },
    menu: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    menuItem: {
        margin: '2px 0',
    },
    link: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 20px',
        color: '#64748b',
        textDecoration: 'none',
        fontSize: '14px',
        transition: 'all 0.2s',
        position: 'relative',
    },
    activeLink: {
        color: '#2563eb',
        backgroundColor: '#eff6ff',
        fontWeight: '500',
    },
    icon: {
        width: '20px',
        marginRight: '12px',
        color: 'inherit',
    },
    footer: {
        marginTop: 'auto',
        padding: '16px 20px',
        borderTop: '1px solid rgba(0,0,0,0.05)',
    },
    profile: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 0',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: '20px',
        fontWeight: '500',
        color: '#1e293b',
        margin: 0,
    },
    // profileRole: {
    //     fontSize: '12px',
    //     color: '#64748b',
    //     margin: 0,
    // },
    logoutButton: {
        background: 'none',
        border: 'none',
        padding: '8px',
        cursor: 'pointer',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        transition: 'all 0.2s',
        marginLeft: 'auto',
    },
};

const Navbar = () => {
    const { isLoggedIn, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    return (
        <nav style={styles.nav}>
            <div style={styles.brand}>
                <div style={styles.brandIcon}>
                    <Activity size={20} />
                </div>
                <h1 style={styles.brandTitle}>스마트 케어</h1>
            </div>

            {navItems.map((section, index) => (
                <div key={index} style={styles.section}>
                    {section.title && <h2 style={styles.sectionTitle}>{section.title}</h2>}
                    <ul style={styles.menu}>
                        {section.items.map((item) => (
                            <li key={item.path} style={styles.menuItem}>
                                <NavLink
                                    to={item.path}
                                    style={({ isActive }) => ({
                                        ...styles.link,
                                        ...(isActive ? styles.activeLink : {}),
                                    })}
                                >
                                    <item.icon style={styles.icon} size={20} />
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            <div style={styles.footer}>
                <div style={styles.profile}>
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <User size={20} color="#64748b" />
                    </div>
                    <div style={styles.profileInfo}>
                        <p style={styles.profileName}>{user?.user_name || user?.name || '사용자'}</p>
                        {/* <p style={styles.profileRole}>{user?.user_role || user?.role || '사용자'}</p> */}
                    </div>
                    <button style={styles.logoutButton} onClick={logout}>
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
