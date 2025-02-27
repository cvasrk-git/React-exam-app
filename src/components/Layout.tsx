import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/LoginSuccess.module.css';

interface LayoutProps {
  children: React.ReactNode;
  activeMenu?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeMenu }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={styles.mainContainer}>
      <header className={styles.header}>
        <h1>Exam Portal</h1>
        <div className={styles.userInfo}>
          <span>Welcome, {user.email || "User"}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className={styles.contentSection}>
        <nav className={styles.sideMenu}>
          <ul>
            <li>
              <button 
                className={activeMenu === 'dashboard' ? styles.activeMenu : ''}
                onClick={() => navigate("/login-success")}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button 
                className={`${activeMenu === 'exam' ? styles.activeMenu : ''} ${styles.examButton} ${styles.primaryButton}`}
                onClick={() => navigate("/topics")}
              >
                Take Exam
              </button>
            </li>
            <li>
              <button 
                className={activeMenu === 'results' ? styles.activeMenu : ''}
                onClick={() => navigate("/results")}
              >
                View Results
              </button>
            </li>
            <li>
              <button 
                className={activeMenu === 'profile' ? styles.activeMenu : ''}
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>
            </li>
          </ul>
        </nav>

        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
