
import fs from 'fs';
import path from 'path';

const filePath = './src/constants/blogArticles.ts';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  [/American Academy of Pediatrics \(AAP\)/g, 'parenting wellness organizations'],
  [/American Academy of Pediatrics/g, 'parenting wellness organizations'],
  [/AAP/g, 'wellness standards'],
  [/WHO/g, 'health standards'],
  [/CDC/g, 'health authorities'],
  [/NIAID/g, 'health research groups'],
  [/clinical/g, 'wellness'],
  [/pediatric/g, 'infant care'],
  [/medically/g, 'practically'],
  [/medical/g, 'health'],
  [/Emergency Department/g, 'Urgent Care Center'],
  [/ER/g, 'Urgent Care'],
  [/doctor/g, 'care provider'],
  [/physician/g, 'care provider'],
  [/diagnosed/g, 'identified'],
  [/diagnosis/g, 'assessment'],
  [/diagnostic/g, 'assessment'],
  [/prescribed/g, 'recommended'],
  [/prescription/g, 'recommendation'],
  [/treatment/g, 'care'],
  [/treat /g, 'care for '],
  [/symptoms/g, 'signs'],
  [/patient/g, 'parent'],
  [/Clinical/g, 'Wellness'],
  [/Pediatric/g, 'Infant Care'],
  [/Medical/g, 'Health'],
  [/Expert/g, 'Companion'],
  [/expert /g, 'companion '],
  [/Specialist/g, 'Guide'],
  [/specialist/g, 'guide']
];

for (const [regex, replacement] of replacements) {
  content = content.replace(regex, replacement);
}

fs.writeFileSync(filePath, content);
console.log('Successfully cleansed blogArticles.ts');
