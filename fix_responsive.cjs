const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  /className="flex items-center justify-between relative z-10"/g,
  'className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10 gap-4"'
);
fs.writeFileSync('src/App.tsx', app);
console.log('Fixed quest progress responsiveness');
