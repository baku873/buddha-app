const fs = require('fs');
const files = [
  '/home/piikee/Downloads/buddha--main/buddha--main/app/[locale]/page.tsx',
  '/home/piikee/Downloads/buddha--main/buddha--main/app/[locale]/monks/page.tsx',
  '/home/piikee/Downloads/buddha--main/buddha--main/app/[locale]/layout.tsx',
  '/home/piikee/Downloads/buddha--main/buddha--main/app/[locale]/monk/content/page.tsx',
  '/home/piikee/Downloads/buddha--main/buddha--main/app/[locale]/blog/page.tsx',
  '/home/piikee/Downloads/buddha--main/buddha--main/app/[locale]/booking/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const isClient = content.includes('"use client"') || content.includes("'use client'");
  
  if (isClient) {
    // Delete the whole line if it's a client component
    content = content.replace(/export function generateStaticParams\(\) \{ return \[\{ locale: "mn" \}/g, '');
  } else {
    // Complete the syntax if it's a server component
    content = content.replace(
      /export function generateStaticParams\(\) \{ return \[\{ locale: "mn" \}/g, 
      'export function generateStaticParams() { return [{ locale: "mn" }, { locale: "en" }]; }'
    );
  }
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file, '-> isClient:', isClient);
});
