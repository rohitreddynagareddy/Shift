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

  const { operationalPulse, futureCast, teamWellness } = managerData;

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
          <div id="team-ticket-chart" style={{ width: '100%', height: '300px' }}>
            <div className="flex items-center justify-center h-full text-gray-500">Chart Placeholder</div>
          </div>
      </DashboardCard>
    </div>
  );
};
