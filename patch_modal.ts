import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const injection = `
      {/* Premium Subscription Paywall Modal */}
      <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} onSubscribe={handleSubscribe} />
`;

content = content.replace(
  '      />\n    </div>\n  );\n}',
  '      />\n' + injection + '    </div>\n  );\n}'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Modal injected");
