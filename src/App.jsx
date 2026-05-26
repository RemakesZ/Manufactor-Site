import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE INTEGRATION POINTS
// Search for "SUPABASE:" comments throughout to find every spot that needs
// a real API call once you connect your project.
//
// Setup: npm install @supabase/supabase-js
// Then: import { createClient } from '@supabase/supabase-js'
//       const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// DISCOUNT CODES
// Move this to a Supabase table called "discount_codes" in production.
// Each row: { code, type: 'percent'|'fixed', value, active: bool }
// ─────────────────────────────────────────────────────────────────────────────
const DISCOUNT_CODES = {
  // SUPABASE: replace this object with a fetch to your discount_codes table
  "FIRST10":  { type: "percent", value: 10, label: "10% off your first order" },
  "WELCOME5": { type: "fixed",   value: 5,  label: "€5 off" },
  "MAKER15":  { type: "percent", value: 15, label: "15% off — maker discount" },
  "BULK20":   { type: "percent", value: 20, label: "20% off — bulk order" },
};

// ─────────────────────────────────────────────────────────────────────────────
// MARKETPLACE ITEMS — managed by you (the owner)
// In production, store these in a Supabase table called "marketplace_items"
// Each row: { id, name, description, category, stl_url, preview_img_url, active }
// ─────────────────────────────────────────────────────────────────────────────
const MARKETPLACE_ITEMS = [
  // stlUrl: path relative to your site root — put files in /public/assets/STLs/
  // previewImg: path to a photo/render, e.g. "/assets/previews/flexicat.jpg"
  // SUPABASE (future): replace this array with a fetch to your marketplace_items table
  { id: "mk1", name: "Flexicat", category: "Art", description: "Articulated flexible cat. Prints in place, no supports. Classic.", stlUrl: "/assets/STLs/flexicat.stl", previewImg: null },
  { id: "mk2", name: "Cable Clip XL", category: "Utility", description: "Heavy-duty desk cable management clip. Fits up to 8mm cable bundles.", stlUrl: "/assets/STLs/cable-clip-xl.stl", previewImg: null },
  { id: "mk3", name: "Parametric Enclosure", category: "Electronics", description: "Clean electronics enclosure with snap-fit lid and M3 standoffs.", stlUrl: "/assets/STLs/parametric-enclosure.stl", previewImg: null },
  { id: "mk4", name: "Wall Hook", category: "Utility", description: "Low-profile load-bearing wall hook. 3 mounting hole variants included.", stlUrl: "/assets/STLs/wall-hook.stl", previewImg: null },
  { id: "mk5", name: "Miniature Vase", category: "Art", description: "Gyroid-infill decorative vase. Looks different every time.", stlUrl: "/assets/STLs/miniature-vase.stl", previewImg: null },
  { id: "mk6", name: "Lens Cap Holder", category: "Photography", description: "Mounts to camera strap. Never lose a lens cap again.", stlUrl: "/assets/STLs/lens-cap-holder.stl", previewImg: null },
];

const CATEGORIES = ["All", "Art", "Utility", "Electronics", "Photography"];

