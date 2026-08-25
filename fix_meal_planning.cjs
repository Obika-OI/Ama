const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. App.tsx states and handleNavigate
content = content.replace(
  /const \[fluidMl, setFluidMl\] = useState/,
  `const [navData, setNavData] = useState<any>(null);\n  const [fluidMl, setFluidMl] = useState`
);

content = content.replace(
  /const handleNavigate = \(screen: string, data\?: any\) => \{\n\s*if \(screen === 'recipe-detail' \|\| screen === 'evaluation'\) \{\n\s*setSelectedMeal\(data \|\| MOCK_MEALS\[0\]\);\n\s*\}\n\s*setActiveScreen\(screen\);\n\s*\};/,
  `const handleNavigate = (screen: string, data?: any) => {
    if (screen === 'recipe-detail' || screen === 'evaluation') {
      setSelectedMeal(data || MOCK_MEALS[0]);
    } else if (screen === 'journal') {
      setNavData(data);
    }
    setActiveScreen(screen);
  };`
);

// 2. Journal Props
content = content.replace(
  /const Journal = \(\{ \n\s*onNavigate,\n\s*scheduledMeals,/,
  `const Journal = ({ 
  onNavigate,
  navData,
  allMeals,
  scheduledMeals,`
);
content = content.replace(
  /\}: \{ \n\s*onNavigate: \(screen: string, data\?: any\) => void,\n\s*scheduledMeals: any\[\],/,
  `}: { 
  onNavigate: (screen: string, data?: any) => void,
  navData: any,
  allMeals: any[],
  scheduledMeals: any[],`
);

// 3. Journal hook for navData
content = content.replace(
  /const \[newPlanTime, setNewPlanTime\] = useState\('08:00 AM'\);/,
  `const [newPlanTime, setNewPlanTime] = useState('08:00 AM');
  
  useEffect(() => {
    if (navData && navData.type === 'meal') {
      setShowAddPlan(true);
      setNewPlanType('meal');
      setNewPlanTitle(navData.meal.id);
    }
  }, [navData]);`
);

// 4. Journal handleAddPlan
content = content.replace(
  /const handleAddPlan = \(\) => \{\n\s*if \(!newPlanTitle\) return;\n\s*const newPlan = \{ id: Date\.now\(\)\.toString\(\), title: newPlanTitle, time: newPlanTime, completed: false, date: selectedDate\.toISOString\(\) \};\n\s*if \(newPlanType === 'meal'\) setScheduledMeals\(\[\.\.\.scheduledMeals, \{ \.\.\.newPlan, meal: \{ title: newPlanTitle, description: '' \}, type: 'Snack' \}\]\);\n\s*if \(newPlanType === 'activity'\) setScheduledActivities\(\[\.\.\.scheduledActivities, \{ \.\.\.newPlan, duration: '15m' \}\]\);\n\s*if \(newPlanType === 'med'\) setScheduledMeds\(\[\.\.\.scheduledMeds, \{ \.\.\.newPlan, name: newPlanTitle, dosage: '1 dose' \}\]\);\n\s*setShowAddPlan\(false\);\n\s*setNewPlanTitle\(''\);\n\s*\};/,
  `const handleAddPlan = () => {
    if (!newPlanTitle && newPlanType !== 'meal') return;
    const newPlan = { id: Date.now().toString(), time: newPlanTime, completed: false, date: selectedDate.toISOString() };
    if (newPlanType === 'meal') {
      const selectedMealObj = allMeals.find(m => m.id === newPlanTitle) || allMeals[0];
      setScheduledMeals([...scheduledMeals, { ...newPlan, title: selectedMealObj.title, meal: selectedMealObj, type: selectedMealObj.type || 'Snack' }]);
    } else if (newPlanType === 'activity') {
      setScheduledActivities([...scheduledActivities, { ...newPlan, title: newPlanTitle, duration: '15m' }]);
    } else if (newPlanType === 'med') {
      setScheduledMeds([...scheduledMeds, { ...newPlan, title: newPlanTitle, name: newPlanTitle, dosage: '1 dose' }]);
    }
    setShowAddPlan(false);
    setNewPlanTitle('');
  };`
);

// 5. Journal Form rendering
content = content.replace(
  /<div>\n\s*<label className="text-\[10px\] font-black text-gray-400 uppercase tracking-widest block mb-1">Title<\/label>\n\s*<input type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" placeholder="e\.g\. Lunch" value=\{newPlanTitle\} onChange=\{e => setNewPlanTitle\(e\.target\.value\)\} \/>\n\s*<\/div>/,
  `<div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Title / Meal</label>
              {newPlanType === 'meal' ? (
                <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" value={newPlanTitle} onChange={e => setNewPlanTitle(e.target.value)}>
                  <option value="" disabled>Select a meal</option>
                  {allMeals.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              ) : (
                <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" placeholder={newPlanType === 'activity' ? 'e.g. Tummy Time' : 'e.g. Vitamin D'} value={newPlanTitle} onChange={e => setNewPlanTitle(e.target.value)} />
              )}
            </div>`
);

// 6. RecipeDetail onSchedule signature
content = content.replace(
  /onSchedule: \(time: string, type: string\) => void/,
  `onSchedule: (meal: Meal) => void`
);

// 7. RecipeDetail Schedule button onClick
content = content.replace(
  /onClick=\{\(\) => \{\n\s*const time = prompt\("Enter time to schedule \(e\.g\. 12:30 PM\):", "12:30 PM"\);\n\s*if \(time\) onSchedule\(time, meal\.type \|\| 'Snack'\);\n\s*\}\}/,
  `onClick={() => onSchedule(meal)}`
);

// 8. App JSX Journal rendering
content = content.replace(
  /<Journal \n\s*onNavigate=\{handleNavigate\}\n\s*scheduledMeals=\{scheduledMeals\}/,
  `<Journal 
              onNavigate={handleNavigate}
              navData={navData}
              allMeals={[...MOCK_MEALS, ...personalRecipes]}
              scheduledMeals={scheduledMeals}`
);

// 9. App JSX RecipeDetail rendering
content = content.replace(
  /onSchedule=\{\(time, type\) => \{\n\s*setScheduledMeals\(prev => \[\.\.\.prev, \{ id: Date\.now\(\)\.toString\(\), meal: selectedMeal, time, type, completed: false \}\]\);\n\s*setActiveScreen\('home'\);\n\s*\}\}/,
  `onSchedule={(meal) => {
                handleNavigate('journal', { type: 'meal', meal });
              }}`
);

fs.writeFileSync('src/App.tsx', content);
