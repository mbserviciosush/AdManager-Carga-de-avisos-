import { addDays, isSaturday, isSunday, format, parseISO } from 'date-fns';
import { Feriado, Edición } from '../types';

export function isHoliday(date: Date, feriados: Feriado[]): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  return feriados.some(h => h.fecha === dateStr);
}

export function isValidWorkDay(date: Date, feriados: Feriado[], allowedDays: number[]): boolean {
  const day = date.getDay();
  if (isHoliday(date, feriados)) return false;
  
  // Si no se especifican días, por defecto es Lunes a Viernes (1-5)
  const allowed = allowedDays.length > 0 ? allowedDays : [1, 2, 3, 4, 5];
  return allowed.includes(day);
}

export function getNextValidDate(startDate: Date, feriados: Feriado[], allowedDays: number[]): Date {
  let current = startDate;
  while (!isValidWorkDay(current, feriados, allowedDays)) {
    current = addDays(current, 1);
  }
  return current;
}

export function generateValidDates(startDate: Date, quantity: number, feriados: Feriado[], allowedDays: number[]): Date[] {
  const dates: Date[] = [];
  if (quantity <= 0 || allowedDays.length === 0) return dates;
  
  let current = startDate;
  let safetyCounter = 0;
  const maxIterations = 1000; // Seguridad contra bucles infinitos
  
  while (dates.length < quantity && safetyCounter < maxIterations) {
    if (isValidWorkDay(current, feriados, allowedDays)) {
      dates.push(new Date(current));
    }
    current = addDays(current, 1);
    safetyCounter++;
  }
  
  return dates;
}

// Format helpers
export function formatDateES(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy');
  } catch {
    return dateStr;
  }
}
