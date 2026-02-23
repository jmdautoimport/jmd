// Firebase Messaging service worker for background notifications
// Note: The messagingSenderId is not secret — it can be hardcoded here.
// Replace REPLACE_WITH_MESSAGING_SENDER_ID with your actual sender ID from .env
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

firebase.initializeApp({
  messagingSenderId: '866374087987',
});

const messaging = firebase.messaging();

// Display background notifications when the app is not open
messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || 'Notification';
  const body = payload?.notification?.body || '';
  const options = {
    body,
    icon: '/favicon.png',
    data: payload?.data || {},
  };
  self.registration.showNotification(title, options);
});