import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: (string | SelectOption)[];
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  onKeyDown,
  placeholder = "Seleccionar...",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setActiveIndex(-1);
      // Give time for animation to focus
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    return !searchTerm.trim() 
      ? options 
      : options.filter(o => {
          const label = typeof o === 'string' ? o : o.label;
          return label.toLowerCase().includes(searchTerm.toLowerCase());
        });
  }, [options, searchTerm]);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const getLabel = (val: string) => {
    const opt = options.find(o => typeof o === 'string' ? o === val : o.value === val);
    if (!opt) return placeholder;
    return typeof opt === 'string' ? opt : opt.label;
  };

  const handleGlobalKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
    } else {
      if (e.key === 'ArrowDown') {
        setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        e.preventDefault();
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        const opt = filteredOptions[activeIndex];
        const val = typeof opt === 'string' ? opt : opt.value;
        handleSelect(val);
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        e.preventDefault();
      }
    }
    
    if (onKeyDown) onKeyDown(e);
  };

  // Auto-scroll to active item
  useEffect(() => {
    if (activeIndex >= 0 && optionsRef.current) {
      const activeEl = optionsRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  return (
    <div className={`relative w-full ${isOpen ? 'z-[9999]' : 'z-10'}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleGlobalKeyDown}
        className={`modern-input flex items-center transition-all duration-300 relative
          ${isOpen ? 'ring-4 ring-primary/10 border-primary bg-[var(--surface)]' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed select-none' : ''}
          ${className}
        `}
      >
        <span className={`w-full px-4 ${className.includes('text-center') ? 'text-center' : 'text-left'} truncate ${value ? 'text-[var(--on-surface)]' : 'text-[var(--on-surface-variant)] opacity-60'}`}>
          {getLabel(value)}
        </span>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <ChevronDown 
            size={18} 
            className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-[var(--on-surface-variant)]'}`} 
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 12, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 z-[10000] w-full bg-[var(--surface-card)]/95 backdrop-blur-3xl border border-[var(--outline)] rounded-[1.5rem] md:rounded-[2rem] shadow-[0_30px_90px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="p-2 border-b border-[var(--outline)] bg-[var(--surface)]/50">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setActiveIndex(0);
                  }}
                  placeholder="Buscar..."
                  className="w-full bg-transparent border-none pl-9 pr-8 py-2 text-sm font-bold text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-variant)]/40"
                  onKeyDown={handleGlobalKeyDown}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] hover:text-primary transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div 
              ref={optionsRef}
              className="max-h-[240px] overflow-y-auto custom-scrollbar pt-1 pb-2"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((o, index) => {
                  const optValue = typeof o === 'string' ? o : o.value;
                  const optLabel = typeof o === 'string' ? o : o.label;
                  const isSelected = value === optValue;
                  const isActive = activeIndex === index;
                  
                  return (
                    <button
                      key={optValue}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => handleSelect(optValue)}
                      className={`w-full px-6 py-3.5 text-left text-sm font-bold flex items-center justify-between transition-all
                        ${isSelected 
                          ? 'bg-primary text-slate-900' 
                          : isActive 
                            ? 'bg-primary/20 text-primary' 
                            : 'hover:bg-primary/5 text-[var(--on-surface)]'}
                      `}
                    >
                      <span className="truncate">{optLabel}</span>
                      {isSelected && <Check size={16} />}
                    </button>
                  );
                })
              ) : (
                <div className="px-6 py-8 text-center text-[var(--on-surface-variant)] opacity-50 italic text-sm">
                  No se encontraron resultados
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

