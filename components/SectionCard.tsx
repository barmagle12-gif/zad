
import React, { useState } from 'react';
import Icon from './Icon';
import { motion, AnimatePresence } from 'motion/react';

interface InfoItem {
  type: string;
  text: string;
}

interface SectionCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  infoItems?: InfoItem[];
  defaultOpen?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children, infoItems, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div 
      layout
      initial={false}
      className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-[2rem] overflow-hidden transition-all hover:border-yellow-700/30 group shadow-lg dark:shadow-2xl"
    >
      <motion.div 
        layout="position"
        className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a1a1a] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4 flex-grow">
            <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-[#222] flex items-center justify-center text-[#d4af37] border border-gray-200 dark:border-gray-800 group-hover:border-yellow-600/50 transition-colors shadow-sm"
          >
            <Icon name={icon} className={`text-xl ${isOpen ? 'animate-pulse' : ''}`} />
          </motion.div>
          <div className="flex flex-col">
             <h3 className="text-lg font-black text-slate-800 dark:text-gray-100 tracking-tight">{title}</h3>
             <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">
               {isOpen ? 'انقر للإغلاق' : 'انقر للتفاصيل والمهام'}
             </span>
          </div>
        </div>
        
          <motion.div 
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-yellow-600 bg-gray-100 dark:bg-[#222] transition-all"
        >
          <Icon name="fa-chevron-down" className="text-xs" />
        </motion.div>
      </motion.div>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            {/* Religious Info */}
            {infoItems && infoItems.length > 0 && (
              <div className="bg-yellow-50/30 dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800/50">
                {infoItems.map((info, idx) => (
                  <div key={idx} className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                      <span className="text-[10px] font-black px-3 py-1 rounded-full bg-yellow-600/10 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 uppercase tracking-widest">
                        {info.type} اليوم
                      </span>
                    </div>
                    <p className="quran-font text-slate-700 dark:text-gray-200 text-2xl leading-relaxed text-right pr-6 border-r-4 border-yellow-600/30 dark:border-yellow-800/30 italic">
                      {info.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="p-6 dark:text-gray-300">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SectionCard;
