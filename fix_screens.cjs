const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Rename NotificationsScreen to RemindersScreen
// First, we need to completely delete the old RemindersScreen.
// Let's find its start and end.
const remindersScreenRegex = /const RemindersScreen = \(\{ onBack \}: \{ onBack: \(\) => void \}\) => \{[\s\S]*?\n\};\n/g;
content = content.replace(remindersScreenRegex, '');

// 2. Rename NotificationsScreen to RemindersScreen
content = content.replace('const NotificationsScreen = ({', 'const RemindersScreen = ({');
content = content.replace(/<NotificationsScreen/g, '<RemindersScreen');
content = content.replace(/<h1 className="text-2xl font-serif font-black text-gray-800">Notifications<\/h1>/, '<h1 className="text-2xl font-serif font-black text-gray-800">Reminders</h1>');

// Wait, earlier the user asked to change the state name from `reminders` to `notifications` for this screen.
// We should probably change `notifications={notifications} setNotifications={setNotifications}` back to `reminders={reminders} setReminders={setReminders}`.
// Let's do that.
content = content.replace(
  /const \[notifications, setNotifications\] = useState<any\[\]>\(\(\) => \{[\s\S]*?\}\);/g,
  `const [reminders, setReminders] = useState<any[]>(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [];
  });`
);
content = content.replace(
  /localStorage\.setItem\('notifications', JSON\.stringify\(notifications\)\);/g,
  `localStorage.setItem('reminders', JSON.stringify(reminders));`
);
content = content.replace(/\[notifications\]\);/g, `[reminders]);`);

// Rename props in RemindersScreen
content = content.replace(/notifications, \n\s*setNotifications,/g, 'reminders, \n  setReminders,');
content = content.replace(/notifications: any\[\]; \n\s*setNotifications: \(notifications: any\[\]\) => void;/g, 'reminders: any[]; \n  setReminders: (reminders: any[]) => void;');
content = content.replace(/setNotifications\(\[\.\.\.notifications,/g, 'setReminders([...reminders,');
content = content.replace(/notifications\.length > 0 \? notifications\.map/g, 'reminders.length > 0 ? reminders.map');
content = content.replace(/setNotifications\(notifications\.map/g, 'setReminders(reminders.map');
content = content.replace(/notifications=\{notifications\}/g, 'reminders={reminders}');
content = content.replace(/setNotifications=\{setNotifications\}/g, 'setReminders={setReminders}');

// Now, activeScreen updates
// In the JSX, currently `activeScreen === 'notifications'` shows NotificationsScreen (now RemindersScreen)
// and `activeScreen === 'reminders'` showed RemindersScreen (which is deleted).
// So let's change:
content = content.replace(
  /\{activeScreen === 'notifications' && \(\s*<RemindersScreen[\s\S]*?\/>\s*\)\}/g,
  `{activeScreen === 'reminders' && (
          <RemindersScreen 
            reminders={reminders} 
            setReminders={setReminders} 
            onBack={() => setActiveScreen('home')} 
          />
        )}`
);

// Delete the old `activeScreen === 'reminders'` block if it still exists.
content = content.replace(
  /\{activeScreen === 'reminders' && \(\s*<RemindersScreen onBack=\{\(\) => setActiveScreen\('home'\)\} \/>\s*\)\}/g,
  ''
);

// 3. Create a new NotificationsScreen
const newNotificationsScreen = `const NotificationsScreen = ({ onBack }: { onBack: () => void }) => {
  const inAppNotifications = [
    { id: '1', title: 'Vitamin D time', time: '10:00 AM', read: false },
    { id: '2', title: 'Feed Leo', time: '08:00 AM', read: true },
    { id: '3', title: 'Nap time logged', time: 'Yesterday', read: true }
  ];

  return (
    <div className="p-6 pb-24 space-y-8 bg-background min-h-screen">
      <header className="flex justify-between items-center">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-800 hover:scale-105 transition-transform">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-serif font-black text-gray-800">Notifications</h1>
        <div className="w-10" />
      </header>

      <div className="space-y-4">
        {inAppNotifications.map(notif => (
          <div key={notif.id} className={\`bg-card p-6 rounded-[32px] shadow-sm border \${notif.read ? 'border-white' : 'border-primary/20 bg-primary/5'} flex justify-between items-center\`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm">
                🔔
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{notif.title}</p>
                <div className="flex items-center gap-2 text-muted mt-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{notif.time}</span>
                </div>
              </div>
            </div>
            {!notif.read && <div className="w-3 h-3 bg-primary rounded-full" />}
          </div>
        ))}
      </div>
    </div>
  );
};
`;

content = content.replace('export default function App() {', newNotificationsScreen + '\nexport default function App() {');

// Add NotificationsScreen to JSX
content = content.replace(
  /\{activeScreen === 'reminders' && \(/,
  `{activeScreen === 'notifications' && (
          <NotificationsScreen onBack={() => setActiveScreen('home')} />
        )}
        {activeScreen === 'reminders' && (`
);

fs.writeFileSync('src/App.tsx', content);
