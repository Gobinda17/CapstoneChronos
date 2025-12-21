
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Sidebar = ({ isCollapsed, onToggle, isMobileOpen = false, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'ri-dashboard-line' },
    { name: 'Jobs', href: '/dashboard/jobs', icon: 'ri-timer-line' },
    { name: 'Schedule', href: '/dashboard/schedule', icon: 'ri-calendar-line' },
    { name: 'Logs', href: '/dashboard/logs', icon: 'ri-file-list-3-line' },
    { name: 'Profile', href: '/dashboard/profile', icon: 'ri-user-line' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobileOpen && onMobileClose) {
        onMobileClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen, onMobileClose]);
  
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        bg-gray-900 text-white transition-all duration-300 z-50
        ${isCollapsed ? 'w-16' : 'w-64'} 
        min-h-screen
        fixed lg:relative
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-xl font-bold truncate">CronManager</h1>
            )}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              <i className={`ri-${isCollapsed ? 'menu-unfold' : 'menu-fold'}-line`}></i>
            </button>
          </div>
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              className={`
                w-full flex items-center px-4 py-3 text-left hover:bg-gray-800 transition-colors whitespace-nowrap
                ${location.pathname === item.href ? 'bg-gray-800 border-r-2 border-blue-500' : ''}
              `}
            >
              <i className={`${item.icon} text-lg flex-shrink-0`}></i>
              {!isCollapsed && (
                <span className="ml-3 truncate">{item.name}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};
