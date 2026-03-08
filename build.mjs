import fs from 'node:fs';
import { execSync } from 'node:child_process';

console.log('Building React Router 7 SPA...');
execSync('npx react-router build', { stdio: 'inherit' });

console.log('Moving build/client to dist for Vercel...');
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
}
if (fs.existsSync('build/client')) {
    fs.cpSync('build/client', 'dist', { recursive: true });
}

console.log('Build output generated into dist successfully!');
