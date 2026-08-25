const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix Recipe log modal height
content = content.replace(
  /className="relative w-full max-w-md bg-card rounded-t-\[48px\] p-10 space-y-8 shadow-2xl"/,
  'className="relative w-full max-w-md bg-card rounded-t-[48px] p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"'
);

// 2. Add consistency and newFood to Journal's Logged Meals view
content = content.replace(
  /<span className="font-bold text-gray-800">\{meal\.title\}<\/span>\n\s*<span className="text-\[10px\] text-gray-400 font-bold uppercase">\{meal\.logType \|\| meal\.type\}<\/span>/,
  `<span className="font-bold text-gray-800">{meal.title}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{meal.logType || meal.type} • {meal.consistency} {meal.newFood}</span>`
);

fs.writeFileSync('src/App.tsx', content);
