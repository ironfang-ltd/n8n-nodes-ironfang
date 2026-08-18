// Copy icons into dist (tsc only emits .js/.d.ts).
import { cpSync } from 'node:fs';
for (const dir of ['nodes/Renderwolf', 'credentials']) {
    for (const f of ['renderwolf.svg', 'renderwolf.dark.svg']) {
        cpSync(`${dir}/${f}`, `dist/${dir}/${f}`);
    }
}
console.log('assets copied');
