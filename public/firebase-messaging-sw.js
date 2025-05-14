// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

// Firebase 구성 정보를 실제 값으로 사용
// Service Worker는 환경 변수에 접근할 수 없으므로 직접 값을 입력해야 합니다
const firebaseConfig = {
    apiKey: 'AIzaSyCFuHAlMLW11naTr7MwH14E_W3K11cIeA8',
    authDomain: 'hamburger-9d630.firebaseapp.com',
    projectId: 'hamburger-9d630',
    messagingSenderId: '527168226905',
    appId: '1:527168226905:web:f7cb7d34231a19eabc5348',
    measurementId: 'G-3MME825YX7',
};

// Firebase 앱 초기화
firebase.initializeApp(firebaseConfig);

// messaging 변수 정의
const messaging = firebase.messaging();

// 백그라운드 메시지 핸들러 수정
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] 백그라운드 메시지:', payload);

    // 클라이언트 찾기
    self.clients
        .matchAll({
            type: 'window',
            includeUncontrolled: true,
        })
        .then((clients) => {
            if (clients.length > 0) {
                // 활성화된 클라이언트가 있으면 메시지 전달
                const client = clients[0];
                client.postMessage({
                    type: 'FIREBASE_ALERT',
                    payload: payload,
                });
                return;
            }

            // 활성화된 클라이언트가 없으면 기본 알림 표시
            let title = '알림';
            let body = '새로운 알림이 도착했습니다.';

            if (payload.notification) {
                title = payload.notification.title || title;
                body = payload.notification.body || body;
            } else if (payload.data) {
                title = payload.data.title || '낙상 사고 발생';
                body = payload.data.body || payload.data.message || '병실에서 낙상 사고가 감지되었습니다.';
            }

            self.registration.showNotification(title, {
                body,
                icon: '/logo.png',
                // 클릭하면 앱 열기
                data: { url: self.location.origin },
            });
        });
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // 앱 열기
    const urlToOpen = event.notification.data?.url || self.location.origin;

    event.waitUntil(
        self.clients
            .matchAll({
                type: 'window',
                includeUncontrolled: true,
            })
            .then((clientList) => {
                // 이미 열린 창이 있으면 포커스
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // 열린 창이 없으면 새 창 열기
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );
});
