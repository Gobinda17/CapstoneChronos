
export const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full whitespace-nowrap';
  
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800'
  };
  
  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };
  
  return (
    <span className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};
