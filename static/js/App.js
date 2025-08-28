const App = () => {
  // --- STATE MANAGEMENT ---
  const [userType, setUserType] = React.useState('manager');
  const [view, setView] = React.useState('home');
  const [uploadedFileName, setUploadedFileName] = React.useState(null);

  // We'll use the initial mock data from the old app.js.
  const [managerData, setManagerData] = React.useState(null);
  const [engineerData, setEngineerData] = React.useState({ name: 'Rohit' });

  // --- MOCK DATA ---
  // In a real app, this would come from an API call.
  // Here, we load it once when the component mounts.
  React.useEffect(() => {
    setManagerData({
        operationalPulse: {
            kpiAdherence: { value: 96, color: 'text-green-500', bgColor: 'bg-green-500', icon: 'Target' },
            staffingLevel: { value: 90, color: 'text-blue-500', bgColor: 'bg-blue-500', icon: 'UserCheck' },
            teamWorkload: { value: 75, color: 'text-orange-500', bgColor: 'bg-orange-500', icon: 'Activity' },
            burnoutRisk: { value: 40, color: 'text-red-500', bgColor: 'bg-red-500', icon: 'Heart' },
        },
        futureCast: [
            { id: 1, type: 'Pinch Point', severity: 'High', title: 'High Ticket Volume Predicted', details: 'AI predicts a 40% spike in Jira tickets on Friday at 3 PM due to new feature deployment.', recommendation: 'Place Naresh on a paid standby shift.', icon: 'TrendingUp' },
            { id: 2, type: 'Burnout', severity: 'Medium', title: 'Burnout Forecast', details: 'Keerthi has worked 5 consecutive evening shifts.', recommendation: 'Assign her a morning shift on Thursday.', icon: 'Heart' },
            { id: 3, type: 'Skill Gap', severity: 'Low', title: 'Skill Mismatch', details: 'A critical "Azure Database" task is scheduled for Rohit, but his skill confidence is low.', recommendation: 'Initiate a smart swap with Keerthi.', icon: 'Zap' },
        ],
        teamWellness: {
            shiftBalanceScore: 'A+',
            kudos: [
                { id: 1, from: 'Manager', to: 'Keerthi', message: 'Resolved a P1 ticket in under 30 minutes!' },
                { id: 2, from: 'Naresh', to: 'Rohit', message: 'Thanks for helping with the deployment script.' }
            ],
            upcomingLeave: [ { name: 'Rohit', days: 3 } ]
        },
    });
  }, []);


  // --- EVENT HANDLERS ---
  const handleSwitchUserType = () => {
    setUserType(prevType => prevType === 'manager' ? 'engineer' : 'manager');
    setView('home'); // Reset to home view on user type switch
  };

  const handleNavigate = (newView) => {
    setView(newView);
  };

  // --- RENDER LOGIC ---
  const renderView = () => {
    // For now, we only have the manager dashboard.
    // We will add the other views later.
    if (userType === 'manager') {
      switch (view) {
        case 'home':
          return <ManagerDashboard managerData={managerData} />;
        case 'roster':
          return <AIRosterGenerator />;
        default:
          return <div className="p-8">Page not yet implemented: {view}</div>;
      }
    } else {
      return <div className="p-8">Engineer views not yet implemented.</div>;
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
          engineerName={engineerData.name}
          onSwitchUserType={handleSwitchUserType}
        />
        <main className="flex-1 overflow-y-auto">
          {managerData ? renderView() : <div className="p-8">Loading...</div>}
        </main>
      </div>
    </div>
  );
};
