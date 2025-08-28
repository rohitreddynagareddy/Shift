const AIRosterGenerator = () => {
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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const employeesSheetName = 'Employees';
            if (!workbook.SheetNames.includes(employeesSheetName)) {
                throw new Error(`Excel file must contain a sheet named "${employeesSheetName}".`);
            }
            const worksheet = workbook.Sheets[employeesSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            if (jsonData.length === 0) {
                throw new Error('The "Employees" sheet is empty.');
            }
            if (!('Name' in jsonData[0]) || !('Role' in jsonData[0])) {
                throw new Error('The "Employees" sheet must have "Name" and "Role" columns.');
            }
            setMembers(jsonData);
            setRosterError(null);
        } catch (error) {
            setRosterError(`Error processing Excel file: ${error.message}`);
            setMembers([]);
            setFileName('');
        }
    };
    reader.readAsArrayBuffer(file);
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
        <p className="text-gray-600 mb-4">Upload an Excel file (.xlsx, .xls) with an "Employees" sheet. Required columns: <strong>Name</strong> and <strong>Role</strong>.</p>
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
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Morning</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Afternoon</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evening</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Night</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Off</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {Object.entries(generatedRoster).map(([day, shifts]) => (
                    <tr key={day}>
                        <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{day}</td>
                        {["Morning", "Afternoon", "Evening", "Night"].map(shift => (
                            <td key={shift} className="py-4 px-4 whitespace-nowrap text-gray-600 space-y-1">
                                {shifts[shift] && shifts[shift].map(person => (
                                    <div key={person.name} className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(person.role)}`}>
                                        {person.name}
                                    </div>
                                ))}
                            </td>
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
