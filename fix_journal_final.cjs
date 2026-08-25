const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Journal signature
const oldJournalSig = /const Journal = \(\{ \n\s*scheduledMeals,/;
content = content.replace(
  oldJournalSig,
  `const Journal = ({ 
  onNavigate,
  navData,
  allMeals,
  scheduledMeals,`
);

const oldJournalType = /\}: \{ \n\s*scheduledMeals: any\[\],/;
content = content.replace(
  oldJournalType,
  `}: { 
  onNavigate: (screen: string, data?: any) => void,
  navData?: any,
  allMeals: any[],
  scheduledMeals: any[],`
);

// 2. toggleItemCompletion to navigate to evaluation
content = content.replace(
  `  const toggleItemCompletion = (item: any) => {
    if (item.typeId === 'meal') {
      setScheduledMeals(scheduledMeals.map(m => m.id === item.id ? { ...m, completed: !m.completed } : m));
    } else if (item.typeId === 'activity') {`,
  `  const toggleItemCompletion = (item: any) => {
    if (item.typeId === 'meal') {
      const isCompleting = !item.completed;
      setScheduledMeals(scheduledMeals.map(m => m.id === item.id ? { ...m, completed: !m.completed } : m));
      if (isCompleting) {
        onNavigate('evaluation', item.meal);
      }
    } else if (item.typeId === 'activity') {`
);

// 3. App JSX rendering
content = content.replace(
  /<Journal \n\s*scheduledMeals=\{scheduledMeals\}/,
  `<Journal 
              onNavigate={handleNavigate}
              navData={navData}
              allMeals={[...MOCK_MEALS, ...personalRecipes]}
              scheduledMeals={scheduledMeals}`
);

fs.writeFileSync('src/App.tsx', content);
