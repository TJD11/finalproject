import { format, formatDistance, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns';

export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a');
};

export const getTimeRemaining = (dueDate) => {
  if (!dueDate) return null;
  const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return differenceInDays(dateObj, new Date());
};

export const getUrgencyLevel = (dueDate) => {
  const days = getDaysUntilDue(dueDate);
  if (days === null) return 'safe';
  if (days < 0) return 'overdue';
  if (days < 1) return 'urgent';
  if (days <= 3) return 'soon';
  return 'safe';
};

export const getCalendarDays = (date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const isSameDayHelper = (date1, date2) => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
};

export const isTodayHelper = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isToday(dateObj);
};

export const formatMinutesToHours = (minutes) => {
  if (!minutes) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};
