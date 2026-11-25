// Adds the storefront-redesign task 13.4 strings to the Admin_App catalogs. Re-run safe: existing keys are overwritten with these values.
import { readFileSync, writeFileSync } from "node:fs";
const dir = new URL("../apps/admin/src/lib/i18n/", import.meta.url);
const en = {}, hi = {};
const add = (k, e, h) => { en[k] = e; hi[k] = h; };

add("nav.storefront", "Storefront", "स्टोरफ़्रंट");
add("catalog.tab.storefront", "Storefront", "स्टोरफ़्रंट");
add("sf.title", "Storefront", "स्टोरफ़्रंट");
add("sf.intro", "Set how the online store looks and what it shows. Changes reach shoppers at the next Site_Build.", "ऑनलाइन स्टोर कैसा दिखे और क्या दिखाए, यह तय करें। बदलाव अगले साइट बिल्ड पर खरीदारों तक पहुँचते हैं।");
for (const [k, e, h] of [["layout", "Layout", "लेआउट"], ["components", "Persuasion components", "प्रेरक घटक"], ["experiments", "Experiments", "प्रयोग"], ["builds", "Site builds", "साइट बिल्ड"], ["vitals", "Web vitals", "वेब वाइटल्स"], ["legal", "Legal content", "कानूनी सामग्री"]]) add(`sf.tab.${k}`, e, h);
add("sf.loadFailed", "The storefront data could not be loaded.", "स्टोरफ़्रंट का डेटा लोड नहीं हो सका।");
add("sf.close", "Close", "बंद करें");
add("sf.moveUp", "Move {name} up", "{name} को ऊपर ले जाएँ");
add("sf.moveDown", "Move {name} down", "{name} को नीचे ले जाएँ");
add("sf.remove", "Remove {name}", "{name} हटाएँ");
add("sf.hidden", "hidden", "छिपा हुआ");
add("sf.hide", "Hide", "छिपाएँ");

