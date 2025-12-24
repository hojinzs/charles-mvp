import { BrowserWindow } from 'electron';

export async function checkRanking(keyword: string, targetUrlPart: string): Promise<number | null> {
  console.log(`[Crawler] Checking ranking for "${keyword}" looking for "${targetUrlPart}"...`);
  
  let win: BrowserWindow | null = new BrowserWindow({
    width: 1280,
    height: 1024,
    show: false, // Hidden window
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  try {
    await win.loadURL(`https://search.naver.com/search.naver?query=${encodeURIComponent(keyword)}`);

    // Wait for dynamic content (simple timeout for POC)
    await new Promise(resolve => setTimeout(resolve, 3000));

    const results = await win.webContents.executeJavaScript(`
      (() => {
        const data = { ads: [], organic: [] };
        
        // 1. Ads (Power Link)
        const adSection = document.getElementById('power_link_body');
        if (adSection) {
           const listItems = adSection.querySelectorAll('li.lst'); 
           listItems.forEach((el, index) => {
              const titleEl = el.querySelector('a.lnk_head .lnk_tit');
              const urlEl = el.querySelector('.lnk_url');
              const linkEl = el.querySelector('a.lnk_head');
              
              if (titleEl) {
                 data.ads.push({
                   rank: index + 1,
                   title: titleEl.innerText,
                   displayUrl: urlEl ? urlEl.innerText : '',
                   link: linkEl ? linkEl.href : ''
                 });
              }
           });
        }

        // 2. Organic
        const sections = document.querySelectorAll('.sc_new');
        sections.forEach((section) => {
            if (section.classList.contains('sp_nwebsite')) {
               const items = section.querySelectorAll('.list_type .bx');
               items.forEach((item) => {
                   const link = item.querySelector('a.link_tit');
                   const url = item.querySelector('a.link_url');
                   if (link) {
                       data.organic.push({
                           type: 'website',
                           title: link.innerText,
                           displayUrl: url ? url.innerText : '',
                           link: link.href
                       });
                   }
               });
            }
        });
        return data;
      })()
    `);

    // Check Ranking
    // 1. Check Ads first
    const foundAd = results.ads.find((ad: any) => 
      ad.displayUrl.includes(targetUrlPart) || ad.title.includes(targetUrlPart)
    );

    if (foundAd) {
      console.log(`[Crawler] Found in Ads at rank ${foundAd.rank}`);
      return foundAd.rank;
    }

    // 2. Check Organic (If user wants organic rank, we might need to separate ad/organic ranking logic)
    // For now, let's return the Organic index + 100 or something to differentiate? 
    // Or just null if only monitoring Ads. The user requirement said "Verification of ranking" but implied Ads monitoring ("Power Link").
    // But the verified crawler extracted both. 
    // Let's stick to returning Ad rank if found, else null (or maybe handle organic later).
    // User request: "1분마다 스케줄러가 돌면서 등록된 키워드들의 순위를 확인" (Check ranking of registered keywords every minute)
    // Assuming Ads for now given the context of "Naver Ad Monitor".
    
    return null;

  } catch (error) {
    console.error('[Crawler] Error:', error);
    return null;
  } finally {
    if (win) {
      win.close();
      win = null;
    }
  }
}
