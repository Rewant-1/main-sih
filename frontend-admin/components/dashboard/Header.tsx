import React from "react";
import { Bell, User } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center px-6 py-2 border-b border-gray-100 bg-white">

      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <img
          src="/fot_logo.png"
          alt="Faculty of Technology Logo"
          className="h-14 object-contain"
        />
      </div>

      {/* Icons Section */}
      <div className="flex items-center gap-4">
        <button title="Notifications" className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={24} />
        </button>

        <button title="User Profile" className="p-1 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            <User size={24} className="text-gray-400" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
