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

  const { Name, ticketsResolved, avgResolutionTime, csat, myKudos } = engineerData;

  const kpiCards = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    { name: 'Tickets Resolved', You: ticketsResolved, Team: teamAverages.avg_tickets_resolved },
    { name: 'Resolution Time (min)', You: avgResolutionTime, Team: teamAverages.avg_resolution_time },
    { name: 'CSAT (%)', You: csat, Team: teamAverages.avg_csat },
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
