const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /if \(!newPlanTitle && newPlanType !== 'meal'\) return;/,
  'if (!newPlanTitle) return;'
);

fs.writeFileSync('src/App.tsx', content);
