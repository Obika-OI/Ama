const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(/const copy = \{ \.\.\.prev \};\s*const copy = \{ \.\.\.prev \};/g, 'const copy = { ...prev };');

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed copy duplication.');
