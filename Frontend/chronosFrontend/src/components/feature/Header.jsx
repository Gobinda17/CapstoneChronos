import { useState } from "react";

export const Header = ({ user, onLogout, onMobileMenuToggle }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i className="ri-menu-line text-xl"></i>
          </button>

          <div className="hidden sm:block">
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">
              Cron Job Manager
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <i className="ri-notification-line text-xl"></i>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700 truncate max-w-32 lg:max-w-none">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-32 lg:max-w-none">
                  {user?.email || "user@example.com"}
                </p>
              </div>
              <i className="ri-arrow-down-s-line text-gray-400"></i>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <i className="ri-user-line mr-2"></i>
                  Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <i className="ri-settings-line mr-2"></i>
                  Settings
                </button>
                <hr className="my-2" />
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <i className="ri-logout-box-line mr-2"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
