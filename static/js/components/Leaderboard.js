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
