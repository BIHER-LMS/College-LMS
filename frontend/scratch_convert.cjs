const fs = require('fs');

const htmlContent = fs.readFileSync('c:\\Users\\natha.HP\\OneDrive\\Documents\\GitHub\\College LMS\\sttich landing page\\code.html', 'utf8');

// Extract body content between <body> and </body>
const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) {
  console.error('Body not found');
  process.exit(1);
}

let bodyContent = bodyMatch[1];

// Convert class= to className=
bodyContent = bodyContent.replace(/class=/g, 'className=');
// Convert for= to htmlFor=
bodyContent = bodyContent.replace(/for=/g, 'htmlFor=');
// Fix style attribute syntax
bodyContent = bodyContent.replace(/style="([^"]*)"/g, (match, styleString) => {
  // A simple hacky style string to object converter for the few styles present
  // Note: Only handles simple styles like height: 40%;
  const styleProps = styleString.split(';').filter(s => s.trim()).map(s => {
    let [key, val] = s.split(':');
    key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    return `${key}: '${val.trim().replace(/'/g, "\\'")}'`;
  }).join(', ');
  return `style={{ ${styleProps} }}`;
});

// Fix unclosed img tags
bodyContent = bodyContent.replace(/<img([^>]*?)(?<!\/)>/g, '<img$1 />');
// Fix unclosed input tags
bodyContent = bodyContent.replace(/<input([^>]*?)(?<!\/)>/g, '<input$1 />');
// Fix unclosed br tags
bodyContent = bodyContent.replace(/<br([^>]*?)(?<!\/)>/g, '<br$1 />');
// Fix unclosed hr tags
bodyContent = bodyContent.replace(/<hr([^>]*?)(?<!\/)>/g, '<hr$1 />');
// Remove comments
bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, '');

const appTsxContent = `
import React from 'react';

function App() {
  return (
    <>
      ${bodyContent}
    </>
  );
}

export default App;
`;

fs.writeFileSync('c:\\Users\\natha.HP\\OneDrive\\Documents\\GitHub\\College LMS\\frontend\\src\\App.tsx', appTsxContent);
console.log('App.tsx written successfully');
