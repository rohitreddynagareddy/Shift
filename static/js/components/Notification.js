const Notification = ({ notification, onRemove }) => {
  const { id, message, type } = notification;
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(id), 500); // Allow time for exit animation
    }, 5000); // 5 seconds visible

    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setExiting(true);
    setTimeout(() => onRemove(id), 500);
  };

  const baseClasses = "flex items-center justify-between p-4 rounded-lg shadow-lg text-white transition-all duration-500 transform";
  const typeClasses = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };
  const animationClasses = exiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0';

  return (
    <div className={`${baseClasses} ${typeClasses[type] || 'bg-gray-500'} ${animationClasses}`}>
      <span>{message}</span>
      <button onClick={handleRemove} className="ml-4 font-bold">X</button>
    </div>
  );
};

const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-5 right-5 z-50 space-y-2 w-80">
      {notifications.map(n => (
        <Notification key={n.id} notification={n} onRemove={onRemove} />
      ))}
    </div>
  );
};
