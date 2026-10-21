import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('生成站点的页面、目录锚点和公式字体引用均有效', async()=>{
  const root = fileURLToPath(new URL('../',import.meta.url));
  execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root});
  const dist = path.join(root,'dist');
  const config = JSON.parse(await readFile(path.join(root,'site.config.json'),'utf8'));
  const base = '/' + config.basePath.split('/').filter(Boolean).join('/');
  const files = await readdir(dist,{recursive:true});
  for (const file of files.filter(f=>f.endsWith('.html'))) {
    const html = await readFile(path.join(dist,file),'utf8');
    if (html.includes('class="katex')) assert.match(html,/katex.min.css/);
    const pageUrl = new URL((base === '/' ? '/' : base + '/') + file.replaceAll('\\','/'),'https://test.local');
    for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const target = new URL(match[1].replaceAll('&amp;','&'),pageUrl);
      if(target.origin !== pageUrl.origin) continue;
      let pathname = decodeURIComponent(target.pathname);
      if(base !== '/') { assert.ok(pathname.startsWith(base + '/')); pathname=pathname.slice(base.length); }
      if(pathname.endsWith('/')) pathname+='index.html';
      const targetFile = path.join(dist,pathname);
      await access(targetFile);
      if(target.hash) {
        const content=await readFile(targetFile,'utf8');
        assert.ok(content.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`),`${file}: ${target.hash}`);
      }
    }
  }
  const css = await readFile(path.join(dist,'assets/katex/katex.min.css'),'utf8');
  for(const match of css.matchAll(/url\(([^)]+)\)/g)) await access(path.join(dist,'assets/katex',match[1]));
  const home=await readFile(path.join(dist,'index.html'),'utf8');
  assert.doesNotMatch(home,/katex.min.css/);
});
