// Copy icons into dist (tsc only emits .js/.d.ts).
import { cpSync } from 'node:fs';
cpSync('nodes/Ironfang/ironfang.svg', 'dist/nodes/Ironfang/ironfang.svg');
cpSync('credentials/ironfang.svg', 'dist/credentials/ironfang.svg');
console.log('assets copied');
