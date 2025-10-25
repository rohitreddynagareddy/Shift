const App = () => {
  // --- STATE MANAGEMENT ---
  const [userType, setUserType] = React.useState('manager');
  const [view, setView] = React.useState('home');
  const [uploadedFileName, setUploadedFileName] = React.useState(null);
  const [employees, setEmployees] = React.useState([]);
  const [engineerData, setEngineerData] = React.useState(null); // Keep engineer data for now
  const [isAiAgentActive, setIsAiAgentActive] = React.useState(false);
  const [uploadError, setUploadError] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch('/api/employees');
        if (!response.ok) throw new Error('Failed to fetch employees');
        const employeesData = await response.json();
        setEmployees(employeesData);

        // Mock engineer data for now
        const initialEngineerData = {
            name: 'Rohit',
            personalPulse: { currentShift: 'Morning', workload: 65, tasksCompleted: 5, tasksPending: 3 },
            weekAhead: [
                { day: 'Mon', shift: 'Morning' }, { day: 'Tue', shift: 'Morning' }, { day: 'Wed', shift: 'Evening' },
                { day: 'Thu', shift: 'Evening' }, { day: 'Fri', shift: 'Off' }, { day: 'Sat', shift: 'Off' }, { day: 'Sun', shift: 'Morning' },
            ],
            myTickets: { serviceNow: 5, jira: 8 },
            myKudos: [ { id: 1, from: 'Naresh', message: 'Thanks for helping with the deployment script.' } ],
            aiAgent: { isOnLeave: false }
        };
        setEngineerData(initialEngineerData);
        setIsAiAgentActive(initialEngineerData.aiAgent.isOnLeave);

      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // --- EVENT HANDLERS ---
  const handleSwitchUserType = () => {
    setUserType(prevType => {
      const newType = prevType === 'manager' ? 'engineer' : 'manager';
      setView('home');
      return newType;
    });
  };

  const handleNavigate = (newView) => {
    setView(newView);
  };

  const handleSetAiAgentActive = (isActive) => {
    setIsAiAgentActive(isActive);
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/employees/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'File upload failed');
      }

      const result = await response.json();
      setEmployees(result.employees);
      setUploadedFileName(result.fileName);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(error.message);
      setUploadedFileName(null); // Clear filename on error
    } finally {
      setIsUploading(false);
    }
  };

  // --- RENDER LOGIC ---
  const renderView = () => {
    if (userType === 'manager') {
      switch (view) {
        case 'home':
          return <DashboardPage employees={employees} />;
        case 'roster':
          return <AIRosterGenerator
            members={employees}
            fileName={uploadedFileName}
            onFileUpload={handleFileUpload}
            uploadError={uploadError}
            isUploading={isUploading}
          />;
        case 'analytics':
          // Passing employees to analytics, assuming it can work with that
          return <TeamAnalytics managerData={{ teamTickets: employees }} />;
        case 'schedule':
           // Passing employees to schedule manager
          return <ScheduleManager managerData={{ teamTickets: employees }} />;
        case 'gamification':
          return <ManagerGamificationPage employees={employees} />;
        case 'leaderboard':
          return <Leaderboard />;
        default:
          return <div className="p-8">Page not yet implemented: {view}</div>;
      }
    } else { // Engineer view
      switch (view) {
        case 'home':
          return <EngineerDashboard engineerData={engineerData} isAiAgentActive={isAiAgentActive} handleSetAiAgentActive={handleSetAiAgentActive} />;
        case 'schedule':
          return <EngineerSchedule engineerData={engineerData} />;
        case 'gamification':
            return <GamificationDashboard engineerName={engineerData ? engineerData.name : ''} />;
        case 'leaderboard':
            return <Leaderboard />;
        case 'request':
          return <RequestPage handleSetAiAgentActive={handleSetAiAgentActive} />;
        default:
          return <div className="p-8">Page not yet implemented: {view}</div>;
      }
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar
        userType={userType}
        uploadedFileName={uploadedFileName}
        activeView={view}
        onNavigate={handleNavigate}
      />
      <div className="flex-1 flex flex-col">
        <Header
          userType={userType}
          engineerName={engineerData ? engineerData.name : ''}
          onSwitchUserType={handleSwitchUserType}
        />
        <main className="flex-1 overflow-y-auto">
          {loading ? <div className="p-8">Loading...</div> : renderView()}
        </main>
      </div>
    </div>
  );
};