// Layout
add("sf.layout.unsaved", "You have unsaved changes.", "आपके बदलाव सहेजे नहीं गए हैं।");
add("sf.layout.appliesAtBuild", "Saved changes reach shoppers at the next Site_Build.", "सहेजे गए बदलाव अगले साइट बिल्ड पर खरीदारों तक पहुँचते हैं।");
add("sf.preview.title", "Preview with unsaved changes", "बिना सहेजे बदलावों के साथ पूर्वावलोकन");
add("sf.preview.hint", "Opens the storefront in a new tab with your current changes. The link works for 10 minutes.", "आपके मौजूदा बदलावों के साथ स्टोरफ़्रंट नए टैब में खुलता है। लिंक 10 मिनट चलता है।");
add("sf.preview.home", "Preview home page", "होम पेज का पूर्वावलोकन");
add("sf.preview.productId", "Product ID", "उत्पाद आईडी");
add("sf.preview.product", "Preview this product page", "इस उत्पाद पेज का पूर्वावलोकन");
add("sf.preview.failed", "The preview could not be opened. Check the product ID and try again.", "पूर्वावलोकन नहीं खुल सका। उत्पाद आईडी जाँचकर फिर कोशिश करें।");
add("sf.preset.title", "Business preset", "बिज़नेस प्रीसेट");
add("sf.preset.hint", "A preset sets the home page sections, product page blocks, filters and badges for your kind of business. You see what changes before anything is saved.", "प्रीसेट आपके व्यवसाय के अनुसार होम पेज सेक्शन, उत्पाद पेज ब्लॉक, फ़िल्टर और बैज तय करता है। कुछ सहेजने से पहले आप देखते हैं कि क्या बदलेगा।");
add("sf.preset.choose", "Preset", "प्रीसेट");
add("sf.preset.preview", "Preview changes", "बदलाव देखें");
add("sf.preset.willChange", "What applying {name} changes", "{name} लागू करने पर क्या बदलेगा");
add("sf.preset.noChange", "No change", "कोई बदलाव नहीं");
add("sf.preset.declarations", "Products need these declarations: {keys}.", "उत्पादों के लिए ये घोषणाएँ ज़रूरी हैं: {keys}।");
add("sf.preset.unsavedLost", "Your unsaved layout changes below are replaced when the preset is applied.", "प्रीसेट लागू होने पर नीचे के आपके बिना सहेजे लेआउट बदलाव बदल जाते हैं।");
add("sf.preset.apply", "Apply preset", "प्रीसेट लागू करें");
add("sf.preset.applied", "The preset is applied.", "प्रीसेट लागू हो गया।");
add("sf.preset.stale", "The layout or the preset changed after the preview. Preview it again before applying.", "पूर्वावलोकन के बाद लेआउट या प्रीसेट बदल गया। लागू करने से पहले फिर पूर्वावलोकन देखें।");
add("sf.list.sections", "Home page sections", "होम पेज सेक्शन");
add("sf.list.pdp_blocks", "Product page blocks", "उत्पाद पेज ब्लॉक");
add("sf.list.plp_filters", "Listing filters", "लिस्टिंग फ़िल्टर");
add("sf.list.badges", "Product badges", "उत्पाद बैज");
add("sf.list.empty", "Nothing listed.", "कुछ सूचीबद्ध नहीं है।");
add("sf.list.add", "Add", "जोड़ें");
add("sf.badges.hint", "When a product qualifies for more than one badge, the one higher in this list is shown.", "जब उत्पाद एक से अधिक बैज के योग्य हो, तो इस सूची में ऊपर वाला बैज दिखता है।");
add("sf.sections.empty", "No sections. The home page shows none.", "कोई सेक्शन नहीं। होम पेज पर कुछ नहीं दिखेगा।");
add("sf.sections.edit", "Edit settings", "सेटिंग बदलें");
add("sf.sections.settings", "Section settings (JSON)", "सेक्शन सेटिंग (JSON)");
add("sf.sections.settingsInvalid", "Enter a JSON object, for example {\"title\":{\"en\":\"Hello\"}}.", "JSON ऑब्जेक्ट लिखें, जैसे {\"title\":{\"en\":\"Hello\"}}।");
add("sf.sections.keep", "Keep settings", "सेटिंग रखें");
add("sf.sections.type", "Section type", "सेक्शन का प्रकार");
add("sf.sections.add", "Add", "जोड़ें");
const sections = { hero_banner: ["Hero banner", "हीरो बैनर"], category_grid: ["Category grid", "श्रेणी ग्रिड"], collection_grid: ["Collection grid", "संग्रह ग्रिड"], product_rail: ["Product rail", "उत्पाद पट्टी"], review_highlights: ["Review highlights", "समीक्षा झलकियाँ"], trust_strip: ["Trust strip", "भरोसा पट्टी"], brand_story: ["Brand story", "ब्रांड कहानी"], offer_banner: ["Offer banner", "ऑफ़र बैनर"], faq: ["FAQ", "अक्सर पूछे जाने वाले प्रश्न"], newsletter: ["Newsletter sign-up", "न्यूज़लेटर साइन-अप"] };
for (const [k, [e, h]] of Object.entries(sections)) add(`sf.section.${k}`, e, h);
const blocks = {
  description: ["Description", "विवरण"], specifications: ["Specifications", "विशिष्टताएँ"], key_specifications: ["Key specifications", "मुख्य विशिष्टताएँ"], size_guide: ["Size guide", "साइज़ गाइड"], fit_notes: ["Fit notes", "फ़िट नोट्स"],
  comparison: ["Comparison", "तुलना"], warranty: ["Warranty", "वारंटी"], net_quantity: ["Net quantity", "शुद्ध मात्रा"], unit_price: ["Unit price", "इकाई मूल्य"], best_before: ["Best before", "इससे पहले उपयोग करें"],
  ingredients: ["Ingredients", "सामग्री"], dimensions: ["Dimensions", "आयाम"], materials: ["Materials", "सामग्री (मटेरियल)"], assembly: ["Assembly", "असेंबली"], suitability: ["Suitability", "उपयुक्तता"],
  how_to_use: ["How to use", "उपयोग का तरीका"], quantity_tiers: ["Quantity tier prices", "मात्रा के अनुसार मूल्य"], minimum_order_quantity: ["Minimum order quantity", "न्यूनतम ऑर्डर मात्रा"],
  quotation_request: ["Quotation request", "कोटेशन अनुरोध"], metal: ["Metal", "धातु"], purity: ["Purity", "शुद्धता"], weight: ["Weight", "वज़न"], certification: ["Certification", "प्रमाणन"],
};
for (const [k, [e, h]] of Object.entries(blocks)) add(`sf.pdp_blocks.${k}`, e, h);
const filters = { categories: ["Categories", "श्रेणियाँ"], collections: ["Collections", "संग्रह"], types: ["Product types", "उत्पाद प्रकार"], tags: ["Tags", "टैग"], options: ["Options", "विकल्प"], price: ["Price", "मूल्य"] };
for (const [k, [e, h]] of Object.entries(filters)) add(`sf.plp_filters.${k}`, e, h);
const badges = { sale: ["Sale", "सेल"], new: ["New", "नया"], best_seller: ["Best seller", "बेस्ट सेलर"], low_stock: ["Low stock", "कम स्टॉक"], free_delivery: ["Free delivery", "मुफ़्त डिलीवरी"], made_in_india: ["Made in India", "भारत में निर्मित"] };
for (const [k, [e, h]] of Object.entries(badges)) add(`sf.badges.${k}`, e, h);

