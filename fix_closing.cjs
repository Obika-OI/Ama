const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// The closing of rewards map:
app = app.replace(
  /\{reward\.unlocked && <CheckCircle2 className="w-3 h-3 text-secondary" \/>\}\n                <\/div>\s*\{\/\* Tummy Time Section \*\/\}/g,
  `{reward.unlocked && <CheckCircle2 className="w-3 h-3 text-secondary" />}\n                </div>\n              ))}\n            </div>\n          </div>\n          {/* Tummy Time Section */}`
);

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed closing tags.');
