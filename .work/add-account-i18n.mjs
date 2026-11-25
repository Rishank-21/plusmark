import { readFileSync, writeFileSync } from 'node:fs';
const en = {
  signIn: {
    title: 'Sign in or create an account',
    resetTitle: 'Reset your password',
    newPasswordTitle: 'Choose a new password',
    tabSignIn: 'Sign in', tabSignUp: 'Create account', tabReset: 'Forgot password',
    email: 'Email address', password: 'Password', newPassword: 'New password',
    passwordHint: 'At least 10 characters.',
    submitSignIn: 'Sign in', submitSignUp: 'Create account', submitReset: 'Send reset link', submitNewPassword: 'Save new password',
    checkEmail: 'Check your email and open the link to confirm your account, then sign in.',
    resetSent: 'If that email address has an account, a reset link is on its way.',
    passwordUpdated: 'Your password is updated. Sign in with it.',
    captchaNeeded: 'Complete the check below to continue.',
    errInvalid: 'The email address or password is not right.',
    errNotConfirmed: 'Confirm your email address first. The link is in the email we sent you.',
    errWeak: 'Choose a longer or less common password.',
    errCaptcha: 'The check did not pass. Try again.',
    errRate: 'Too many attempts. Wait a few minutes and try again.',
    errExists: 'An account with this email address already exists. Sign in instead.',
    errNetwork: 'Could not reach the store. Check your connection and try again.',
    errUnknown: 'Something went wrong. Try again.',
    errEmail: 'Enter a valid email address.',
  },
  area: {
    title: 'Your account', signedInAs: 'Signed in as {email}', signOut: 'Sign out', signedOut: 'You have signed out.',
    needSignIn: 'Sign in to see your account.', goSignIn: 'Sign in', loading: 'Loading…', loadFailed: 'Could not load this. Try again.',
    sections: 'Account sections',
    orders: 'Orders', addresses: 'Addresses', wishlists: 'Wishlists', reviews: 'Reviews', preferences: 'Preferences', language: 'Language', deletion: 'Delete account',
  },
  orders: {
    none: 'You have no orders yet.', number: 'Order {id}', placedOn: 'Placed on {date}', total: 'Total {amount}',
    view: 'View order', back: 'Back to orders', items: 'Items', status: 'Status', deliveryAddress: 'Delivery address', payment: 'Payment',
    tracking: 'Track shipment', history: 'Status history', cancel: 'Cancel order', cancelSure: 'Cancel this order?', cancelled: 'The order is cancelled.',
    returnHeading: 'Return items', returnQty: 'Quantity to return', returnSend: 'Request return', returnSent: 'Your return request is sent.',
    returnPick: 'Choose at least one item to return.',
    invoice: 'Tax invoice', invoiceOpen: 'Open tax invoice', invoiceNone: 'The tax invoice is issued when the order ships.',
    invoicePrint: 'Print', invoiceTitle: 'Tax invoice for order {id}', notFound: 'This order was not found.',
    actionFailed: 'Could not do that. The order may have changed. Reload and try again.',
  },
  addr: {
    none: 'You have no saved addresses.', add: 'Add an address', save: 'Save address', remove: 'Delete', saved: 'Address saved.', removed: 'Address deleted.',
    name: 'Full name', line1: 'Address line 1', line2: 'Address line 2', city: 'City', state: 'State', pin: 'PIN code', phone: 'Mobile number', defaultShipping: 'Use as my delivery address',
    invalid: 'Check the address and try again.',
  },
  wish: { none: 'You have no saved products.', remove: 'Remove', removed: 'Removed from your list.', view: 'View product' },
  rev: { none: 'You have not written a review.', awaiting: 'Awaiting moderation', published: 'Published', rejected: 'Not published', verified: 'Verified purchase', rating: '{n} out of 5 stars' },
  pref: {
    marketing: 'Send me offers and news by email', saved: 'Preference saved.',
    languageLabel: 'Language', languageEn: 'English', languageHi: 'हिन्दी', languageSaved: 'Language saved.',
  },
  del: {
    text: 'Deleting your account removes your personal details. Orders are kept as the law requires, without your details. This cannot be undone.',
    confirm: 'Delete my account', sure: 'Delete your account for good?', done: 'Your deletion request is received. You are signed out.',
    recent: 'For your safety, sign in again and then delete the account.', failed: 'Could not delete the account. Try again.',
  },
};
const hi = {
  signIn: {
    title: 'साइन इन करें या खाता बनाएँ',
    resetTitle: 'पासवर्ड रीसेट करें',
    newPasswordTitle: 'नया पासवर्ड चुनें',
    tabSignIn: 'साइन इन', tabSignUp: 'खाता बनाएँ', tabReset: 'पासवर्ड भूल गए',
    email: 'ईमेल पता', password: 'पासवर्ड', newPassword: 'नया पासवर्ड',
    passwordHint: 'कम से कम 10 अक्षर।',
    submitSignIn: 'साइन इन करें', submitSignUp: 'खाता बनाएँ', submitReset: 'रीसेट लिंक भेजें', submitNewPassword: 'नया पासवर्ड सहेजें',
    checkEmail: 'अपना ईमेल देखें और खाता पक्का करने के लिए लिंक खोलें, फिर साइन इन करें।',
    resetSent: 'अगर इस ईमेल पते पर खाता है, तो रीसेट लिंक भेजा जा रहा है।',
    passwordUpdated: 'आपका पासवर्ड बदल गया है। उससे साइन इन करें।',
    captchaNeeded: 'आगे बढ़ने के लिए नीचे की जाँच पूरी करें।',
    errInvalid: 'ईमेल पता या पासवर्ड सही नहीं है।',
    errNotConfirmed: 'पहले अपना ईमेल पता पक्का करें। लिंक हमारे भेजे ईमेल में है।',
    errWeak: 'लंबा या कम आम पासवर्ड चुनें।',
    errCaptcha: 'जाँच पूरी नहीं हुई। फिर कोशिश करें।',
    errRate: 'बहुत ज़्यादा कोशिशें। कुछ मिनट रुककर फिर कोशिश करें।',
    errExists: 'इस ईमेल पते से खाता पहले से है। साइन इन करें।',
    errNetwork: 'स्टोर तक नहीं पहुँच सके। कनेक्शन जाँचकर फिर कोशिश करें।',
    errUnknown: 'कुछ गड़बड़ हुई। फिर कोशिश करें।',
    errEmail: 'सही ईमेल पता लिखें।',
  },
  area: {
    title: 'आपका खाता', signedInAs: '{email} से साइन इन', signOut: 'साइन आउट', signedOut: 'आप साइन आउट हो गए हैं।',
    needSignIn: 'अपना खाता देखने के लिए साइन इन करें।', goSignIn: 'साइन इन', loading: 'लोड हो रहा है…', loadFailed: 'यह लोड नहीं हो सका। फिर कोशिश करें।',
    sections: 'खाते के भाग',
    orders: 'ऑर्डर', addresses: 'पते', wishlists: 'विशलिस्ट', reviews: 'समीक्षाएँ', preferences: 'पसंद', language: 'भाषा', deletion: 'खाता हटाएँ',
  },
  orders: {
    none: 'आपका अभी कोई ऑर्डर नहीं है।', number: 'ऑर्डर {id}', placedOn: '{date} को किया गया', total: 'कुल {amount}',
    view: 'ऑर्डर देखें', back: 'ऑर्डर पर वापस', items: 'सामान', status: 'स्थिति', deliveryAddress: 'डिलीवरी का पता', payment: 'भुगतान',
    tracking: 'शिपमेंट ट्रैक करें', history: 'स्थिति का इतिहास', cancel: 'ऑर्डर रद्द करें', cancelSure: 'यह ऑर्डर रद्द करें?', cancelled: 'ऑर्डर रद्द हो गया।',
    returnHeading: 'सामान वापस करें', returnQty: 'वापस करने की संख्या', returnSend: 'वापसी का अनुरोध करें', returnSent: 'आपका वापसी अनुरोध भेज दिया गया।',
    returnPick: 'वापस करने के लिए कम से कम एक सामान चुनें।',
    invoice: 'टैक्स इनवॉइस', invoiceOpen: 'टैक्स इनवॉइस खोलें', invoiceNone: 'ऑर्डर शिप होने पर टैक्स इनवॉइस जारी होता है।',
    invoicePrint: 'प्रिंट करें', invoiceTitle: 'ऑर्डर {id} का टैक्स इनवॉइस', notFound: 'यह ऑर्डर नहीं मिला।',
    actionFailed: 'यह नहीं हो सका। ऑर्डर बदल गया होगा। पेज फिर खोलकर कोशिश करें।',
  },
  addr: {
    none: 'आपका कोई सहेजा हुआ पता नहीं है।', add: 'पता जोड़ें', save: 'पता सहेजें', remove: 'हटाएँ', saved: 'पता सहेज लिया।', removed: 'पता हटा दिया।',
    name: 'पूरा नाम', line1: 'पता, पंक्ति 1', line2: 'पता, पंक्ति 2', city: 'शहर', state: 'राज्य', pin: 'पिन कोड', phone: 'मोबाइल नंबर', defaultShipping: 'इसे मेरा डिलीवरी पता बनाएँ',
    invalid: 'पता जाँचकर फिर कोशिश करें।',
  },
  wish: { none: 'आपका कोई सहेजा हुआ उत्पाद नहीं है।', remove: 'हटाएँ', removed: 'आपकी सूची से हटा दिया।', view: 'उत्पाद देखें' },
  rev: { none: 'आपने कोई समीक्षा नहीं लिखी है।', awaiting: 'जाँच की प्रतीक्षा में', published: 'प्रकाशित', rejected: 'प्रकाशित नहीं हुई', verified: 'खरीद की पुष्टि हुई', rating: '5 में से {n} सितारे' },
  pref: {
    marketing: 'मुझे ऑफ़र और खबरें ईमेल से भेजें', saved: 'पसंद सहेज ली।',
    languageLabel: 'भाषा', languageEn: 'English', languageHi: 'हिन्दी', languageSaved: 'भाषा सहेज ली।',
  },
  del: {
    text: 'खाता हटाने पर आपकी निजी जानकारी हट जाती है। कानून के अनुसार ऑर्डर आपकी जानकारी के बिना रखे जाते हैं। इसे वापस नहीं किया जा सकता।',
    confirm: 'मेरा खाता हटाएँ', sure: 'खाता हमेशा के लिए हटाएँ?', done: 'आपका हटाने का अनुरोध मिल गया। आप साइन आउट हो गए हैं।',
    recent: 'सुरक्षा के लिए दोबारा साइन इन करें, फिर खाता हटाएँ।', failed: 'खाता नहीं हट सका। फिर कोशिश करें।',
  },
};
for (const [file, add] of [['en', en], ['hi', hi]]) {
  const p = `apps/storefront/src/i18n/${file}.json`;
  const j = JSON.parse(readFileSync(p, 'utf8'));
  j.account = add;
  writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
}
