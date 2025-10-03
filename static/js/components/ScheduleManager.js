const ScheduleManager = ({ employees }) => {
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

  const getRoleColor = (role) => {
    switch (role) {
        case 'Development': return 'bg-blue-100 text-blue-800';
        case 'Operations': return 'bg-green-100 text-green-800';
        case 'DBA': return 'bg-purple-100 text-purple-800';
        case 'Support': return 'bg-pink-100 text-pink-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!employees || employees.length === 0) {
    return <div className="p-8">Loading...</div>;
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Simplified schedule logic for demonstration, now using live employee data
  const schedule = {};
  for(let day = 1; day <= daysInMonth; day++) {
      schedule[day] = { Morning: [], Afternoon: [], Evening: [], Night: [], Off: [] };
      employees.forEach((member, index) => {
          const shiftIndex = (day + index) % 5;
          if (shiftIndex === 0) schedule[day].Morning.push(member);
          else if (shiftIndex === 1) schedule[day].Afternoon.push(member);
          else if (shiftIndex === 2) schedule[day].Evening.push(member);
          else if (shiftIndex === 3) schedule[day].Night.push(member);
          else schedule[day].Off.push(member);
      });
  }

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(year, month + offset, 1));
  };

  const calendarGrid = (
    <div className="grid grid-cols-7 gap-px bg-gray-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <div key={day} className="py-2 text-center font-semibold text-gray-600 bg-gray-50">{day}</div>)}
        {blanks.map((_, index) => <div key={`blank-${index}`} className="bg-gray-50"></div>)}
        {days.map(day => {
            const daySchedule = schedule[day];
            return (
                <div key={day} className="bg-white p-2 min-h-[140px]">
                    <div className="font-bold text-right">{day}</div>
                    {daySchedule && (
                        <div className="space-y-1 mt-1">
                            {Object.entries(daySchedule).map(([shift, people]) => {
                                if (shift === 'Off' || !people || people.length === 0) return null;
                                return (
                                    <div key={shift} className={`text-xs p-1 rounded ${getRoleColor(people[0].role)}`}>
                                        <strong>{shift}:</strong> {people.slice(0,2).map(p=>p.name).join(', ')}
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
                     {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                 </h1>
                 <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200">{Icon("ChevronRight")}</button>
             </div>
             {calendarGrid}
         </DashboardCard>
     </div>
  );
};