// Components
add("sf.components.hint", "Turn each persuasion component on or off. Each one uses only true store data. Open the rationale to see the principle, the evidence and the dark-pattern guard in English and Hindi.", "हर प्रेरक घटक को चालू या बंद करें। हर घटक केवल स्टोर का सही डेटा इस्तेमाल करता है। सिद्धांत, प्रमाण और डार्क पैटर्न से बचाव अंग्रेज़ी और हिंदी में देखने के लिए तर्क खोलें।");
add("sf.components.saved", "The switches are saved.", "स्विच सहेज लिए गए।");
add("sf.components.on", "On", "चालू");
add("sf.components.firstOrderHint", "Needs a promotion set in the store settings before it shows.", "दिखने के लिए स्टोर सेटिंग में एक प्रमोशन तय होना चाहिए।");
add("sf.components.rationale", "Rationale (English and Hindi)", "तर्क (अंग्रेज़ी और हिंदी)");
add("sf.components.noRationale", "No rationale is written for this component.", "इस घटक का कोई तर्क लिखा नहीं गया है।");
add("sf.rationale.principle", "Principle", "सिद्धांत");
add("sf.rationale.evidence", "Evidence", "प्रमाण");
add("sf.rationale.shownOnlyWhen", "Shown only when", "केवल तब दिखता है जब");
add("sf.rationale.expectedEffect", "Expected effect", "अपेक्षित प्रभाव");
add("sf.rationale.darkPatternGuard", "Dark-pattern guard", "डार्क पैटर्न से बचाव");
const comps = {
  review_summary: ["Review summary", "समीक्षा सारांश"], review_highlights: ["Review highlights", "समीक्षा झलकियाँ"], popularity_notice: ["Popularity notice", "लोकप्रियता सूचना"], low_stock_notice: ["Low-stock notice", "कम स्टॉक सूचना"],
  sale_countdown: ["Sale countdown", "सेल काउंटडाउन"], dispatch_countdown: ["Dispatch countdown", "डिस्पैच काउंटडाउन"], delivery_promise: ["Delivery promise", "डिलीवरी वादा"], free_delivery_progress: ["Free-delivery progress", "मुफ़्त डिलीवरी प्रगति"],
  savings_summary: ["Savings summary", "बचत सारांश"], trust_strip: ["Trust strip", "भरोसा पट्टी"], goes_well_with: ["Goes well with", "इसके साथ अच्छा लगता है"], bundle_offer: ["Bundle offer", "बंडल ऑफ़र"],
  recently_viewed: ["Recently viewed", "हाल में देखे गए"], back_in_stock_alert: ["Back-in-stock alert", "स्टॉक में वापसी अलर्ट"], first_order_offer: ["First-order offer", "पहले ऑर्डर का ऑफ़र"], checkout_progress: ["Checkout progress", "चेकआउट प्रगति"], sticky_buy_bar: ["Sticky buy bar", "चिपकी खरीद पट्टी"],
};
for (const [k, [e, h]] of Object.entries(comps)) add(`sf.component.${k}`, e, h);

