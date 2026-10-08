const fs = require('fs');
const file = 'frontend/src/modules/hod/types/hod.types.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /subject\?: \{ id: string; name: string; code: string \} \| null;/,
  `subjects?: Array<{ id: string; name: string; code: string; classId: string; className: string }>;`
);
fs.writeFileSync(file, content);
console.log('Done types');
