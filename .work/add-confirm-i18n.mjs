import fs from 'node:fs';
const add = {
  en: {
    confirm: {
      title: 'Order confirmation',
      thanks: 'Thank you. Your order is placed.',
      number: 'Your order number is {id}.',
      emailSent: 'We sent the details to {email}.',
      empty: 'We could not find a recent order on this device.',
      emptyHelp: 'If you placed an order as a guest, you can open it with your order number and email address.',
      trackLink: 'Find my order',
      continueShopping: 'Continue shopping',
      viewOrders: 'View my orders',
      createTitle: 'Create an account to follow your orders',
      createText: 'Choose a password. We send a confirmation email, and your orders on this email address join your account once you confirm it.',
      createSubmit: 'Create account',
      createSent: 'Check your email and open the link to confirm your account.',
      createDone: 'Your account is ready.',
      guestKept: 'This page keeps your order only until you close the browser. Save your order number and email address to open it later.'
    },
    track: {
      title: 'Track your order',
      intro: 'Enter your order number and the email address you used. We send a six-digit code to that address.',
      orderNumber: 'Order number',
      email: 'Email address',
      sendCode: 'Send code',
      codeSent: 'If the details match an order, we sent a code to that email address. It is valid for a short time.',
      code: 'Six-digit code',
      verify: 'Open order',
      change: 'Use other details',
      checkNeeded: 'Complete the check below to continue.',
      errNumber: 'Enter your order number.',
      errCode: 'Enter the six-digit code.',
      errInvalidCode: 'The code is not right or has expired. Check it or ask for a new one.',
      errRate: 'Too many attempts. Wait a few minutes and try again.',
      errCaptcha: 'The check did not pass. Try again.',
      errNetwork: 'Could not reach the store. Check your connection and try again.',
      errUnknown: 'Something went wrong. Try again.'
    }
  },
  hi: {
    confirm: {
      title: 'ऑर्डर की पुष्टि',
      thanks: 'धन्यवाद। आपका ऑर्डर हो गया है।',
      number: 'आपका ऑर्डर नंबर {id} है।',
      emailSent: 'हमने विवरण {email} पर भेजा है।',
      empty: 'इस डिवाइस पर कोई हाल का ऑर्डर नहीं मिला।',
      emptyHelp: 'अगर आपने अतिथि के रूप में ऑर्डर किया था, तो ऑर्डर नंबर और ईमेल पते से उसे खोल सकते हैं।',
      trackLink: 'मेरा ऑर्डर खोजें',
      continueShopping: 'खरीदारी जारी रखें',
      viewOrders: 'मेरे ऑर्डर देखें',
      createTitle: 'ऑर्डर देखने के लिए खाता बनाएँ',
      createText: 'पासवर्ड चुनें। हम पुष्टि का ईमेल भेजते हैं, और पुष्टि के बाद इस ईमेल पते के ऑर्डर आपके खाते में जुड़ जाते हैं।',
      createSubmit: 'खाता बनाएँ',
      createSent: 'अपना ईमेल देखें और खाते की पुष्टि के लिए लिंक खोलें।',
      createDone: 'आपका खाता तैयार है।',
      guestKept: 'यह पेज आपका ऑर्डर केवल ब्राउज़र बंद होने तक रखता है। बाद में खोलने के लिए ऑर्डर नंबर और ईमेल पता सहेज लें।'
    },
    track: {
      title: 'अपना ऑर्डर ट्रैक करें',
      intro: 'अपना ऑर्डर नंबर और इस्तेमाल किया गया ईमेल पता लिखें। हम उस पते पर छह अंकों का कोड भेजते हैं।',
      orderNumber: 'ऑर्डर नंबर',
      email: 'ईमेल पता',
      sendCode: 'कोड भेजें',
      codeSent: 'अगर विवरण किसी ऑर्डर से मेल खाता है, तो हमने उस ईमेल पते पर कोड भेजा है। यह थोड़े समय के लिए मान्य है।',
      code: 'छह अंकों का कोड',
      verify: 'ऑर्डर खोलें',
      change: 'दूसरा विवरण लिखें',
      checkNeeded: 'आगे बढ़ने के लिए नीचे की जाँच पूरी करें।',
      errNumber: 'अपना ऑर्डर नंबर लिखें।',
      errCode: 'छह अंकों का कोड लिखें।',
      errInvalidCode: 'कोड सही नहीं है या समाप्त हो गया है। उसे जाँचें या नया कोड मँगवाएँ।',
      errRate: 'बहुत ज़्यादा प्रयास हुए। कुछ मिनट रुककर फिर कोशिश करें।',
      errCaptcha: 'जाँच पूरी नहीं हुई। फिर कोशिश करें।',
      errNetwork: 'स्टोर से संपर्क नहीं हो सका। कनेक्शन जाँचकर फिर कोशिश करें।',
      errUnknown: 'कुछ गड़बड़ हो गई। फिर कोशिश करें।'
    }
  }
};
for (const l of ['en','hi']) {
  const f = `src/i18n/${l}.json`;
  const j = JSON.parse(fs.readFileSync(f,'utf8'));
  j.account = { ...j.account, ...add[l] };
  fs.writeFileSync(f, JSON.stringify(j,null,2)+'\n');
}
