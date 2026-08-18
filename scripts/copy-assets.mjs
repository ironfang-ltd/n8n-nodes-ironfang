// Copy icons into dist (tsc only emits .js/.d.ts).
import { cpSync } from 'node:fs';
cpSync('nodes/Renderwolf/renderwolf.svg', 'dist/nodes/Renderwolf/renderwolf.svg');
cpSync('credentials/renderwolf.svg', 'dist/credentials/renderwolf.svg');
console.log('assets copied');
