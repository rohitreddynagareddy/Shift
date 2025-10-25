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
