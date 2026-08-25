const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const updatedJournal = `const Journal = ({ 
  scheduledMeals, 
  scheduledActivities, 
  scheduledMeds,
  loggedMeals,
  observationLogs,
  setObservationLogs,
  setScheduledMeals,
  setScheduledActivities,
  setScheduledMeds
}: { 
  scheduledMeals: any[], 
  scheduledActivities: any[], 
  scheduledMeds: any[],
  loggedMeals: any[],
  observationLogs: any[],
  setObservationLogs: (logs: any[]) => void,
  setScheduledMeals: (meals: any[]) => void,
  setScheduledActivities: (acts: any[]) => void,
  setScheduledMeds: (meds: any[]) => void
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlanType, setNewPlanType] = useState('meal');
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanTime, setNewPlanTime] = useState('08:00 AM');
  
  const [obsWeight, setObsWeight] = useState('');
  const [obsSymptoms, setObsSymptoms] = useState('');
  const [obsPoopColor, setObsPoopColor] = useState('Brown');
  const [obsPoopConsistency, setObsPoopConsistency] = useState('Normal');

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const getDayItems = () => {
    return [
      ...scheduledMeals.map(m => ({ ...m, typeId: 'meal', category: 'Meal', icon: '🍽️', title: m.meal?.title || m.title, subtitle: m.type })),
      ...scheduledActivities.map(a => ({ ...a, typeId: 'activity', category: 'Activity', icon: '🧸', title: a.title, subtitle: a.duration })),
      ...scheduledMeds.map(m => ({ ...m, typeId: 'med', category: 'Medication', icon: '💊', title: m.name || m.title, subtitle: m.dosage }))
    ].sort((a, b) => {
      const timeA = new Date(\`1970/01/01 \${a.time}\`).getTime();
      const timeB = new Date(\`1970/01/01 \${b.time}\`).getTime();
      return timeA - timeB;
    });
  };

  const dayItems = getDayItems();

  const handleAddPlan = () => {
    if (!newPlanTitle) return;
    const newPlan = { id: Date.now().toString(), title: newPlanTitle, time: newPlanTime, completed: false, date: selectedDate.toISOString() };
    if (newPlanType === 'meal') setScheduledMeals([...scheduledMeals, { ...newPlan, meal: { title: newPlanTitle, description: '' }, type: 'Snack' }]);
    if (newPlanType === 'activity') setScheduledActivities([...scheduledActivities, { ...newPlan, duration: '15m' }]);
    if (newPlanType === 'med') setScheduledMeds([...scheduledMeds, { ...newPlan, name: newPlanTitle, dosage: '1 dose' }]);
    setShowAddPlan(false);
    setNewPlanTitle('');
  };

  const toggleItemCompletion = (item: any) => {
    if (item.typeId === 'meal') {
      setScheduledMeals(scheduledMeals.map(m => m.id === item.id ? { ...m, completed: !m.completed } : m));
    } else if (item.typeId === 'activity') {
      setScheduledActivities(scheduledActivities.map(a => a.id === item.id ? { ...a, completed: !a.completed } : a));
    } else if (item.typeId === 'med') {
      setScheduledMeds(scheduledMeds.map(m => m.id === item.id ? { ...m, completed: !m.completed } : m));
    }
  };
  
  const saveObservation = () => {
    const newObs = {
      id: Date.now().toString(),
      date: selectedDate.toISOString(),
      weight: obsWeight,
      symptoms: obsSymptoms,
      poopColor: obsPoopColor,
      poopConsistency: obsPoopConsistency
    };
    setObservationLogs([...observationLogs, newObs]);
    setObsWeight('');
    setObsSymptoms('');
  };
  
  const currentObs = observationLogs.find(o => isSameDay(new Date(o.date), selectedDate));

  return (
    <div className="p-6 pb-24 space-y-8 bg-background min-h-screen">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-black text-gray-800">Journal</h1>
        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
      </header>

      <div className="bg-card p-6 rounded-[48px] shadow-xl shadow-card/20 border border-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black text-gray-800 uppercase tracking-[0.2em]">
            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 text-gray-400 hover:text-gray-800 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={handleNextMonth} className="p-2 text-gray-400 hover:text-gray-800 transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={\`empty-\${i}\`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = new Date(currentYear, currentMonth, i + 1);
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            return (
              <button 
                key={i}
                onClick={() => { setSelectedDate(date); setShowAddPlan(true); }}
                className={\`w-10 h-10 mx-auto rounded-xl font-bold text-sm flex items-center justify-center transition-all \${
                  isSelected ? 'bg-primary text-white shadow-md scale-110' : 
                  isToday ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
                }\`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
      
      {showAddPlan && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 rounded-[32px] shadow-xl border border-white space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Add Plan for {selectedDate.toLocaleDateString()}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Type</label>
              <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" value={newPlanType} onChange={e => setNewPlanType(e.target.value)}>
                <option value="meal">Meal</option>
                <option value="activity">Activity</option>
                <option value="med">Medication</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Title</label>
              <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" placeholder="e.g. Lunch" value={newPlanTitle} onChange={e => setNewPlanTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Time</label>
              <input type="time" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" value={newPlanTime.replace(/ [AP]M/, '')} onChange={e => {
                const [h, m] = e.target.value.split(':');
                const hour = parseInt(h);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const formattedHour = hour % 12 || 12;
                setNewPlanTime(\`\${formattedHour.toString().padStart(2, '0')}:\${m} \${ampm}\`);
              }} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAddPlan(false)} className="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest">Close</button>
              <button onClick={handleAddPlan} className="flex-1 py-3 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">Add Plan</button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-serif font-black text-gray-800">Plan</h2>
        <div className="bg-card rounded-[48px] shadow-xl shadow-card/20 border border-white p-8 relative overflow-hidden">
          <div className="relative space-y-4">
            {dayItems.length > 0 ? (
              dayItems.map((item, i) => (
                <div key={i} className="flex gap-4 items-center bg-gray-50 p-4 rounded-3xl">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.title}</h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{item.category} • {item.time}</p>
                  </div>
                  <button 
                    onClick={() => toggleItemCompletion(item)}
                    className={\`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors \${item.completed ? 'bg-green-500' : 'bg-gray-200'}\`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 text-sm italic">Nothing planned for this date.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <h2 className="text-xl font-serif font-black text-gray-800">Observation Notes</h2>
        <div className="bg-card rounded-[48px] shadow-xl shadow-card/20 border border-white p-8 space-y-6">
          {currentObs ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fluid Output</p>
                  <p className="font-bold text-gray-800">{currentObs.weight} g</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Poop</p>
                  <p className="font-bold text-gray-800">{currentObs.poopColor}, {currentObs.poopConsistency}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Symptoms/Notes</p>
                <p className="font-medium text-gray-800 text-sm">{currentObs.symptoms || 'None recorded'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Diaper Weight (g)</label>
                  <input type="number" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" placeholder="e.g. 150" value={obsWeight} onChange={e => setObsWeight(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Poop Color</label>
                  <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" value={obsPoopColor} onChange={e => setObsPoopColor(e.target.value)}>
                    <option>Yellow</option><option>Brown</option><option>Green</option><option>Red/Black</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Poop Consistency</label>
                <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" value={obsPoopConsistency} onChange={e => setObsPoopConsistency(e.target.value)}>
                  <option>Normal</option><option>Watery</option><option>Hard</option><option>Mucusy</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Symptoms & Notes</label>
                <textarea className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium h-24" placeholder="Any fever, fussiness, rash?" value={obsSymptoms} onChange={e => setObsSymptoms(e.target.value)} />
              </div>
              <button onClick={saveObservation} className="w-full py-4 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">Save Observation</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
`;

const startIndex = content.indexOf('const Scheduler = ({');
const endIndex = content.indexOf('const MealEvaluation = ({');
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + updatedJournal + content.substring(endIndex);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Journal successfully updated.');
} else {
  console.log('Failed to find components in App.tsx');
}
