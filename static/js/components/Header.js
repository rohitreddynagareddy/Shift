const Header = ({ userType, engineerName, onSwitchUserType }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // This helper function renders icons from the global 'lucide' object
  const Icon = (name, props = {}) => {
      const { size = 20, className = '' } = props;
      const camelCaseName = name.charAt(0).toLowerCase() + name.slice(1).replace(/-(\w)/g, g => g[1].toUpperCase());
      const iconNode = lucide.icons[camelCaseName];
      if (!iconNode) {
          console.warn(`Lucide icon not found: ${name} (as ${camelCaseName})`);
          // Return a span with a placeholder to maintain layout
          return <span className={className}><svg width={size} height={size}></svg></span>;
      }
      // The className is passed to a wrapper span because dangerouslySetInnerHTML doesn't apply it to the SVG root.
      return <span className={className} dangerouslySetInnerHTML={{ __html: iconNode.toSvg({ width: size, height: size }) }} />;
  };

  const title = userType === 'manager'
    ? "Manager's Command Center"
    : `Engineer's Dashboard (${engineerName})`;

  const switchUserText = userType === 'manager' ? 'Engineer' : 'Manager';

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <div className="flex items-center">
        <div className="relative mr-4">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            {Icon('User', { size: 20, className: 'mr-2' })}
            <span className="font-semibold">{userType === 'manager' ? 'Manager' : 'Engineer'} View</span>
            {Icon('ChevronDown', { size: 16, className: 'ml-1' })}
          </button>
          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20"
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSwitchUserType();
                  setIsDropdownOpen(false);
                }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
              >
                Switch to {switchUserText}
              </a>
            </div>
          )}
        </div>
        <button className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg mr-2 hover:bg-blue-700">Invite</button>
        <button className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Publish Roster</button>
      </div>
    </header>
  );
};
