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
  let newContent = content.replace(/\/\/\s*CAP_INJECT_PARAMS\n*,\s*\{\s*locale:\s*"en"\s*\}\];\s*\}/g, '');
  newContent = newContent.replace(/,\s*\{\s*locale:\s*"en"\s*\}\];\s*\}/g, '');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed syntax in:', file);
    fixedCount++;
  }
});
console.log('Total files fixed:', fixedCount);
