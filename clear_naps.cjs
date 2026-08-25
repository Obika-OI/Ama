const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /const \[sleepLogs, setSleepLogs\] = useState<any\[\]>\(\[\s*\{\s*start: '10:00 AM', end: '11:30 AM', duration: '1h 30m', quality: '😴', timestamp: new Date\(\).toISOString\(\) \}\s*\]\);/g,
  `const [sleepLogs, setSleepLogs] = useState<any[]>([]);`
);

fs.writeFileSync('src/App.tsx', app);
console.log('App updated to clear naps.');
