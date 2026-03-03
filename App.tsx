
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Icon from './components/Icon';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import { NotificationService } from './services/notificationService';
import { initAppStorage } from './services/storageService';

const Navigation = ({ isDarkMode, toggleTheme }: { isDarkMode: boolean, toggleTheme: () => void }) => {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#111]/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 px-6 py-3 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-4xl mx-auto flex justify-around items-center">
          <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${location.pathname === '/' ? 'text-[#d4af37] scale-110' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
        >
          <Icon name="fa-house-chimney" className="text-xl" />
          <span className="text-[10px] font-black uppercase tracking-widest">الرئيسية</span>
        </Link>
        
          <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="w-14 h-14 -mt-12 bg-gradient-to-br from-[#d4af37] via-[#b8962c] to-[#9a7d24] rounded-full flex items-center justify-center shadow-2xl shadow-yellow-900/40 md:mt-0 md:w-11 md:h-11 border-4 border-white dark:border-[#111] z-10"
        >
            <Icon name={isDarkMode ? 'fa-sun' : 'fa-moon'} className={`text-white text-xl md:text-lg`} />
        </motion.button>

        <Link 
          to="/history" 
          className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${location.pathname === '/history' ? 'text-[#d4af37] scale-110' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
        >
          <Icon name="fa-chart_line" className="text-xl" />
          <span className="text-[10px] font-black uppercase tracking-widest">التقييم</span>
        </Link>
      </div>
    </nav>
  );
};

const Header = () => (
  <header className="pt-16 pb-6 md:pt-24 md:pb-12 text-center relative overflow-visible px-4">
    {/* Fatimid Style Garland Decorations */}
    <div className="absolute top-0 left-0 right-0 h-16 flex justify-center pointer-events-none select-none overflow-hidden">
       {/* Central Garland Path */}
       <svg className="absolute w-full h-24 top-0 opacity-20 dark:opacity-30" preserveAspectRatio="none" viewBox="0 0 100 20">
          <path d="M0,5 Q50,20 100,5" stroke="#d4af37" strokeWidth="0.5" fill="none" />
          {[...Array(10)].map((_, i) => (
            <circle key={i} cx={10 * i} cy={5 + (i % 2 === 0 ? 5 : 8)} r="0.5" fill="#d4af37" />
          ))}
       </svg>
    </div>

    {/* Hanging Elements - Adjusted for Mobile */}
    <div className="absolute top-0 left-2 md:left-24 animate-swing origin-top z-20">
      <div className="w-[1px] h-8 md:h-12 bg-[#d4af37]/40 mx-auto"></div>
      <div className="flex flex-col items-center -mt-1">
        <Icon name="fa-moon" className="text-yellow-500 text-[10px] md:text-xs lantern" />
        <Icon name="fa-star" className="text-yellow-600/30 text-[6px] md:text-[8px] mt-1" />
      </div>
    </div>
    
    <div className="absolute top-0 right-2 md:right-24 animate-swing origin-top z-20" style={{ animationDelay: '0.3s' }}>
      <div className="w-[1px] h-10 md:h-14 bg-[#d4af37]/40 mx-auto"></div>
      <div className="flex flex-col items-center -mt-1">
        <Icon name="fa-mosque" className="text-yellow-600/40 text-[10px] md:text-xs mb-1" />
        <Icon name="fa-star" className="text-yellow-500 text-[10px] md:text-xs lantern" />
      </div>
    </div>

    {/* Main Ramadan Mubarak Banner */}
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative inline-flex items-center justify-center gap-2 md:gap-4 mb-6 md:mb-10"
    >
       <div className="flex flex-col items-center animate-float" style={{ animationDelay: '0.1s' }}>
         <Icon name="fa-moon" className="text-yellow-500 text-lg md:text-xl lantern rotate-[-15deg]" />
       </div>

       <div className="px-6 py-3 md:px-10 md:py-4 bg-gradient-to-r from-yellow-600/10 via-yellow-400/20 to-yellow-600/10 dark:from-yellow-900/30 dark:via-yellow-800/20 dark:to-yellow-900/30 rounded-full border border-yellow-500/30 backdrop-blur-md shadow-xl animate-glow relative overflow-hidden group">
          <div className="absolute inset-0 islamic-pattern opacity-10"></div>
          <span className="relative z-10 text-[#b8962c] dark:text-[#f9e29c] text-lg md:text-2xl font-black tracking-widest uppercase quran-font">
            رمضان مبارك
          </span>
       </div>

       <div className="flex flex-col items-center animate-float" style={{ animationDelay: '0.2s' }}>
         <Icon name="fa-moon" className="text-yellow-500 text-lg md:text-xl lantern rotate-[15deg]" style={{ transform: 'scaleX(-1)' }} />
       </div>
    </motion.div>
    
    <div className="relative">
      <motion.h1 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="text-6xl md:text-9xl font-extrabold gold-gradient mb-3 drop-shadow-2xl tracking-tighter quran-font"
      >
        زاد المسلم
      </motion.h1>
      <div className="flex items-center justify-center gap-2 md:gap-3">
         <div className="h-[1px] w-6 md:w-8 bg-yellow-600/30"></div>
         <p className="text-gray-600 dark:text-gray-400 font-bold tracking-[0.15em] text-[10px] md:text-sm opacity-80 uppercase">رفيقك الإيماني في رحلة الريان</p>
         <div className="h-[1px] w-6 md:w-8 bg-yellow-600/30"></div>
      </div>
    </div>
  </header>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route 
          path="/" 
          element={
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard />
            </motion.div>
          } 
        />
        <Route 
          path="/history" 
          element={
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <History />
            </motion.div>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    // initialize localStorage keys to ensure offline-first behavior
    initAppStorage();

    const initNotifications = async () => {
      try {
        const granted = await NotificationService.requestPermissions();
        if (granted) {
          await NotificationService.scheduleReminders();
        }
      } catch (e) { console.error('Notification init failed', e); }
    };
    initNotifications();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col pb-28 md:pb-12 md:pt-20 theme-transition overflow-x-hidden bg-[#fdfcf0] dark:bg-[#0a0a0a]">
        <Header />
        <main className="flex-grow max-w-4xl mx-auto w-full px-4 relative">
          <AnimatedRoutes />
        </main>
        <Navigation isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>
    </HashRouter>
  );
};

export default App;
