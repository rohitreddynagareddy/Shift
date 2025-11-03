const EngineerSchedule = ({ engineerData }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

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
    return <div className="p-8">Loading...</div>;
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getShiftForDay = (day) => {
      const dayOfWeek = new Date(year, month, day).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) return 'Off';
      return (day % 2 === 0) ? 'Evening' : 'Morning';
  };

  const getShiftColor = (shift) => {
      switch (shift) {
          case 'Morning': return 'bg-blue-100 text-blue-800';
          case 'Evening': return 'bg-indigo-100 text-indigo-800';
          case 'Off': return 'bg-gray-200 text-gray-700';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(year, month + offset, 1));
  };

  const calendarGrid = (
    <div className="grid grid-cols-7 gap-px bg-gray-200 border-l border-t border-gray-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <div key={day} className="py-2 text-center font-semibold text-gray-600 bg-gray-50">{day}</div>)}
        {blanks.map((_, index) => <div key={`blank-${index}`} className="bg-white border-r border-b border-gray-200"></div>)}
        {days.map(day => {
            const shift = getShiftForDay(day);
            return (
                <div key={day} className="bg-white p-2 min-h-[120px] border-r border-b border-gray-200 flex flex-col">
                    <div className="font-bold text-right text-gray-700">{day}</div>
                    <div className="flex-grow flex items-center justify-center mt-2">
                        <span className={`font-semibold text-sm px-3 py-1.5 rounded-lg ${getShiftColor(shift)}`}>{shift}</span>
                    </div>
                </div>
            );
        })}
    </div>
  );

  return (
     <div className="p-8 bg-gray-100 flex-1">
         <DashboardCard>
             <div className="flex justify-between items-center mb-6">
                 <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200">{Icon("ChevronLeft")}</button>
                 <h1 className="text-2xl font-bold text-gray-800">
                     My Schedule for {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                 </h1>
                 <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200">{Icon("ChevronRight")}</button>
             </div>
             {calendarGrid}
         </DashboardCard>
     </div>
  );
};
