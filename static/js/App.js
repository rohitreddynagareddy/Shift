const App = () => {
  // --- MOCK DATA (Loaded on init) ---
  const initialManagerData = {
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
    teamTickets: [
        { name: 'Rohit', role: 'Development', serviceNow: 5, jira: 8, csat: 92, ticketsResolved: 13, avgResolutionTime: 45 },
        { name: 'Keerthi', role: 'Operations', serviceNow: 3, jira: 12, csat: 98, ticketsResolved: 15, avgResolutionTime: 30 },
        { name: 'Naresh', role: 'DBA', serviceNow: 7, jira: 4, csat: 95, ticketsResolved: 11, avgResolutionTime: 55 },
    ],
    analytics: {
        last30Days: {
            avgResolutionTime: 43,
            firstContactResolution: 85,
            csat: 95,
            ticketVolume: [
                { date: 'Week 1', volume: 110 }, { date: 'Week 2', volume: 140 },
                { date: 'Week 3', volume: 125 }, { date: 'Week 4', volume: 155 },
            ],
            ticketCategories: [
                { name: 'Bug Report', value: 400, color: '#3b82f6' },
                { name: 'Feature Request', value: 300, color: '#10b981' },
                { name: 'Password Reset', value: 180, color: '#f97316' },
                { name: 'Billing Inquiry', value: 120, color: '#8b5cf6' },
            ]
        }
    }
  };
  const initialEngineerData = {
      name: 'Rohit',
      personalPulse: { currentShift: 'Morning', workload: 65, tasksCompleted: 5, tasksPending: 3 },
      weekAhead: [
          { day: 'Mon', shift: 'Morning' }, { day: 'Tue', shift: 'Morning' }, { day: 'Wed', shift: 'Evening' },
          { day: 'Thu', shift: 'Evening' }, { day: 'Fri', shift: 'Off' }, { day: 'Sat', shift: 'Off' }, { day: 'Sun', shift: 'Morning' },
      ],
      myTickets: { serviceNow: 5, jira: 8 },
      myKudos: [ { id: 1, from: 'Naresh', message: 'Thanks for helping with the deployment script.' } ],
      aiAgent: {
          isOnLeave: false,
          tasks: [
              { id: 1, name: 'Send Azure Health Check Mail', status: 'Completed' },
              { id: 2, name: 'Generate Weekly Performance Report', status: 'In Progress' },
          ]
      }
  };

  // --- STATE MANAGEMENT ---
  const [userType, setUserType] = React.useState('manager');
  const [view, setView] = React.useState('home');
  const [uploadedFileName, setUploadedFileName] = React.useState(null);
  const [managerData, setManagerData] = React.useState(null);
  const [engineerData, setEngineerData] = React.useState(null);
  const [isAiAgentActive, setIsAiAgentActive] = React.useState(false);

  React.useEffect(() => {
    setManagerData(initialManagerData);
    setEngineerData(initialEngineerData);
    if (initialEngineerData && initialEngineerData.aiAgent) {
      setIsAiAgentActive(initialEngineerData.aiAgent.isOnLeave);
    }
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

  // --- RENDER LOGIC ---
  const renderView = () => {
    if (userType === 'manager') {
      switch (view) {
        case 'home':
          return <ManagerDashboard managerData={managerData} />;
        case 'roster':
          return <AIRosterGenerator />;
        case 'analytics':
          return <TeamAnalytics managerData={managerData} />;
        case 'schedule':
          return <ScheduleManager managerData={managerData} />;
        default:
          return <div className="p-8">Page not yet implemented: {view}</div>;
      }
    } else { // Engineer view
      switch (view) {
        case 'home':
          return <EngineerDashboard engineerData={engineerData} isAiAgentActive={isAiAgentActive} handleSetAiAgentActive={handleSetAiAgentActive} />;
        case 'schedule':
          return <EngineerSchedule engineerData={engineerData} />;
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
          {(managerData && engineerData) ? renderView() : <div className="p-8">Loading...</div>}
        </main>
      </div>
    </div>
  );
};
window.App = App;
