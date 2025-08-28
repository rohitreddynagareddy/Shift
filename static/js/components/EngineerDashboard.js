const EngineerDashboard = ({ engineerData }) => {
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
  const { name, personalPulse, weekAhead, myTickets, aiAgent } = engineerData;
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

  const [isLeaveToggleOn, setIsLeaveToggleOn] = React.useState(aiAgent.isOnLeave);

  const aiAgentStatus = isLeaveToggleOn ? (
    <div className="space-y-3 bg-green-50 p-4 rounded-lg">
        <p className="text-sm font-semibold text-green-700 mb-2">AI Backup is Active. It will handle:</p>
        {aiAgent.tasks.map(task => (
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
                  <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center font-semibold">
                      {Icon('ArrowRightLeft', { size: 18, className: 'mr-2' })} Request Shift Swap
                  </button>
                  <button className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center font-semibold">
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
                          <input type="checkbox" id="leave-toggle" className="sr-only" checked={isLeaveToggleOn} onChange={() => setIsLeaveToggleOn(!isLeaveToggleOn)} />
                          <div className="block bg-gray-200 w-12 h-7 rounded-full"></div>
                          <div className={`dot absolute left-1 top-1 w-5 h-5 rounded-full shadow-md transition-transform duration-300 ease-in-out ${isLeaveToggleOn ? 'transform translate-x-full bg-green-500' : 'bg-gray-400'}`}></div>
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
