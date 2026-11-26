const {chromium}=require('/tmp/pw/node_modules/playwright-core');const assert=require('assert');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [n,w,h] of [['desktop',1280,900],['mobile',390,844]]){
 const p=await b.newPage({viewport:{width:w,height:h}});await p.context().grantPermissions(['clipboard-read','clipboard-write']).catch(()=>{});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///downloads/cin-checker/index.html');
 // empty
 assert(await p.locator('.empty h2').innerText()==='Nothing to check yet');
 // whitespace-only stays empty
 await p.fill('#input','  \n \n');await p.waitForTimeout(300);assert(await p.locator('.empty h2').count()===1);
 // example link in empty state
 await p.fill('#input','');await p.waitForTimeout(300);await p.click('#ex2');assert(await p.locator('.item').count()===6);
 // mixed with dups, PN, ZZ, FCRN, messy
 await p.fill('#input','l17110mh1973plc019786\nL17110MH1973PLC019786\n\nU72900PN2015PTC123456\nL17110ZZ1973PLC019786\nF04662\naaa 1234\nnonsense');await p.waitForTimeout(400);
 assert.strictEqual(await p.locator('.item').count(),7);
 assert(/Repeat of line 1/.test(await p.locator('.item').nth(1).innerText()));
 assert(/Pune/.test(await p.locator('.item').nth(2).innerText()));
 assert(/code not recognised/.test(await p.locator('.item').nth(3).innerText()));
 assert(/Not a CIN or LLPIN/.test(await p.locator('.item').nth(4).innerText()));
 await p.screenshot({path:`shots/${n}-mixed.png`,fullPage:true});
 // filters
 await p.click('[data-f=invalid]');assert.strictEqual(await p.locator('.item').count(),2);
 await p.click('[data-f=valid]');assert.strictEqual(await p.locator('.item').count(),5);
 await p.click('[data-f=all]');
 // 500
 const big=Array.from({length:500},(_,i)=>i%7==0?'BAD'+i:'U72900KA2020PTC'+String(i).padStart(6,'0')).join('\n');
 await p.fill('#input',big);await p.waitForTimeout(700);
 assert.strictEqual(await p.locator('.item').count(),100);
 await p.click('#more');assert.strictEqual(await p.locator('.item').count(),200);
 for(let i=0;i<3;i++)await p.click('#more');assert.strictEqual(await p.locator('.item').count(),500);assert.strictEqual(await p.locator('#more').count(),0);
 await p.click('[data-f=invalid]');assert.strictEqual(await p.locator('.item').count(),72);
 await p.click('#csv');await p.waitForTimeout(300);
 const clip=await p.evaluate(()=>navigator.clipboard.readText());assert(clip.split('\n').length>=501&&clip.startsWith('"line"'),'csv '+clip.slice(0,80));
 assert.strictEqual(await p.locator('#csv').innerText(),'Copied');
 assert.strictEqual(await p.evaluate(()=>document.documentElement.scrollWidth),w);
 await p.screenshot({path:`shots/${n}-500b.png`});
 await p.click('#clear');assert.strictEqual(await p.locator('.empty h2').count(),1);assert.strictEqual(await p.inputValue('#input'),'');
 assert.deepStrictEqual(errs,[]);console.log(n,'UI ok');
}
await b.close()})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
