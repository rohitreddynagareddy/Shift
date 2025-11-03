const DashboardCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200/80 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${className}`}>
      {children}
    </div>
  );
};
