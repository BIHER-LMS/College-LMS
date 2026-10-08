const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src/modules/hod');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  // Replace single-line imports
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g, (match, imports, modulePath) => {
    if (modulePath === 'react' || modulePath === 'react-redux' || modulePath === 'react-router-dom') return match;
    const typeNames = ['RootState', 'AppDispatch', 'PayloadAction', 'Batch', 'ClassItem', 'Program', 'Faculty', 'DashboardData', 'Department', 'Student', 'Subject', 'AcademicYear', 'Semester', 'HODProfile', 'AttendanceSummary', 'CurriculumItem', 'AnnouncementItem', 'StudentAcademicAlert'];
    
    let hasType = false;
    for (const tn of typeNames) {
      if (imports.includes(tn)) hasType = true;
    }
    
    if (hasType) {
      changed = true;
      const parts = imports.split(',').map(i => i.trim()).filter(Boolean);
      const valueImports = [];
      const typeImports = [];
      parts.forEach(p => {
        const baseName = p.split(/\s+as\s+/)[0].trim();
        if (typeNames.includes(baseName)) typeImports.push(p);
        else valueImports.push(p);
      });
      let result = '';
      if (valueImports.length > 0) result += 'import { ' + valueImports.join(', ') + ' } from "' + modulePath + '";\n';
      if (typeImports.length > 0) result += 'import type { ' + typeImports.join(', ') + ' } from "' + modulePath + '";';
      return result;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
  }
});
console.log('Fixed imports!');
