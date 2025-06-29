import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDateOnly = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'yyyy년 M월 d일', { locale: ko });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'yyyy년 M월 d일 HH:mm', { locale: ko });
};

export const formatDateShort = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'yy.M.d', { locale: ko });
};