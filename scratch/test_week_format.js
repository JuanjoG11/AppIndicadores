import { format } from 'date-fns';

const getISOWeekKey = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dow = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dow); // ISO Thursday
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${week.toString().padStart(2, '0')}`;
};

const d = new Date('2026-07-07');
console.log('Date-fns:   ', format(d, "yyyy-'W'II"));
console.log('Custom helper:', getISOWeekKey(d));
