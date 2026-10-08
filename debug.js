const fs = require('fs');
const file = 'frontend/src/modules/hod/pages/FacultyPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// I will output the file line by line with line numbers to see EXACTLY what is there
const lines = content.split('\n');
for (let i = 260; i < 290; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
