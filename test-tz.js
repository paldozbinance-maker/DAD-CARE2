const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Mogadishu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});
const parts = formatter.formatToParts(new Date());
const year = parts.find(p => p.type === 'year')?.value;
const month = parts.find(p => p.type === 'month')?.value;
const day = parts.find(p => p.type === 'day')?.value;
const todayStr = `${year}-${month}-${day}`;

console.log('todayStr:', todayStr);
