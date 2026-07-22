import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ClientManager } from './components/ClientManager';
import { CalendarView } from './components/CalendarView';
import { DashboardView } from './components/DashboardView';

function App() {
  const [activeView, setActiveView] = useState<string>('clients');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="main-content">
        {activeView === 'clients' && (
          <ClientManager onRefreshCitas={triggerRefresh} />
        )}
        {activeView === 'calendar' && (
          <CalendarView refreshTrigger={refreshTrigger} />
        )}
        {activeView === 'dashboard' && (
          <DashboardView refreshTrigger={refreshTrigger} />
        )}
      </main>
    </div>
  );
}

export default App;
