const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Find Save Tooth Emergence Data
app = app.replace(
  /Save Tooth Emergence Data\n\s*<\/button>\n\s*\n\s*\)\)\}\n\s*<\/div>\n\s*<\/div>/g,
  `Save Tooth Emergence Data\n                  </button>\n                </div>\n              </div>\n            </div>\n          </div>`
);

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed syntax 2.');
