const AR_OFFSET_MIN = -3 * 60;

const getArgDateInfo = () => {
  const now = new Date();
  const argMs = now.getTime() + AR_OFFSET_MIN * 60 * 1000;
  const argDate = new Date(argMs);
  return {
    year: argDate.getUTCFullYear(),
    month: argDate.getUTCMonth(),
    day: argDate.getUTCDate(),
  };
};

export const getArgToday = () => {
  const { year, month, day } = getArgDateInfo();
  return new Date(Date.UTC(year, month, day));
};

export const getArgStartOfMonth = () => {
  const { year, month } = getArgDateInfo();
  return new Date(Date.UTC(year, month, 1));
};

export const getArgStartOfDay = (date) => {
  const d = new Date(date);
  const local = new Date(d.getTime() + AR_OFFSET_MIN * 60 * 1000);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
};

export const toArgISODate = (date) => {
  const d = new Date(date);
  const local = new Date(d.getTime() + AR_OFFSET_MIN * 60 * 1000);
  return local.toISOString().split('T')[0];
};

export const toArgDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day) + AR_OFFSET_MIN * 60 * 1000);
};

export const isDateExpired = (date, today = getArgToday()) => {
  if (!date) return false;
  return getArgStartOfDay(date) < today;
};