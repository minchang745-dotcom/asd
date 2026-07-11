// service-worker.js
// 이 파일은 HTML 파일과 "같은 폴더"에 함께 올려야 함 (GitHub Pages 루트 기준 상대경로로 등록되어 있음).
// 역할: 서버(Supabase Edge Function)가 보낸 Web Push 메시지를 받아서
// 브라우저/폰이 완전히 꺼져있지 않은 한(백그라운드 포함) 알림으로 띄워줌.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 서버에서 push를 보낼 때는 아래 형태의 JSON을 담아 보내면 됨:
// { "title": "D-129 수능", "body": "수능이 129일 남았습니다...", "url": "/" }
self.addEventListener('push', (event) => {
  let data = { title: '경고장', body: '알림이 도착했습니다.', url: '/' };
  try{
    if(event.data) data = event.data.json();
  }catch(e){
    if(event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: data.icon || undefined,
    badge: data.badge || undefined,
    data: { url: data.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 알림을 클릭하면 앱 탭으로 포커스 이동 (없으면 새로 열기)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for(const client of clientList){
        if(client.url.includes(targetUrl) && 'focus' in client) return client.focus();
      }
      if(self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
