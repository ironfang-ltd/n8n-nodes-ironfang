// Copy node icons into dist (tsc only emits .js/.d.ts).
import { cpSync } from 'node:fs';
cpSync('nodes/Renderwolf/renderwolf.png', 'dist/nodes/Renderwolf/renderwolf.png');
console.log('assets copied');
