import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, onKeyDown }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value + 'T01:00:00') : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 is Sunday

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const days = [];
  const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  // Fill empty spaces for the first week (Sunday start)
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />);
  }

  // Fill actual days
  for (let i = 1; i <= totalDays; i++) {
    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), i).toDateString();
    const isSelected = value === new Date(currentDate.getFullYear(), currentDate.getMonth(), i).toISOString().split('T')[0];
    
    days.push(
      <button
        key={i}
        onClick={() => handleDateClick(i)}
        className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all
          ${isSelected 
            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
            : 'hover:bg-primary/10 text-[var(--on-surface)]'}
          ${isToday && !isSelected ? 'border border-primary/30 text-primary' : ''}
        `}
      >
        {i}
      </button>
    );
  }

  return (
    <div className={`relative w-full ${isOpen ? 'z-[100]' : 'z-auto'}`} ref={containerRef}>
      <div className="relative group">
        <div 
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none p-1 rounded-lg
            ${isOpen ? 'bg-primary/20 text-primary scale-110' : 'text-[var(--on-surface)] opacity-60'}
            group-hover:opacity-100 group-hover:text-primary
          `}
        >
          <CalendarIcon size={18} strokeWidth={2.5} />
        </div>
        <input
          type="text"
          readOnly
          value={value ? new Date(value + 'T01:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !onKeyDown) {
              setIsOpen(!isOpen);
            }
            if (onKeyDown) onKeyDown(e);
          }}
          placeholder="Seleccionar fecha..."
          className={`modern-input pl-12 cursor-pointer transition-all duration-300
            ${isOpen ? 'ring-4 ring-primary/15 border-primary bg-[var(--surface)] shadow-lg' : ''}
          `}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 12, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 z-[999] w-[calc(100vw-2rem)] max-w-[340px] bg-[var(--surface-card)]/95 backdrop-blur-3xl border border-[var(--outline)] rounded-[2rem] md:rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] p-4 md:p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-primary/5 rounded-xl transition-colors text-[var(--on-surface-variant)]">
                <ChevronLeft size={20} />
              </button>
              <div className="text-center">
                <h4 className="font-display font-black text-[var(--on-surface)] leading-none mb-1">
                  {monthNames[currentDate.getMonth()]}
                </h4>
                <p className="text-[10px] font-black uppercase text-primary tracking-widest">
                  {currentDate.getFullYear()}
                </p>
              </div>
              <button onClick={nextMonth} className="p-2 hover:bg-primary/5 rounded-xl transition-colors text-[var(--on-surface-variant)]">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'].map(d => (
                <div key={d} className="text-center text-[9px] font-black tracking-tighter text-[var(--on-surface-variant)] py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days}
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--outline)] flex justify-between items-center">
               <button 
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  onChange(today);
                  setCurrentDate(new Date());
                  setIsOpen(false);
                }}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
               >
                Hoy
               </button>
               <button 
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]"
               >
                Cerrar
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
