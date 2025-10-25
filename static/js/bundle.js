const KpiCards = ({ kpis }) => {
  const kpiData = [
    { title: 'Kpi Adherence', value: `${kpis.kpiAdherence}%`, color: 'bg-green-500' },
    { title: 'Staffing Level', value: `${kpis.staffingLevel}%`, color: 'bg-blue-500' },
    { title: 'Team Workload', value: `${kpis.teamWorkload}%`, color: 'bg-orange-500' },
    { title: 'Burnout Risk', value: `${kpis.burnoutRisk}%`, color: 'bg-red-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">{kpi.title}</h3>
          <p className="text-4xl font-bold text-gray-800 my-2">{kpi.value}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`${kpi.color} h-2.5 rounded-full`} style={{ width: kpi.value }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const FutureCastRadar = ({ alerts }) => {
  const alertColors = {
    'High Ticket Volume Predicted': 'border-red-500',
    'Burnout Forecast': 'border-orange-500',
    'Skill Mismatch': 'border-blue-500',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Future-Cast Radar (Next 72 Hours)</h3>
      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${alertColors[alert.type] || 'border-gray-500'}`}>
            <p className="font-bold text-gray-700">{alert.type}</p>
            <p className="text-gray-600 my-1">{alert.message}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-blue-600 font-semibold">{alert.action}</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Take Action
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TeamWellness = ({ wellnessData }) => {
  const { shiftFairnessScore, kudos, upcomingTimeOff } = wellnessData;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Team Wellness & Engagement</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shift Fairness Score */}
        <div className="text-center">
          <p className="text-gray-600 font-semibold">Shift Fairness Score</p>
          <p className="text-6xl font-bold text-green-500 my-2">{shiftFairnessScore}</p>
          <p className="text-sm text-gray-500">Based on weekend & evening shift distribution.</p>
        </div>

        {/* Kudos Corner */}
        <div>
          <p className="text-gray-600 font-semibold mb-2">Kudos Corner</p>
          <div className="space-y-2">
            {kudos.map((kudo, index) => (
              <div key={index} className="bg-yellow-100 p-3 rounded-lg">
                <p className="text-sm text-gray-800">
                  <span className="font-bold">{kudo.from} to {kudo.to}:</span> {kudo.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Time Off */}
        <div>
          <p className="text-gray-600 font-semibold mb-2">Upcoming Time Off</p>
          <div className="space-y-2">
            {upcomingTimeOff.map((leave, index) => (
              <div key={index} className="flex items-center space-x-2">
                <i className="lucide-calendar-off text-gray-500"></i>
                <p className="text-sm text-gray-700">{leave.name}'s vacation starts in {leave.daysUntil} days!</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = ({ employees }) => {
  const [kpis, setKpis] = React.useState(null);
  const [alerts, setAlerts] = React.useState(null);
  const [wellnessData, setWellnessData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [kpisRes, alertsRes, wellnessRes] = await Promise.all([
          fetch('/api/dashboard/kpis'),
          fetch('/api/dashboard/radar'),
          fetch('/api/dashboard/wellness')
        ]);

        if (!kpisRes.ok || !alertsRes.ok || !wellnessRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const kpisData = await kpisRes.json();
        const alertsData = await alertsRes.json();
        const wellnessData = await wellnessRes.json();

        setKpis(kpisData);
        setAlerts(alertsData);
        setWellnessData(wellnessData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manager's Command Center</h1>
      {kpis && <KpiCards kpis={kpis} />}
      <div className="lg:flex lg:space-x-6 mt-6">
        <div className="lg:w-2/3">
          {alerts && <FutureCastRadar alerts={alerts} />}
        </div>
        <div className="lg:w-1/3">
          {wellnessData && <TeamWellness wellnessData={wellnessData} />}
        </div>
      </div>
      <AwardPoints employees={employees} />
    </div>
  );
};

const AIRosterGenerator = ({ onUploadSuccess, addNotification }) => {
  const [isRosterLoading, setIsRosterLoading] = React.useState(false);
  const [rosterError, setRosterError] = React.useState(null);
  const [generatedRoster, setGeneratedRoster] = React.useState(null);
  const [constraints, setConstraints] = React.useState('');
  const [members, setMembers] = React.useState([]);
  const [fileName, setFileName] = React.useState('');

  const Icon = (name, props = {}) => {
      const { size = 20, className = '' } = props;
      const camelCaseName = name.charAt(0).toLowerCase() + name.slice(1).replace(/-(\w)/g, g => g[1].toUpperCase());
      const iconNode = lucide.icons[camelCaseName];
      if (!iconNode) {
          console.warn(`Lucide icon not found: ${name} (as ${camelCaseName})`);
          return <span className={className}><svg width={size} height={size}></svg></span>;
      }
      return <span className={className} dangerouslySetInnerHTML={{ __html: iconNode.toSvg({ width: size, height: size }) }} />;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/employees/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        setMembers(data.employees.map(emp => ({
            Name: emp.name,
            Role: emp.role,
            Project: emp.project,
            CostCenter: emp.costCenter
        })));
        setRosterError(null);
        addNotification(data.message, 'success');
        if (data.roster) {
            setGeneratedRoster(data.roster);
        }
        if (onUploadSuccess) {
            onUploadSuccess();
        }
    } catch (error) {
        setRosterError(`Error uploading file: ${error.message}`);
        addNotification(`Error uploading file: ${error.message}`, 'error');
        setMembers([]);
        setFileName('');
    }
  };

  const handleGenerateRoster = async () => {
    setIsRosterLoading(true);
    setRosterError(null);
    setGeneratedRoster(null);

    if (members.length === 0) {
        setRosterError("No employee data found. Please upload an Excel file with employee details.");
        setIsRosterLoading(false);
        return;
    }

    try {
        const response = await fetch('/api/generate_roster', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ members, constraints }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const roster = await response.json();
        setGeneratedRoster(roster);
    } catch (err) {
        setRosterError(err.message);
    } finally {
        setIsRosterLoading(false);
    }
  };

  const excelUploadSection = (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Upload Employee Roster</h2>
        <p className="text-gray-600 mb-4">Upload an Excel file (.xlsx, .xls) with an "Employees" sheet. Required columns: <strong>Name</strong>, <strong>Role</strong>, <strong>Project</strong>, and <strong>Cost Center</strong>.</p>
        <div className="flex items-center space-x-4">
            <label className="file-input-button bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 inline-flex items-center">
                {Icon('Upload', {size: 20, className: 'mr-2'})}
                <span>Choose File</span>
                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
            </label>
            <span className="text-gray-600">{fileName || 'No file chosen'}</span>
        </div>
    </div>
  );

  const getRoleColor = (role) => {
    switch (role) {
        case 'Development': return 'bg-blue-100 text-blue-800';
        case 'Operations': return 'bg-green-100 text-green-800';
        case 'DBA': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const rosterTable = generatedRoster ? (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-50">
                <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                    {["Morning", "Afternoon", "Evening", "Night"].map(shift => (
                        <React.Fragment key={shift}>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{shift}</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        </React.Fragment>
                    ))}
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Off</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {Object.entries(generatedRoster).map(([day, shifts]) => (
                    <tr key={day}>
                        <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{day}</td>
                        {["Morning", "Afternoon", "Evening", "Night"].map(shift => (
                            <React.Fragment key={shift}>
                                <td className="py-4 px-4 whitespace-nowrap text-gray-600 space-y-1">
                                    {shifts[shift] && shifts[shift].map(person => (
                                        <div key={person.name} className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(person.role)}`}>
                                            {person.name}
                                        </div>
                                    ))}
                                </td>
                                <td className="py-4 px-4 whitespace-nowrap text-gray-600 space-y-1">
                                    {shifts[shift] && shifts[shift].map(person => (
                                        <div key={person.name} className="text-xs text-gray-600">{person.project}</div>
                                    ))}
                                </td>
                            </React.Fragment>
                        ))}
                        <td className="py-4 px-4 whitespace-nowrap text-gray-600"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{shifts.Off}</span></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  ) : null;

  return (
    <div className="p-8 bg-gray-100">
      <DashboardCard>
          <div className="flex items-center mb-4">
              {Icon("BrainCircuit", { size: 32, className: "text-blue-600 mr-3" })}
              <h1 className="text-3xl font-bold text-gray-800">Automated Roster Generator</h1>
          </div>
          {excelUploadSection}
          <p className="text-gray-600 mb-6">This tool automatically generates a balanced schedule based on the roles from your uploaded file, historical workload, and shift fairness.</p>
          <div className="mb-6">
              <label htmlFor="constraints" className="block text-sm font-medium text-gray-700 mb-1">Additional Constraints</label>
              <textarea id="constraints" rows="3" placeholder="e.g., Keerthi needs Saturday off" className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" value={constraints} onChange={e => setConstraints(e.target.value)}></textarea>
          </div>
          <button onClick={handleGenerateRoster} disabled={isRosterLoading} className="w-full flex justify-center items-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
              {isRosterLoading ? (
                  <React.Fragment><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div> Generating...</React.Fragment>
              ) : (
                  <React.Fragment>{Icon("Sparkles", { size: 20, className: "mr-2" })} Generate Roster</React.Fragment>
              )}
          </button>
          {rosterError && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">{rosterError}</div>}
      </DashboardCard>
      {generatedRoster && <DashboardCard className="mt-8">{rosterTable}</DashboardCard>}
    </div>
  );
};
const DashboardCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200/80 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${className}`}>
      {children}
    </div>
  );
};
const EngineerDashboard = ({ engineerData, isAiAgentActive, handleSetAiAgentActive, onNavigate }) => {
  const [tasks, setTasks] = React.useState([]);

  React.useEffect(() => {
    if (engineerData && engineerData.aiAgent && engineerData.aiAgent.tasks) {
      setTasks(engineerData.aiAgent.tasks);
    }
  }, [engineerData]);

  React.useEffect(() => {
    if (isAiAgentActive) {
      const taskToComplete = tasks.find(t => t.status === 'In Progress');
      if (taskToComplete) {
        const timer = setTimeout(() => {
          setTasks(currentTasks =>
            currentTasks.map(t =>
              t.id === taskToComplete.id ? { ...t, status: 'Completed' } : t
            )
          );
        }, 3000); // 3-second delay to simulate work

        return () => clearTimeout(timer); // Cleanup the timer
      }
    }
  }, [isAiAgentActive, tasks]);

  const Icon = (name, props = {}) => {
      const { size = 20, className = '' } = props;
      const camelCaseName = name.charAt(0).toLowerCase() + name.slice(1).replace(/-(\w)/g, g => g[1].toUpperCase());
      const iconNode = lucide.icons[camelCaseName];
      if (!iconNode) {
          console.warn(`Lucide icon not found: ${name} (as ${camelCaseName})`);
          return <span className={className}><svg width={size} height={size}></svg></span>;
      }
      return <span className={className} dangerouslySetInnerHTML={{ __html: iconNode.toSvg({ width: size, height: size }) }} />;
  };

  if (!engineerData) {
    return <div className="p-8">Loading...</div>;
  }

  const { RadialBarChart, RadialBar, ResponsiveContainer } = Recharts;
  const { name, personalPulse, weekAhead, myTickets } = engineerData;
  const workloadData = [{ name: 'Workload', value: personalPulse.workload, fill: '#3b82f6' }];

  const workloadChart = (
    <ResponsiveContainer width="100%" height={120}>
      <RadialBarChart innerRadius="70%" outerRadius="90%" data={workloadData} startAngle={90} endAngle={-270}>
        <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-gray-800">
          {`${personalPulse.workload}%`}
        </text>
      </RadialBarChart>
    </ResponsiveContainer>
  );

  const personalPulseCards = (
    <React.Fragment>
        <DashboardCard className="col-span-2 md:col-span-1 flex flex-col items-center justify-center">
            <h3 className="font-bold text-lg mb-2 text-gray-800">Current Workload</h3>
            {workloadChart}
        </DashboardCard>
        <DashboardCard className="text-center">
            <div className="flex justify-center items-center mb-2 text-blue-500">{Icon('CheckCircle', {size: 24})}</div>
            <h4 className="font-semibold text-gray-600 mb-1">Tasks Completed</h4>
            <p className="text-3xl font-bold text-gray-800">{personalPulse.tasksCompleted}</p>
        </DashboardCard>
        <DashboardCard className="text-center">
            <div className="flex justify-center items-center mb-2 text-blue-500">{Icon('Clock', {size: 24})}</div>
            <h4 className="font-semibold text-gray-600 mb-1">Tasks Pending</h4>
            <p className="text-3xl font-bold text-gray-800">{personalPulse.tasksPending}</p>
        </DashboardCard>
         <DashboardCard className="text-center">
            <div className="flex justify-center items-center mb-2 text-blue-500">{Icon('Ticket', {size: 24})}</div>
            <h4 className="font-semibold text-gray-600 mb-1">Total Tickets</h4>
            <p className="text-3xl font-bold text-gray-800">{myTickets.serviceNow + myTickets.jira}</p>
        </DashboardCard>
    </React.Fragment>
  );

  const weekAheadComponent = (
    <DashboardCard>
        <h3 className="font-bold text-xl mb-4 text-gray-800">My Week Ahead</h3>
        <div className="flex flex-wrap justify-between text-center -m-1">
            {weekAhead.map(item => (
                <div key={item.day} className="w-1/2 sm:w-1/3 md:flex-1 p-1">
                    <div className="p-2 rounded-lg h-full flex flex-col justify-center">
                        <p className="font-bold text-gray-800">{item.day}</p>
                        <div className={`mt-2 p-3 rounded-md text-sm font-semibold ${
                            item.shift === 'Morning' ? 'bg-blue-100 text-blue-800' :
                            item.shift === 'Evening' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-200 text-gray-700'
                        }`}>{item.shift}</div>
                    </div>
                </div>
            ))}
        </div>
    </DashboardCard>
  );

  const aiAgentStatus = isAiAgentActive ? (
    <div className="space-y-3 bg-green-50 p-4 rounded-lg">
        <p className="text-sm font-semibold text-green-700 mb-2">AI Backup is Active. It will handle:</p>
        {tasks.map(task => (
            <div key={task.id} className="flex items-center text-sm text-gray-700">
                {Icon('CheckCircle', { size: 16, className: 'text-green-600 mr-2 flex-shrink-0' })}
                <span>{task.name}</span>
                <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${task.status === 'Completed' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>{task.status}</span>
            </div>
        ))}
    </div>
  ) : (
    <div className="text-center flex flex-col justify-center items-center h-full p-4 bg-gray-50 rounded-lg">
        {Icon('Sparkles', { size: 24, className: 'text-gray-400 mb-2' })}
        <p className="text-sm text-gray-500 font-medium">AI Assistant is on standby.</p>
    </div>
  );

  const quickActionsAndAI = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <DashboardCard className="lg:col-span-1">
              <h3 className="font-bold text-xl mb-4 text-gray-800">Quick Actions</h3>
              <div className="flex flex-col space-y-3">
                  <button onClick={() => onNavigate('request')} className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center font-semibold">
                      {Icon('ArrowRightLeft', { size: 18, className: 'mr-2' })} Request Shift Swap
                  </button>
                  <button onClick={() => onNavigate('request')} className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center font-semibold">
                      {Icon('LogOut', { size: 18, className: 'mr-2' })} Apply for Leave
                  </button>
              </div>
          </DashboardCard>
          <DashboardCard className="lg:col-span-2">
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h3 className="font-bold text-xl text-gray-800">AI Assistant</h3>
                      <p className="text-sm text-gray-500">Going on leave? Toggle on to activate your AI backup.</p>
                  </div>
                  <label htmlFor="leave-toggle" className="flex items-center cursor-pointer">
                      <div className="relative">
                          <input type="checkbox" id="leave-toggle" className="sr-only" checked={isAiAgentActive} onChange={() => handleSetAiAgentActive(!isAiAgentActive)} />
                          <div className="block bg-gray-200 w-12 h-7 rounded-full"></div>
                          <div className={`dot absolute left-1 top-1 w-5 h-5 rounded-full shadow-md transition-transform duration-300 ease-in-out ${isAiAgentActive ? 'transform translate-x-full bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                  </label>
              </div>
              <div>{aiAgentStatus}</div>
          </DashboardCard>
      </div>
  );

  return (
    <div className="p-8 bg-gray-100 flex-1 space-y-8">
        <DashboardCard>
            <h2 className="text-3xl font-bold text-gray-800">Welcome, {name}!</h2>
            <p className="text-gray-600 mt-1">Here is your command center for today. Your current shift is: <span className="font-bold text-blue-600">{personalPulse.currentShift}</span>.</p>
        </DashboardCard>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {personalPulseCards}
        </div>
        {weekAheadComponent}
        {quickActionsAndAI}
    </div>
  );
};
const EngineerSchedule = ({ engineerData }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const Icon = (name, props = {}) => {
      const { size = 20, className = '' } = props;
      const camelCaseName = name.charAt(0).toLowerCase() + name.slice(1).replace(/-(\w)/g, g => g[1].toUpperCase());
      const iconNode = lucide.icons[camelCaseName];
      if (!iconNode) {
          console.warn(`Lucide icon not found: ${name} (as ${camelCaseName})`);
          return <span className={className}><svg width={size} height={size}></svg></span>;
      }
      return <span className={className} dangerouslySetInnerHTML={{ __html: iconNode.toSvg({ width: size, height: size }) }} />;
  };

  if (!engineerData) {
    return <div className="p-8">Loading...</div>;
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getShiftForDay = (day) => {
      const dayOfWeek = new Date(year, month, day).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) return 'Off';
      return (day % 2 === 0) ? 'Evening' : 'Morning';
  };

  const getShiftColor = (shift) => {
      switch (shift) {
          case 'Morning': return 'bg-blue-100 text-blue-800';
          case 'Evening': return 'bg-indigo-100 text-indigo-800';
          case 'Off': return 'bg-gray-200 text-gray-700';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(year, month + offset, 1));
  };

  const calendarGrid = (
    <div className="grid grid-cols-7 gap-px bg-gray-200 border-l border-t border-gray-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <div key={day} className="py-2 text-center font-semibold text-gray-600 bg-gray-50">{day}</div>)}
        {blanks.map((_, index) => <div key={`blank-${index}`} className="bg-white border-r border-b border-gray-200"></div>)}
        {days.map(day => {
            const shift = getShiftForDay(day);
            return (
                <div key={day} className="bg-white p-2 min-h-[120px] border-r border-b border-gray-200 flex flex-col">
                    <div className="font-bold text-right text-gray-700">{day}</div>
                    <div className="flex-grow flex items-center justify-center mt-2">
                        <span className={`font-semibold text-sm px-3 py-1.5 rounded-lg ${getShiftColor(shift)}`}>{shift}</span>
                    </div>
                </div>
            );
        })}
    </div>
  );

  return (
     <div className="p-8 bg-gray-100 flex-1">
         <DashboardCard>
             <div className="flex justify-between items-center mb-6">
                 <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200">{Icon("ChevronLeft")}</button>
                 <h1 className="text-2xl font-bold text-gray-800">
                     My Schedule for {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                 </h1>
                 <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200">{Icon("ChevronRight")}</button>
             </div>
             {calendarGrid}
         </DashboardCard>
     </div>
  );
};
const Header = ({ userType, engineerName, onSwitchUserType }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // This helper function renders icons from the global 'lucide' object
  const Icon = (name, props = {}) => {
      const { size = 20, className = '' } = props;
      const camelCaseName = name.charAt(0).toLowerCase() + name.slice(1).replace(/-(\w)/g, g => g[1].toUpperCase());
      const iconNode = lucide.icons[camelCaseName];
      if (!iconNode) {
          console.warn(`Lucide icon not found: ${name} (as ${camelCaseName})`);
          // Return a span with a placeholder to maintain layout
          return <span className={className}><svg width={size} height={size}></svg></span>;
      }
      // The className is passed to a wrapper span because dangerouslySetInnerHTML doesn't apply it to the SVG root.
      return <span className={className} dangerouslySetInnerHTML={{ __html: iconNode.toSvg({ width: size, height: size }) }} />;
  };

  const title = userType === 'manager'
    ? "Manager's Command Center"
    : `Engineer's Dashboard (${engineerName})`;

  const switchUserText = userType === 'manager' ? 'Engineer' : 'Manager';

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <div className="flex items-center">
        <div className="relative mr-4">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            {Icon('User', { size: 20, className: 'mr-2' })}
            <span className="font-semibold">{userType === 'manager' ? 'Manager' : 'Engineer'} View</span>
            {Icon('ChevronDown', { size: 16, className: 'ml-1' })}
          </button>
          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20"
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSwitchUserType();
                  setIsDropdownOpen(false);
                }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
              >
                Switch to {switchUserText}
              </a>
            </div>
          )}
        </div>
        <button className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg mr-2 hover:bg-blue-700">Invite</button>
        <button className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Publish Roster</button>
      </div>
    </header>
  );
};
const SwapRequestModal = ({ isOpen, onClose, myShift, engineerData, addNotification, onSwapRequestSubmit }) => {
    const [employees, setEmployees] = React.useState([]);
    const [selectedEmployee, setSelectedEmployee] = React.useState('');
    const [colleagueShifts, setColleagueShifts] = React.useState([]);
    const [selectedColleagueShift, setSelectedColleagueShift] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            // Fetch all employees to populate the dropdown
            const fetchEmployees = async () => {
                try {
                    const response = await fetch('/api/employees');
                    const allEmployees = await response.json();
                    // Filter out the current user
                    const otherEmployees = allEmployees.filter(emp => emp.name !== engineerData.name);
                    setEmployees(otherEmployees);
                } catch (error) {
                    addNotification('Failed to fetch employees', 'error');
                }
            };
            fetchEmployees();
        } else {
            // Reset state when modal is closed
            setSelectedEmployee('');
            setColleagueShifts([]);
            setSelectedColleagueShift(null);
        }
    }, [isOpen, engineerData.name]);

    React.useEffect(() => {
        if (selectedEmployee) {
            // Fetch the selected colleague's shifts
            const fetchColleagueShifts = async () => {
                setIsLoading(true);
                try {
                    const response = await fetch(`/api/employees/${selectedEmployee}/shifts`);
                    const shifts = await response.json();
                    setColleagueShifts(shifts);
                } catch (error) {
                    addNotification(`Failed to fetch shifts for ${selectedEmployee}`, 'error');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchColleagueShifts();
        } else {
            setColleagueShifts([]);
        }
    }, [selectedEmployee]);

    const handleSubmit = () => {
        if (!selectedColleagueShift || !selectedEmployee) {
            addNotification('Please select a colleague and a shift to swap with.', 'warning');
            return;
        }
        onSwapRequestSubmit(myShift, selectedColleagueShift, selectedEmployee);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Request a Shift Swap</h2>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="font-semibold">Your shift to swap:</p>
                    <p>{myShift.day} - {myShift.shift} Shift</p>
                </div>

                <div className="mb-4">
                    <label htmlFor="colleague-select" className="block text-sm font-medium text-gray-700 mb-1">Swap with:</label>
                    <select
                        id="colleague-select"
                        value={selectedEmployee}
                        onChange={e => setSelectedEmployee(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">-- Select a Colleague --</option>
                        {employees.map(emp => (
                            <option key={emp.name} value={emp.name}>{emp.name}</option>
                        ))}
                    </select>
                </div>

                {isLoading && <p>Loading shifts...</p>}

                {selectedEmployee && !isLoading && (
                    <div>
                        <h3 className="font-semibold mb-2">Available shifts for {selectedEmployee}:</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {colleagueShifts.length > 0 ? colleagueShifts.map((shift, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedColleagueShift(shift)}
                                    className={`p-3 rounded-lg cursor-pointer ${selectedColleagueShift && selectedColleagueShift.day === shift.day && selectedColleagueShift.shift === shift.shift ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    {shift.day} - {shift.shift} Shift
                                </div>
                            )) : <p className="text-gray-500">No available shifts for this colleague.</p>}
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
                    <button onClick={handleSubmit} disabled={!selectedColleagueShift} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                        Submit Swap Request
                    </button>
                </div>
            </div>
        </div>
    );
};

const ManagerDashboard = ({ managerData }) => {
  // This helper function renders icons from the global 'lucide' object
  const Icon = (name, props = {}) => {
      const { size = 20, className = '' } = props;
      const camelCaseName = name.charAt(0).toLowerCase() + name.slice(1).replace(/-(\w)/g, g => g[1].toUpperCase());
      const iconNode = lucide.icons[camelCaseName];
      if (!iconNode) {
          console.warn(`Lucide icon not found: ${name} (as ${camelCaseName})`);
          return <span className={className}><svg width={size} height={size}></svg></span>;
      }
      return <span className={className} dangerouslySetInnerHTML={{ __html: iconNode.toSvg({ width: size, height: size }) }} />;
  };

  if (!managerData) {
    return <div className="p-8">Loading...</div>;
  }

  const { operationalPulse, futureCast, teamWellness, teamTickets } = managerData;
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'High': return 'border-red-500';
      case 'Medium': return 'border-orange-500';
      default: return 'border-blue-500';
    }
  };

  const getIconClass = (severity) => {
    switch (severity) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-orange-500';
      default: return 'text-blue-500';
    }
  };

  const teamTicketChart = (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={teamTickets} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip wrapperClassName="bg-white shadow-lg rounded-lg p-2" />
        <Legend />
        <Bar dataKey="serviceNow" stackId="a" fill="#3b82f6" name="ServiceNow" />
        <Bar dataKey="jira" stackId="a" fill="#10b981" name="Jira" />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="p-8 bg-gray-100">
      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Object.entries(operationalPulse).map(([key, data]) => {
          const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          return (
            <DashboardCard key={key} className="flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-600">{title}</h4>
                <div className={data.color}>{Icon(data.icon)}</div>
              </div>
              <div>
                <span className={`text-4xl font-bold ${data.color}`}>{data.value}%</span>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className={`${data.bgColor} h-2.5 rounded-full`} style={{ width: `${data.value}%` }}></div>
                </div>
              </div>
            </DashboardCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
        {/* Future-Cast Radar */}
        <DashboardCard className="col-span-1 lg:col-span-3">
          <h3 className="font-bold text-xl mb-4 text-gray-800">Future-Cast Radar (Next 72 Hours)</h3>
          <div className="space-y-4">
            {futureCast.map(item => (
              <div key={item.id} className={`bg-gray-50 p-4 rounded-lg border-l-4 ${getSeverityClass(item.severity)}`}>
                <div className="flex items-center mb-2">
                  <div className={getIconClass(item.severity)}>{Icon(item.icon)}</div>
                  <h4 className="ml-3 font-bold text-gray-900">{item.title}</h4>
                </div>
                <p className="text-gray-600 mb-3">{item.details}</p>
                <div className="bg-blue-100 text-blue-800 p-3 rounded-md flex items-center">
                  {Icon('Sparkles', { size: 18, className: 'mr-3' })}
                  <p className="font-semibold text-sm">{item.recommendation}</p>
                  <button className="ml-auto bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-blue-700">Take Action</button>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Team Wellness Hub */}
        <DashboardCard className="col-span-1 lg:col-span-2">
            <h3 className="font-bold text-xl mb-4 text-gray-800">Team Wellness & Engagement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold mb-2 text-gray-700">Shift Fairness Score</h4>
                    <div className="flex items-center justify-center bg-green-100 text-green-800 rounded-lg p-4">
                        <span className="text-5xl font-bold">{teamWellness.shiftBalanceScore}</span>
                    </div>
                    <p className="text-xs text-center mt-1 text-gray-500">Based on weekend & evening shift distribution.</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-2 text-gray-700">Kudos Corner</h4>
                    <div className="space-y-2">
                        {teamWellness.kudos.map(kudo => (
                            <div key={kudo.id} className="bg-yellow-50 p-2 rounded-lg text-sm">
                                <p className="text-yellow-800"><span className="font-bold">{kudo.from}</span> to <span className="font-bold">{kudo.to}:</span> {kudo.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <h4 className="font-semibold mb-2 text-gray-700">Upcoming Time Off</h4>
                {teamWellness.upcomingLeave.map(leave => (
                    <p key={leave.name} className="text-gray-600">🌴 <span className="font-bold">{leave.name}'s</span> vacation starts in <span className="font-bold">{leave.days}</span> days!</p>
                ))}
            </div>
        </DashboardCard>
      </div>

      <DashboardCard>
          <h3 className="font-bold text-xl mb-4 text-gray-800">Team Ticket Distribution</h3>
          {teamTicketChart}
      </DashboardCard>
    </div>
  );
};
const RequestPage = ({ handleSetAiAgentActive, engineerData, leaveRequests, onSubmit, addNotification }) => {
  const [activeTab, setActiveTab] = React.useState('swap');
  const [leaveType, setLeaveType] = React.useState('Vacation');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [myShifts, setMyShifts] = React.useState([]);
  const [swapRequests, setSwapRequests] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedShift, setSelectedShift] = React.useState(null);
  const [rosterExists, setRosterExists] = React.useState(true); // Assume it exists initially to avoid flash of message

  const fetchSwapRequests = async () => {
    if (!engineerData || !engineerData.name) return;
    try {
      const response = await fetch(`/api/swap_requests?engineerName=${engineerData.name}`);
      if (!response.ok) throw new Error('Failed to fetch swap requests');
      const requests = await response.json();
      setSwapRequests(requests);
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  const handleOpenModal = (shift) => {
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedShift(null);
  };

  const handleSwapRequestSubmit = async (myShift, colleagueShift, responderName) => {
    try {
        const response = await fetch('/api/swap_requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requesterName: engineerData.name,
                responderName: responderName,
                requesterShift: myShift,
                responderShift: colleagueShift,
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to submit swap request');
        }
        addNotification('Swap request submitted successfully!', 'success');
        handleCloseModal();
        fetchSwapRequests(); // Refetch requests
    } catch (error) {
        addNotification(error.message, 'error');
    }
  };

  const handleSwapRequestUpdate = async (requestId, status) => {
    try {
      const response = await fetch(`/api/swap_requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update swap request');
      }
      addNotification(`Request ${status.toLowerCase()}.`, 'success');
      fetchSwapRequests(); // Refetch to show updated status
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  React.useEffect(() => {
    if (activeTab === 'swap' && engineerData && engineerData.name) {
      const checkRosterAndFetchData = async () => {
        try {
          const statusRes = await fetch('/api/roster/status');
          const statusData = await statusRes.json();
          setRosterExists(statusData.isGenerated);

          if (statusData.isGenerated) {
            const shiftsRes = await fetch(`/api/employees/${engineerData.name}/shifts`);
            if (!shiftsRes.ok) throw new Error('Failed to fetch shifts');
            const shifts = await shiftsRes.json();
            setMyShifts(shifts);

            fetchSwapRequests();
          }
        } catch (error) {
          addNotification(error.message, 'error');
          setMyShifts([]);
        }
      };
      checkRosterAndFetchData();
    }
  }, [activeTab, engineerData]);

  const Icon = (name, props = {}) => {
      const { size = 20, className = '' } = props;
      const camelCaseName = name.charAt(0).toLowerCase() + name.slice(1).replace(/-(\w)/g, g => g[1].toUpperCase());
      const iconNode = lucide.icons[camelCaseName];
      if (!iconNode) {
          console.warn(`Lucide icon not found: ${name} (as ${camelCaseName})`);
          return <span className={className}><svg width={size} height={size}></svg></span>;
      }
      return <span className={className} dangerouslySetInnerHTML={{ __html: iconNode.toSvg({ width: size, height: size }) }} />;
  };

  const handleLocalLeaveSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      addNotification('Please select a start and end date.', 'warning');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      addNotification('End date cannot be before start date.', 'warning');
      return;
    }
    onSubmit({
      leaveType,
      startDate,
      endDate,
      reason,
    });
    // Clear form
    setLeaveType('Vacation');
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return 'bg-green-100 text-green-800';
    if (status === 'Rejected') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  }

  const renderSwapRequestTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DashboardCard>
            <h3 className="font-bold text-xl mb-4 text-gray-800">My Upcoming Shifts</h3>
            <div className="space-y-3">
                {!rosterExists ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                {Icon('AlertTriangle', { className: 'text-yellow-400' })}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    A roster has not been generated yet. A manager must generate a roster from the "AI Roster Generator" page before you can see your shifts or request a swap.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : myShifts.length > 0 ? (
                    myShifts.map((shift, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-bold">{shift.day}</p>
                                <p className="text-sm text-gray-600">{shift.shift} Shift</p>
                            </div>
                            <button onClick={() => handleOpenModal(shift)} className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-md hover:bg-blue-600">Request Swap</button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">You have no upcoming shifts in the current roster.</p>
                )}
            </div>
        </DashboardCard>
        <DashboardCard>
            <h3 className="font-bold text-xl mb-4 text-gray-800">Pending Requests</h3>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Incoming Requests</h4>
                    {swapRequests.filter(r => r.responderName === engineerData.name && r.status === 'Pending').length > 0 ?
                        swapRequests.filter(r => r.responderName === engineerData.name && r.status === 'Pending').map(req => (
                            <div key={req.id} className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm">
                                    <span className="font-bold">{req.requesterName}</span> wants to swap their <span className="font-bold">{req.requesterShift.day} {req.requesterShift.shift}</span> shift for your <span className="font-bold">{req.responderShift.day} {req.responderShift.shift}</span> shift.
                                </p>
                                <div className="mt-2 flex justify-end space-x-2">
                                    <button onClick={() => handleSwapRequestUpdate(req.id, 'Rejected')} className="bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-md hover:bg-red-600">Reject</button>
                                    <button onClick={() => handleSwapRequestUpdate(req.id, 'Approved')} className="bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-md hover:bg-green-600">Approve</button>
                                </div>
                            </div>
                        )) : <p className="text-gray-500 text-sm">No incoming requests.</p>
                    }
                </div>
                <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">My Outgoing Requests</h4>
                    {swapRequests.filter(r => r.requesterName === engineerData.name && r.status === 'Pending').length > 0 ?
                        swapRequests.filter(r => r.requesterName === engineerData.name && r.status === 'Pending').map(req => (
                            <div key={req.id} className="bg-yellow-50 p-3 rounded-lg text-sm">
                                <p>You requested to swap with <span className="font-bold">{req.responderName}</span>.</p>
                                <p className="text-xs mt-1">Status: Pending colleague approval.</p>
                            </div>
                        )) : <p className="text-gray-500 text-sm">No outgoing requests.</p>
                    }
                </div>
            </div>
        </DashboardCard>
    </div>
  );

  const renderLeaveRequestTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DashboardCard>
            <h3 className="font-bold text-xl mb-4 text-gray-800">Submit a New Leave Request</h3>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-semibold">Your available leave balance: {engineerData && engineerData.leaveBalance !== undefined ? `${engineerData.leaveBalance} days` : 'Loading...'}</p>
            </div>
            <form className="space-y-4" onSubmit={handleLocalLeaveSubmit}>
                <div>
                    <label htmlFor="leave-type" className="block text-sm font-medium text-gray-700">Leave Type</label>
                    <select id="leave-type" value={leaveType} onChange={e => setLeaveType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        <option>Vacation</option>
                        <option>Sick Leave</option>
                        <option>Personal</option>
                    </select>
                </div>
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2" />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
                    <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} rows="3" className="mt-1 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"></textarea>
                </div>
                <div>
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Submit Request
                    </button>
                </div>
            </form>
        </DashboardCard>
         <DashboardCard>
            <h3 className="font-bold text-xl mb-4 text-gray-800">My Request History</h3>
            <div className="space-y-3">
                {leaveRequests && leaveRequests.length > 0 ? (
                    leaveRequests.map(req => (
                        <div key={req.id} className={`p-3 rounded-lg ${getStatusColor(req.status)}`}>
                            <p className="font-bold">{req.startDate} to {req.endDate}</p>
                            <p className="text-sm">Status: {req.status}</p>
                            {req.reason && <p className="text-sm mt-1"><em>"{req.reason}"</em></p>}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">You have no past leave requests.</p>
                )}
            </div>
        </DashboardCard>
    </div>
  );

  return (
    <div className="p-8 bg-gray-100 flex-1">
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <div className="flex border-b border-gray-300">
                    <button onClick={() => setActiveTab('swap')} className={`py-3 px-6 font-semibold ${activeTab === 'swap' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                        Request Shift Swap
                    </button>
                    <button onClick={() => setActiveTab('leave')} className={`py-3 px-6 font-semibold ${activeTab === 'leave' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                        Request Leave
                    </button>
                </div>
            </div>
            <div id="request-tab-content">
                {activeTab === 'swap' ? renderSwapRequestTab() : renderLeaveRequestTab()}
            </div>
        </div>
        <SwapRequestModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            myShift={selectedShift}
            engineerData={engineerData}
            addNotification={addNotification}
            onSwapRequestSubmit={handleSwapRequestSubmit}
        />
    </div>
  );
};
const CabRequestPage = ({ engineerData, addNotification }) => {
  const [cabRequests, setCabRequests] = React.useState([]);
  const [shift, setShift] = React.useState('Morning');
  const [date, setDate] = React.useState('');

  React.useEffect(() => {
    if (engineerData && engineerData.name) {
      const fetchCabRequests = async () => {
        try {
          const response = await fetch(`/api/cab_requests?engineerName=${engineerData.name}`);
          if (!response.ok) throw new Error('Failed to fetch cab requests');
          const requests = await response.json();
          setCabRequests(requests);
        } catch (error) {
          addNotification(error.message, 'error');
        }
      };
      fetchCabRequests();
    }
  }, [engineerData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !shift) {
      addNotification('Please select a date and shift.', 'warning');
      return;
    }
    try {
      const response = await fetch('/api/cab_requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineerName: engineerData.name,
          date,
          shift,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit cab request');
      }
      const newRequest = await response.json();
      setCabRequests(prev => [...prev, newRequest]);
      addNotification('Cab request submitted successfully!', 'success');
      setDate('');
      setShift('Morning');
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  return (
    <div className="p-8 bg-gray-100 flex-1">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Cab Requests</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DashboardCard>
            <h3 className="font-bold text-xl mb-4 text-gray-800">Request a Cab</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label htmlFor="shift" className="block text-sm font-medium text-gray-700">Shift</label>
                <select id="shift" value={shift} onChange={e => setShift(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                  <option>Night</option>
                </select>
              </div>
              <div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Submit Request
                </button>
              </div>
            </form>
          </DashboardCard>
          <DashboardCard>
            <h3 className="font-bold text-xl mb-4 text-gray-800">My Cab Requests</h3>
            <div className="space-y-3">
              {cabRequests.length > 0 ? (
                cabRequests.map(req => (
                  <div key={req.id} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-bold">{req.date}</p>
                      <p className="text-sm text-gray-600">{req.shift} Shift</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${req.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {req.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">You have no past cab requests.</p>
              )}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};
const CabRequestApprovalPage = ({ addNotification }) => {
  const [cabRequests, setCabRequests] = React.useState([]);

  React.useEffect(() => {
    const fetchCabRequests = async () => {
      try {
        const response = await fetch('/api/cab_requests/all');
        if (!response.ok) throw new Error('Failed to fetch cab requests');
        const requests = await response.json();
        setCabRequests(requests);
      } catch (error) {
        addNotification(error.message, 'error');
      }
    };
    fetchCabRequests();
  }, []);

  const handleUpdateRequest = async (requestId, status) => {
    try {
      const response = await fetch(`/api/cab_requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update cab request');
      }
      const updatedRequest = await response.json();
      setCabRequests(prev =>
        prev.map(req => (req.id === requestId ? updatedRequest : req))
      );
      addNotification(`Request ${status.toLowerCase()}.`, 'success');
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  return (
    <div className="p-8 bg-gray-100">
      <DashboardCard>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Cab Requests for Approval</h2>
        <div className="space-y-4">
          {cabRequests.length > 0 ? (
            cabRequests.map(req => (
              <div key={req.id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold">{req.engineerName}</p>
                  <p className="text-sm text-gray-600">{req.date} - {req.shift} Shift</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${req.status === 'Approved' ? 'bg-green-100 text-green-800' : (req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800')}`}>
                    {req.status}
                  </span>
                  {req.status === 'Pending' && (
                    <React.Fragment>
                      <button onClick={() => handleUpdateRequest(req.id, 'Approved')} className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600">Approve</button>
                      <button onClick={() => handleUpdateRequest(req.id, 'Rejected')} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Reject</button>
                    </React.Fragment>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No pending cab requests.</p>
          )}
        </div>
      </DashboardCard>
    </div>
  );
};
const LeaveApprovalPage = ({ leaveRequests, onUpdateRequest }) => {
  const Icon = (name, props = {}) => {
      const { size = 20, className = '' } = props;
      const camelCaseName = name.charAt(0).toLowerCase() + name.slice(1).replace(/-(\w)/g, g => g[1].toUpperCase());
      const iconNode = lucide.icons[camelCaseName];
      if (!iconNode) {
          console.warn(`Lucide icon not found: ${name} (as ${camelCaseName})`);
          return <span className={className}><svg width={size} height={size}></svg></span>;
      }
      return <span className={className} dangerouslySetInnerHTML={{ __html: iconNode.toSvg({ width: size, height: size }) }} />;
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return 'bg-green-100 text-green-800';
    if (status === 'Rejected') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  }

  return (
    <div className="p-8 bg-gray-100">
      <DashboardCard>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Leave Requests for Approval</h2>
        <div className="space-y-4">
          {leaveRequests && leaveRequests.length > 0 ? (
            leaveRequests.map(req => (
              <div key={req.id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold">{req.engineerName}</p>
                  <p className="text-sm text-gray-600">{req.startDate} to {req.endDate}</p>
                  {req.reason && <p className="text-sm mt-1">Reason: <em>"{req.reason}"</em></p>}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                  {req.status === 'Pending' && (
                    <React.Fragment>
                      <button onClick={() => onUpdateRequest(req.id, 'Approved')} className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600">Approve</button>
                      <button onClick={() => onUpdateRequest(req.id, 'Rejected')} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Reject</button>
                    </React.Fragment>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No pending leave requests.</p>
          )}
        </div>
      </DashboardCard>
    </div>
  );
};

const ScheduleManager = ({ managerData }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const Icon = (name, props = {}) => {
      const { size = 20, className = '' } = props;
      const camelCaseName = name.charAt(0).toLowerCase() + name.slice(1).replace(/-(\w)/g, g => g[1].toUpperCase());
      const iconNode = lucide.icons[camelCaseName];
      if (!iconNode) {
          console.warn(`Lucide icon not found: ${name} (as ${camelCaseName})`);
          return <span className={className}><svg width={size} height={size}></svg></span>;
      }
      return <span className={className} dangerouslySetInnerHTML={{ __html: iconNode.toSvg({ width: size, height: size }) }} />;
  };

  const getRoleColor = (role) => {
    switch (role) {
        case 'Development': return 'bg-blue-100 text-blue-800';
        case 'Operations': return 'bg-green-100 text-green-800';
        case 'DBA': return 'bg-purple-100 text-purple-800';
        case 'Support': return 'bg-pink-100 text-pink-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!managerData) {
    return <div className="p-8">Loading...</div>;
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Simplified schedule logic for demonstration
  const schedule = {};
  for(let day = 1; day <= daysInMonth; day++) {
      schedule[day] = { Morning: [], Afternoon: [], Evening: [], Night: [], Off: [] };
      managerData.teamTickets.forEach((member, index) => {
          const shiftIndex = (day + index) % 5;
          if (shiftIndex === 0) schedule[day].Morning.push(member);
          else if (shiftIndex === 1) schedule[day].Afternoon.push(member);
          else if (shiftIndex === 2) schedule[day].Evening.push(member);
          else if (shiftIndex === 3) schedule[day].Night.push(member);
          else schedule[day].Off.push(member);
      });
  }

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(year, month + offset, 1));
  };

  const calendarGrid = (
    <div className="grid grid-cols-7 gap-px bg-gray-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <div key={day} className="py-2 text-center font-semibold text-gray-600 bg-gray-50">{day}</div>)}
        {blanks.map((_, index) => <div key={`blank-${index}`} className="bg-gray-50"></div>)}
        {days.map(day => {
            const daySchedule = schedule[day];
            return (
                <div key={day} className="bg-white p-2 min-h-[140px]">
                    <div className="font-bold text-right">{day}</div>
                    {daySchedule && (
                        <div className="space-y-1 mt-1">
                            {Object.entries(daySchedule).map(([shift, people]) => {
                                if (shift === 'Off' || !people || people.length === 0) return null;
                                return (
                                    <div key={shift} className={`text-xs p-1 rounded ${getRoleColor(people[0].role)}`}>
                                        <strong>{shift}:</strong> {people.slice(0,2).map(p=>p.name).join(', ')}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        })}
    </div>
  );

  return (
     <div className="p-8 bg-gray-100 flex-1">
         <DashboardCard>
             <div className="flex justify-between items-center mb-6">
                 <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200">{Icon("ChevronLeft")}</button>
                 <h1 className="text-2xl font-bold text-gray-800">
                     {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                 </h1>
                 <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200">{Icon("ChevronRight")}</button>
             </div>
             {calendarGrid}
         </DashboardCard>
     </div>
  );
};
const MyPerformancePage = ({ engineerData }) => {
  const [teamAverages, setTeamAverages] = React.useState(null);

  React.useEffect(() => {
    const fetchTeamAverages = async () => {
      try {
        const response = await fetch('/api/analytics/team_averages');
        if (!response.ok) throw new Error('Failed to fetch team averages');
        const data = await response.json();
        setTeamAverages(data);
      } catch (error) {
        console.error("Error fetching team averages:", error);
      }
    };
    fetchTeamAverages();
  }, []);

  const Icon = (name, props = {}) => {
      const { size = 20, className = '' } = props;
      const camelCaseName = name.charAt(0).toLowerCase() + name.slice(1).replace(/-(\w)/g, g => g[1].toUpperCase());
      const iconNode = lucide.icons[camelCaseName];
      if (!iconNode) {
          console.warn(`Lucide icon not found: ${name} (as ${camelCaseName})`);
          return <span className={className}><svg width={size} height={size}></svg></span>;
      }
      return <span className={className} dangerouslySetInnerHTML={{ __html: iconNode.toSvg({ width: size, height: size }) }} />;
  };

  if (!engineerData) {
    return <div className="p-8">Loading performance data...</div>;
  }

  const { name, ticketsResolved, avgResolutionTime, csat, myKudos, project, costCenter } = engineerData;

  const kpiCards = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-600">Project</h4>
                {Icon('Briefcase', {className: "text-purple-500", size: 24})}
            </div>
            <p className="text-4xl font-bold text-gray-800">{project || 'N/A'}</p>
        </DashboardCard>
        <DashboardCard>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-600">Cost Center</h4>
                {Icon('DollarSign', {className: "text-yellow-500", size: 24})}
            </div>
            <p className="text-4xl font-bold text-gray-800">{costCenter || 'N/A'}</p>
        </DashboardCard>
        <DashboardCard>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-600">Tickets Resolved</h4>
                {Icon('Ticket', {className: "text-green-500", size: 24})}
            </div>
            <p className="text-4xl font-bold text-gray-800">{ticketsResolved || 'N/A'}</p>
        </DashboardCard>
        <DashboardCard>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-600">Avg. Resolution Time</h4>
                {Icon('Clock', {className: "text-blue-500", size: 24})}
            </div>
            <p className="text-4xl font-bold text-gray-800">{avgResolutionTime || 'N/A'}<span className="text-2xl text-gray-500"> min</span></p>
        </DashboardCard>
        <DashboardCard>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-600">Customer Satisfaction</h4>
                {Icon('Star', {className: "text-red-500", size: 24})}
            </div>
            <p className="text-4xl font-bold text-gray-800">{csat || 'N/A'}<span className="text-2xl text-gray-500">%</span></p>
        </DashboardCard>
    </div>
  );

  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;

  const comparisonData = teamAverages ? [
    { name: 'Tickets Resolved', You: ticketsResolved, Team: teamAverages.avg_tickets_resolved, Project: project, CostCenter: costCenter },
    { name: 'Resolution Time (min)', You: avgResolutionTime, Team: teamAverages.avg_resolution_time, Project: project, CostCenter: costCenter },
    { name: 'CSAT (%)', You: csat, Team: teamAverages.avg_csat, Project: project, CostCenter: costCenter },
  ] : [];

  const comparisonChart = (
    <DashboardCard>
        <h3 className="font-bold text-xl mb-4 text-gray-800">You vs. Team Average</h3>
        {teamAverages ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="You" fill="#3b82f6" />
                    <Bar dataKey="Team" fill="#10b981" />
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <p>Loading team comparison data...</p>
        )}
    </DashboardCard>
  );

  const kudosWall = (
    <DashboardCard>
        <h3 className="font-bold text-xl mb-4 text-gray-800">Kudos Wall</h3>
        <div className="space-y-3">
            {myKudos && myKudos.length > 0 ? (
                myKudos.map(kudo => (
                    <div key={kudo.id} className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-yellow-800">
                            <span className="font-bold">{kudo.from}</span> said: <em>"{kudo.message}"</em>
                        </p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No kudos yet. Keep up the great work!</p>
            )}
        </div>
    </DashboardCard>
  );

  return (
    <div className="p-8 bg-gray-100 flex-1 space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">My Performance Dashboard</h1>
        {kpiCards}
        {comparisonChart}
        {kudosWall}
    </div>
  );
};

const Sidebar = ({ userType, uploadedFileName, activeView, onNavigate }) => {
  // This helper function renders icons from the global 'lucide' object
  const Icon = (name, props = {}) => {
      const { size = 20, className = '' } = props;
      const camelCaseName = name.charAt(0).toLowerCase() + name.slice(1).replace(/-(\w)/g, g => g[1].toUpperCase());
      const iconNode = lucide.icons[camelCaseName];
      if (!iconNode) {
          console.warn(`Lucide icon not found: ${name} (as ${camelCaseName})`);
          return <span className={className}><svg width={size} height={size}></svg></span>;
      }
      return <span className={className} dangerouslySetInnerHTML={{ __html: iconNode.toSvg({ width: size, height: size }) }} />;
  };

  const managerLinks = [
    { name: 'Home', iconName: 'Briefcase', view: 'home' },
    { name: 'AI Roster Generator', iconName: 'BrainCircuit', view: 'roster' },
    { name: 'Team Analytics', iconName: 'BarChart2', view: 'analytics' },
    { name: 'Schedule Manager', iconName: 'Calendar', view: 'schedule' },
    { name: 'Yearly Schedule', iconName: 'CalendarDays', view: 'yearly_schedule' },
    { name: 'Leave Approvals', iconName: 'CheckSquare', view: 'approvals' },
    { name: 'Cab Requests', iconName: 'Car', view: 'cab_requests' },
  ];

  const engineerLinks = [
    { name: 'Home', iconName: 'Briefcase', view: 'home' },
    { name: 'My Schedule', iconName: 'Calendar', view: 'schedule' },
    { name: 'Yearly Schedule', iconName: 'CalendarDays', view: 'yearly_schedule' },
    { name: 'Request Swap/Leave', iconName: 'ArrowRightLeft', view: 'request' },
    { name: 'Cab Requests', iconName: 'Car', view: 'cab' },
    { name: 'My Performance', iconName: 'BarChart2', view: 'performance' },
  ];

  const links = userType === 'manager' ? managerLinks : engineerLinks;

  return (
    <div className="bg-custom-blue text-gray-300 w-64 min-h-screen p-4 flex-col hidden lg:flex">
      <div className="flex items-center mb-10">
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-2 rounded-lg mr-3 shadow-lg">
          {Icon('Shield', { size: 28 })}
        </div>
        <h1 className="text-2xl font-bold text-white">Roster Genius</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          {links.map(link => {
            const isActive = activeView === link.view;
            const linkClass = `flex items-center p-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-custom-blue-hover'}`;
            return (
              <li key={link.name} className="mb-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(link.view);
                  }}
                  className={linkClass}
                >
                  {Icon(link.iconName)}
                  <span className="ml-3 font-medium">{link.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto">
        <div className="text-xs text-gray-400 p-2">
          Data Source: {uploadedFileName ? (
            <span className="font-semibold text-green-300">{uploadedFileName}</span>
          ) : (
            <span className="text-yellow-300">Using Sample Data</span>
          )}
        </div>
      </div>
    </div>
  );
};
const TeamAnalytics = ({ managerData }) => {
  const Icon = (name, props = {}) => {
      const { size = 20, className = '' } = props;
      const camelCaseName = name.charAt(0).toLowerCase() + name.slice(1).replace(/-(\w)/g, g => g[1].toUpperCase());
      const iconNode = lucide.icons[camelCaseName];
      if (!iconNode) {
          console.warn(`Lucide icon not found: ${name} (as ${camelCaseName})`);
          return <span className={className}><svg width={size} height={size}></svg></span>;
      }
      return <span className={className} dangerouslySetInnerHTML={{ __html: iconNode.toSvg({ width: size, height: size }) }} />;
  };

  if (!managerData || !managerData.analytics || !managerData.teamTickets) {
    return <div className="p-8">Loading...</div>;
  }

  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } = Recharts;
  const analyticsData = managerData.analytics.last30Days;

  const kpiCards = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-600">Avg. Resolution Time</h4>
                {Icon('Clock', {className: "text-blue-500", size: 24})}
            </div>
            <p className="text-4xl font-bold text-gray-800">{analyticsData.avgResolutionTime}<span className="text-2xl text-gray-500"> min</span></p>
            <div className="flex items-center text-sm mt-2 text-red-500">
                {Icon("TrendingDown", {size: 16, className: "mr-1"})}
                <span>5% vs last period</span>
            </div>
        </DashboardCard>
        <DashboardCard>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-600">First Contact Resolution</h4>
                {Icon('CheckCircle', {className: "text-blue-500", size: 24})}
            </div>
            <p className="text-4xl font-bold text-gray-800">{analyticsData.firstContactResolution}<span className="text-2xl text-gray-500">%</span></p>
            <div className="flex items-center text-sm mt-2 text-green-500">
                {Icon("TrendingUp", {size: 16, className: "mr-1"})}
                <span>2% vs last period</span>
            </div>
        </DashboardCard>
        <DashboardCard>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-600">Customer Satisfaction</h4>
                {Icon('Star', {className: "text-blue-500", size: 24})}
            </div>
            <p className="text-4xl font-bold text-gray-800">{analyticsData.csat}<span className="text-2xl text-gray-500">%</span></p>
            <div className="flex items-center text-sm mt-2 text-green-500">
                {Icon("TrendingUp", {size: 16, className: "mr-1"})}
                <span>1.5% vs last period</span>
            </div>
        </DashboardCard>
        <DashboardCard>
            <h4 className="font-semibold text-gray-600 mb-2">Total Tickets Resolved</h4>
            <p className="text-4xl font-bold text-gray-800">{managerData.teamTickets.reduce((acc, t) => acc + (t.ticketsResolved || 0), 0)}</p>
        </DashboardCard>
    </div>
  );

  const leaderboard = (
    <DashboardCard>
        <h3 className="font-bold text-xl mb-4 text-gray-800">Performance Leaderboard</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="border-b">
                    <tr>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Engineer</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Project</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Cost Center</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Tickets Resolved</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Avg. Resolution (min)</th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">CSAT</th>
                    </tr>
                </thead>
                <tbody>
                    {[...managerData.teamTickets].sort((a, b) => (b.ticketsResolved || 0) - (a.ticketsResolved || 0)).map((eng, index) => (
                        <tr key={eng.name} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-800 flex items-center">
                                {index === 0 && Icon("Crown", {size: 16, className: "text-yellow-500 mr-2"})}
                                {index === 1 && Icon("Star", {size: 16, className: "text-gray-400 mr-2"})}
                                {eng.name}
                            </td>
                            <td className="py-3 px-4 text-gray-600">{eng.project || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-600">{eng.costCenter || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-600">{eng.ticketsResolved || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-600">{eng.avgResolutionTime || 'N/A'}</td>
                            <td className={`py-3 px-4 font-semibold ${eng.csat > 95 ? 'text-green-600' : 'text-orange-500'}`}>{eng.csat || 'N/A'}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </DashboardCard>
  );

  const ticketVolumeChart = (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={analyticsData.ticketVolume} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
        <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );

  const ticketCategoryChart = (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={analyticsData.ticketCategories} cx="50%" cy="50%" outerRadius={110} fill="#8884d8" dataKey="value" label={(e) => e.name}>
          {analyticsData.ticketCategories.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="p-8 bg-gray-100 flex-1 space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Team Analytics</h1>
        </div>
        {kpiCards}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <DashboardCard className="col-span-1 lg:col-span-3">
                <h3 className="font-bold text-xl mb-4 text-gray-800">Ticket Volume Trend</h3>
                {ticketVolumeChart}
            </DashboardCard>
            <DashboardCard className="col-span-1 lg:col-span-2">
                <h3 className="font-bold text-xl mb-4 text-gray-800">Ticket Category Analysis</h3>
                {ticketCategoryChart}
            </DashboardCard>
        </div>
        {leaderboard}
    </div>
  );
};
const Notification = ({ notification, onRemove }) => {
  const { id, message, type } = notification;
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(id), 500); // Allow time for exit animation
    }, 5000); // 5 seconds visible

    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setExiting(true);
    setTimeout(() => onRemove(id), 500);
  };

  const baseClasses = "flex items-center justify-between p-4 rounded-lg shadow-lg text-white transition-all duration-500 transform";
  const typeClasses = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };
  const animationClasses = exiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0';

  return (
    <div className={`${baseClasses} ${typeClasses[type] || 'bg-gray-500'} ${animationClasses}`}>
      <span>{message}</span>
      <button onClick={handleRemove} className="ml-4 font-bold">X</button>
    </div>
  );
};

const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-5 right-5 z-50 space-y-2 w-80">
      {notifications.map(n => (
        <Notification key={n.id} notification={n} onRemove={onRemove} />
      ))}
    </div>
  );
};

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
        { name: 'Rohit', role: 'Development', serviceNow: 5, jira: 8, csat: 92, ticketsResolved: 13, avgResolutionTime: 45, project: 'Phoenix', costCenter: 'RND-101' },
        { name: 'Keerthi', role: 'Operations', serviceNow: 3, jira: 12, csat: 98, ticketsResolved: 15, avgResolutionTime: 30, project: 'Orion', costCenter: 'OPS-202' },
        { name: 'Naresh', role: 'DBA', serviceNow: 7, jira: 4, csat: 95, ticketsResolved: 11, avgResolutionTime: 55, project: 'Phoenix', costCenter: 'RND-101' },
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
      project: 'Phoenix',
      costCenter: 'RND-101',
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
  const [leaveRequests, setLeaveRequests] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);

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

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSetAiAgentActive = async (isActive) => {
    if (!engineerData || !engineerData.name) {
      console.error("Engineer data not available to update AI status.");
      return;
    }
    try {
      const response = await fetch(`/api/employees/${engineerData.name}/ai_status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAiAgentActive: isActive }),
      });
      if (!response.ok) {
        throw new Error('Failed to update AI agent status');
      }
      const updatedEmployee = await response.json();
      setIsAiAgentActive(updatedEmployee.isAiAgentActive);
      setEngineerData(prevData => ({
          ...prevData,
          isAiAgentActive: updatedEmployee.isAiAgentActive,
      }));
    } catch (error) {
      console.error("Error updating AI agent status:", error);
      addNotification(error.message, 'error');
    }
  };

  const handleLeaveRequestSubmit = async (requestData) => {
    try {
      const response = await fetch('/api/leave_requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...requestData, engineerName: engineerData.name}),
      });
      if (!response.ok) {
        throw new Error('Failed to submit leave request');
      }
      const newRequest = await response.json();
      setLeaveRequests(prevRequests => [...prevRequests, newRequest]);
      addNotification('Leave request submitted successfully!', 'success');
    } catch (error) {
      console.error("Error submitting leave request:", error);
      addNotification(error.message, 'error');
    }
  };

  const handleLeaveRequestUpdate = async (requestId, status) => {
    try {
      const response = await fetch(`/api/leave_requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update leave request');
      }
      const updatedRequest = await response.json();
      setLeaveRequests(prevRequests =>
        prevRequests.map(req => req.id === requestId ? updatedRequest : req)
      );

      if (updatedRequest.status === 'Approved') {
        addNotification(`Request ${updatedRequest.id} approved.`, 'success');
      } else {
        addNotification(`Request ${updatedRequest.id} rejected.`, 'warning');
      }

      if (updatedRequest.conflict_warning) {
        addNotification(updatedRequest.conflict_warning, 'warning');
      }
    } catch (error) {
      console.error("Error updating leave request:", error);
      addNotification(error.message, 'error');
    }
  };

  // --- DATA FETCHING & LIFECYCLE ---
  const fetchInitialData = async () => {
    try {
      const [employeesRes, leaveRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/leave_requests')
      ]);

      if (!employeesRes.ok || !leaveRes.ok) {
        throw new Error('Failed to fetch initial data');
      }

      const employees = await employeesRes.json();
      const leaveRequestsData = await leaveRes.json();

      setLeaveRequests(leaveRequestsData);

      // Update manager data with fresh employee list
      setManagerData(prevData => ({
          ...initialManagerData, // Reset with static mock data structure
          teamTickets: employees, // Overwrite with live data
      }));

      // Update engineer data
      const firstEngineer = employees[0];
      if (firstEngineer) {
          const fullEngineerData = {
              ...initialEngineerData, // Base template
              ...firstEngineer,       // Overwrite with fetched data
          };
          setEngineerData(fullEngineerData);
          setIsAiAgentActive(firstEngineer.isAiAgentActive);
      } else {
          setEngineerData(initialEngineerData); // Fallback to mock
      }

    } catch (error) {
      addNotification(`Error fetching data: ${error.message}`, 'error');
      // Fallback to initial mock data on error
      setManagerData(initialManagerData);
      setEngineerData(initialEngineerData);
      setLeaveRequests([]);
    }
  };

  React.useEffect(() => {
    fetchInitialData();
  }, []);

  // --- RENDER LOGIC ---
  const renderView = () => {
    if (userType === 'manager') {
      switch (view) {
        case 'home':
          return <ManagerDashboard managerData={managerData} />;
        case 'roster':
          return <AIRosterGenerator onUploadSuccess={fetchInitialData} addNotification={addNotification} />;
        case 'analytics':
          return <TeamAnalytics managerData={managerData} />;
        case 'schedule':
          return <ScheduleManager managerData={managerData} />;
        case 'yearly_schedule':
          return <YearlySchedulePage userType={userType} engineerData={engineerData} managerData={managerData} />;
        case 'approvals':
          return <LeaveApprovalPage leaveRequests={leaveRequests} onUpdateRequest={handleLeaveRequestUpdate} />;
        case 'cab_requests':
          return <CabRequestApprovalPage addNotification={addNotification} />;
        default:
          return <div className="p-8">Page not yet implemented: {view}</div>;
      }
    } else { // Engineer view
      switch (view) {
        case 'home':
          return <EngineerDashboard engineerData={engineerData} isAiAgentActive={isAiAgentActive} handleSetAiAgentActive={handleSetAiAgentActive} onNavigate={handleNavigate} />;
        case 'schedule':
          return <EngineerSchedule engineerData={engineerData} />;
        case 'yearly_schedule':
          return <YearlySchedulePage userType={userType} engineerData={engineerData} managerData={managerData} />;
        case 'request':
          return <RequestPage handleSetAiAgentActive={handleSetAiAgentActive} engineerData={engineerData} leaveRequests={leaveRequests.filter(r => r.engineerName === engineerData.name)} onSubmit={handleLeaveRequestSubmit} addNotification={addNotification} />;
        case 'cab':
          return <CabRequestPage engineerData={engineerData} addNotification={addNotification} />;
        case 'performance':
          return <MyPerformancePage engineerData={engineerData} />;
        default:
          return <div className="p-8">Page not yet implemented: {view}</div>;
      }
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
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
const container = document.getElementById('app-container');

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  container
);
const YearlySchedulePage = ({ userType, engineerData, managerData }) => {
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [schedule, setSchedule] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const engineerName = userType === 'engineer' && engineerData ? engineerData.name : '';
        const response = await fetch(`/api/yearly_schedule?year=${year}&engineerName=${engineerName}`);
        if (!response.ok) throw new Error('Failed to fetch yearly schedule');
        const data = await response.json();
        setSchedule(data);
      } catch (error) {
        console.error("Error fetching yearly schedule:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [year, userType, engineerData]);

  const getShiftColor = (shift) => {
    switch (shift) {
        case 'Morning': return 'bg-blue-100 text-blue-800';
        case 'Evening': return 'bg-indigo-100 text-indigo-800';
        case 'Off': return 'bg-gray-200 text-gray-700';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMonth = (month) => {
    const monthDate = new Date(year, month, 1);
    const monthName = monthDate.toLocaleString('default', { month: 'long' });
    const firstDay = monthDate.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div key={month} className="bg-white p-4 rounded-lg shadow-md">
        <h4 className="text-lg font-bold text-center mb-2">{monthName}</h4>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["S", "M", "T", "W", "T", "F", "S"].map(d => <div key={d} className="font-semibold">{d}</div>)}
          {blanks.map((_, i) => <div key={`blank-${i}`}></div>)}
          {days.map(day => {
            const shift = schedule && schedule[month] ? schedule[month][day] : null;
            return (
              <div key={day} className={`py-1 rounded ${shift ? getShiftColor(shift) : ''}`}>
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-100 flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 flex-1">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Yearly Schedule for {year}</h1>
          <div>
            <button onClick={() => setYear(year - 1)} className="px-4 py-2 bg-white rounded-lg shadow-md mr-2">&lt;</button>
            <button onClick={() => setYear(year + 1)} className="px-4 py-2 bg-white rounded-lg shadow-md">&gt;</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }, (_, i) => renderMonth(i))}
        </div>
      </div>
    </div>
  );
};
const GamificationDashboard = ({ engineerName }) => {
  const [gamificationData, setGamificationData] = React.useState({ points: 0, badges: [], isClockedIn: false });
  const [error, setError] = React.useState(null);
  const [message, setMessage] = React.useState('');

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/gamification/status?name=${engineerName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch gamification status');
      }
      const data = await response.json();
      setGamificationData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  React.useEffect(() => {
    if (engineerName) {
      fetchData();
    }
  }, [engineerName]);

  const handleClockIn = async () => {
    setError(null);
    setMessage('');
    try {
      const response = await fetch('/api/clock_in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: engineerName }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Clock-in failed');
      }
      setMessage(data.message);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClockOut = async () => {
    setError(null);
    setMessage('');
    try {
      const response = await fetch('/api/clock_out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: engineerName }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Clock-out failed');
      }
      setMessage(data.message);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err.message);
    }
  };

  const nextMilestone = Math.ceil(gamificationData.points / 50) * 50 || 50;
  const progressPercentage = (gamificationData.points / nextMilestone) * 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Gamification & Clock-In</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <lucide.Star className="text-yellow-500 w-8 h-8" />
          <div>
            <div className="text-3xl font-bold text-gray-800">{gamificationData.points}</div>
            <div className="text-sm text-gray-500">Points</div>
          </div>
        </div>
        <div>
          {gamificationData.isClockedIn ? (
            <button onClick={handleClockOut} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
              Clock Out
            </button>
          ) : (
            <button onClick={handleClockIn} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
              Clock In
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Progress to Next Reward</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="text-right text-sm text-gray-500 mt-1">{gamificationData.points} / {nextMilestone} Points</div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-2">My Badges</h3>
        <div className="flex space-x-4">
          {gamificationData.badges.length > 0 ? (
            gamificationData.badges.map(badge => (
              <div key={badge} className="flex flex-col items-center p-2 bg-gray-100 rounded-lg">
                <lucide.Badge className="text-indigo-500 w-10 h-10" />
                <span className="text-xs mt-1 text-gray-600">{badge}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No badges earned yet. Keep up the great work!</p>
          )}
        </div>
      </div>
    </div>
  );
};
const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        const data = await response.json();
        setLeaderboardData(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankColor = (rank) => {
    if (rank === 0) return 'bg-yellow-400 text-white';
    if (rank === 1) return 'bg-gray-300 text-gray-800';
    if (rank === 2) return 'bg-yellow-600 text-white';
    return 'bg-white';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <lucide.Trophy className="w-6 h-6 mr-2 text-yellow-500" />
        Monthly Leaderboard
      </h2>
      {error && <div className="text-red-500">{error}</div>}
      <ul className="space-y-4">
        {leaderboardData.map((employee, index) => (
          <li key={employee.name} className={`flex items-center p-3 rounded-lg transition-transform transform hover:scale-105 ${getRankColor(index)}`}>
            <span className="text-lg font-bold w-8">{index + 1}</span>
            <div className="flex-1 ml-4">
              <p className="font-semibold text-gray-900">{employee.name}</p>
            </div>
            <div className="text-xl font-bold text-gray-800">{employee.points} pts</div>
          </li>
        ))}
      </ul>
    </div>
  );
};
const AwardPoints = ({ employees }) => {
  const [selectedEmployee, setSelectedEmployee] = React.useState('');
  const [points, setPoints] = React.useState(5); // Default to 5 diligence points
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!selectedEmployee) {
      setError('Please select an employee.');
      return;
    }

    try {
      const response = await fetch('/api/award_points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selectedEmployee, points: parseInt(points, 10) }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to award points');
      }
      setMessage(data.message);
      // Reset form
      setSelectedEmployee('');
      setPoints(5);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Award Diligence Points</h2>
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700">
            Select Employee
          </label>
          <select
            id="employee-select"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">-- Choose an employee --</option>
            {employees.map(emp => (
              <option key={emp.name} value={emp.name}>{emp.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="points-input" className="block text-sm font-medium text-gray-700">
            Points to Award
          </label>
          <input
            type="number"
            id="points-input"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            min="1"
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          Award Points
        </button>
      </form>
    </div>
  );
};
