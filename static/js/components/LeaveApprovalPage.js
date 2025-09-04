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