// Experiments
add("sf.exp.hint", "{running} of {max} experiments are running. A component can have one running experiment.", "{max} में से {running} प्रयोग चल रहे हैं। एक घटक पर एक ही प्रयोग चल सकता है।");
add("sf.exp.started", "The experiment started.", "प्रयोग शुरू हो गया।");
add("sf.exp.empty", "No experiments yet.", "अभी कोई प्रयोग नहीं है।");
add("sf.exp.name", "Name", "नाम");
add("sf.exp.component", "Component", "घटक");
add("sf.exp.status", "Status", "स्थिति");
add("sf.exp.share", "Treatment share", "ट्रीटमेंट हिस्सा");
add("sf.exp.actions", "Actions", "कार्रवाइयाँ");
add("sf.exp.results", "Results", "नतीजे");
add("sf.exp.start", "Start", "शुरू करें");
add("sf.exp.stop", "Stop", "रोकें");
add("sf.exp.new", "New experiment", "नया प्रयोग");
add("sf.exp.edit", "Edit experiment", "प्रयोग बदलें");
add("sf.exp.variant", "Treatment variant", "ट्रीटमेंट रूप");
add("sf.exp.variantHint", "Other state shows the component in its opposite state. Alternative shows its alternative design.", "अन्य स्थिति में घटक अपनी उलटी स्थिति में दिखता है। विकल्प में उसका वैकल्पिक डिज़ाइन दिखता है।");
add("sf.exp.variant.other_state", "Other state (on or off)", "अन्य स्थिति (चालू या बंद)");
add("sf.exp.variant.alternative", "Alternative design", "वैकल्पिक डिज़ाइन");
add("sf.exp.shareLabel", "Share of sessions in the treatment, % ({min} to {max})", "ट्रीटमेंट में सत्रों का हिस्सा, % ({min} से {max})");
add("sf.exp.changeLabel", "Smallest relative change in conversion rate to detect, % ({min} to {max})", "कन्वर्ज़न दर में पता लगाने योग्य सबसे छोटा सापेक्ष बदलाव, % ({min} से {max})");
add("sf.exp.err.range", "Enter a whole number in the allowed range.", "अनुमत सीमा में पूर्ण संख्या लिखें।");
add("sf.exp.err.name", "Use 1 to 200 characters.", "1 से 200 अक्षर रखें।");
add("sf.exp.err.required", "Choose a value.", "एक मान चुनें।");
add("sf.exp.plan", "Show sample size", "नमूना आकार देखें");
add("sf.exp.planTitle", "Sessions needed (80% power, 5% significance)", "ज़रूरी सत्र (80% पावर, 5% सार्थकता)");
add("sf.exp.planControl", "Control sessions", "कंट्रोल सत्र");
add("sf.exp.planTreatment", "Treatment sessions", "ट्रीटमेंट सत्र");
add("sf.exp.planDuration", "Expected duration", "अपेक्षित अवधि");
add("sf.exp.days", "{n} days", "{n} दिन");
add("sf.exp.noTraffic", "Not estimated: the component's page area has no recent traffic.", "अनुमान नहीं: घटक वाले पेज क्षेत्र पर हाल में ट्रैफ़िक नहीं है।");
add("sf.exp.planBasis", "Based on the last 28 days: {sessions} sessions, {conversions} reached an order.", "पिछले 28 दिनों के आधार पर: {sessions} सत्र, {conversions} ऑर्डर तक पहुँचे।");
add("sf.exp.reason.no_sessions", "The last 28 days have no sessions, so the sample size cannot be computed.", "पिछले 28 दिनों में कोई सत्र नहीं है, इसलिए नमूना आकार नहीं निकल सकता।");
add("sf.exp.reason.no_conversions", "No session in the last 28 days reached an order, so the sample size cannot be computed.", "पिछले 28 दिनों में किसी सत्र ने ऑर्डर नहीं किया, इसलिए नमूना आकार नहीं निकल सकता।");
add("sf.exp.reason.target_rate_above_one", "The change to detect would need a conversion rate above 100%. Choose a smaller change.", "पता लगाने वाले बदलाव के लिए कन्वर्ज़न दर 100% से अधिक चाहिए। छोटा बदलाव चुनें।");
for (const [k, e, h] of [["draft", "Draft", "ड्राफ़्ट"], ["running", "Running", "चल रहा है"], ["stopped", "Stopped", "रोका गया"], ["concluded", "Concluded", "पूरा हुआ"]]) add(`sf.exp.status.${k}`, e, h);
add("sf.exp.stopTitle", "Stop {name}", "{name} रोकें");
add("sf.exp.stale", "The experiment changed. Close this and try again.", "प्रयोग बदल गया। इसे बंद करके फिर कोशिश करें।");
add("sf.exp.stopHint", "Stopping ends the assignments at the next Site_Build and keeps the results.", "रोकने पर अगले साइट बिल्ड से सत्रों का बँटवारा बंद हो जाता है और नतीजे सुरक्षित रहते हैं।");
add("sf.exp.stopChoose", "After the experiment, the component is", "प्रयोग के बाद घटक");
add("sf.exp.stopOn", "On", "चालू रहे");
add("sf.exp.stopOff", "Off", "बंद रहे");
add("sf.exp.resultsTitle", "Results of {name}", "{name} के नतीजे");
add("sf.exp.live", "Counted live.", "अभी की गिनती।");
add("sf.exp.stored", "Stored results from {at}.", "{at} के सहेजे नतीजे।");
add("sf.exp.verdict.collecting", "Collecting data. There is no winner yet.", "डेटा जुटाया जा रहा है। अभी कोई विजेता नहीं है।");
add("sf.exp.verdict.better", "The treatment is better.", "ट्रीटमेंट बेहतर है।");
add("sf.exp.verdict.worse", "The treatment is worse.", "ट्रीटमेंट बदतर है।");
add("sf.exp.verdict.not_clearly_different", "The treatment is not clearly different.", "ट्रीटमेंट साफ़ तौर पर अलग नहीं है।");
add("sf.exp.collecting", "Control {control} of {plannedControl} sessions, treatment {treatment} of {plannedTreatment} sessions.", "कंट्रोल {plannedControl} में से {control} सत्र, ट्रीटमेंट {plannedTreatment} में से {treatment} सत्र।");
add("sf.exp.planMissing", "This experiment has no sample-size plan, so no verdict is shown.", "इस प्रयोग की नमूना आकार योजना नहीं है, इसलिए कोई निष्कर्ष नहीं दिखता।");
add("sf.exp.variantCol", "Variant", "रूप");
add("sf.exp.exposed", "Sessions with an exposure", "एक्सपोज़र वाले सत्र");
add("sf.exp.conversions", "Conversions", "कन्वर्ज़न");
add("sf.exp.rate", "Conversion rate", "कन्वर्ज़न दर");
add("sf.exp.revenue", "Revenue per exposed session", "प्रति एक्सपोज़्ड सत्र आय");
add("sf.exp.control", "Control", "कंट्रोल");
add("sf.exp.treatment", "Treatment", "ट्रीटमेंट");
add("sf.exp.difference", "Difference in conversion rate: {diff} (95% interval {low} to {high}).", "कन्वर्ज़न दर में अंतर: {diff} (95% अंतराल {low} से {high})।");

