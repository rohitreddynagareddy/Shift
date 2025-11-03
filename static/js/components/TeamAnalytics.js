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
