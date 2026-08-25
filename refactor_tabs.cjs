const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Rename 'quests' tab to 'activities' (Activities Tracker)
app = app.replace(/{ id: 'quests', label: '🎯 Quests', color: 'primary' },/g, `{ id: 'quests', label: '🎯 Activities', color: 'primary' },`);
app = app.replace(/<h2 className="text-xl font-serif font-black text-gray-800 text-left">Daily Quests<\/h2>/g, `<h2 className="text-xl font-serif font-black text-gray-800 text-left">Activities Tracker</h2>`);

// 2. Fix setAllTimePoints type
app = app.replace(/setAllTimePoints\?: \(pts: number\) => void,/g, `setAllTimePoints?: any,`);

// 3. Extract the chunks
function extractChunk(appStr, startRegex, endRegex) {
  const startIndex = appStr.search(startRegex);
  if (startIndex === -1) return { extracted: '', appStr };
  
  // Find the end by looking for the next top-level div or comment that signifies the end
  const restStr = appStr.substring(startIndex);
  const endIndex = restStr.search(endRegex);
  if (endIndex === -1) return { extracted: '', appStr };
  
  const extracted = restStr.substring(0, endIndex);
  const newAppStr = appStr.substring(0, startIndex) + appStr.substring(startIndex + endIndex);
  return { extracted, newAppStr };
}

let immunizationChunk = '';
let outdoorChunk = '';
let readingChunk = '';
let bathChunk = '';
let teethingChunk = '';
let milestonesChunk = '';

// Immunization scheduler
let r1 = extractChunk(app, /\{\/\* Immunization scheduler \*\/\}/, /\{\/\* \-\-\- \*\/\}/);
// Actually, it's followed by nothing in the growth tab except `</motion.div>`
let index1 = app.indexOf('{/* Immunization scheduler */}');
let endIndex1 = app.indexOf('</motion.div>', index1);
immunizationChunk = app.substring(index1, endIndex1);
app = app.substring(0, index1) + app.substring(endIndex1);

// Teething Map
let indexTeething = app.indexOf('{/* Teething Map */}');
let endIndexTeething = app.indexOf('</motion.div>', indexTeething);
teethingChunk = app.substring(indexTeething, endIndexTeething);
app = app.substring(0, indexTeething) + app.substring(endIndexTeething);

// In timers tab, we have Outdoor, Reading, Bath
let indexTimers = app.indexOf('{activeTab === \'timers\' && (');
let endIndexTimers = app.indexOf('{activeTab === \'milestones\' && (');
let timersBlock = app.substring(indexTimers, endIndexTimers);
app = app.substring(0, indexTimers) + app.substring(endIndexTimers);

// Remove the timers tab button
app = app.replace(/{ id: 'timers', label: '⏱️ Timers', color: 'emerald' },/g, '');

// Also milestones tab can be merged into activities tracker!
let indexMilestones = app.indexOf('{activeTab === \'milestones\' && (');
let endIndexMilestones = app.indexOf('{activeTab === \'growth\' && (');
let milestonesBlock = app.substring(indexMilestones, endIndexMilestones);
app = app.substring(0, indexMilestones) + app.substring(endIndexMilestones);

// Remove milestones tab button
app = app.replace(/{ id: 'milestones', label: '👶 Milestones', color: 'purple' },/g, '');

// So we only have 'quests' (Activities), 'growth' (Growth & Vac), 'sleep' (Sleep)
// Wait, the prompt says "Move ... to activities tracker", maybe keep growth and sleep? Yes.
// Let's get the inner content of timers and milestones.
let timersInner = timersBlock.match(/<motion\.div[^>]*>([\s\S]*?)<\/motion\.div>/)[1];
let milestonesInner = milestonesBlock.match(/<motion\.div[^>]*>([\s\S]*?)<\/motion\.div>/)[1];

// Insert everything into the 'quests' tab content, right after Unlocked Rewards.
let targetStr = '{/* Unlocked Rewards */}';
let indexTarget = app.indexOf('Unlocked Rewards</h2>');
if(indexTarget === -1) indexTarget = app.indexOf('Unlocked Rewards');
let insertPos = app.indexOf('</div>', indexTarget + 20) + 6; // after the grid
// But wait, there are closing divs for the Unlocked Rewards section.
let unlockedRewardsEnd = app.indexOf('</div>', app.indexOf('</div>', indexTarget + 20) + 6) + 6;

let contentToInject = `
          ${timersInner}
          ${milestonesInner}
          ${immunizationChunk}
          ${teethingChunk}
`;

app = app.substring(0, unlockedRewardsEnd) + contentToInject + app.substring(unlockedRewardsEnd);

// Gamify Reading & Language Exposure
app = app.replace(/const handleAddReadingLog = \(\) => \{/g, `const handleAddReadingLog = () => {
    if (setAllTimePoints) setAllTimePoints((prev: any) => prev + 20);`);

// Gamify Developmental Milestones
app = app.replace(/const toggleMilestone = \(key: string\) => \{/g, `const toggleMilestone = (key: string) => {
    if (setAllTimePoints) setAllTimePoints((prev: any) => prev + 50);`);

// Fix logged meal card background
app = app.replace(/className="bg-primary p-6 rounded-\[36px\] shadow-sm space-y-4 text-left"/g, `className="bg-card p-6 rounded-[36px] shadow-xl shadow-card/20 border border-white space-y-4 text-left"`);
app = app.replace(/className="flex items-center justify-between cursor-pointer" onClick=\{\(\) => setExpandedLogIndex\(isExpanded \? null : i\)\}/g, `className="bg-white p-4 rounded-3xl flex items-center justify-between cursor-pointer" onClick={() => setExpandedLogIndex(isExpanded ? null : i)}`);
app = app.replace(/<ChevronDown className=\{.w-5 h-5 text-white\/70 transition-transform \$\{isExpanded \? 'rotate-180' : ''\}.\} \/>/g, `<ChevronDown className={\`w-5 h-5 text-primary transition-transform \${isExpanded ? 'rotate-180' : ''}\`} />`);
app = app.replace(/text-white\/70/g, `text-muted`);
app = app.replace(/text-white/g, `text-gray-800`);

fs.writeFileSync('src/App.tsx', app);
console.log('Tabs refactored, Gamification added, logged meal fixed.');
