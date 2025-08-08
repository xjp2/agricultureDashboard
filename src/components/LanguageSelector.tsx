import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../lib/i18n';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const getFlagEmoji = (lang: Language) => {
    switch (lang) {
      case 'en': return '🇬🇧'; // United Kingdom flag for English
      case 'ms': return '🇲🇾'; // Malaysia flag for Malay
      case 'zh': return '🇨🇳'; // China flag for Chinese
      default: return '🌐';
    }
  };

  const getLanguageName = (lang: Language) => {
    switch (lang) {
      case 'en': return 'English';
      case 'ms': return 'Bahasa Malaysia';
      case 'zh': return '中文';
      default: return 'English';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
        title="Select Language"
      >
        <Globe size={20} className="text-gray-800 dark:text-white" />
        <span className="ml-2 text-lg">{getFlagEmoji(language)}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                language === 'en' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              <span className="mr-2 text-lg">🇬🇧</span> English
            </button>
            <button
              onClick={() => handleLanguageChange('ms')}
              className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                language === 'ms' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              <span className="mr-2 text-lg">🇲🇾</span> Bahasa Malaysia
            </button>
            <button
              onClick={() => handleLanguageChange('zh')}
              className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                language === 'zh' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              <span className="mr-2 text-lg">🇨🇳</span> 中文
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;