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
