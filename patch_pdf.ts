import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `                onClick={async () => {
                  const element = document.getElementById('print-report-content');`;
                  
const replacement = `                onClick={async () => {
                  if (!isPremium) {
                    setIsSubscriptionModalOpen(true);
                    return;
                  }
                  const element = document.getElementById('print-report-content');`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', content);
  console.log("PDF button patched");
} else {
  console.log("Could not find target in App.tsx");
}
