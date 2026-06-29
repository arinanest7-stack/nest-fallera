import React from 'react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <span className="logo-icon">🪡</span>
        <span className="logo-text">Fallera Nest</span>
      </div>
      
      <nav>
        <ul className="nav-links">
          <li className="nav-item">
            <button
              onClick={() => setActiveView('clients')}
              className={`nav-button ${activeView === 'clients' ? 'active' : ''}`}
            >
              <svg
                className="nav-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Clientes y Trajes
            </button>
          </li>
          
          <li className="nav-item">
            <button
              onClick={() => setActiveView('calendar')}
              className={`nav-button ${activeView === 'calendar' ? 'active' : ''}`}
            >
              <svg
                className="nav-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Calendario
            </button>
          </li>

          <li className="nav-item">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`nav-button ${activeView === 'dashboard' ? 'active' : ''}`}
            >
              <svg
                className="nav-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              Dashboard
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};