// Builds
add("sf.builds.minutes", "Build minutes this month", "इस महीने के बिल्ड मिनट");
add("sf.builds.minutesUsed", "{used} of {allowance} minutes used ({percent}%).", "{allowance} में से {used} मिनट इस्तेमाल हुए ({percent}%)।");
add("sf.builds.interval", "Builds start at least {minutes} minutes apart.", "बिल्ड कम से कम {minutes} मिनट के अंतर पर शुरू होते हैं।");
add("sf.builds.lastChange", "last change {at}", "आख़िरी बदलाव {at}");
add("sf.builds.running", "A build is running.", "एक बिल्ड चल रहा है।");
add("sf.builds.start", "Start a build now", "अभी बिल्ड शुरू करें");
add("sf.builds.started", "The build started.", "बिल्ड शुरू हो गया।");
add("sf.builds.empty", "No builds yet.", "अभी कोई बिल्ड नहीं है।");
add("sf.builds.col.started", "Started", "शुरू हुआ");
add("sf.builds.col.reason", "Trigger", "कारण");
add("sf.builds.col.duration", "Duration", "अवधि");
add("sf.builds.col.pages", "Pages", "पेज");
add("sf.builds.col.warnings", "Warnings", "चेतावनियाँ");
for (const [k, e, h] of [["triggered", "Waiting", "प्रतीक्षा में"], ["running", "Running", "चल रहा है"], ["success", "Succeeded", "सफल"], ["failed", "Failed", "विफल"]]) add(`sf.builds.status.${k}`, e, h);
for (const [k, e, h] of [["change", "Change", "बदलाव"], ["manual", "Started by hand", "हाथ से शुरू"], ["external", "External", "बाहरी"]]) add(`sf.builds.trigger.${k}`, e, h);
add("sf.builds.reason.build_running", "A build is already running.", "एक बिल्ड पहले से चल रहा है।");
add("sf.builds.reason.allowance_reached", "This month's build minutes are used up.", "इस महीने के बिल्ड मिनट खत्म हो गए हैं।");
add("sf.builds.reason.rebuild_interval", "A build started a moment ago. Try again after the rebuild interval.", "अभी-अभी एक बिल्ड शुरू हुआ था। रीबिल्ड अंतराल के बाद फिर कोशिश करें।");
add("sf.builds.reason.missing_configuration", "The build hook is not set up yet.", "बिल्ड हुक अभी सेट नहीं है।");
add("sf.builds.reason.hook_failed", "The build service did not accept the request. Try again.", "बिल्ड सेवा ने अनुरोध स्वीकार नहीं किया। फिर कोशिश करें।");
add("sf.builds.reason.error", "The build could not be started.", "बिल्ड शुरू नहीं हो सका।");

