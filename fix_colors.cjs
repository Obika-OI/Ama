const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(/bg-primary([^"']*)text-gray-800/g, 'bg-primary$1text-white');
app = app.replace(/bg-purple-600([^"']*)text-gray-800/g, 'bg-purple-600$1text-white');
app = app.replace(/bg-amber-600([^"']*)text-gray-800/g, 'bg-amber-600$1text-white');
app = app.replace(/bg-amber-500([^"']*)text-gray-800/g, 'bg-amber-500$1text-white');
app = app.replace(/bg-green-500([^"']*)text-gray-800/g, 'bg-green-500$1text-white');
app = app.replace(/bg-blue-600([^"']*)text-gray-800/g, 'bg-blue-600$1text-white');
app = app.replace(/bg-rose-500([^"']*)text-gray-800/g, 'bg-rose-500$1text-white');
app = app.replace(/text-gray-800\/70/g, 'text-white/70');
app = app.replace(/text-gray-800\/20/g, 'text-white/20');
app = app.replace(/text-gray-800\/60/g, 'text-white/60');
app = app.replace(/text-gray-800\/10/g, 'text-white/10');
app = app.replace(/text-gray-800 mt-1 leading-tight/g, 'text-white mt-1 leading-tight');
app = app.replace(/text-gray-800 space-y-4 shadow-xl/g, 'text-white space-y-4 shadow-xl');

fs.writeFileSync('src/App.tsx', app);
console.log('Colors fixed.');
