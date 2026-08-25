const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Insert Port-Harcourt at the beginning of the database
const portHarcourtData = `
  {
    name: "Port-Harcourt, Nigeria",
    lat: 4.8156,
    lng: 7.0498,
    currency: "₦",
    suggestions: [
      "🌿 Creamy Plantain and Carrot Mash - Plantains provide natural sweetness and energy.",
      "🥔 Rich Tom Brown Cereal - Nutrient-dense powder made from grains and legumes.",
      "🍎 Soft Bean Puree - Beans are a great source of protein for growing muscles.",
      "🥕 Steamed Fish & Crayfish Moi Moi - A smooth, protein-rich steamed pudding."
    ]
  },`;

app = app.replace(/const LOCAL_REGIONS_DATABASE = \[/g, `const LOCAL_REGIONS_DATABASE = [${portHarcourtData}`);

fs.writeFileSync('src/App.tsx', app);
console.log('App updated with Port-Harcourt.');
