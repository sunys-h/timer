const CACHE='badtimer-v4';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // フォントは一度読んだら保存して、オフラインでも使う
  if(url.host==='fonts.googleapis.com'||url.host==='fonts.gstatic.com'){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(hit=>hit||fetch(req).then(res=>{c.put(req,res.clone());return res}).catch(()=>hit))));return;
  }
  if(url.origin!==location.origin)return;
  // 自分のファイル：ネットにつながればその場で更新、なければ保存済みを使う
  e.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res})
    .catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
});
