const RequestPage = () => {
  const [activeTab, setActiveTab] = React.useState('swap');

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

  const renderSwapRequestTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DashboardCard>
            <h3 className="font-bold text-xl mb-4 text-gray-800">My Upcoming Shifts</h3>
            <div className="space-y-3">
                {/* Mock data for now */}
                <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-bold">July 18, 2025</p>
                        <p className="text-sm text-gray-600">Morning Shift</p>
                    </div>
                    <button className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-md hover:bg-blue-600">Request Swap</button>
                </div>
                 <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-bold">July 19, 2025</p>
                        <p className="text-sm text-gray-600">Morning Shift</p>
                    </div>
                    <button className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-md hover:bg-blue-600">Request Swap</button>
                </div>
            </div>
        </DashboardCard>
        <DashboardCard>
            <h3 className="font-bold text-xl mb-4 text-gray-800">Pending Requests</h3>
            <div className="space-y-3">
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg">
                    <p><span className="font-bold">You requested to swap</span> your Morning shift on Jul 18 with Keerthi.</p>
                    <p className="text-sm">Status: Pending colleague approval.</p>
                </div>
            </div>
        </DashboardCard>
    </div>
  );

  const renderLeaveRequestTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DashboardCard>
            <h3 className="font-bold text-xl mb-4 text-gray-800">Submit a New Leave Request</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label htmlFor="leave-type" className="block text-sm font-medium text-gray-700">Leave Type</label>
                    <select id="leave-type" name="leave-type" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        <option>Vacation</option>
                        <option>Sick Leave</option>
                        <option>Personal</option>
                    </select>
                </div>
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" id="start-date" name="start-date" className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2" />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" id="end-date" name="end-date" className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
                    <textarea id="reason" name="reason" rows="3" className="mt-1 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"></textarea>
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
                <p className="text-gray-500">You have no past leave requests.</p>
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
    </div>
  );
};