// ─────────────────────────────────────────────────────────────────────────────
// TRANSLATIONS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  en: {
    nav_home: "Home", nav_quote: "Get a Quote", nav_market: "Models", nav_account: "Account",
    nav_signin: "Sign In",
    hero_tag: "On-Demand 3D Printing Service · Athens, Greece",
    hero_headline: "On-demand 3D printed parts.",
    slogans: [
      "Manufacturing shouldn't require a factory.",
      "Hand-finished. Precisely yours.",
      "Precision without the price tag.",
      "Independent craft at an industrial level.",
      "Your design. Our obsession.",
    ],
    hero_sub: "Manufactor is a boutique fabrication studio. Precision FDM printing, professional post-processing, shipped ready to use. One part or one hundred — it gets the same attention.",
    cta_quote: "Get a Quote", cta_learn: "See What We Do",
    section_what: "What We Do",
    what_p: "We produce end-use parts, prototypes, and custom objects — then finish them to a standard most print services don't bother with.",
    card_print_title: "Precision FDM Printing", card_print_body: "PLA, PETG, ABS, ASA and more. Layer heights from 0.08 mm. Tight tolerances, reviewed before shipping.",
    card_finish_title: "Professional Finishing", card_finish_body: "Sanding, priming, painting, colour matching, vapor smoothing. Your part looking like it left a production line.",
    card_rapid_title: "Rapid Turnaround", card_rapid_body: "Solo operation means no queue bureaucracy. Direct communication, honest timelines.",
    finishing_intro: "Most print services hand you the part raw. We don't.",
    finishing_items: [
      { label: "Vapor Smoothing", desc: "ABS/ASA parts chemically smoothed for an injection-moulded finish. No visible layer lines." },
      { label: "Sanding & Priming", desc: "Manual surface prep for parts that need painting or strict aesthetics." },
      { label: "Custom Paint", desc: "Colour matching, base coats, protective topcoats. A product, not a prototype." },
    ],
    section_manifesto: "Built for the Independent Builder",
    manifesto_p: "Manufacturing has always been a tool of whoever owns the machines. We think that's worth challenging.\n\nManufactor exists because access to quality fabrication shouldn't depend on minimum order quantities, corporate accounts, or proximity to a production hub. One part or one hundred — it gets the same attention.\n\nThis is craft at a technical level. Precise, deliberate, and independent.",
    photos_label: "Recent Work",
    quote_title: "Request a Quote", quote_sub: "Upload your STL, choose your options, get an instant ballpark. Delivery and payment arranged by email after confirmation.",
    upload_label: "Upload STL File", upload_hint: "Drag & drop or click to browse", upload_loaded: "Model loaded",
    mat_label: "Material", layer_label: "Layer Height", infill_label: "Infill / Strength",
    color_label: "Filament Colour", color_disclaimer: "Reference only — we match as closely as stock allows. Exact colour not guaranteed.",
    post_label: "Post-Processing", post_none: "None — as printed", post_vapor: "Vapor Smoothing (ABS/ASA only)", post_sand: "Sanding & Smoothing", post_paint: "Full Paint Finish",
    qty_label: "Quantity", notes_label: "Notes for the maker", notes_placeholder: "Tolerances, intended use, deadlines, colour notes…",
    name_label: "Your Name", email_label: "Email Address",
    discount_label: "Discount Code", discount_placeholder: "Enter code…", discount_apply: "Apply", discount_invalid: "Code not recognised.", discount_applied: "Applied:",
    estimate_title: "Instant Estimate", estimate_note: "Ballpark only — final price confirmed after manual review. Payment and delivery by email.",
    btn_request: "Request Final Quote", btn_sending: "Sending…",
    sent_title: "Request received.", sent_body: "We'll review your model and reply within 24 hours with a confirmed price, delivery options, and payment details.",
    no_file: "Upload an STL to see your estimate.", volume_note: "Volume:",
    market_title: "Ready-to-Print Models", market_sub: "Browse our catalogue of tested models. Click any to open the quote form with the model pre-loaded — just pick your options and request a print.",
    market_order: "Order This Printed",
    account_title: "Your Account",
    signin_title: "Sign In", signup_title: "Create Account",
    auth_email: "Email", auth_password: "Password", auth_confirm: "Confirm Password",
    btn_signin: "Sign In", btn_signup: "Create Account", btn_signout: "Sign Out",
    switch_to_signup: "No account? Create one", switch_to_signin: "Already have an account? Sign in",
    auth_error_match: "Passwords don't match.",
    auth_error_short: "Password must be at least 6 characters.",
    your_files: "Your Uploaded Files",
    your_files_empty: "You haven't uploaded any files yet. Files you submit with quote requests appear here.",
    file_reorder: "Order Again",
    file_delete: "Delete",
    file_confirm_delete: "Delete this file from your history?",
    footer_copy: "© 2025 Manufactor · Athens, Greece",
    cookie_msg: "We use essential cookies only. No tracking, no advertising.",
    cookie_ok: "Got it",
    privacy_title: "Privacy Policy",
    privacy_items: [
      "We collect only what you give us: your name, email, and STL file when requesting a quote.",
      "Your STL files and quote details are stored securely and used only to prepare your quote.",
      "We do not sell, share, or rent your data to any third party.",
      "We do not use advertising trackers, analytics SDKs, or third-party marketing cookies.",
      "Email addresses are used only to respond to your quote request.",
      "You can request deletion of your data at any time by emailing us.",
      "Files are deleted after your order completes or after 90 days if no order follows.",
      "This site is hosted on Vercel (EU region) and data stored on Supabase (EU region).",
      "We comply with GDPR (EU Regulation 2016/679).",
      "Contact for data matters: privacy@manufactor.gr",
    ],
    terms_title: "Terms of Service",
    terms_items: [
      "Quotes are estimates. Final confirmed price agreed by email before any payment is taken.",
      "Payment is arranged after quote confirmation via payment link or bank transfer.",
      "We accept STL files only. You are responsible for the file being printable and legally yours.",
      "Lead times given at quote confirmation are best-effort estimates, not guarantees.",
      "We reserve the right to decline any order we consider unprintable, illegal, or inappropriate.",
      "Colour matching is best-effort. Exact filament colour is not guaranteed.",
      "Returns: defective prints due to our error are reprinted or refunded. Design dissatisfaction is not covered.",
      "Shipping risk transfers to the carrier on dispatch. We package carefully but are not liable for carrier damage.",
      "Discount codes cannot be combined and are subject to withdrawal at any time.",
      "These terms are governed by Greek law.",
    ],
  },
  gr: {
    nav_home: "Αρχική", nav_quote: "Αίτηση Προσφοράς", nav_market: "Μοντέλα", nav_account: "Λογαριασμός",
    nav_signin: "Σύνδεση",
    hero_tag: "Υπηρεσία 3D Εκτύπωσης κατ' Απαίτηση · Αθήνα",
    hero_headline: "Εξαρτήματα 3D εκτύπωσης κατ' απαίτηση.",
    slogans: ["Η κατασκευή δεν χρειάζεται εργοστάσιο.", "Χειροποίητο φινίρισμα. Ακριβώς δικό σου.", "Ακρίβεια χωρίς υπερβολικό κόστος.", "Ανεξάρτητη τέχνη σε βιομηχανικό επίπεδο.", "Το σχέδιό σου. Η εμμονή μας."],
    hero_sub: "Το Manufactor είναι studio κατασκευής υψηλής ποιότητας. FDM εκτύπωση ακριβείας, επαγγελματικό φινίρισμα, έτοιμο για χρήση.",
    cta_quote: "Αίτηση Προσφοράς", cta_learn: "Τι Κάνουμε",
    section_what: "Τι Κάνουμε", what_p: "Παράγουμε εξαρτήματα, πρωτότυπα και προσαρμοσμένα αντικείμενα — και τα φινίρουμε σε επίπεδο που οι περισσότερες υπηρεσίες δεν κοπιάζουν.",
    card_print_title: "Εκτύπωση FDM Ακριβείας", card_print_body: "PLA, PETG, ABS, ASA και άλλα. Ύψος στρώσης από 0.08 mm.",
    card_finish_title: "Επαγγελματικό Φινίρισμα", card_finish_body: "Λείανση, αστάρωμα, βαφή, vapor smoothing. Αποτέλεσμα γραμμής παραγωγής.",
    card_rapid_title: "Γρήγορη Παράδοση", card_rapid_body: "Μονοπρόσωπη λειτουργία, άμεση επικοινωνία. Ειλικρινείς χρόνοι παράδοσης.",
    finishing_intro: "Οι περισσότερες υπηρεσίες σου δίνουν το εξάρτημα ακατέργαστο. Εμείς όχι.",
    finishing_items: [
      { label: "Vapor Smoothing", desc: "Χημική εξομάλυνση ABS/ASA. Χωρίς ορατές στρώσεις." },
      { label: "Λείανση & Αστάρωμα", desc: "Χειροκίνητη προετοιμασία για βαφή ή αισθητικές απαιτήσεις." },
      { label: "Προσαρμοσμένη Βαφή", desc: "Αντιστοίχιση χρώματος, base coats, topcoats." },
    ],
    section_manifesto: "Φτιαγμένο για τον Ανεξάρτητο Κατασκευαστή",
    manifesto_p: "Η κατασκευή ήταν πάντα εργαλείο όσων κατέχουν τις μηχανές. Αξίζει να αμφισβητηθεί.\n\nΤο Manufactor υπάρχει γιατί η πρόσβαση σε ποιοτική κατασκευή δεν πρέπει να εξαρτάται από ελάχιστες ποσότητες ή εταιρικούς λογαριασμούς.\n\nΑυτή είναι τέχνη σε τεχνικό επίπεδο. Ακριβής, σκόπιμη και ανεξάρτητη.",
    photos_label: "Πρόσφατες Εργασίες",
    quote_title: "Αίτηση Προσφοράς", quote_sub: "Ανεβάστε το STL, επιλέξτε παραμέτρους, λάβετε εκτίμηση. Παράδοση και πληρωμή μέσω email.",
    upload_label: "Ανεβάστε STL", upload_hint: "Σύρετε & αφήστε ή κλικ", upload_loaded: "Μοντέλο φορτώθηκε",
    mat_label: "Υλικό", layer_label: "Ύψος Στρώσης", infill_label: "Πυκνότητα / Αντοχή",
    color_label: "Χρώμα Νήματος", color_disclaimer: "Ενδεικτικό μόνο — αντιστοίχιση κατά προσέγγιση.",
    post_label: "Μεταεπεξεργασία", post_none: "Καμία", post_vapor: "Vapor Smoothing (ABS/ASA)", post_sand: "Λείανση & Εξομάλυνση", post_paint: "Πλήρης Βαφή",
    qty_label: "Ποσότητα", notes_label: "Σημειώσεις", notes_placeholder: "Ανοχές, χρήση, προθεσμίες…",
    name_label: "Ονοματεπώνυμο", email_label: "Email",
    discount_label: "Κωδικός Έκπτωσης", discount_placeholder: "Εισάγετε κωδικό…", discount_apply: "Εφαρμογή", discount_invalid: "Ο κωδικός δεν αναγνωρίστηκε.", discount_applied: "Εφαρμόστηκε:",
    estimate_title: "Άμεση Εκτίμηση", estimate_note: "Ενδεικτική τιμή. Η τελική τιμή επιβεβαιώνεται μετά από επισκόπηση.",
    btn_request: "Αίτηση Τελικής Προσφοράς", btn_sending: "Αποστολή…",
    sent_title: "Η αίτηση ελήφθη.", sent_body: "Θα απαντήσουμε εντός 24 ωρών με επιβεβαιωμένη τιμή και στοιχεία πληρωμής.",
    no_file: "Ανεβάστε STL για εκτίμηση.", volume_note: "Όγκος:",
    market_title: "Έτοιμα Μοντέλα", market_sub: "Περιηγηθείτε στον κατάλογό μας. Κάντε κλικ για να ανοίξετε τη φόρμα προσφοράς με το μοντέλο προ-φορτωμένο.",
    market_order: "Παραγγείλτε Εκτύπωση",
    account_title: "Ο Λογαριασμός σας",
    signin_title: "Σύνδεση", signup_title: "Δημιουργία Λογαριασμού",
    auth_email: "Email", auth_password: "Κωδικός", auth_confirm: "Επιβεβαίωση Κωδικού",
    btn_signin: "Σύνδεση", btn_signup: "Δημιουργία Λογαριασμού", btn_signout: "Αποσύνδεση",
    switch_to_signup: "Χωρίς λογαριασμό; Δημιουργήστε έναν", switch_to_signin: "Έχετε λογαριασμό; Συνδεθείτε",
    auth_error_match: "Οι κωδικοί δεν ταιριάζουν.", auth_error_short: "Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.",
    your_files: "Τα Αρχεία σας",
    your_files_empty: "Δεν έχετε ανεβάσει αρχεία ακόμα. Τα αρχεία που υποβάλλετε με αιτήσεις εμφανίζονται εδώ.",
    file_reorder: "Παραγγελία Πάλι",
    file_delete: "Διαγραφή",
    file_confirm_delete: "Διαγραφή αυτού του αρχείου από το ιστορικό;",
    footer_copy: "© 2025 Manufactor · Αθήνα, Ελλάδα",
    cookie_msg: "Χρησιμοποιούμε μόνο απαραίτητα cookies. Χωρίς tracking ή διαφήμιση.",
    cookie_ok: "Εντάξει",
    privacy_title: "Πολιτική Απορρήτου",
    privacy_items: ["Συλλέγουμε μόνο ό,τι μας δίνετε: όνομα, email και STL αρχείο.", "Τα δεδομένα σας χρησιμοποιούνται μόνο για την προετοιμασία της προσφοράς.", "Δεν πουλάμε ή μοιραζόμαστε δεδομένα με τρίτους.", "Δεν χρησιμοποιούμε trackers διαφήμισης ή marketing cookies.", "Τα email χρησιμοποιούνται μόνο για απάντηση στην αίτησή σας.", "Μπορείτε να ζητήσετε διαγραφή δεδομένων οποτεδήποτε.", "Τα αρχεία διαγράφονται μετά την παραγγελία ή μετά 90 ημέρες.", "Hosting σε Vercel (EU) και Supabase (EU).", "Συμμορφωνόμαστε με τον GDPR (ΕΕ 2016/679).", "Επικοινωνία: privacy@manufactor.gr"],
    terms_title: "Όροι Χρήσης",
    terms_items: ["Οι προσφορές είναι εκτιμήσεις. Η τελική τιμή συμφωνείται μέσω email.", "Η πληρωμή διευθετείται μετά την επιβεβαίωση.", "Αποδεχόμαστε μόνο STL αρχεία. Είστε υπεύθυνοι για τα νομικά δικαιώματα.", "Χρόνοι παράδοσης είναι εκτιμήσεις.", "Διατηρούμε το δικαίωμα να αρνηθούμε οποιαδήποτε παραγγελία.", "Αντιστοίχιση χρώματος κατά προσέγγιση.", "Επιστροφές μόνο για ελαττώματα εκτύπωσης.", "Ο κίνδυνος αποστολής μεταφέρεται στον μεταφορέα.", "Οι κωδικοί έκπτωσης δεν συνδυάζονται.", "Οι παρόντες όροι διέπονται από το ελληνικό δίκαιο."],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PRICING
// ─────────────────────────────────────────────────────────────────────────────
const MATERIAL_RATES = { PLA: 0.28, PETG: 0.34, ABS: 0.38, ASA: 0.42, TPU: 0.52 };
const LAYER_MULT = { "0.08": 2.6, "0.10": 2.0, "0.12": 1.6, "0.16": 1.2, "0.20": 1.0, "0.24": 0.88, "0.28": 0.78 };
const INFILL_MULT = { light: 0.60, standard: 1.0, strong: 1.65, solid: 2.4, engineering: 3.6 };
const POST_ADD = { none: 0, vapor: 14, sand: 20, paint: 45 };
const MIN_ORDER = 8;
function volumeDiscount(v) { return v < 5 ? 1.0 : v < 20 ? 0.95 : v < 60 ? 0.88 : v < 150 ? 0.80 : 0.72; }

const COLORS = [
  { name: "Black", hex: "#1a1a1a" }, { name: "White", hex: "#f0ede8" },
  { name: "Dark Red", hex: "#8b1a1a" }, { name: "Silver", hex: "#a8a8a8" },
  { name: "Dark Grey", hex: "#444" }, { name: "Natural", hex: "#e8dbb0" },
  { name: "Navy", hex: "#1a2a4a" }, { name: "Forest Green", hex: "#2a4a2a" },
  { name: "Orange", hex: "#c85a18" }, { name: "Yellow", hex: "#d4aa20" },
  { name: "Blue", hex: "#1a3a7a" }, { name: "Purple", hex: "#4a1a6a" },
];

// ─────────────────────────────────────────────────────────────────────────────
// STL PARSER
// ─────────────────────────────────────────────────────────────────────────────
function parseSTLVolume(buffer) {
  try {
    const view = new DataView(buffer);
    const triCount = view.getUint32(80, true);
    if (buffer.byteLength === 84 + triCount * 50 && triCount > 0) {
      let vol = 0;
      for (let i = 0; i < triCount; i++) {
        const b = 84 + i * 50;
        const v1x = view.getFloat32(b+12,true), v1y = view.getFloat32(b+16,true), v1z = view.getFloat32(b+20,true);
        const v2x = view.getFloat32(b+24,true), v2y = view.getFloat32(b+28,true), v2z = view.getFloat32(b+32,true);
        const v3x = view.getFloat32(b+36,true), v3y = view.getFloat32(b+40,true), v3z = view.getFloat32(b+44,true);
        vol += v1x*(v2y*v3z-v3y*v2z) - v1y*(v2x*v3z-v3x*v2z) + v1z*(v2x*v3y-v3x*v2y);
      }
      return Math.abs(vol)/6;
    }
    const m = new TextDecoder().decode(buffer).match(/facet normal/g);
    return m ? m.length*800 : 8000;
  } catch { return 8000; }
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE CANVAS — speed dial: PARTICLE_SPEED
// ─────────────────────────────────────────────────────────────────────────────
const PARTICLE_SPEED = 0.22;

function ParticleCanvas({ style }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ particles: [], mouse: { x: -9999, y: -9999 }, raf: null });
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const state = stateRef.current;
    let W = 0, H = 0;
    function resize() {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * window.devicePixelRatio; canvas.height = H * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);
    state.particles = Array.from({ length: 75 }, () => ({
      x: Math.random()*(W||800), y: Math.random()*(H||600),
      bvx: (Math.random()-.5)*PARTICLE_SPEED, bvy: (Math.random()-.5)*PARTICLE_SPEED,
      vx:0, vy:0, r: Math.random()*1.5+0.5, gold: Math.random()>.72,
      wanderAngle: Math.random()*Math.PI*2, wanderSpeed: .004+Math.random()*.007,
    }));
    function onMove(e) { const r=canvas.getBoundingClientRect(); state.mouse.x=e.clientX-r.left; state.mouse.y=e.clientY-r.top; }
    window.addEventListener("mousemove", onMove);
    function draw() {
      ctx.clearRect(0,0,W,H);
      const ps=state.particles, mx=state.mouse.x, my=state.mouse.y;
      for (let i=0;i<ps.length;i++) {
        const p=ps[i];
        p.wanderAngle += p.wanderSpeed*(Math.random()-.485);
        p.bvx += Math.cos(p.wanderAngle)*.003; p.bvy += Math.sin(p.wanderAngle)*.003;
        const bs=Math.sqrt(p.bvx**2+p.bvy**2);
        if(bs>PARTICLE_SPEED*1.15){p.bvx*=(PARTICLE_SPEED*1.15)/bs;p.bvy*=(PARTICLE_SPEED*1.15)/bs;}
        const dx=p.x-mx,dy=p.y-my,d2=dx*dx+dy*dy,R=130;
        if(d2<R*R&&d2>.01){const d=Math.sqrt(d2),f=Math.pow((R-d)/R,2)*1.1;p.vx+=dx/d*f;p.vy+=dy/d*f;}
        p.vx=(p.vx+p.bvx)*.95; p.vy=(p.vy+p.bvy)*.95;
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<-10)p.x=W+10; if(p.x>W+10)p.x=-10;
        if(p.y<-10)p.y=H+10; if(p.y>H+10)p.y=-10;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.gold?"rgba(197,160,80,0.7)":"rgba(165,32,32,0.55)"; ctx.fill();
        for(let j=i+1;j<ps.length;j++){
          const q=ps[j],ex=p.x-q.x,ey=p.y-q.y,ed2=ex*ex+ey*ey;
          if(ed2<120*120){const ed=Math.sqrt(ed2),a=(1-ed/120)*.18;
            ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
            ctx.strokeStyle=(p.gold||q.gold)?`rgba(197,160,80,${a})`:`rgba(155,32,32,${a})`;ctx.lineWidth=.5;ctx.stroke();}
        }
      }
      state.raf=requestAnimationFrame(draw);
    }
    draw();
    return ()=>{cancelAnimationFrame(state.raf);ro.disconnect();window.removeEventListener("mousemove",onMove);};
  }, []);
  return <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",...style}}/>;
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPEWRITER
// ─────────────────────────────────────────────────────────────────────────────
function Typewriter({ slogans }) {
  const [display, setDisplay] = useState(""); const [idx, setIdx] = useState(0); const [phase, setPhase] = useState("typing");
  useEffect(() => {
    const slogan = slogans[idx%slogans.length]; let t;
    if(phase==="typing"){t=display.length<slogan.length?setTimeout(()=>setDisplay(slogan.slice(0,display.length+1)),52):setTimeout(()=>setPhase("pause"),2400);}
    else if(phase==="pause"){t=setTimeout(()=>setPhase("erasing"),200);}
    else{t=display.length>0?setTimeout(()=>setDisplay(d=>d.slice(0,-1)),26):(()=>{setIdx(i=>i+1);setPhase("typing");})();}
    return()=>clearTimeout(t);
  },[display,phase,idx,slogans]);
  return <span style={{fontFamily:"var(--font-mono)",fontSize:"clamp(.78rem,1.25vw,.93rem)",letterSpacing:".05em",color:"var(--gold)"}}>{display}<span style={{animation:"blink 1s step-end infinite"}}>_</span></span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// STL VIEWER
// ─────────────────────────────────────────────────────────────────────────────
function STLViewer({ buffer, colorHex }) {
  const mountRef = useRef(null); const glRef = useRef(null);

  // When colorHex changes without remounting, just update the material color
  useEffect(() => {
    if (!glRef.current?.mat || !colorHex) return;
    const THREE = window.THREE; if (!THREE) return;
    glRef.current.mat.color.set(colorHex);
  }, [colorHex]);

  useEffect(() => {
    if (!window.THREE || !buffer) return;
    const THREE = window.THREE; const el = mountRef.current; if (!el) return;
    if (glRef.current) { glRef.current.renderer.dispose(); el.innerHTML=""; }
    const W=el.offsetWidth, H=el.offsetHeight||280;
    const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    el.appendChild(renderer.domElement);
    const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(45,W/H,.1,10000);
    const geom=new THREE.BufferGeometry(), view=new DataView(buffer), triCount=view.getUint32(80,true);
    if(triCount>0&&buffer.byteLength===84+triCount*50){
      const pos=new Float32Array(triCount*9);
      for(let i=0;i<triCount;i++){const b=84+i*50;for(let v=0;v<3;v++){const vb=b+12+v*12;pos[i*9+v*3]=view.getFloat32(vb,true);pos[i*9+v*3+1]=view.getFloat32(vb+4,true);pos[i*9+v*3+2]=view.getFloat32(vb+8,true);}}
      geom.setAttribute("position",new THREE.BufferAttribute(pos,3));
    }
    geom.computeVertexNormals(); geom.center();
    const mat=new THREE.MeshStandardMaterial({color: colorHex || 0x8b1a1a, roughness:.52,metalness:.38});
    const mesh=new THREE.Mesh(geom,mat); scene.add(mesh);
    const box=new THREE.Box3().setFromObject(mesh), size=box.getSize(new THREE.Vector3());
    if(size.x>size.y&&size.x>size.z)mesh.rotation.z=Math.PI/2;
    else if(size.z>size.y)mesh.rotation.x=Math.PI/2;
    const maxDim=Math.max(size.x,size.y,size.z), fitDist=(maxDim/2)/Math.tan(22.5*Math.PI/180)*1.4;
    scene.add(new THREE.AmbientLight(0xffffff,.5));
    const d1=new THREE.DirectionalLight(0xffc880,1.3);d1.position.set(1,2,1.5);scene.add(d1);
    const d2=new THREE.DirectionalLight(0x8b2020,.5);d2.position.set(-1,-.5,-1);scene.add(d2);
    let theta=0,phi=.18,spinDTheta=.007,spinDPhi=0,autoSpin=true,isDragging=false,lastX=0,lastY=0,velTheta=0,velPhi=0;
    function camPos(){const r=fitDist;camera.position.set(r*Math.cos(phi)*Math.sin(theta),r*Math.sin(phi),r*Math.cos(phi)*Math.cos(theta));camera.lookAt(0,0,0);}
    camPos();
    const dom=renderer.domElement; dom.style.cursor="grab";
    function onDown(e){isDragging=true;autoSpin=false;lastX=e.clientX;lastY=e.clientY;velTheta=0;velPhi=0;dom.style.cursor="grabbing";dom.setPointerCapture(e.pointerId);}
    function onMove(e){if(!isDragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY,s=.007;velTheta=-dx*s;velPhi=-dy*s;theta+=velTheta;phi=Math.max(-1.3,Math.min(1.3,phi+velPhi));lastX=e.clientX;lastY=e.clientY;}
    function onUp(){isDragging=false;dom.style.cursor="grab";spinDTheta=Math.max(-.018,Math.min(.018,velTheta*.7));spinDPhi=Math.max(-.004,Math.min(.004,velPhi*.3));if(Math.abs(spinDTheta)<.002)spinDTheta=.007;setTimeout(()=>{autoSpin=true;},1200);}
    dom.addEventListener("pointerdown",onDown);dom.addEventListener("pointermove",onMove);dom.addEventListener("pointerup",onUp);dom.addEventListener("pointercancel",onUp);
    let raf;
    function animate(){raf=requestAnimationFrame(animate);if(autoSpin){theta+=spinDTheta;phi=Math.max(-1.3,Math.min(1.3,phi+spinDPhi));spinDPhi*=.99;}else if(!isDragging){velTheta*=.91;velPhi*=.91;theta+=velTheta;phi=Math.max(-1.3,Math.min(1.3,phi+velPhi));}camPos();renderer.render(scene,camera);}
    animate(); glRef.current={renderer, mat};
    return()=>{cancelAnimationFrame(raf);dom.removeEventListener("pointerdown",onDown);dom.removeEventListener("pointermove",onMove);dom.removeEventListener("pointerup",onUp);renderer.dispose();};
  },[buffer]); // colorHex changes handled by separate effect above
  return (
    <div ref={mountRef} style={{width:"100%",height:"280px",overflow:"hidden",background:"rgba(10,3,3,0.75)",border:"1px solid rgba(197,160,80,0.14)",borderRadius:"1px"}}>
      {!buffer&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontFamily:"var(--font-mono)",fontSize:".64rem",color:"rgba(232,221,216,0.18)",letterSpacing:".12em"}}>3D PREVIEW</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOUR PICKER — color wheel + hex input + quick swatches
// value: { hex: "#rrggbb", name: string }
// onChange: called with same shape
// ─────────────────────────────────────────────────────────────────────────────
const QUICK_SWATCHES = [
  "#1a1a1a","#f0ede8","#8b1a1a","#a8a8a8","#444444","#e8dbb0",
  "#1a2a4a","#2a4a2a","#c85a18","#d4aa20","#1a3a7a","#4a1a6a",
  "#c0272d","#8b4513","#4a90d9","#7cba6a","#e8c84a","#c87890",
];
function hexToName(hex) {
  // Try to find a close named match, otherwise use the hex itself
  const named = {
    "#1a1a1a":"Black","#f0ede8":"White","#8b1a1a":"Dark Red","#a8a8a8":"Silver",
    "#444444":"Dark Grey","#e8dbb0":"Natural","#1a2a4a":"Navy","#2a4a2a":"Forest Green",
    "#c85a18":"Orange","#d4aa20":"Yellow","#1a3a7a":"Blue","#4a1a6a":"Purple",
    "#c0272d":"Red","#8b4513":"Brown","#4a90d9":"Sky Blue","#7cba6a":"Green",
    "#e8c84a":"Gold","#c87890":"Pink",
  };
  return named[hex.toLowerCase()] || hex.toUpperCase();
}

function ColourPicker({ value, onChange, label, disclaimer }) {
  const gl="1px solid rgba(197,160,80,0.28)";
  const [hexInput, setHexInput] = useState(value?.hex || "#8b1a1a");

  function commitHex(raw) {
    // Accept with or without # , 3 or 6 digit
    let h = raw.trim();
    if (!h.startsWith("#")) h = "#" + h;
    if (/^#[0-9a-fA-F]{3}$/.test(h)) h = "#" + h[1]+h[1]+h[2]+h[2]+h[3]+h[3];
    if (/^#[0-9a-fA-F]{6}$/.test(h)) {
      setHexInput(h);
      onChange({ hex: h.toLowerCase(), name: hexToName(h.toLowerCase()) });
    }
  }

  return (
    <div className="form-group">
      <label>{label}</label>
      {/* Color wheel + hex input row */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
        {/* Native color input styled to look like a swatch */}
        <div style={{position:"relative",width:44,height:44,flexShrink:0}}>
          <div style={{width:44,height:44,background:value?.hex||"#8b1a1a",border:gl,cursor:"pointer"}}/>
          <input type="color" value={value?.hex||"#8b1a1a"}
            onChange={e=>{setHexInput(e.target.value);onChange({hex:e.target.value,name:hexToName(e.target.value)});}}
            style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
        </div>
        {/* Hex text input */}
        <input className="fi" value={hexInput}
          onChange={e=>setHexInput(e.target.value)}
          onBlur={e=>commitHex(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&commitHex(hexInput)}
          placeholder="#8b1a1a"
          style={{fontFamily:"var(--font-mono)",fontSize:".78rem",letterSpacing:".08em",flex:1}}/>
        {/* Live preview label */}
        <span style={{fontFamily:"var(--font-mono)",fontSize:".65rem",color:"var(--text-dim)",letterSpacing:".06em",whiteSpace:"nowrap"}}>
          {value?.name||""}
        </span>
      </div>
      {/* Quick swatches */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(9,1fr)",gap:5,marginBottom:9}}>
        {QUICK_SWATCHES.map(hex=>(
          <button key={hex} title={hexToName(hex)} onClick={()=>{setHexInput(hex);onChange({hex,name:hexToName(hex)});}}
            style={{width:"100%",aspectRatio:"1",border:value?.hex===hex?"2px solid var(--gold)":"1px solid rgba(197,160,80,0.2)",
              background:hex,cursor:"pointer",borderRadius:1,transition:"border-color .15s"}}/>
        ))}
      </div>
      <p style={{fontFamily:"var(--font-mono)",fontSize:".62rem",color:"var(--text-dimmer)",letterSpacing:".05em",lineHeight:1.65,fontStyle:"italic"}}>{disclaimer}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO CAROUSEL
// ─────────────────────────────────────────────────────────────────────────────
// Replace src: null with your image paths e.g. src: "/photos/flexicat.jpg"
const PHOTOS = [
  { src: null, label: "Flexicat · PLA · Vapor Smoothed" },
  { src: null, label: "Enclosure Panel · PETG · Standard" },
  { src: null, label: "Mechanical Bracket · ABS · Painted" },
  { src: null, label: "Display Model · PLA · Primed" },
  { src: null, label: "Custom Housing · ASA · Raw" },
];
function Carousel({ lang }) {
  const [active, setActive] = useState(0);
  const t = T[lang];
  const prev=()=>setActive(a=>(a-1+PHOTOS.length)%PHOTOS.length);
  const next=()=>setActive(a=>(a+1)%PHOTOS.length);
  useEffect(()=>{const id=setInterval(next,4000);return()=>clearInterval(id);},[]);
  const gl="1px solid rgba(197,160,80,0.28)";
  return (
    <section style={{padding:"0",background:"var(--bg2)",borderTop:gl,borderBottom:gl,position:"relative",overflow:"hidden"}}>
      <ParticleCanvas style={{opacity:.16}}/>
      <div style={{maxWidth:1140,margin:"0 auto",padding:"clamp(40px,6vw,80px) clamp(20px,5vw,72px)",position:"relative",zIndex:1}}>
        <div style={{fontFamily:"var(--font-mono)",fontSize:".67rem",letterSpacing:".18em",color:"var(--gold)",textTransform:"uppercase",marginBottom:26,display:"flex",alignItems:"center",gap:14}}>
          04 <span style={{width:36,height:1,background:"rgba(197,160,80,.32)",display:"inline-block"}}/>{t.photos_label}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:28,alignItems:"center"}}>
          <div style={{border:gl,aspectRatio:"4/3",background:"rgba(12,4,4,.8)",position:"relative",overflow:"hidden"}}>
            {PHOTOS[active].src?<img src={PHOTOS[active].src} alt={PHOTOS[active].label} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:
              <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" opacity=".1"><rect x="3" y="7" width="30" height="24" rx="2" stroke="var(--text)" strokeWidth="1.3"/><circle cx="12" cy="17" r="4" stroke="var(--text)" strokeWidth="1.1"/><path d="M3 27l8-7 7 7 5-5 10 8" stroke="var(--text)" strokeWidth="1.1" strokeLinejoin="round"/></svg>
                <span style={{fontFamily:"var(--font-mono)",fontSize:".6rem",color:"rgba(237,228,223,.16)",letterSpacing:".1em",textTransform:"uppercase"}}>Drop photo here</span>
              </div>}
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"10px 14px",background:"linear-gradient(transparent,rgba(10,3,3,.85))",fontFamily:"var(--font-cond)",fontSize:".8rem",letterSpacing:".06em",color:"var(--text-dim)"}}>{PHOTOS[active].label}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {PHOTOS.map((p,i)=>(
              <div key={i} onClick={()=>setActive(i)} style={{border:i===active?"1px solid rgba(197,160,80,.62)":gl,padding:"9px 13px",cursor:"pointer",background:i===active?"rgba(197,160,80,.06)":"transparent",display:"flex",alignItems:"center",gap:11,transition:"all .18s"}}>
                <div style={{width:32,height:32,background:"rgba(139,26,26,.15)",border:"1px solid rgba(139,26,26,.2)",flexShrink:0,backgroundImage:p.src?`url(${p.src})`:"none",backgroundSize:"cover"}}/>
                <span style={{fontFamily:"var(--font-mono)",fontSize:".58rem",letterSpacing:".07em",color:i===active?"var(--text)":"var(--text-dimmer)",lineHeight:1.5}}>{p.label}</span>
              </div>
            ))}
            <div style={{display:"flex",gap:7,marginTop:6}}>
              {[["← PREV",prev],["NEXT →",next]].map(([label,fn])=>(
                <button key={label} onClick={fn} style={{flex:1,padding:"7px",background:"none",border:gl,color:"var(--text-dim)",cursor:"pointer",fontFamily:"var(--font-cond)",fontSize:".78rem",letterSpacing:".1em",transition:"color .18s"}}
                  onMouseEnter={e=>e.target.style.color="var(--text)"} onMouseLeave={e=>e.target.style.color="var(--text-dim)"}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COOKIE BANNER
// ─────────────────────────────────────────────────────────────────────────────
function CookieBanner({ lang }) {
  const [visible, setVisible] = useState(false);
  const t = T[lang];
  useEffect(()=>{try{if(!localStorage.getItem("cookie_ok"))setVisible(true);}catch{setVisible(true);}},[] );
  function accept(){try{localStorage.setItem("cookie_ok","1");}catch{}setVisible(false);}
  if(!visible)return null;
  return (
    <div style={{position:"fixed",bottom:20,left:20,zIndex:999,background:"rgba(18,6,6,0.97)",border:"1px solid rgba(197,160,80,0.28)",padding:"14px 18px",display:"flex",alignItems:"center",gap:18,backdropFilter:"blur(12px)",maxWidth:520}}>
      <span style={{fontFamily:"var(--font-mono)",fontSize:".64rem",letterSpacing:".07em",color:"var(--text-dim)",lineHeight:1.6}}>{t.cookie_msg}</span>
      <button onClick={accept} style={{background:"none",border:"1px solid rgba(197,160,80,.35)",color:"var(--gold)",fontFamily:"var(--font-mono)",fontSize:".64rem",letterSpacing:".1em",padding:"5px 12px",cursor:"pointer",whiteSpace:"nowrap"}}>{t.cookie_ok}</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGAL MODAL
// ─────────────────────────────────────────────────────────────────────────────
function LegalModal({ type, lang, onClose }) {
  const t=T[lang], title=type==="privacy"?t.privacy_title:t.terms_title, items=type==="privacy"?t.privacy_items:t.terms_items;
  return (
    <div style={{position:"fixed",inset:0,zIndex:900,background:"rgba(8,2,2,0.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"var(--bg3)",border:"1px solid rgba(197,160,80,0.28)",maxWidth:620,width:"100%",maxHeight:"80vh",overflowY:"auto",padding:"36px 32px"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,borderBottom:"1px solid rgba(197,160,80,0.2)",paddingBottom:18}}>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.7rem",letterSpacing:".05em",color:"var(--text)"}}>{title}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",color:"var(--text-dimmer)",cursor:"pointer",fontSize:"1.3rem",lineHeight:1}}>×</button>
        </div>
        <ol style={{listStyle:"none",display:"flex",flexDirection:"column",gap:14}}>
          {items.map((item,i)=>(
            <li key={i} style={{display:"flex",gap:14,fontSize:".86rem",lineHeight:1.78,color:"var(--text-dim)",fontWeight:300}}>
              <span style={{fontFamily:"var(--font-mono)",fontSize:".63rem",color:"var(--gold)",minWidth:20,paddingTop:3}}>{String(i+1).padStart(2,"0")}</span>{item}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AuthModal({ lang, onClose, onAuth }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authConfirm, setAuthConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const t = T[lang];
  const gl = "1px solid rgba(197,160,80,0.28)";

  async function handleSubmit() {
    setError("");
    if (mode === "signup") {
      if (authPass.length < 6) { setError(t.auth_error_short); return; }
      if (authPass !== authConfirm) { setError(t.auth_error_match); return; }
    }
    setLoading(true);
    // SUPABASE: replace this block with real auth calls:
    // Sign up:  const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPass })
    // Sign in:  const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass })
    // On success, supabase returns a session — call onAuth({ email: authEmail, id: data.user.id })
    await new Promise(r => setTimeout(r, 900));
    // Simulated success — in prod this only runs if no error
    onAuth({ email: authEmail, id: "demo-user-id" });
    setLoading(false);
    onClose();
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:910,background:"rgba(8,2,2,0.9)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"var(--bg3)",border:gl,maxWidth:420,width:"100%",padding:"36px 32px"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:26,borderBottom:gl,paddingBottom:16}}>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.6rem",letterSpacing:".05em",color:"var(--text)"}}>{mode==="signin"?t.signin_title:t.signup_title}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",color:"var(--text-dimmer)",cursor:"pointer",fontSize:"1.3rem"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label style={{display:"block",fontFamily:"var(--font-mono)",fontSize:".65rem",letterSpacing:".14em",textTransform:"uppercase",color:"var(--gold)",marginBottom:7}}>{t.auth_email}</label>
            <input className="fi" type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} style={{width:"100%"}}/>
          </div>
          <div>
            <label style={{display:"block",fontFamily:"var(--font-mono)",fontSize:".65rem",letterSpacing:".14em",textTransform:"uppercase",color:"var(--gold)",marginBottom:7}}>{t.auth_password}</label>
            <input className="fi" type="password" value={authPass} onChange={e=>setAuthPass(e.target.value)} style={{width:"100%"}}/>
          </div>
          {mode==="signup"&&(
            <div>
              <label style={{display:"block",fontFamily:"var(--font-mono)",fontSize:".65rem",letterSpacing:".14em",textTransform:"uppercase",color:"var(--gold)",marginBottom:7}}>{t.auth_confirm}</label>
              <input className="fi" type="password" value={authConfirm} onChange={e=>setAuthConfirm(e.target.value)} style={{width:"100%"}}/>
            </div>
          )}
          {error&&<p style={{fontFamily:"var(--font-mono)",fontSize:".7rem",color:"var(--red-bright)",letterSpacing:".06em"}}>{error}</p>}
          <button className="btn-p" style={{width:"100%",justifyContent:"center",marginTop:4,opacity:loading?.6:1}} onClick={handleSubmit} disabled={loading}>
            {loading?"…":mode==="signin"?t.btn_signin:t.btn_signup}
          </button>
          <button style={{background:"none",border:"none",color:"var(--text-dimmer)",fontFamily:"var(--font-mono)",fontSize:".65rem",letterSpacing:".07em",cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3,marginTop:4}}
            onClick={()=>{setMode(m=>m==="signin"?"signup":"signin");setError("");}}>
            {mode==="signin"?t.switch_to_signup:t.switch_to_signin}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKETPLACE PAGE
// ─────────────────────────────────────────────────────────────────────────────
function MarketplacePage({ lang, onOrderItem }) {
  const [cat, setCat] = useState("All");
  const t = T[lang];
  const gl = "1px solid rgba(197,160,80,0.28)";
  const filtered = cat === "All" ? MARKETPLACE_ITEMS : MARKETPLACE_ITEMS.filter(i => i.category === cat);

  return (
    <div style={{paddingTop:58,minHeight:"100vh",background:"var(--bg)",position:"relative",overflow:"hidden"}}>
      <ParticleCanvas style={{opacity:.38}}/>
      <div style={{maxWidth:1140,margin:"0 auto",padding:"52px clamp(20px,5vw,72px)",position:"relative",zIndex:1}}>
        <div style={{fontFamily:"var(--font-mono)",fontSize:".67rem",letterSpacing:".18em",color:"var(--gold)",textTransform:"uppercase",marginBottom:13,display:"flex",alignItems:"center",gap:13}}>
          Models <span style={{width:36,height:1,background:"rgba(197,160,80,.32)",display:"inline-block"}}/>
        </div>
        <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(2rem,4vw,3.2rem)",letterSpacing:".04em",color:"var(--text)",marginBottom:12}}>{t.market_title}</h1>
        <p style={{fontSize:".88rem",lineHeight:1.78,color:"var(--text-dim)",fontWeight:300,maxWidth:560,marginBottom:36}}>{t.market_sub}</p>

        {/* Category filter */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:36}}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{fontFamily:"var(--font-cond)",fontSize:".8rem",letterSpacing:".1em",textTransform:"uppercase",padding:"6px 16px",background:cat===c?"var(--red)":"none",color:cat===c?"var(--text)":"var(--text-dim)",border:cat===c?"1px solid var(--red)":gl,cursor:"pointer",transition:"all .2s"}}>
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:1,border:gl}}>
          {filtered.map(item=>(
            <div key={item.id} style={{background:"var(--bg2)",border:gl,padding:"0",display:"flex",flexDirection:"column",transition:"background .22s",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(139,26,26,0.1)"}
              onMouseLeave={e=>e.currentTarget.style.background="var(--bg2)"}>
              {/* Preview image */}
              <div style={{aspectRatio:"4/3",background:"rgba(12,4,4,.6)",borderBottom:gl,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                {item.previewImg
                  ? <img src={item.previewImg} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <svg width="36" height="36" viewBox="0 0 36 36" fill="none" opacity=".1"><rect x="3" y="7" width="30" height="24" rx="2" stroke="var(--text)" strokeWidth="1.3"/><circle cx="12" cy="17" r="4" stroke="var(--text)" strokeWidth="1.1"/><path d="M3 27l8-7 7 7 5-5 10 8" stroke="var(--text)" strokeWidth="1.1" strokeLinejoin="round"/></svg>}
                <div style={{position:"absolute",top:10,right:10,fontFamily:"var(--font-mono)",fontSize:".58rem",letterSpacing:".1em",color:"var(--gold)",background:"rgba(12,4,4,.75)",padding:"3px 8px",border:gl}}>
                  {item.category}
                </div>
              </div>
              {/* Info */}
              <div style={{padding:"22px 22px 18px",flex:1,display:"flex",flexDirection:"column",gap:10}}>
                <div style={{fontFamily:"var(--font-cond)",fontSize:"1.05rem",letterSpacing:".07em",color:"var(--text)",textTransform:"uppercase"}}>{item.name}</div>
                <div style={{fontSize:".83rem",lineHeight:1.7,color:"var(--text-dim)",fontWeight:300,flex:1}}>{item.description}</div>
                <button className="btn-p" style={{alignSelf:"flex-start",padding:"9px 20px",fontSize:".8rem",marginTop:4}}
                  onClick={()=>onOrderItem(item)}>
                  {t.market_order}
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT PAGE
// ─────────────────────────────────────────────────────────────────────────────
function AccountPage({ lang, user, onSignOut, onReorder }) {
  const t = T[lang];
  const gl = "1px solid rgba(197,160,80,0.28)";

  // SUPABASE: replace this state with a fetch:
  // const { data: files } = await supabase.from('user_files').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  const [files, setFiles] = useState([
    // Demo files — remove these once Supabase is connected
    { id: "f1", name: "bracket_v3.stl", size: 248320, created_at: "2025-05-14T10:22:00Z", volume: 18400 },
    { id: "f2", name: "custom_knob.stl", size: 92160, created_at: "2025-04-28T16:05:00Z", volume: 6200 },
    { id: "f3", name: "flexicat_large.stl", size: 1048576, created_at: "2025-04-01T09:11:00Z", volume: 42000 },
  ]);

  function deleteFile(id) {
    if (!window.confirm(t.file_confirm_delete)) return;
    // SUPABASE: await supabase.from('user_files').delete().eq('id', id)
    // Also delete the actual file: await supabase.storage.from('user-stls').remove([`${user.id}/${id}.stl`])
    setFiles(f => f.filter(x => x.id !== id));
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(lang === "gr" ? "el-GR" : "en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div style={{paddingTop:58,minHeight:"100vh",background:"var(--bg)",position:"relative",overflow:"hidden"}}>
      <ParticleCanvas style={{opacity:.35}}/>
      <div style={{maxWidth:900,margin:"0 auto",padding:"52px clamp(20px,5vw,72px)",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:40,flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{fontFamily:"var(--font-mono)",fontSize:".67rem",letterSpacing:".18em",color:"var(--gold)",textTransform:"uppercase",marginBottom:12,display:"flex",alignItems:"center",gap:13}}>
              Account <span style={{width:36,height:1,background:"rgba(197,160,80,.32)",display:"inline-block"}}/>
            </div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(1.8rem,3.5vw,2.8rem)",letterSpacing:".04em",color:"var(--text)",marginBottom:6}}>{t.account_title}</h1>
            <div style={{fontFamily:"var(--font-mono)",fontSize:".72rem",color:"var(--text-dimmer)",letterSpacing:".08em"}}>{user.email}</div>
          </div>
          <button className="btn-s" onClick={onSignOut}>{t.btn_signout}</button>
        </div>

        {/* File history */}
        <div style={{fontFamily:"var(--font-mono)",fontSize:".67rem",letterSpacing:".15em",color:"var(--gold)",textTransform:"uppercase",marginBottom:16}}>{t.your_files}</div>

        {files.length === 0 ? (
          <div style={{border:gl,padding:"36px 28px",fontFamily:"var(--font-mono)",fontSize:".72rem",color:"var(--text-dimmer)",letterSpacing:".08em",lineHeight:1.8}}>{t.your_files_empty}</div>
        ) : (
          <div style={{border:gl}}>
            {files.map((f, i) => (
              <div key={f.id} style={{display:"grid",gridTemplateColumns:"1fr auto auto",alignItems:"center",gap:20,padding:"18px 22px",borderBottom:i<files.length-1?gl:"none",transition:"background .2s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(139,26,26,0.07)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div>
                  <div style={{fontFamily:"var(--font-cond)",fontSize:"1rem",letterSpacing:".06em",color:"var(--text)",marginBottom:4}}>{f.name}</div>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:".62rem",color:"var(--text-dimmer)",letterSpacing:".07em"}}>
                    {(f.size/1024).toFixed(0)} KB · {(f.volume/1000).toFixed(1)} cm³ · {formatDate(f.created_at)}
                  </div>
                </div>
                <button className="btn-s" style={{padding:"7px 14px",fontSize:".75rem"}} onClick={()=>onReorder(f)}>
                  {t.file_reorder}
                </button>
                <button onClick={()=>deleteFile(f.id)} style={{background:"none",border:"1px solid rgba(139,26,26,.4)",color:"rgba(192,39,45,.7)",fontFamily:"var(--font-cond)",fontSize:".75rem",letterSpacing:".1em",padding:"7px 12px",cursor:"pointer",transition:"all .2s",textTransform:"uppercase"}}
                  onMouseEnter={e=>{e.target.style.background="rgba(139,26,26,.15)";e.target.style.color="var(--red-bright)";}}
                  onMouseLeave={e=>{e.target.style.background="none";e.target.style.color="rgba(192,39,45,.7)";}}>
                  {t.file_delete}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV BAR — desktop links + mobile hamburger drawer
// ─────────────────────────────────────────────────────────────────────────────
function NavBar({ page, setPage, lang, setLang, user, onSignIn, t }) {
  const [open, setOpen] = useState(false);

  function go(p) { setPage(p); setOpen(false); }

  return (
    <>
      <nav>
        {/* Logo — always visible */}
        <div className="n-logo" onClick={()=>go("home")}>MAN<em>U</em>FACTOR</div>

        {/* Desktop links */}
        <div className="n-r">
          <button className={`nl ${page==="home"?"act":""}`} onClick={()=>go("home")}>{t.nav_home}</button>
          <button className={`nl ${page==="market"?"act":""}`} onClick={()=>go("market")}>{t.nav_market}</button>
          <button className={`nl ${page==="quote"?"act":""}`} onClick={()=>go("quote")}>{t.nav_quote}</button>
          {user
            ? <button className="n-user" onClick={()=>go("account")}>{user.email.split("@")[0]}</button>
            : <button className="nl" onClick={onSignIn}>{t.nav_signin}</button>}
          <div className="lt">
            <button className={`lb ${lang==="en"?"act":""}`} onClick={()=>setLang("en")}>EN</button>
            <div className="ls" style={{alignSelf:"stretch"}}/>
            <button className={`lb ${lang==="gr"?"act":""}`} onClick={()=>setLang("gr")}>ΕΛ</button>
          </div>
          {/* Hamburger — shown via CSS on small screens */}
          <button className={`hbg ${open?"open":""}`} onClick={()=>setOpen(o=>!o)} aria-label="Menu">
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mob-drawer ${open?"open":""}`}>
        <button className={`mob-nl ${page==="home"?"act":""}`} onClick={()=>go("home")}>{t.nav_home}</button>
        <button className={`mob-nl ${page==="market"?"act":""}`} onClick={()=>go("market")}>{t.nav_market}</button>
        <button className={`mob-nl ${page==="quote"?"act":""}`} onClick={()=>go("quote")}>{t.nav_quote}</button>
        {user
          ? <button className={`mob-nl ${page==="account"?"act":""}`} onClick={()=>go("account")}>{t.nav_account} — {user.email.split("@")[0]}</button>
          : <button className="mob-nl" onClick={()=>{setOpen(false);onSignIn();}}>{t.nav_signin}</button>}
        <div className="mob-lang">
          <button className={`lb ${lang==="en"?"act":""}`} onClick={()=>setLang("en")}>EN</button>
          <div className="ls" style={{alignSelf:"stretch"}}/>
          <button className={`lb ${lang==="gr"?"act":""}`} onClick={()=>setLang("gr")}>ΕΛ</button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function ManufactorApp() {
  const [lang, setLang] = useState(()=>(navigator.language||"").toLowerCase().startsWith("el")?"gr":"en");
  const [page, setPage] = useState("home"); // "home" | "quote" | "market" | "account"
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [legal, setLegal] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null); // { email, id } when logged in
  // SUPABASE: On app load, check for existing session:
  // const { data: { session } } = await supabase.auth.getSession()
  // if (session) setUser({ email: session.user.email, id: session.user.id })

  // Quote state
  const [stlBuffer, setStlBuffer] = useState(null);
  const [stlName, setStlName] = useState("");
  const [volume, setVolume] = useState(0);
  const [material, setMaterial] = useState("PLA");
  const [layer, setLayer] = useState("0.20");
  const [infill, setInfill] = useState("standard");
  const [post, setPost] = useState("none");
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(COLORS[0]);
  const [notes, setNotes] = useState("");
  const [custName, setCustName] = useState("");
  const [email, setEmail] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const t = T[lang];

  useEffect(()=>{
    if(window.THREE){setThreeLoaded(true);return;}
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.onload=()=>setThreeLoaded(true);
    document.head.appendChild(s);
  },[]);

  // Pricing
  const volCm3 = volume/1000;
  const basePrice = volume>0
    ? Math.max(MIN_ORDER,(volCm3*MATERIAL_RATES[material]*LAYER_MULT[layer]*INFILL_MULT[infill]*volumeDiscount(volCm3))+POST_ADD[post])
    : null;
  const unitPrice = basePrice !== null && appliedDiscount
    ? appliedDiscount.type==="percent"
      ? basePrice*(1-appliedDiscount.value/100)
      : Math.max(MIN_ORDER, basePrice-appliedDiscount.value)
    : basePrice;
  const totalPrice = unitPrice!==null ? unitPrice*qty : null;

  function applyDiscount() {
    setDiscountError("");
    const code = DISCOUNT_CODES[discountCode.trim().toUpperCase()];
    // SUPABASE: replace with: const { data } = await supabase.from('discount_codes').select('*').eq('code', discountCode.toUpperCase()).eq('active', true).single()
    if (code) { setAppliedDiscount({ ...code, code: discountCode.toUpperCase() }); }
    else { setDiscountError(t.discount_invalid); }
  }

  function handleFile(file) {
    if (!file) return;
    setStlName(file.name);
    const reader = new FileReader();
    reader.onload = e => { const b=e.target.result; setStlBuffer(b); setVolume(Math.round(parseSTLVolume(b))); };
    reader.readAsArrayBuffer(file);
  }
  const onDrop = useCallback(e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);},[]);

  // Pre-fill quote from marketplace item — loads STL directly from /assets/STLs/
  function handleOrderItem(item) {
    setPage("quote");
    setStlName(item.name + ".stl");
    setStlBuffer(null); setVolume(0);
    if (item.stlUrl) {
      fetch(item.stlUrl)
        .then(r => r.arrayBuffer())
        .then(buf => { setStlBuffer(buf); setVolume(Math.round(parseSTLVolume(buf))); })
        .catch(() => {}); // silently fail if file missing — viewer shows empty state
    }
    // SUPABASE (future): swap fetch above for:
    // const { data } = await supabase.storage.from('marketplace-stls').download(item.stlUrl)
    // const buffer = await data.arrayBuffer()
    // setStlBuffer(buffer); setVolume(Math.round(parseSTLVolume(buffer)))
  }

  // Pre-fill quote from user's file history
  function handleReorder(file) {
    setPage("quote");
    setStlName(file.name);
    setStlBuffer(null); setVolume(file.volume);
    // SUPABASE: fetch the user's STL file:
    // const { data } = await supabase.storage.from('user-stls').download(`${user.id}/${file.id}.stl`)
    // const buffer = await data.arrayBuffer()
    // setStlBuffer(buffer)
  }

  async function handleSubmit() {
    if (!email || !custName) return;
    setSending(true);
    // SUPABASE: save quote request and STL file:
    // 1. Upload file: await supabase.storage.from('user-stls').upload(`${user?.id ?? 'anon'}/${Date.now()}.stl`, stlBuffer)
    // 2. Save record: await supabase.from('quote_requests').insert({ name: custName, email, material, layer, infill, post, qty, volume, discount: appliedDiscount?.code, notes })
    // 3. If user is logged in, also save to user_files table
    await new Promise(r=>setTimeout(r,1600));
    setSending(false); setSent(true);
  }

  function signOut() {
    // SUPABASE: await supabase.auth.signOut()
    setUser(null); setPage("home");
  }

  function resetQuote() {
    setSent(false); setStlBuffer(null); setStlName(""); setVolume(0);
    setAppliedDiscount(null); setDiscountCode(""); setDiscountError("");
  }

  const gl = "1px solid rgba(197,160,80,0.28)";

  return (
    <div style={{fontFamily:"var(--font-body)",background:"var(--bg)",color:"var(--text)",minHeight:"100vh",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500&family=Barlow+Condensed:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        :root{
          --bg:#0c0404;--bg2:#110606;--bg3:#160808;
          --red:#8b1a1a;--red-bright:#c0272d;
          --gold:#c5a050;--gold-dim:rgba(197,160,80,0.22);
          --text:#ede4df;--text-dim:rgba(237,228,223,0.55);--text-dimmer:rgba(237,228,223,0.27);
          --font-display:'Bebas Neue',sans-serif;
          --font-cond:'Barlow Condensed',sans-serif;
          --font-body:'Inter',sans-serif;
          --font-mono:'JetBrains Mono',monospace;
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fu{opacity:0;animation:fadeUp .6s ease forwards;}
        .fu1{animation-delay:.0s}.fu2{animation-delay:.12s}.fu3{animation-delay:.25s}.fu4{animation-delay:.4s}
        ::selection{background:rgba(197,160,80,0.2);}
        html{scroll-behavior:smooth;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:var(--bg);}::-webkit-scrollbar-thumb{background:rgba(197,160,80,0.22);}

        nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(16px,4vw,72px);height:58px;background:rgba(12,4,4,0.96);backdrop-filter:blur(14px);border-bottom:${gl};}
        .n-logo{font-family:var(--font-display);font-size:1.48rem;letter-spacing:.14em;color:var(--text);cursor:pointer;user-select:none;flex-shrink:0;}
        .n-logo em{color:var(--red-bright);font-style:normal;}
        .n-logo img{height:30px;width:auto;object-fit:contain;}
        .n-r{display:flex;align-items:center;gap:20px;}
        .nl{font-family:var(--font-cond);font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text-dim);background:none;border:none;cursor:pointer;transition:color .2s;padding-bottom:2px;white-space:nowrap;}
        .nl:hover{color:var(--text);}.nl.act{color:var(--text);border-bottom:1px solid var(--gold);}
        .n-user{font-family:var(--font-mono);font-size:.62rem;letter-spacing:.08em;color:var(--gold);background:rgba(197,160,80,.08);border:${gl};padding:4px 10px;cursor:pointer;transition:background .2s;white-space:nowrap;}
        .n-user:hover{background:rgba(197,160,80,.15);}
        .lt{display:flex;border:${gl};overflow:hidden;flex-shrink:0;}
        .lb{font-family:var(--font-mono);font-size:.64rem;letter-spacing:.08em;padding:4px 9px;background:none;border:none;color:var(--text-dimmer);cursor:pointer;transition:all .18s;}
        .lb.act{background:rgba(197,160,80,.12);color:var(--gold);}
        .ls{width:1px;background:rgba(197,160,80,.25);}
        .hbg{display:none;flex-direction:column;justify-content:center;gap:5px;background:none;border:none;cursor:pointer;padding:8px;margin-right:-8px;height:40px;}
        .hbg span{display:block;width:22px;height:1.5px;background:var(--text);transition:all .25s;transform-origin:center;}
        .hbg.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg);}
        .hbg.open span:nth-child(2){opacity:0;transform:scaleX(0);}
        .hbg.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg);}
        .mob-drawer{position:fixed;top:58px;left:0;right:0;z-index:190;background:rgba(10,3,3,0.98);border-bottom:${gl};backdrop-filter:blur(16px);display:flex;flex-direction:column;padding:16px clamp(16px,4vw,32px) 20px;transform:translateY(-110%);transition:transform .26s cubic-bezier(.4,0,.2,1);pointer-events:none;}
        .mob-drawer.open{transform:translateY(0);pointer-events:all;}
        .mob-nl{font-family:var(--font-cond);font-size:1.05rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text-dim);background:none;border:none;cursor:pointer;text-align:left;padding:13px 0;border-bottom:1px solid rgba(197,160,80,.1);transition:color .2s;width:100%;}
        .mob-nl:last-of-type{border-bottom:none;}
        .mob-nl:hover,.mob-nl.act{color:var(--gold);}
        .mob-lang{display:flex;gap:0;border:${gl};width:fit-content;margin-top:14px;}

        .btn-p{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-cond);font-size:.86rem;letter-spacing:.14em;text-transform:uppercase;padding:12px 26px;background:var(--red);color:var(--text);border:none;cursor:pointer;transition:background .22s,transform .18s;}
        .btn-p:hover{background:var(--red-bright);transform:translateY(-1px);}
        .btn-p:disabled{opacity:.5;cursor:not-allowed;transform:none;}
        .btn-s{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-cond);font-size:.86rem;letter-spacing:.14em;text-transform:uppercase;padding:11px 26px;background:transparent;color:var(--text-dim);border:${gl};cursor:pointer;transition:all .22s;}
        .btn-s:hover{color:var(--text);border-color:rgba(197,160,80,.6);}

        .hero{position:relative;min-height:100vh;overflow:hidden;display:flex;align-items:center;padding:80px clamp(20px,5vw,72px) 60px;}
        .hi{position:relative;z-index:2;width:100%;max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;}
        .hl{display:flex;flex-direction:column;gap:20px;}
        .htag{font-family:var(--font-mono);font-size:.7rem;letter-spacing:.15em;color:var(--gold);text-transform:uppercase;display:flex;align-items:center;gap:11px;}
        .htag::before{content:'';display:block;width:24px;height:1px;background:var(--gold);}
        .hh{font-family:var(--font-display);font-size:clamp(2.5rem,5vw,4.8rem);line-height:.96;letter-spacing:.03em;color:var(--text);}
        .hsub{font-size:clamp(.85rem,1.2vw,.95rem);line-height:1.84;color:var(--text-dim);font-weight:300;max-width:450px;}
        .hctas{display:flex;gap:12px;flex-wrap:wrap;}
        .prbox{width:100%;max-width:430px;aspect-ratio:1;border:${gl};position:relative;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;background:linear-gradient(135deg,rgba(139,26,26,.07),transparent 65%);}
        .co{position:absolute;width:16px;height:16px;}
        .c1{top:-1px;left:-1px;border-top:2px solid var(--gold);border-left:2px solid var(--gold);}
        .c2{top:-1px;right:-1px;border-top:2px solid var(--gold);border-right:2px solid var(--gold);}
        .c3b{bottom:-1px;left:-1px;border-bottom:2px solid var(--gold);border-left:2px solid var(--gold);}
        .c4{bottom:-1px;right:-1px;border-bottom:2px solid var(--gold);border-right:2px solid var(--gold);}
        .pi{position:absolute;inset:14px;border:1px solid rgba(197,160,80,.07);}
        .phl{font-family:var(--font-mono);font-size:.63rem;letter-spacing:.13em;color:var(--text-dimmer);text-align:center;text-transform:uppercase;}

        section.s{padding:clamp(50px,7vw,96px) clamp(20px,5vw,72px);position:relative;overflow:hidden;}
        .si{max-width:1120px;margin:0 auto;}
        .sl{font-family:var(--font-mono);font-size:.66rem;letter-spacing:.18em;color:var(--gold);text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:12px;}
        .sl::after{content:'';width:34px;height:1px;background:rgba(197,160,80,.3);}
        .st{font-family:var(--font-display);font-size:clamp(1.9rem,3.6vw,3rem);letter-spacing:.04em;color:var(--text);margin-bottom:24px;line-height:1;}
        hr.dv{height:1px;background:rgba(197,160,80,.2);border:none;margin:0;}

        .c3g{display:grid;grid-template-columns:repeat(3,1fr);border:${gl};margin-top:38px;}
        .crd{padding:32px 24px;background:var(--bg2);border-right:${gl};transition:background .22s;}
        .crd:last-child{border-right:none;}
        .crd:hover{background:rgba(139,26,26,.09);}
        .cn{font-family:var(--font-mono);font-size:.59rem;color:var(--gold);letter-spacing:.12em;margin-bottom:14px;}
        .ct{font-family:var(--font-cond);font-size:1.02rem;letter-spacing:.07em;color:var(--text);margin-bottom:10px;text-transform:uppercase;}
        .cb{font-size:.83rem;line-height:1.74;color:var(--text-dim);font-weight:300;}
        .fl{margin-top:32px;border:${gl};}
        .fr{display:grid;grid-template-columns:180px 1fr;align-items:start;padding:18px 24px;border-bottom:${gl};gap:18px;transition:background .2s;}
        .fr:last-child{border-bottom:none;}
        .fr:hover{background:rgba(139,26,26,.07);}
        .flb{font-family:var(--font-cond);font-size:.96rem;letter-spacing:.07em;color:var(--text);text-transform:uppercase;}
        .fd{font-size:.83rem;line-height:1.72;color:var(--text-dim);font-weight:300;}
        .mt{font-family:var(--font-cond);font-size:clamp(.95rem,1.8vw,1.22rem);line-height:2;color:var(--text-dim);white-space:pre-line;letter-spacing:.02em;}

        .qw{padding-top:58px;min-height:100vh;background:var(--bg);position:relative;overflow:hidden;}
        .qh{padding:46px clamp(20px,5vw,72px) 30px;border-bottom:${gl};position:relative;z-index:2;}
        .qg{display:grid;grid-template-columns:1fr 348px;position:relative;z-index:2;}
        .qf{padding:38px clamp(20px,5vw,72px);border-right:${gl};}
        .qs{padding:38px 30px;position:sticky;top:58px;height:fit-content;}
        .form-group{margin-bottom:20px;}
        label{display:block;font-family:var(--font-mono);font-size:.64rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:8px;}
        .fi,.fs,.fta{width:100%;background:rgba(255,255,255,.022);border:${gl};color:var(--text);font-family:var(--font-body);font-size:.86rem;padding:10px 12px;outline:none;transition:border-color .2s;border-radius:0;appearance:none;}
        .fi:focus,.fs:focus,.fta:focus{border-color:rgba(197,160,80,.56);background:rgba(197,160,80,.03);}
        .fs{cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23c5a050' stroke-width='1.3' fill='none'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;background-color:rgba(12,4,4,.97);}
        option{background:#160808;color:var(--text);}
        .fta{min-height:84px;resize:vertical;line-height:1.6;}
        .uz{border:1px dashed rgba(197,160,80,.3);padding:28px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;cursor:pointer;transition:all .2s;text-align:center;background:rgba(255,255,255,.016);}
        .uz:hover,.uz.dg{border-color:rgba(197,160,80,.6);background:rgba(197,160,80,.04);}
        .uz.ld{border-color:rgba(139,26,26,.5);border-style:solid;}
        .uph{font-family:var(--font-mono);font-size:.62rem;letter-spacing:.1em;color:var(--text-dimmer);text-transform:uppercase;}
        .upn{font-family:var(--font-cond);font-size:.87rem;color:var(--text);letter-spacing:.05em;}
        .eb{border:${gl};padding:24px;background:rgba(139,26,26,.06);}
        .elb{font-family:var(--font-mono);font-size:.64rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:14px;}
        .ep{font-family:var(--font-display);font-size:2.7rem;letter-spacing:.04em;color:var(--text);line-height:1;}
        .ep span{font-size:1.2rem;color:var(--text-dim);margin-right:2px;}
        .er{font-family:var(--font-mono);font-size:.62rem;color:var(--text-dimmer);margin-top:4px;letter-spacing:.07em;}
        .en2{font-size:.73rem;color:var(--text-dimmer);margin-top:12px;line-height:1.68;font-style:italic;}
        .bd{margin-top:14px;border-top:${gl};padding-top:12px;display:flex;flex-direction:column;gap:6px;}
        .br2{display:flex;justify-content:space-between;font-size:.75rem;color:var(--text-dim);}
        .br2 span:last-child{font-family:var(--font-mono);color:var(--text);}
        .nf{font-family:var(--font-mono);font-size:.68rem;color:var(--text-dimmer);letter-spacing:.08em;text-align:center;padding:18px 0;}
        .qr{display:flex;align-items:center;border:${gl};width:fit-content;}
        .qb{width:35px;height:35px;background:none;border:none;color:var(--text);font-size:1.08rem;cursor:pointer;transition:background .18s;}
        .qb:hover{background:rgba(197,160,80,.08);}
        .qv{min-width:40px;height:35px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:.85rem;color:var(--text);border-left:${gl};border-right:${gl};}
        .sb{text-align:center;padding:64px 40px;}
        .si2{color:var(--gold);margin-bottom:16px;}
        .st2{font-family:var(--font-display);font-size:1.85rem;letter-spacing:.06em;color:var(--text);margin-bottom:9px;}
        .sb2{font-size:.87rem;color:var(--text-dim);line-height:1.8;}
        footer{border-top:${gl};padding:22px clamp(20px,5vw,72px);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;position:relative;z-index:2;}
        .fl2{font-family:var(--font-display);font-size:1.08rem;letter-spacing:.12em;color:var(--text-dimmer);}
        .fc{font-family:var(--font-mono);font-size:.6rem;letter-spacing:.09em;color:var(--text-dimmer);}
        .flinks{display:flex;gap:16px;}
        .flink{font-family:var(--font-mono);font-size:.6rem;letter-spacing:.09em;color:var(--text-dimmer);background:none;border:none;cursor:pointer;text-decoration:underline;text-underline-offset:3px;transition:color .18s;}
        .flink:hover{color:var(--gold);}

        @media(max-width:900px){
          .hi{grid-template-columns:1fr;}.hr{display:none;}
          .qg{grid-template-columns:1fr;}.qs{position:static;border-right:none;border-top:${gl};}
          .c3g{grid-template-columns:1fr;}.crd{border-right:none;border-bottom:${gl};}.crd:last-child{border-bottom:none;}
          .fr{grid-template-columns:1fr;}
        }
        @media(max-width:680px){
          .n-r .nl,.n-r .n-user,.n-r .lt{display:none;}
          .hbg{display:flex;}
          .hero{padding:72px 16px 48px;}
          .hh{font-size:clamp(2.2rem,10vw,3.5rem);}
          section.s{padding:44px 16px;}
        }
      `}</style>

      {legal && <LegalModal type={legal} lang={lang} onClose={()=>setLegal(null)}/>}
      {showAuth && <AuthModal lang={lang} onClose={()=>setShowAuth(false)} onAuth={u=>{setUser(u);setShowAuth(false);}}/>}
      <CookieBanner lang={lang}/>

      {/* NAV */}
      <NavBar
        page={page} setPage={setPage}
        lang={lang} setLang={setLang}
        user={user} onSignIn={()=>setShowAuth(true)}
        t={t}
      />

      {page==="market" && <MarketplacePage lang={lang} onOrderItem={item=>{handleOrderItem(item);}} />}
      {page==="account" && (user
        ? <AccountPage lang={lang} user={user} onSignOut={signOut} onReorder={f=>{handleReorder(f);setPage("quote");}}/>
        : <div style={{paddingTop:120,textAlign:"center"}}><button className="btn-p" onClick={()=>setShowAuth(true)}>{t.nav_signin}</button></div>
      )}

      {page==="home" && (
        <>
          {/* HERO */}
          <section className="hero">
            <ParticleCanvas style={{zIndex:0}}/>
            <div className="hi">
              <div className="hl">
                <div className="htag fu fu1">{t.hero_tag}</div>
                <h1 className="hh fu fu2">{t.hero_headline}</h1>
                <div style={{minHeight:22}} className="fu fu3"><Typewriter slogans={t.slogans}/></div>
                <p className="hsub fu fu3">{t.hero_sub}</p>
                <div className="hctas fu fu4">
                  <button className="btn-p" onClick={()=>setPage("quote")}>{t.cta_quote}<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                  <button className="btn-s" onClick={()=>document.getElementById("what")?.scrollIntoView({behavior:"smooth"})}>{t.cta_learn}</button>
                </div>
              </div>
              <div className="hr fu fu4" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div className="prbox">
                  <div className="co c1"/><div className="co c2"/><div className="co c3b"/><div className="co c4"/><div className="pi"/>
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{opacity:.1}}>
                    <rect x="12" y="24" width="40" height="26" rx="2" stroke="var(--text)" strokeWidth="1.3"/>
                    <rect x="20" y="16" width="24" height="10" rx="1" stroke="var(--text)" strokeWidth="1.3"/>
                    <line x1="12" y1="40" x2="52" y2="40" stroke="var(--text)" strokeWidth="1"/>
                    <circle cx="44" cy="32" r="3" fill="var(--text)"/>
                    <rect x="24" y="50" width="16" height="8" stroke="var(--text)" strokeWidth="1.3"/>
                  </svg>
                  <p className="phl">Manufactor MK-I<br/><span style={{color:"var(--red-bright)",opacity:.45}}>Render coming soon</span></p>
                </div>
              </div>
            </div>
          </section>
          <hr className="dv"/>

          {/* WHAT WE DO */}
          <section id="what" className="s" style={{background:"var(--bg2)"}}>
            <ParticleCanvas style={{opacity:.14}}/>
            <div className="si" style={{position:"relative",zIndex:1}}>
              <div className="sl">01</div>
              <h2 className="st">{t.section_what}</h2>
              <p style={{fontSize:".91rem",lineHeight:1.84,color:"var(--text-dim)",maxWidth:580,fontWeight:300}}>{t.what_p}</p>
              <div className="c3g">
                {[{n:"01",title:t.card_print_title,body:t.card_print_body},{n:"02",title:t.card_finish_title,body:t.card_finish_body},{n:"03",title:t.card_rapid_title,body:t.card_rapid_body}].map(c=>(
                  <div className="crd" key={c.n}><div className="cn">— {c.n}</div><div className="ct">{c.title}</div><div className="cb">{c.body}</div></div>
                ))}
              </div>
            </div>
          </section>
          <hr className="dv"/>

          {/* FINISHING */}
          <section className="s">
            <ParticleCanvas style={{opacity:.11}}/>
            <div className="si" style={{position:"relative",zIndex:1}}>
              <div className="sl">02</div>
              <h2 className="st">Finishing Options</h2>
              <p style={{fontSize:".91rem",lineHeight:1.8,color:"var(--text-dim)",fontWeight:300,maxWidth:500}}>{t.finishing_intro}</p>
              <div className="fl">
                {t.finishing_items.map((fi,i)=>(
                  <div className="fr" key={i}><div className="flb">{fi.label}</div><div className="fd">{fi.desc}</div></div>
                ))}
              </div>
            </div>
          </section>
          <hr className="dv"/>

          <Carousel lang={lang}/>
          <hr className="dv"/>

          {/* MANIFESTO */}
          <section className="s" style={{background:"var(--bg3)",borderTop:"1px solid rgba(197,160,80,0.18)",borderBottom:"1px solid rgba(197,160,80,0.18)"}}>
            <ParticleCanvas style={{opacity:.12}}/>
            <div className="si" style={{maxWidth:700,position:"relative",zIndex:1}}>
              <div className="sl">03</div>
              <h2 className="st">{t.section_manifesto}</h2>
              <p className="mt">{t.manifesto_p}</p>
              <div style={{marginTop:36}}>
                <button className="btn-p" onClick={()=>setPage("quote")}>{t.cta_quote}<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
              </div>
            </div>
          </section>
          <footer>
            <div className="fl2">MANUFACTOR</div>
            <div className="fc">{t.footer_copy}</div>
            <div className="flinks">
              <button className="flink" onClick={()=>setLegal("privacy")}>{lang==="gr"?"Απόρρητο":"Privacy Policy"}</button>
              <button className="flink" onClick={()=>setLegal("terms")}>{lang==="gr"?"Όροι Χρήσης":"Terms of Service"}</button>
            </div>
          </footer>
        </>
      )}

      {page==="quote" && (
        <div className="qw">
          <ParticleCanvas style={{zIndex:0,opacity:.4}}/>
          <div className="qh">
            <div className="sl">Quote Request</div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(1.8rem,3.4vw,2.7rem)",letterSpacing:".04em",marginBottom:9}}>{t.quote_title}</h1>
            <p style={{color:"var(--text-dim)",fontSize:".86rem",maxWidth:500,lineHeight:1.78,fontWeight:300}}>{t.quote_sub}</p>
          </div>

          {sent ? (
            <div className="sb">
              <div className="si2"><svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="1.4"/><path d="M12 22l7 7 13-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              <div className="st2">{t.sent_title}</div>
              <p className="sb2">{t.sent_body}</p>
              <div style={{marginTop:26}}><button className="btn-s" onClick={resetQuote}>New Request</button></div>
            </div>
          ) : (
            <div className="qg">
              {/* FORM */}
              <div className="qf">
                {/* Pre-filled notice */}
                {stlName && !stlBuffer && (
                  <div style={{border:"1px solid rgba(197,160,80,.35)",padding:"12px 16px",marginBottom:20,fontFamily:"var(--font-mono)",fontSize:".68rem",color:"var(--gold)",letterSpacing:".07em"}}>
                    Model pre-loaded: {stlName}
                  </div>
                )}

                {/* Upload */}
                <div className="form-group">
                  <label>{t.upload_label}</label>
                  <div className={`uz${dragOver?" dg":""}${stlBuffer?" ld":""}`}
                    onClick={()=>fileRef.current?.click()}
                    onDragOver={e=>{e.preventDefault();setDragOver(true);}}
                    onDragLeave={()=>setDragOver(false)} onDrop={onDrop}>
                    {stlBuffer?(
                      <><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2v9M8 8l3 3 3-3" stroke="var(--red-bright)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 16v1.5A1.5 1.5 0 003.5 19h15a1.5 1.5 0 001.5-1.5V16" stroke="var(--gold)" strokeWidth="1.3" strokeLinecap="round"/></svg>
                        <div className="upn">{stlName}</div><div className="uph">{t.upload_loaded} · {(stlBuffer.byteLength/1024).toFixed(0)} KB</div></>
                    ):(
                      <><svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="2" y="6" width="22" height="16" rx="2" stroke="rgba(197,160,80,0.45)" strokeWidth="1.2"/><path d="M13 18V10M9 14l4-4 4 4" stroke="rgba(197,160,80,0.65)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <div className="upn" style={{color:"var(--text-dim)"}}>STL</div><div className="uph">{t.upload_hint}</div></>
                    )}
                    <input ref={fileRef} type="file" accept=".stl" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
                  </div>
                </div>

                {threeLoaded&&(
                  <div className="form-group">
                    <label>3D Preview {stlBuffer&&<span style={{color:"var(--text-dimmer)",fontSize:".58rem"}}>— drag to rotate</span>}</label>
                    <STLViewer buffer={stlBuffer} colorHex={color?.hex}/>
                  </div>
                )}

                <div className="form-group">
                  <label>{t.mat_label}</label>
                  <select className="fs" value={material} onChange={e=>setMaterial(e.target.value)}>
                    {Object.keys(MATERIAL_RATES).map(m=><option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <ColourPicker value={color} onChange={setColor} label={t.color_label} disclaimer={t.color_disclaimer}/>

                <div className="form-group">
                  <label>{t.layer_label}</label>
                  <select className="fs" value={layer} onChange={e=>setLayer(e.target.value)}>
                    <option value="0.08">0.08 mm — Ultrafine</option>
                    <option value="0.10">0.10 mm — Superfine</option>
                    <option value="0.12">0.12 mm — Fine</option>
                    <option value="0.16">0.16 mm — Optimal</option>
                    <option value="0.20">0.20 mm — Standard</option>
                    <option value="0.24">0.24 mm — Draft</option>
                    <option value="0.28">0.28 mm — Superdraft</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t.infill_label}</label>
                  <select className="fs" value={infill} onChange={e=>setInfill(e.target.value)}>
                    <option value="light">Minimal (10%)</option>
                    <option value="standard">Standard (15%)</option>
                    <option value="strong">Strong (30%)</option>
                    <option value="solid">Solid (50%)</option>
                    <option value="engineering">Engineering (80%)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t.post_label}</label>
                  <select className="fs" value={post} onChange={e=>setPost(e.target.value)}>
                    <option value="none">{t.post_none}</option>
                    <option value="vapor">{t.post_vapor}</option>
                    <option value="sand">{t.post_sand}</option>
                    <option value="paint">{t.post_paint}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t.qty_label}</label>
                  <div className="qr">
                    <button className="qb" onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
                    <div className="qv">{qty}</div>
                    <button className="qb" onClick={()=>setQty(q=>q+1)}>+</button>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t.notes_label}</label>
                  <textarea className="fta" value={notes} onChange={e=>setNotes(e.target.value)} placeholder={t.notes_placeholder}/>
                </div>

                <hr className="dv" style={{margin:"2px 0 20px"}}/>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div className="form-group" style={{marginBottom:0}}>
                    <label>{t.name_label}</label>
                    <input className="fi" value={custName} onChange={e=>setCustName(e.target.value)}/>
                  </div>
                  <div className="form-group" style={{marginBottom:0}}>
                    <label>{t.email_label}</label>
                    <input className="fi" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
                  </div>
                </div>

                <div style={{marginTop:24}}>
                  <button className="btn-p" style={{width:"100%",justifyContent:"center",opacity:(!custName||!email)?.5:1}}
                    onClick={handleSubmit} disabled={sending||!custName||!email}>
                    {sending?t.btn_sending:t.btn_request}
                    {!sending&&<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                </div>
              </div>

              {/* SIDEBAR */}
              <div className="qs">
                <div className="eb">
                  <div className="elb">{t.estimate_title}</div>
                  {totalPrice!==null?(
                    <>
                      <div className="ep"><span>€</span>{totalPrice.toFixed(2)}</div>
                      {qty>1&&<div className="er">€{unitPrice.toFixed(2)} × {qty} units</div>}
                      {appliedDiscount&&<div style={{fontFamily:"var(--font-mono)",fontSize:".65rem",color:"#7cba6a",marginTop:5,letterSpacing:".07em"}}>
                        ✓ {t.discount_applied} {appliedDiscount.label}
                      </div>}
                      <div className="er" style={{marginTop:3}}>Range: €{(totalPrice*.86).toFixed(2)} – €{(totalPrice*1.3).toFixed(2)}</div>
                      <div className="bd">
                        <div className="br2"><span>Volume</span><span>{volCm3.toFixed(2)} cm³</span></div>
                        <div className="br2"><span>Material</span><span>{material}</span></div>
                        <div className="br2"><span>Layer</span><span>{layer} mm ×{LAYER_MULT[layer]}</span></div>
                        <div className="br2"><span>Infill</span><span>{infill} ×{INFILL_MULT[infill]}</span></div>
                        {volCm3>5&&<div className="br2"><span>Vol. discount</span><span>×{volumeDiscount(volCm3).toFixed(2)}</span></div>}
                        {color&&<div className="br2"><span>Colour</span><span style={{display:"flex",alignItems:"center",gap:5}}><span style={{display:"inline-block",width:9,height:9,background:color.hex,border:"1px solid rgba(197,160,80,.3)"}}/>{color.name}</span></div>}
                        {POST_ADD[post]>0&&<div className="br2"><span>Post-process</span><span>+€{POST_ADD[post]}</span></div>}
                        {appliedDiscount&&<div className="br2" style={{color:"#7cba6a"}}><span>Discount ({appliedDiscount.code})</span><span>{appliedDiscount.type==="percent"?`−${appliedDiscount.value}%`:`−€${appliedDiscount.value}`}</span></div>}
                      </div>
                    </>
                  ):(
                    <div className="nf">{t.no_file}</div>
                  )}
                  <p className="en2">{t.estimate_note}</p>
                </div>

                {/* Discount code */}
                <div style={{marginTop:16,border:gl,padding:"16px"}}>
                  <label style={{marginBottom:8}}>{t.discount_label}</label>
                  <div style={{display:"flex",gap:0}}>
                    <input className="fi" style={{flex:1,borderRight:"none"}} value={discountCode}
                      onChange={e=>{setDiscountCode(e.target.value);setDiscountError("");}}
                      placeholder={t.discount_placeholder}
                      onKeyDown={e=>e.key==="Enter"&&applyDiscount()}/>
                    <button onClick={applyDiscount} style={{fontFamily:"var(--font-cond)",fontSize:".78rem",letterSpacing:".1em",textTransform:"uppercase",padding:"0 14px",background:"none",border:gl,color:"var(--text-dim)",cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s"}}
                      onMouseEnter={e=>e.target.style.color="var(--text)"} onMouseLeave={e=>e.target.style.color="var(--text-dim)"}>
                      {t.discount_apply}
                    </button>
                  </div>
                  {discountError&&<p style={{fontFamily:"var(--font-mono)",fontSize:".65rem",color:"var(--red-bright)",marginTop:7,letterSpacing:".06em"}}>{discountError}</p>}
                </div>

                <div style={{marginTop:18,padding:"14px 0",borderTop:"1px solid rgba(197,160,80,0.17)"}}>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:".61rem",letterSpacing:".1em",color:"var(--text-dimmer)",lineHeight:2.1}}>
                    MANUFACTOR STUDIO<br/>Athens, Greece<br/>Response within 24h
                  </div>
                </div>
              </div>
            </div>
          )}
          <footer>
            <div className="fl2">MANUFACTOR</div>
            <div className="fc">{t.footer_copy}</div>
            <div className="flinks">
              <button className="flink" onClick={()=>setLegal("privacy")}>{lang==="gr"?"Απόρρητο":"Privacy Policy"}</button>
              <button className="flink" onClick={()=>setLegal("terms")}>{lang==="gr"?"Όροι Χρήσης":"Terms of Service"}</button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
