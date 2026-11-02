import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, join } from 'node:path';
import { chromium } from 'playwright';

const WEB = resolve('web');
const TYPES = { '.html': 'text/html', '.mjs': 'application/javascript', '.js':'application/javascript',
  '.css': 'text/css', '.svg':'image/svg+xml' };

function serverForWeb() {
  return createServer(async(req,res)=>{
    const file = new URL(req.url, 'http://localhost').pathname;
    const filename = resolve(WEB, '.' + (file === '/' ? '/index.html' : file));
    if (!filename.startsWith(WEB+'/') || !Object.hasOwn(TYPES,extname(filename))) {
      res.writeHead(404);res.end('Not found');return;
    }
    try{
      const bytes=await readFile(filename);
      res.writeHead(200,{'Content-Type':TYPES[extname(filename)]});res.end(bytes);
    }catch{res.writeHead(404);res.end('Not found');}
  });
}
test('desktop and mobile browsers can launch every mode, tap to fire and switch both visual editions', {timeout:180000}, async()=>{
  const server=serverForWeb();
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  let browser;
  try {
    browser=await chromium.launch({headless:true,args:['--no-sandbox']});
    await mkdir('test-artifacts',{recursive:true});
    const url='http://127.0.0.1:'+server.address().port+'/';
    for(const [name,width,height,touch] of [['iphone',390,844,true],['tablet',768,1024,true],['desktop',1366,900,false]]) {
      const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:touch?2:1,
        isMobile:touch,hasTouch:touch,reducedMotion:'reduce'});
      const page=await context.newPage(), errors=[];
      page.on('pageerror', e=>errors.push(e.message));
      await page.goto(url,{waitUntil:'networkidle'});
      assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('retro96')));
      await page.locator('[data-mode="authentic"]').click();
      await page.locator('#startButton').click();
      await page.locator('#arena').waitFor({state:'visible'});
      const box=await page.locator('#arena').boundingBox();
      assert.ok(box && box.width > 160 && box.width <= width,'arena width fits '+name);
      const center = {x:box.width*.5,y:box.height*.5};
      if(touch) await page.locator('#arena').tap({position:center});
      else await page.locator('#arena').click({position:center});
      await page.waitForTimeout(250);
      assert.ok(await page.locator('#retroScore').count()===1);
      await page.screenshot({path:join('test-artifacts',name+'-authentic-retro.png'),fullPage:true});
      await page.locator('#pauseButton').click();
      assert.ok(await page.locator('#modal').evaluate(e=>e.open),'pause opens on '+name);
      await page.locator('#menu').click();
      await page.locator('#settingsButton').click();
      await page.locator('#visualTheme').selectOption('chrome');
      await page.locator('#done').click();
      assert.ok(!await page.locator('body').evaluate(e=>e.classList.contains('retro96')));
      await page.locator('[data-mode="enhanced"]').click();
      await page.locator('#startButton').click();
      await page.locator('#arena').waitFor({state:'visible'});
      await page.screenshot({path:join('test-artifacts',name+'-enhanced-chrome.png'),fullPage:true});
      assert.deepEqual(errors,[],'no uncaught browser errors in '+name);
      await context.close();
    }
  } finally {
    await browser?.close();
    await new Promise(r=>server.close(r));
  }
});