const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /Save Tooth Emergence Data\n                  <\/button>\n        <\/motion.div>\n      \)\}/g,
  `Save Tooth Emergence Data\n                  </button>\n                </motion.div>\n              )}\n            </AnimatePresence>\n          </div>\n        </motion.div>\n      )}`
);

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed AnimatePresence');
