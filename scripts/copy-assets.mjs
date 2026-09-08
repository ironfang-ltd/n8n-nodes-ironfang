import { cpSync } from 'node:fs';
for (const dir of ['nodes/Ironfang', 'credentials']) {
  for (const icon of ['ironfang.svg', 'ironfang.dark.svg']) cpSync(`${dir}/${icon}`, `dist/${dir}/${icon}`);
}
