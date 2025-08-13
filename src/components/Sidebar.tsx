import React from 'react';
import { LayoutDashboard, Bone as Drone, Map, Users, Package, BarChart4, Sprout, Cloud, Settings, LogOut, CloudRain, Leaf, Calculator, CreditCard } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  currentPage: string;
  onNavigate: (page: string) => void;
  darkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  currentPage, 
  onNavigate,
  darkMode
}) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard size={20} /> },
    { id: 'fields', label: t('fields'), icon: <Map size={20} /> },
    { id: 'rainfall', label: t('rainfall'), icon: <CloudRain size={20} /> },
    { id: 'fertilizer', label: t('fertilizer'), icon: <Leaf size={20} /> },
    { id: 'workers', label: t('workers'), icon: <Users size={20} /> },
    { id: 'accounting', label: t('accounting'), icon: <Calculator size={20} /> },
    { id: 'debt', label: 'Debt', icon: <CreditCard size={20} /> },
  ];

  return (
    <aside 
      className={`${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      } border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col h-full`}
    >
      <div className={`p-5 flex items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
        <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
          <Sprout size={20} className="text-white" />
        </div>
        <h2 className={`ml-3 font-bold text-lg transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
          AgriSmart
        </h2>
      </div>
      
      <nav className="flex-1 pt-5 pb-4 overflow-y-auto">
        <ul>
          {navItems.map((item) => (
            <li key={item.id} className="mb-1 px-3">
              <button
                onClick={() => onNavigate(item.id)}
                className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? darkMode 
                      ? 'bg-gray-700 text-green-400' 
                      : 'bg-green-50 text-green-700'
                    : darkMode
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center justify-center">
                  {item.icon}
                </span>
                <span className={`ml-3 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className={`mt-auto border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-4 pb-4 px-3`}>
        <button className={`flex items-center w-full p-3 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
          <span className="flex items-center justify-center">
            <Settings size={20} />
          </span>
          <span className={`ml-3 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            {t('settings')}
          </span>
        </button>
        <button className={`flex items-center w-full p-3 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
          <span className="flex items-center justify-center">
            <LogOut size={20} />
          </span>
          <span className={`ml-3 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            {t('logout')}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;