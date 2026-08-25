const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /<h2 className="text-lg font-bold text-gray-800">New Notification<\/h2>/,
  '<h2 className="text-lg font-bold text-gray-800">New Reminder</h2>'
);
content = content.replace(
  /<p className="text-center text-gray-400 text-sm italic mt-10">No notifications set\.<\/p>/,
  '<p className="text-center text-gray-400 text-sm italic mt-10">No reminders set.</p>'
);

fs.writeFileSync('src/App.tsx', content);