// Vitals
add("sf.vitals.hint", "75th percentile of shopper measurements over the last {days} days. A value over the limit is marked.", "पिछले {days} दिनों के खरीदार मापों का 75वाँ प्रतिशतक। सीमा से ऊपर का मान चिह्नित होता है।");
add("sf.vitals.window", "Period", "अवधि");
add("sf.vitals.empty", "No measurements yet.", "अभी कोई माप नहीं है।");
add("sf.vitals.page", "Page type", "पेज प्रकार");
add("sf.vitals.metric", "Metric", "मापदंड");
add("sf.vitals.p75", "75th percentile", "75वाँ प्रतिशतक");
add("sf.vitals.samples", "Samples", "नमूने");
add("sf.vitals.over", "Over the limit", "सीमा से ऊपर");
add("sf.vitals.good", "Within the limit", "सीमा के भीतर");

// Legal
add("sf.legal.hint", "This content appears on the seller, policy, contact and certificate pages. Saved changes reach shoppers at the next Site_Build.", "यह सामग्री विक्रेता, नीति, संपर्क और प्रमाणपत्र पेजों पर दिखती है। सहेजे गए बदलाव अगले साइट बिल्ड पर खरीदारों तक पहुँचते हैं।");
add("sf.legal.seller", "Seller details", "विक्रेता विवरण");
add("sf.legal.sellerHint", "Legal name, address and customer care contact are required by law. Fill all of them.", "कानूनी नाम, पता और ग्राहक सेवा संपर्क कानूनन ज़रूरी हैं। सभी भरें।");
add("sf.legal.grievance", "Grievance officer", "शिकायत अधिकारी");
add("sf.legal.grievanceHint", "The person shoppers contact for complaints. Name, phone and email are required.", "शिकायत के लिए खरीदार जिनसे संपर्क करते हैं। नाम, फ़ोन और ईमेल ज़रूरी हैं।");
add("sf.legal.contact", "Contact page", "संपर्क पेज");
add("sf.legal.contactHint", "The phone number and email come from the seller details.", "फ़ोन नंबर और ईमेल विक्रेता विवरण से आते हैं।");
add("sf.legal.legalName", "Legal name", "कानूनी नाम");
add("sf.legal.address", "Registered address", "पंजीकृत पता");
add("sf.legal.gstin", "GSTIN", "जीएसटीआईएन");
add("sf.legal.phone", "Phone", "फ़ोन");
add("sf.legal.email", "Email", "ईमेल");
add("sf.legal.officerName", "Name", "नाम");
add("sf.legal.designation", "Designation", "पद");
add("sf.legal.whatsapp", "WhatsApp number (optional)", "व्हाट्सऐप नंबर (वैकल्पिक)");
add("sf.legal.hoursEn", "Support hours (English)", "सहायता समय (अंग्रेज़ी)");
add("sf.legal.hoursHi", "Support hours (Hindi)", "सहायता समय (हिंदी)");
add("sf.legal.policies", "Policies", "नीतियाँ");
add("sf.legal.policiesHint", "Write each policy in English and Hindi. A page with no Hindi text shows the English text.", "हर नीति अंग्रेज़ी और हिंदी में लिखें। जिस पेज में हिंदी पाठ नहीं है, उस पर अंग्रेज़ी पाठ दिखता है।");
add("sf.legal.privacyHindiMissing", "The Hindi privacy notice is missing. Shoppers who choose Hindi see the English notice.", "हिंदी गोपनीयता सूचना नहीं है। हिंदी चुनने वाले खरीदार अंग्रेज़ी सूचना देखते हैं।");
add("sf.legal.policy", "Policy", "नीति");
add("sf.legal.textEn", "English text", "अंग्रेज़ी पाठ");
add("sf.legal.textHi", "Hindi text", "हिंदी पाठ");
for (const [k, e, h] of [["returns", "Returns", "वापसी"], ["refunds", "Refunds", "रिफ़ंड"], ["exchanges", "Exchanges", "एक्सचेंज"], ["cancellations", "Cancellations", "रद्दीकरण"], ["shipping", "Shipping", "शिपिंग"], ["payments", "Payments", "भुगतान"], ["warranties", "Warranties", "वारंटी"], ["terms", "Terms of use", "उपयोग की शर्तें"], ["privacy", "Privacy notice", "गोपनीयता सूचना"]]) add(`sf.policy.${k}`, e, h);
add("sf.legal.certificate", "Compliance certificate", "अनुपालन प्रमाणपत्र");
add("sf.legal.certificateHint", "Once a year, check the storefront against the 13 dark patterns below and record the certificate. The storefront shows its date.", "साल में एक बार स्टोरफ़्रंट को नीचे के 13 डार्क पैटर्न के विरुद्ध जाँचें और प्रमाणपत्र दर्ज करें। स्टोरफ़्रंट उसकी तारीख दिखाता है।");
add("sf.legal.certDue", "The self-audit is due. The last certificate is dated {date}.", "स्व-ऑडिट का समय हो गया है। पिछला प्रमाणपत्र {date} का है।");
add("sf.legal.certMissing", "No compliance certificate is recorded yet.", "अभी कोई अनुपालन प्रमाणपत्र दर्ज नहीं है।");
add("sf.legal.certDate", "Certificate dated {date}.", "प्रमाणपत्र की तारीख {date}।");
add("sf.legal.certDateLabel", "Audit date", "ऑडिट की तारीख");
add("sf.legal.certText", "Certificate text", "प्रमाणपत्र का पाठ");
add("sf.legal.certImage", "Certificate image address (optional, https)", "प्रमाणपत्र की छवि का पता (वैकल्पिक, https)");
add("sf.legal.certSaved", "The certificate is recorded. The next self-audit is due by {date}.", "प्रमाणपत्र दर्ज हो गया। अगला स्व-ऑडिट {date} तक होना है।");
add("sf.legal.certRecord", "Record certificate", "प्रमाणपत्र दर्ज करें");
add("sf.audit.title", "Self-audit checklist: 13 dark patterns", "स्व-ऑडिट सूची: 13 डार्क पैटर्न");
add("sf.audit.hint", "Open each page and component named under a pattern and confirm that it does not use the pattern. Tick the pattern when it passes.", "हर पैटर्न के नीचे बताए पेज और घटक खोलकर पुष्टि करें कि वह उस पैटर्न का उपयोग नहीं करता। जाँच में खरा उतरने पर पैटर्न पर निशान लगाएँ।");
add("sf.audit.covers", "Covers: {items}", "शामिल: {items}");
add("sf.audit.progress", "{done} of {total} checks done.", "{total} में से {done} जाँच पूरी।");
add("sf.audit.needAll", "Tick all 13 checks to record the certificate.", "प्रमाणपत्र दर्ज करने के लिए सभी 13 जाँचों पर निशान लगाएँ।");
const dark = {
  false_urgency: ["False urgency", "झूठी जल्दबाज़ी"], basket_sneaking: ["Basket sneaking", "बास्केट में चुपके से जोड़ना"], confirm_shaming: ["Confirm shaming", "मना करने पर शर्मिंदा करना"], forced_action: ["Forced action", "जबरन कार्रवाई"],
  subscription_trap: ["Subscription trap", "सब्सक्रिप्शन जाल"], interface_interference: ["Interface interference", "इंटरफ़ेस में दखल"], bait_and_switch: ["Bait and switch", "लालच देकर बदलना"], drip_pricing: ["Drip pricing", "टुकड़ों में कीमत बताना"],
  disguised_advertisement: ["Disguised advertisement", "छिपा विज्ञापन"], nagging: ["Nagging", "बार-बार तंग करना"], trick_question: ["Trick question", "उलझाने वाला प्रश्न"], saas_billing: ["SaaS billing", "SaaS बिलिंग"], rogue_malware: ["Rogue malware", "दुष्ट मैलवेयर"],
};
for (const [k, [e, h]] of Object.entries(dark)) add(`sf.audit.${k}`, e, h);
const pages = { cart: ["cart page", "कार्ट पेज"], checkout: ["checkout", "चेकआउट"], account: ["account pages", "खाता पेज"], newsletter: ["newsletter sign-up", "न्यूज़लेटर साइन-अप"], cookie_banner: ["consent banner", "सहमति बैनर"], product_page: ["product pages", "उत्पाद पेज"], home: ["home page", "होम पेज"], product_rails: ["product rails", "उत्पाद पट्टियाँ"], search: ["search results", "खोज नतीजे"], payments: ["payment step", "भुगतान चरण"], all_pages: ["every page", "हर पेज"] };
for (const [k, [e, h]] of Object.entries(pages)) add(`sf.page.${k}`, e, h);

