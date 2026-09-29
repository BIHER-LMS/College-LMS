const fs = require('fs');
const path = require('path');

const inputHtml = fs.readFileSync(path.join('c:', 'Users', 'natha.HP', 'OneDrive', 'Documents', 'GitHub', 'College LMS', 'stitch sign in page', 'code.html'), 'utf8');

// Extract the body content, specifically the `<main>` tag and its children.
const match = inputHtml.match(/<main[\s\S]*?<\/main>/);
let mainContent = match ? match[0] : '';

// Convert HTML to JSX
mainContent = mainContent
  .replace(/class=/g, 'className=')
  .replace(/for=/g, 'htmlFor=')
  .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
  .replace(/style="([^"]+)"/g, (match, p1) => {
    // Basic inline style to object converter for this specific file
    // "background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 24px 24px;"
    const styleObj = p1.split(';').filter(s => s.trim()).reduce((acc, rule) => {
      let [key, value] = rule.split(':').map(s => s.trim());
      key = key.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
      acc[key] = value;
      return acc;
    }, {});
    return `style={${JSON.stringify(styleObj)}}`;
  })
  .replace(/stroke-width=/g, 'strokeWidth=')
  .replace(/stroke-linecap=/g, 'strokeLinecap=')
  .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
  .replace(/fill-rule=/g, 'fillRule=')
  .replace(/clip-rule=/g, 'clipRule=')
  .replace(/autocomplete=/g, 'autoComplete=')
  .replace(/onclick="([^"]+)"/g, 'onClick={() => {}}')
  .replace(/onsubmit="([^"]+)"/g, 'onSubmit={(e) => e.preventDefault()}')
  .replace(/<input([^>]*[^\/])>/g, '<input$1 />') // self closing inputs
  .replace(/<br>/g, '<br />')
  .replace(/<hr>/g, '<hr />');

const componentCode = `import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    
    let isValid = true;
    if (!email || !email.includes('@')) {
      setEmailError(true);
      isValid = false;
    } else {
      setEmailError(false);
    }

    if (!password || password.length < 4) {
      setPasswordError(true);
      isValid = false;
    } else {
      setPasswordError(false);
    }

    if (!isValid) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      // Mock redirect after 1.2s
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }, 1200);
  };

  return (
    ${mainContent.replace(/<form[\s\S]*?>/, `<form id="signinForm" onSubmit={handleSignInSubmit} className="space-y-4">`)}
  );
}

export default Login;
`;

fs.writeFileSync(path.join('c:', 'Users', 'natha.HP', 'OneDrive', 'Documents', 'GitHub', 'College LMS', 'frontend', 'src', 'pages', 'Login.tsx'), componentCode);
console.log('Conversion successful');
