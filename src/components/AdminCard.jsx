const AdminCard = ({ title, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-700 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-blue-600 to-blue-700',
  };

  return (
    <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-extrabold text-gray-900">{value}</p>
        </div>
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 rounded-xl text-white text-3xl shadow-md transform group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className={`mt-4 h-1 bg-gradient-to-r ${colorClasses[color]} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
    </div>
  );
};

export default AdminCard;