// Product editor
add("sf.product.highlights", "Key highlights", "मुख्य विशेषताएँ");
add("sf.product.highlightsHint", "Up to 5 short lines, one per line, at most 200 characters each. They show near the top of the product page.", "अधिकतम 5 छोटी पंक्तियाँ, हर पंक्ति में एक, प्रत्येक अधिकतम 200 अक्षर। ये उत्पाद पेज पर ऊपर दिखती हैं।");
add("sf.product.highlightsCount", "{n} of 5 highlights", "5 में से {n} विशेषताएँ");
add("sf.product.declarations", "Declarations per variant", "प्रति वेरिएंट घोषणाएँ");
add("sf.product.declarationsHint", "MRP, net quantity and dates the law asks packaged goods to show.", "एमआरपी, शुद्ध मात्रा और तारीखें जो पैक किए सामान पर कानूनन दिखानी होती हैं।");
add("sf.product.noVariants", "This product has no variants.", "इस उत्पाद का कोई वेरिएंट नहीं है।");
add("sf.product.mrp", "MRP", "एमआरपी");
add("sf.product.netQuantity", "Net quantity", "शुद्ध मात्रा");
add("sf.product.unit", "Unit", "इकाई");
add("sf.product.bestBefore", "Best before", "इससे पहले उपयोग करें");
add("sf.product.manufactureMonth", "Month of manufacture", "निर्माण का महीना");
add("sf.product.presetAttributes", "Attributes of the {preset} preset", "{preset} प्रीसेट की विशेषताएँ");
add("sf.product.attributes", "Attributes", "विशेषताएँ");
add("sf.product.noPreset", "No business preset is applied, so there are no preset attributes.", "कोई बिज़नेस प्रीसेट लागू नहीं है, इसलिए प्रीसेट विशेषताएँ नहीं हैं।");
add("sf.product.attributesHint", "Fields marked required are mandatory declarations: the product page shows them to shoppers.", "आवश्यक चिह्नित फ़ील्ड अनिवार्य घोषणाएँ हैं: उत्पाद पेज उन्हें खरीदारों को दिखाता है।");
add("sf.product.required", "required", "आवश्यक");
add("sf.product.declarationMissing", "This declaration is required and is empty.", "यह घोषणा आवश्यक है और खाली है।");
add("sf.pairing.goes_well_with", "Goes well with", "इसके साथ अच्छा लगता है");
add("sf.pairing.goes_well_with.hint", "Up to 12 products shown as pairings on the product page.", "उत्पाद पेज पर जोड़ी के रूप में दिखने वाले अधिकतम 12 उत्पाद।");
add("sf.pairing.compare", "Compare with", "तुलना करें");
add("sf.pairing.compare.hint", "Up to 12 products; the product page compares up to 3 of them.", "अधिकतम 12 उत्पाद; उत्पाद पेज उनमें से 3 तक की तुलना करता है।");
add("sf.pairing.search", "Find a product", "उत्पाद खोजें");
add("sf.pairing.noHits", "No product found.", "कोई उत्पाद नहीं मिला।");
add("sf.pairing.go", "Search", "खोजें");

