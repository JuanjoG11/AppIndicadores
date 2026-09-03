const toMonthKey = (periodOrKey) => {
    if (!periodOrKey) return null;
    const s = String(periodOrKey);
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    if (/^\d{4}-\d{2}[-_]/.test(s)) return s.substring(0, 7);
    const weekMatch = s.match(/^(\d{4})-W(\d{1,2})$/);
    if (weekMatch) {
        const year = parseInt(weekMatch[1]);
        const week = parseInt(weekMatch[2]);
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dow = simple.getDay();
        const isoStart = new Date(simple);
        if (dow <= 4) isoStart.setDate(simple.getDate() - simple.getDay() + 1);
        else isoStart.setDate(simple.getDate() + 8 - simple.getDay());
        isoStart.setDate(isoStart.getDate() + 3);
        return `${isoStart.getFullYear()}-${String(isoStart.getMonth() + 1).padStart(2, '0')}`;
    }
    if (s.length >= 7 && /^\d{4}-\d{2}/.test(s)) return s.substring(0, 7);
    return null;
};

console.log('2026-W30 ->', toMonthKey('2026-W30'));
console.log('2026-W31 ->', toMonthKey('2026-W31'));
console.log('2026-W32 ->', toMonthKey('2026-W32'));
console.log('2026-08-Q1 ->', toMonthKey('2026-08-Q1'));
console.log('2026-08 ->', toMonthKey('2026-08'));
