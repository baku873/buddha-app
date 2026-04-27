const fs = require('fs');
const path = require('path');

const action = process.argv[2];
const apiDir = path.join(__dirname, '..', 'app/api');
const hiddenApiDir = path.join(__dirname, '..', 'app/_api');

const robotsPath = path.join(__dirname, '..', 'app/robots.ts');
const hiddenRobotsPath = path.join(__dirname, '..', 'app/_robots.ts');
const sitemapPath = path.join(__dirname, '..', 'app/sitemap.ts');
const hiddenSitemapPath = path.join(__dirname, '..', 'app/_sitemap.ts');

/**
 * Recursively visits all files in a directory.
 */
function walk(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

/**
 * Safely renames a directory/file, gracefully handling ENOTEMPTY, EXDEV, and EPERM errors.
 */
function safeRenameSync(src, dest) {
    if (!fs.existsSync(src)) return;
    
    if (fs.existsSync(dest)) {
        console.log(`[Capacitor] Destination ${dest} exists, removing it before rename...`);
        try { fs.rmSync(dest, { recursive: true, force: true }); } catch (e) {}
    }
    
    try {
        fs.renameSync(src, dest);
    } catch (e) {
        if (['ENOTEMPTY', 'EXDEV', 'EPERM', 'EBUSY'].includes(e.code)) {
            console.warn(`[Capacitor] renameSync failed (${e.code}). Falling back to cpSync + rmSync...`);
            fs.cpSync(src, dest, { recursive: true, force: true });
            fs.rmSync(src, { recursive: true, force: true });
        } else {
            throw e;
        }
    }
}

// Only target [locale] folder where dynamic routing happens
const targetDirs = ['app/[locale]'].map(d => path.join(__dirname, '..', d));

if (action === 'remove') {
    // Only run if we explicitly pass the Capacitor build flag
    if (process.env.CAPACITOR_BUILD !== 'true') {
        console.log("[Capacitor] CAPACITOR_BUILD is not true, skipping remove step.");
        process.exit(0);
    }
    
    // Hide folders/files that break static export
    if (fs.existsSync(apiDir)) safeRenameSync(apiDir, hiddenApiDir);
    if (fs.existsSync(robotsPath)) safeRenameSync(robotsPath, hiddenRobotsPath);
    if (fs.existsSync(sitemapPath)) safeRenameSync(sitemapPath, hiddenSitemapPath);
    
    let modified = 0;
    targetDirs.forEach(dir => {
        walk(dir, (filePath) => {
            if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                // Skip backup files if they accidentally exist in the tree
                if (filePath.endsWith('.cap_bak')) return;

                let content = fs.readFileSync(filePath, 'utf-8');
                let originalContent = content;
                let changed = false;
                
                // 1. Disable dynamic exports (e.g. export const dynamic = 'force-dynamic')
                const dynamicRegex = /^\s*(export\s+const\s+dynamic\s*=\s*['"][\w-]+['"];?)/gm;
                if (dynamicRegex.test(content)) {
                    content = content.replace(dynamicRegex, '// CAP_DISABLE: $1');
                    changed = true;
                }

                // 1b. Comment out server-only imports that break static export
                const serverOnlyImports = [
                    /@clerk\/nextjs\/server/,
                    /next\/headers/,
                ];
                serverOnlyImports.forEach(pattern => {
                    const importRegex = new RegExp(`^(\\s*import\\s+.*${pattern.source}.*)$`, 'gm');
                    if (importRegex.test(content)) {
                        content = content.replace(importRegex, '// CAP_DISABLE: $1');
                        changed = true;
                    }
                });

                // 1c. Convert layout.tsx to client component for Capacitor static export.
                // @clerk/nextjs ClerkProvider uses server actions internally — incompatible with output: export.
                // The native app uses custom JWT auth (AuthContext), so we remove Clerk entirely.
                if (filePath.endsWith('layout.tsx') && filePath.includes('[locale]') && !filePath.includes('monk')) {
                    // Add "use client" if not present
                    if (!content.includes('"use client"') && !content.includes("'use client'")) {
                        content = '"use client";\n' + content;
                        changed = true;
                    }
                    // Remove ClerkProvider import and JSX tags (native app uses AuthContext, not Clerk)
                    content = content.replace(/import\s+\{[^}]*\}\s+from\s+['"]@clerk\/nextjs['"];?\n?/g, '');
                    content = content.replace(/<ClerkProvider[^>]*>/g, '');
                    content = content.replace(/<\/ClerkProvider>/g, '');
                    // Remove `export const metadata` block (not allowed in client components)
                    // Use brace counting to handle nested objects
                    const metaStart = content.indexOf('export const metadata');
                    if (metaStart !== -1) {
                        let braceCount = 0;
                        let i = content.indexOf('{', metaStart);
                        for (; i < content.length; i++) {
                            if (content[i] === '{') braceCount++;
                            if (content[i] === '}') braceCount--;
                            if (braceCount === 0) {
                                let metaEnd = i + 1;
                                while (metaEnd < content.length && /[;\s]/.test(content[metaEnd])) metaEnd++;
                                content = content.substring(0, metaStart) + content.substring(metaEnd);
                                break;
                            }
                        }
                    }
                    // Convert `async function` to regular function (no await in client components)
                    content = content.replace(/export\s+default\s+async\s+function/g, 'export default function');
                    // Replace `await params` with direct access
                    content = content.replace(/const\s*\{\s*locale\s*\}\s*=\s*await\s+params;/, 
                        "const { locale: localeParam } = (typeof params === 'object' && params !== null && 'then' in params) ? { locale: 'mn' } : (params as { locale: string });\n  const locale = localeParam;");
                    changed = true;
                }

                // 1d. Replace server-only pages (pages that use server APIs like currentUser + connectToDatabase)
                //     with placeholder client components — they can't work in a static app.
                const isClientComponent = content.includes('"use client"') || content.includes("'use client'");
                const isServerOnlyPage = filePath.endsWith('page.tsx') &&
                    !isClientComponent &&
                    (originalContent.includes('connectToDatabase') || originalContent.includes('currentUser()'));
                
                if (isServerOnlyPage) {
                    // Build generateStaticParams for any dynamic segments in the path
                    let dyns = [];
                    const parts = filePath.split(path.sep);
                    parts.forEach(s => {
                        let match = s.match(/\[(.*?)\]/);
                        if (match) dyns.push(match[match.length - 1]);
                    });
                    let paramsMn = { locale: "mn" };
                    let paramsEn = { locale: "en" };
                    dyns.forEach(param => {
                        if (param !== 'locale') {
                            paramsMn[param] = "capacitor";
                            paramsEn[param] = "capacitor";
                        }
                    });

                    const placeholderContent = `// CAP_PLACEHOLDER: server-only page replaced for static export\nexport function generateStaticParams() {\n  return [\n    ${JSON.stringify(paramsMn)},\n    ${JSON.stringify(paramsEn)}\n  ];\n}\n\nexport default function CapPlaceholder() {\n  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}><p>This page is not available in the app.</p></div>;\n}\n`;
                    const backupPath = filePath + '.cap_bak';
                    fs.writeFileSync(backupPath, originalContent, 'utf-8');
                    fs.writeFileSync(filePath, placeholderContent, 'utf-8');
                    modified++;
                    console.log(`[Capacitor] Replaced server-only page with placeholder: ${filePath}`);
                    return; // Skip further processing
                }

                // 2. Inject generateStaticParams safely for `output: export`
                const isPageOrLayout = filePath.endsWith('page.tsx') || filePath.endsWith('layout.tsx');
                
                // ONLY inject if it's a dynamic route `[...]`
                if (isPageOrLayout && filePath.includes('[')) {
                    // Check if it already has generateStaticParams or is a client component
                    const hasGenerateStaticParams = content.includes('generateStaticParams');
                    
                    if (!hasGenerateStaticParams && !isClientComponent) {
                        let dyns = [];
                        
                        // Extract dynamic params from the file path
                        // e.g. /app/[locale]/monks/[id]/page.tsx -> ['locale', 'id']
                        const parts = filePath.split(path.sep);
                        parts.forEach(s => {
                            let match = s.match(/\[(.*?)\]/);
                            if (match) dyns.push(match[match.length - 1]); // get inner string
                        });
                        
                        // We must provide AT LEAST ONE dummy value for EVERY dynamic param in the route.
                        // If we return [], Next.js `output: export` throws an error because there are 0 paths to build.
                        let paramsMn = { locale: "mn" };
                        let paramsEn = { locale: "en" };
                        
                        dyns.forEach(param => {
                            if (param !== 'locale') {
                                paramsMn[param] = "capacitor";
                                paramsEn[param] = "capacitor";
                            }
                        });
                        
                        const injectedCode = `\n\n// --- CAP_INJECT_PARAMS_START ---\nexport function generateStaticParams() {\n  return [\n    ${JSON.stringify(paramsMn)},\n    ${JSON.stringify(paramsEn)}\n  ];\n}\n// --- CAP_INJECT_PARAMS_END ---\n`;
                        
                        content += injectedCode;
                        changed = true;
                    } else if (!hasGenerateStaticParams && isClientComponent && filePath.endsWith('page.tsx')) {
                        // Next.js 16+: client components cannot export generateStaticParams.
                        // Create a server-component wrapper that imports the client page.
                        const dir = path.dirname(filePath);
                        const clientPath = path.join(dir, '_CapClientPage.tsx');

                        // Extract dynamic params from the file path
                        let dyns = [];
                        const parts = filePath.split(path.sep);
                        parts.forEach(s => {
                            let match = s.match(/\[(.*?)\]/);
                            if (match) dyns.push(match[match.length - 1]);
                        });

                        let paramsMn = { locale: "mn" };
                        let paramsEn = { locale: "en" };
                        dyns.forEach(param => {
                            if (param !== 'locale') {
                                paramsMn[param] = "capacitor";
                                paramsEn[param] = "capacitor";
                            }
                        });

                        // 1. Copy original client component to _CapClientPage.tsx
                        fs.writeFileSync(clientPath, content, 'utf-8');

                        // 2. Create thin server wrapper as the new page.tsx
                        const wrapperContent = `// --- CAP_GENERATED_WRAPPER (do not edit manually) ---\nimport { Suspense } from 'react';\nimport ClientPage from './_CapClientPage';\n\nexport function generateStaticParams() {\n  return [\n    ${JSON.stringify(paramsMn)},\n    ${JSON.stringify(paramsEn)}\n  ];\n}\n\nexport default function Page() {\n  return <Suspense fallback={<div style={{minHeight:"100vh"}} />}><ClientPage /></Suspense>;\n}\n`;

                        // 3. Backup original and overwrite with wrapper
                        const backupPath = filePath + '.cap_bak';
                        fs.writeFileSync(backupPath, originalContent, 'utf-8');
                        fs.writeFileSync(filePath, wrapperContent, 'utf-8');
                        modified++;
                        console.log(`[Capacitor] Created server wrapper for client page: ${filePath}`);
                        // Skip further processing — we already backed up and wrote
                        return;
                    }
                }
                
                if (changed) {
                    // PHYSICAL BACKUP: Create an exact copy of the pristine file
                    const backupPath = filePath + '.cap_bak';
                    
                    // Always copy the original, unmodified content to the backup
                    fs.writeFileSync(backupPath, originalContent, 'utf-8');
                    fs.writeFileSync(filePath, content, 'utf-8');
                    modified++;
                    console.log(`[Capacitor] Injected dummy params & backed up: ${filePath}`);
                }
            }
        });
    });
    if (modified > 0) console.log(`[Capacitor] Modified ${modified} files for mobile export (Created .cap_bak backups).`);

} else if (action === 'restore') {
    // Restore hidden folders/files
    if (fs.existsSync(hiddenApiDir)) safeRenameSync(hiddenApiDir, apiDir);
    if (fs.existsSync(hiddenRobotsPath)) safeRenameSync(hiddenRobotsPath, robotsPath);
    if (fs.existsSync(hiddenSitemapPath)) safeRenameSync(hiddenSitemapPath, sitemapPath);

    let restored = 0;
    targetDirs.forEach(dir => {
        walk(dir, (filePath) => {
            // Find any backup file created during the 'remove' step
            if (filePath.endsWith('.cap_bak')) {
                const originalPath = filePath.replace(/\.cap_bak$/, '');
                try {
                    // Restore the original pristine file directly from backup
                    fs.copyFileSync(filePath, originalPath);
                    // Clean up the backup file
                    fs.rmSync(filePath);
                    restored++;
                } catch (e) {
                    console.error(`[Capacitor] Failed to restore ${originalPath} from backup:`, e.message);
                }
            }
            // Clean up _CapClientPage.tsx wrapper artifacts
            if (filePath.endsWith('_CapClientPage.tsx')) {
                try {
                    fs.rmSync(filePath);
                    console.log(`[Capacitor] Cleaned up wrapper artifact: ${filePath}`);
                } catch (e) {
                    console.error(`[Capacitor] Failed to clean up ${filePath}:`, e.message);
                }
            }
        });
    });
    if (restored > 0) console.log(`[Capacitor] Restored ${restored} files perfectly from .cap_bak backups.`);
} else {
    console.error("Please specify 'remove' or 'restore'");
    process.exitCode = 1;
}