// Countdown warning
add("sf.countdown.moveWarning", "Shoppers see a countdown to {end}. Changing the end stops that countdown, and it does not start again.", "खरीदार {end} तक का काउंटडाउन देख रहे हैं। समाप्ति बदलने पर वह काउंटडाउन रुक जाता है और दोबारा शुरू नहीं होता।");
add("sf.countdown.running", "Shoppers see a countdown to {end}. Changing the end stops it for good.", "खरीदार {end} तक का काउंटडाउन देख रहे हैं। समाप्ति बदलने पर वह हमेशा के लिए रुक जाता है।");

// Error codes the Backend returns for experiments
add("error.experiment_component_running", "This component already has a running experiment. A component can have only one running experiment.", "इस घटक पर पहले से एक प्रयोग चल रहा है। एक घटक पर केवल एक प्रयोग चल सकता है।");
add("error.experiment_limit_reached", "Three experiments are already running. At most 3 experiments can run at the same time.", "तीन प्रयोग पहले से चल रहे हैं। एक समय में अधिकतम 3 प्रयोग चल सकते हैं।");
add("error.experiment_not_startable", "Only a draft experiment can be started.", "केवल ड्राफ़्ट प्रयोग शुरू किया जा सकता है।");
add("error.experiment_not_running", "Only a running experiment can be stopped.", "केवल चल रहा प्रयोग रोका जा सकता है।");
add("error.experiment_not_editable", "Only a draft experiment can be edited.", "केवल ड्राफ़्ट प्रयोग बदला जा सकता है।");

for (const [file, add_] of [["en.json", en], ["hi.json", hi]]) {
  const url = new URL(file, dir);
  const cur = JSON.parse(readFileSync(url, "utf8"));
  Object.assign(cur, add_);
  writeFileSync(url, JSON.stringify(cur, null, 2) + "\n");
}
console.log(`added ${Object.keys(en).length} keys`);
