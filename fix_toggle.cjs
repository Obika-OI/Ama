const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(/const toggleMilestone = \(key: string\) => \{\n    if \(setAllTimePoints\) setAllTimePoints\(\(prev: any\) => prev \+ 50\);\n    setMilestoneCompletions\(prev => \{/g, `const toggleMilestone = (key: string) => {
    setMilestoneCompletions(prev => {
      if (!prev[key]) {
        if (setAllTimePoints) setAllTimePoints((p: any) => p + 50);
      }
      const copy = { ...prev };`);

fs.writeFileSync('src/App.tsx', app);
console.log('toggleMilestone fixed.');
