const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('/home/piikee/Downloads/buddha--main/buddha--main/app');
let fixedCount = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('"use client"') || content.includes("'use client'")) {
    if (content.includes('generateStaticParams')) {
      const newContent = content.replace(/export\s+function\s+generateStaticParams\s*\(\)\s*\{[\s\S]*?\}/g, '');
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Fixed:', file);
      fixedCount++;
    }
  }
});
console.log('Total fixed:', fixedCount);
