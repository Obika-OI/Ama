const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  /Save Tooth Emergence Data\n                  <\/button>\n                <\/div>\n        <\/motion.div>/g,
  `Save Tooth Emergence Data\n                  </button>\n        </motion.div>`
);
fs.writeFileSync('src/App.tsx', app);
console.log('Removed extra div 4');
