const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. App name: Wean & Thrive -> Ama
app = app.replace(/Wean & Thrive/g, 'Ama');
app = app.replace(/baby meal journal/ig, 'Ama');

// 2. User name and info functional
// Add parentName state
if (!app.includes('parentName, setParentName')) {
  app = app.replace(
    /const \[babyName, setBabyName\] = useState<string>\(\(\) => \{[\s\S]*?\}\);/g,
    `$&
  const [parentName, setParentName] = useState<string>(() => {
    return localStorage.getItem('parentName') || 'Mom';
  });`
  );
}

// 3. Update Dashboard props to include babyName and parentName
if (!app.includes('babyName: string;')) {
  app = app.replace(/onNavigate: \(screen: string, data\?: any\) => void;/g, `onNavigate: (screen: string, data?: any) => void;
  babyName: string;
  parentName: string;`);
}
// Update Dashboard component definition
app = app.replace(/const Dashboard = \(\{[\s\S]*?onNavigate,[\s\S]*?fluidMl,/g, (match) => {
  if (match.includes('babyName')) return match;
  return match.replace('onNavigate,', 'onNavigate,\n  babyName,\n  parentName,');
});

// Pass to Dashboard
app = app.replace(/<Dashboard[\s\S]*?onNavigate=\{handleNavigate\}/g, (match) => {
  if (match.includes('babyName={babyName}')) return match;
  return match + '\n              babyName={babyName}\n              parentName={parentName}';
});

// Update Hello message in Dashboard
app = app.replace(/Hello, Leo!/g, 'Hello, {parentName} & {babyName}!');
app = app.replace(/When did Leo have this\?/g, 'When did {babyName} have this?');
app = app.replace(/Leo is thriving!/g, '{babyName} is thriving!');
app = app.replace(/Leo is ready/g, '{babyName} is ready');
app = app.replace(/Leo\'s Timeline/g, '{babyName}\\\'s Timeline');

// In Journal setup, also add parentName
// Let's find SettingsModal or similar and add parentName input
app = app.replace(/const \[tempBabyName, setTempBabyName\] = useState\(babyName\);/g, `const [tempBabyName, setTempBabyName] = useState(babyName);\n  const [tempParentName, setTempParentName] = useState(parentName || '');`);
// Update SettingsModal props
if (!app.includes('setParentName: (name: string) => void,')) {
  app = app.replace(/setBabyName: \(name: string\) => void,/g, `setBabyName: (name: string) => void,
  parentName?: string,
  setParentName?: (name: string) => void,`);
}
app = app.replace(/setBabyName\(tempBabyName \|\| 'Leo'\);/g, `setBabyName(tempBabyName || 'Leo');\n    if (setParentName) setParentName(tempParentName || 'Mom');\n    localStorage.setItem('parentName', tempParentName || 'Mom');`);
app = app.replace(/<label className="text-sm font-bold text-gray-700">Baby's Name<\/label>/g, `<label className="text-sm font-bold text-gray-700">Your Name</label>
                <input 
                  type="text" 
                  value={tempParentName} 
                  onChange={(e) => setTempParentName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g. Sarah"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Baby's Name</label>`);

// Update SettingsModal call
app = app.replace(/setBabyName=\{setBabyName\}/g, `setBabyName={setBabyName}\n              parentName={parentName}\n              setParentName={setParentName}`);

// Save App.tsx
fs.writeFileSync('src/App.tsx', app);
console.log('App updated.');
