const Sidebar = ({ userType, uploadedFileName, activeView, onNavigate }) => {
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

  const managerLinks = [
    { name: 'Home', iconName: 'Briefcase', view: 'home' },
    { name: 'AI Roster Generator', iconName: 'BrainCircuit', view: 'roster' },
    { name: 'Team Analytics', iconName: 'BarChart2', view: 'analytics' },
    { name: 'Schedule Manager', iconName: 'Calendar', view: 'schedule' },
    { name: 'Leaderboard', iconName: 'Trophy', view: 'leaderboard' },
  ];

  const engineerLinks = [
    { name: 'Home', iconName: 'Briefcase', view: 'home' },
    { name: 'My Schedule', iconName: 'Calendar', view: 'schedule' },
    { name: 'Gamification', iconName: 'Star', view: 'gamification' },
    { name: 'Leaderboard', iconName: 'Trophy', view: 'leaderboard' },
    { name: 'Request Swap/Leave', iconName: 'ArrowRightLeft', view: 'request' },
    { name: 'My Performance', iconName: 'BarChart2', view: 'performance' },
  ];

  const links = userType === 'manager' ? managerLinks : engineerLinks;

  return (
    <div className="bg-custom-blue text-gray-300 w-64 min-h-screen p-4 flex-col hidden lg:flex">
      <div className="flex items-center mb-10">
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-2 rounded-lg mr-3 shadow-lg">
          {Icon('Shield', { size: 28 })}
        </div>
        <h1 className="text-2xl font-bold text-white">Roster Genius</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          {links.map(link => {
            const isActive = activeView === link.view;
            const linkClass = `flex items-center p-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-custom-blue-hover'}`;
            return (
              <li key={link.name} className="mb-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(link.view);
                  }}
                  className={linkClass}
                >
                  {Icon(link.iconName)}
                  <span className="ml-3 font-medium">{link.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto">
        <div className="text-xs text-gray-400 p-2">
          Data Source: {uploadedFileName ? (
            <span className="font-semibold text-green-300">{uploadedFileName}</span>
          ) : (
            <span className="text-yellow-300">Using Sample Data</span>
          )}
        </div>
      </div>
    </div>
  );
};
