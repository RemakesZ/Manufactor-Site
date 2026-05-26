import { useState, useEffect, useRef, useCallback } from "react";

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    nav_home: "Home", nav_quote: "Get a Quote",
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
    card_print_title: "Precision FDM Printing",
    card_print_body: "PLA, PETG, ABS, ASA and more. Layer heights from 0.08 mm. Tight tolerances, clean infill, reviewed before shipping.",
    card_finish_title: "Professional Finishing",
    card_finish_body: "Sanding, priming, painting, colour matching, vapor smoothing. Your part can come off looking like it left a production line.",
    card_rapid_title: "Rapid Turnaround",
    card_rapid_body: "Solo operation means no queue bureaucracy. You deal directly with the person making your part. Fast communication, honest timelines.",
    finishing_intro: "Most print services hand you the part raw. We don't.",
    finishing_items: [
      { label: "Vapor Smoothing", desc: "ABS/ASA parts chemically smoothed for an injection-moulded surface finish. No visible layer lines." },
      { label: "Sanding & Priming", desc: "Manual surface prep for parts that need to be painted or have strict aesthetic requirements." },
      { label: "Custom Paint", desc: "Colour matching, base coats, protective topcoats. Parts that look like a product, not a prototype." },
    ],
    section_manifesto: "Built for the Independent Builder",
    manifesto_p: "Manufacturing has always been a tool of whoever owns the machines. We think that's worth challenging.\n\nManufactor exists because access to quality fabrication shouldn't depend on minimum order quantities, corporate accounts, or proximity to a production hub. One part or one hundred — it gets the same attention.\n\nThis is craft at a technical level. Precise, deliberate, and independent.",
    quote_title: "Request a Quote",
    quote_sub: "Upload your STL, choose your options, get an instant ballpark. We'll confirm the final price after reviewing your file.",
    upload_label: "Upload STL File", upload_hint: "Drag & drop or click to browse", upload_loaded: "Model loaded",
    mat_label: "Material", layer_label: "Layer Height", infill_label: "Infill / Strength",
    color_label: "Filament Colour",
    color_disclaimer: "This is a reference only. We'll match as closely as our available filament stock allows — exact colour is not guaranteed.",
    infill_light: "Minimal (10%)", infill_standard: "Standard (15%)", infill_strong: "Strong (30%)", infill_solid: "Solid (50%)", infill_engineering: "Engineering (80%)",
    post_label: "Post-Processing", post_none: "None — as printed", post_vapor: "Vapor Smoothing (ABS/ASA only)", post_sand: "Sanding & Smoothing", post_paint: "Full Paint Finish",
    qty_label: "Quantity",
    notes_label: "Notes for the maker", notes_placeholder: "Tolerances, intended use, deadlines, colour notes…",
    name_label: "Your Name", email_label: "Email Address",
    estimate_title: "Instant Estimate",
    estimate_note: "Ballpark only — based on mesh volume. Final price confirmed after manual review and slicing.",
    btn_request: "Request Final Quote", btn_sending: "Sending…",
    sent_title: "Quote request received.", sent_body: "We'll review your model and get back to you with a confirmed price within 24 hours.",
    no_file: "Upload an STL file to see your estimate.",
    volume_note: "Estimated volume:",
    footer_copy: "© 2025 Manufactor · Athens, Greece",
  },
  gr: {
    nav_home: "Αρχική", nav_quote: "Αίτηση Προσφοράς",
    hero_tag: "Υπηρεσία 3D Εκτύπωσης κατ' Απαίτηση · Αθήνα",
    hero_headline: "Εξαρτήματα 3D εκτύπωσης κατ' απαίτηση.",
    slogans: [
      "Η κατασκευή δεν χρειάζεται εργοστάσιο.",
      "Χειροποίητο φινίρισμα. Ακριβώς δικό σου.",
      "Ακρίβεια χωρίς υπερβολικό κόστος.",
      "Ανεξάρτητη τέχνη σε βιομηχανικό επίπεδο.",
      "Το σχέδιό σου. Η εμμονή μας.",
    ],
    hero_sub: "Το Manufactor είναι studio κατασκευής υψηλής ποιότητας. FDM εκτύπωση ακριβείας, επαγγελματικό φινίρισμα, έτοιμο για χρήση. Ένα εξάρτημα ή εκατό — λαμβάνει την ίδια προσοχή.",
    cta_quote: "Αίτηση Προσφοράς", cta_learn: "Τι Κάνουμε",
    section_what: "Τι Κάνουμε",
    what_p: "Παράγουμε εξαρτήματα παραγωγής, πρωτότυπα και προσαρμοσμένα αντικείμενα — και τα φινίρουμε σε επίπεδο που οι περισσότερες υπηρεσίες δεν κοπιάζουν.",
    card_print_title: "Εκτύπωση FDM Ακριβείας",
    card_print_body: "PLA, PETG, ABS, ASA και άλλα. Ύψος στρώσης από 0.08 mm. Αυστηρές ανοχές, καθαρό infill, έλεγχος πριν την αποστολή.",
    card_finish_title: "Επαγγελματικό Φινίρισμα",
    card_finish_body: "Λείανση, αστάρωμα, βαφή, αντιστοίχιση χρώματος, vapor smoothing. Το εξάρτημά σου μπορεί να φαίνεται σαν να βγήκε από γραμμή παραγωγής.",
    card_rapid_title: "Γρήγορη Παράδοση",
    card_rapid_body: "Μονοπρόσωπη λειτουργία σημαίνει άμεση επικοινωνία. Μιλάς απευθείας με αυτόν που φτιάχνει το εξάρτημά σου. Ειλικρινείς χρόνοι παράδοσης.",
    finishing_intro: "Οι περισσότερες υπηρεσίες σου δίνουν το εξάρτημα ακατέργαστο. Εμείς όχι.",
    finishing_items: [
      { label: "Vapor Smoothing", desc: "Χημική εξομάλυνση ABS/ASA για επιφάνεια injection-moulded. Χωρίς ορατές στρώσεις." },
      { label: "Λείανση & Αστάρωμα", desc: "Χειροκίνητη προετοιμασία επιφάνειας για εξαρτήματα που θα βαφούν ή έχουν αισθητικές απαιτήσεις." },
      { label: "Προσαρμοσμένη Βαφή", desc: "Αντιστοίχιση χρώματος, base coats, προστατευτικά topcoats. Αποτέλεσμα προϊόντος, όχι πρωτοτύπου." },
    ],
    section_manifesto: "Φτιαγμένο για τον Ανεξάρτητο Κατασκευαστή",
    manifesto_p: "Η κατασκευή ήταν πάντα εργαλείο όσων κατέχουν τις μηχανές. Αξίζει να αμφισβητηθεί.\n\nΤο Manufactor υπάρχει γιατί η πρόσβαση σε ποιοτική κατασκευή δεν πρέπει να εξαρτάται από ελάχιστες ποσότητες ή εταιρικούς λογαριασμούς. Ένα εξάρτημα ή εκατό — λαμβάνει την ίδια προσοχή.\n\nΑυτή είναι τέχνη σε τεχνικό επίπεδο. Ακριβής, σκόπιμη και ανεξάρτητη.",
    quote_title: "Αίτηση Προσφοράς",
    quote_sub: "Ανεβάστε το STL σας, επιλέξτε τις παραμέτρους και λάβετε άμεση εκτίμηση. Η τελική τιμή επιβεβαιώνεται μετά από επισκόπηση του αρχείου σας.",
    upload_label: "Ανεβάστε STL Αρχείο", upload_hint: "Σύρετε & αφήστε ή κλικ για αναζήτηση", upload_loaded: "Μοντέλο φορτώθηκε",
    mat_label: "Υλικό", layer_label: "Ύψος Στρώσης", infill_label: "Πυκνότητα / Αντοχή",
    color_label: "Χρώμα Νήματος",
    color_disclaimer: "Αυτό είναι ενδεικτικό μόνο. Θα προσπαθήσουμε να ταιριάξουμε όσο το δυνατόν καλύτερα με τα διαθέσιμα νήματά μας — το ακριβές χρώμα δεν είναι εγγυημένο.",
    infill_light: "Ελάχιστο (10%)", infill_standard: "Κανονικό (15%)", infill_strong: "Δυνατό (30%)", infill_solid: "Συμπαγές (50%)", infill_engineering: "Μηχανολογικό (80%)",
    post_label: "Μεταεπεξεργασία", post_none: "Καμία — ως εκτυπωμένο", post_vapor: "Vapor Smoothing (μόνο ABS/ASA)", post_sand: "Λείανση & Εξομάλυνση", post_paint: "Πλήρης Βαφή",
    qty_label: "Ποσότητα",
    notes_label: "Σημειώσεις", notes_placeholder: "Ανοχές, χρήση, προθεσμίες, σημειώσεις χρώματος…",
    name_label: "Ονοματεπώνυμο", email_label: "Email",
    estimate_title: "Άμεση Εκτίμηση",
    estimate_note: "Ενδεικτική τιμή — βάσει όγκου mesh. Η τελική τιμή επιβεβαιώνεται μετά από χειροκίνητη επισκόπηση.",
    btn_request: "Αίτηση Τελικής Προσφοράς", btn_sending: "Αποστολή…",
    sent_title: "Η αίτηση ελήφθη.", sent_body: "Θα επισκοπήσουμε το μοντέλο σας και θα επικοινωνήσουμε εντός 24 ωρών.",
    no_file: "Ανεβάστε STL για εκτίμηση τιμής.",
    volume_note: "Εκτ. όγκος:",
    footer_copy: "© 2025 Manufactor · Αθήνα, Ελλάδα",
  },
};

// ─── PRICING ──────────────────────────────────────────────────────────────────
// Base rate €/cm³ of material — priced for a solo professional studio
const MATERIAL_RATES = { PLA: 0.28, PETG: 0.34, ABS: 0.38, ASA: 0.42, TPU: 0.52 };
// Finer layers = more machine time = higher multiplier
const LAYER_MULT = { "0.08": 1.9, "0.10": 1.6, "0.12": 1.35, "0.16": 1.15, "0.20": 1.0, "0.24": 0.9, "0.28": 0.82 };
// Infill affects material used AND print time
const INFILL_MULT = { light: 0.65, standard: 1.0, strong: 1.5, solid: 2.1, engineering: 3.0 };
// Flat post-processing additions per piece
const POST_ADD = { none: 0, vapor: 14, sand: 20, paint: 45 };
// Minimum order floor
const MIN_ORDER = 8;

// ─── COLOUR OPTIONS ───────────────────────────────────────────────────────────
const COLORS = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "White", hex: "#f0ede8" },
  { name: "Dark Red", hex: "#8b1a1a" },
  { name: "Silver", hex: "#a0a0a0" },
  { name: "Dark Grey", hex: "#444444" },
  { name: "Natural", hex: "#e8dbb0" },
  { name: "Navy", hex: "#1a2a4a" },
  { name: "Forest Green", hex: "#2a4a2a" },
  { name: "Orange", hex: "#c85a18" },
  { name: "Yellow", hex: "#d4aa20" },
  { name: "Blue", hex: "#1a3a7a" },
  { name: "Purple", hex: "#4a1a6a" },
];

// ─── STL PARSER ───────────────────────────────────────────────────────────────
function parseSTLVolume(buffer) {
  try {
    const view = new DataView(buffer);
    const triCount = view.getUint32(80, true);
    const expectedSize = 84 + triCount * 50;
    if (buffer.byteLength === expectedSize && triCount > 0) {
      let vol = 0;
      for (let i = 0; i < triCount; i++) {
        const base = 84 + i * 50;
        const v1x = view.getFloat32(base + 12, true), v1y = view.getFloat32(base + 16, true), v1z = view.getFloat32(base + 20, true);
        const v2x = view.getFloat32(base + 24, true), v2y = view.getFloat32(base + 28, true), v2z = view.getFloat32(base + 32, true);
        const v3x = view.getFloat32(base + 36, true), v3y = view.getFloat32(base + 40, true), v3z = view.getFloat32(base + 44, true);
        vol += (v1x * (v2y * v3z - v3y * v2z) - v1y * (v2x * v3z - v3x * v2z) + v1z * (v2x * v3y - v3x * v2y));
      }
      return Math.abs(vol) / 6;
    }
    const text = new TextDecoder().decode(buffer);
    const matches = text.match(/facet normal/g);
    return matches ? matches.length * 800 : 8000;
  } catch { return 8000; }
}

// ─── PARTICLE CANVAS ─────────────────────────────────────────────────────────
// Reworked: more autonomous drift, smoother mouse interaction
function ParticleCanvas({ style }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ particles: [], mouse: { x: -9999, y: -9999 }, raf: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const state = stateRef.current;

    function resize() {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const N = 90;
    state.particles = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      // base velocity — wider range for more autonomous movement
      bvx: (Math.random() - 0.5) * 0.7,
      bvy: (Math.random() - 0.5) * 0.7,
      vx: 0, vy: 0,
      r: Math.random() * 1.8 + 0.6,
      gold: Math.random() > 0.7,
      // slow wander angle for organic feel
      wanderAngle: Math.random() * Math.PI * 2,
      wanderSpeed: (Math.random() * 0.01 + 0.004),
    }));

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      state.mouse.x = e.clientX - rect.left;
      state.mouse.y = e.clientY - rect.top;
    }
    function onMouseLeave() {
      state.mouse.x = -9999; state.mouse.y = -9999;
    }
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    function draw() {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);
      const ps = state.particles;
      const mx = state.mouse.x, my = state.mouse.y;

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        // Wander: slowly shift base velocity direction
        p.wanderAngle += p.wanderSpeed * (Math.random() - 0.48);
        p.bvx += Math.cos(p.wanderAngle) * 0.012;
        p.bvy += Math.sin(p.wanderAngle) * 0.012;
        // Clamp base speed
        const bspd = Math.sqrt(p.bvx * p.bvx + p.bvy * p.bvy);
        if (bspd > 0.8) { p.bvx *= 0.8 / bspd; p.bvy *= 0.8 / bspd; }

        // Mouse influence: smooth repulsion within radius
        const dx = p.x - mx, dy = p.y - my;
        const dist2 = dx * dx + dy * dy;
        const radius = 140;
        if (dist2 < radius * radius && dist2 > 0.01) {
          const dist = Math.sqrt(dist2);
          const force = Math.pow((radius - dist) / radius, 2) * 1.4;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Combine and damp
        p.vx = (p.vx + p.bvx) * 0.94;
        p.vy = (p.vy + p.bvy) * 0.94;
        p.x += p.vx; p.y += p.vy;

        // Wrap edges
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? "rgba(197,160,80,0.75)" : "rgba(170,35,35,0.6)";
        ctx.fill();

        // Connect nearby
        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j];
          const ex = p.x - q.x, ey = p.y - q.y;
          const ed2 = ex * ex + ey * ey;
          if (ed2 < 130 * 130) {
            const ed = Math.sqrt(ed2);
            const alpha = (1 - ed / 130) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = (p.gold || q.gold) ? `rgba(197,160,80,${alpha})` : `rgba(160,38,38,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      state.raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(state.raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...style }}
    />
  );
}

// ─── TYPEWRITER ───────────────────────────────────────────────────────────────
function Typewriter({ slogans }) {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    const slogan = slogans[idx % slogans.length];
    let t;
    if (phase === "typing") {
      if (display.length < slogan.length) {
        t = setTimeout(() => setDisplay(slogan.slice(0, display.length + 1)), 52);
      } else {
        t = setTimeout(() => setPhase("pause"), 2400);
      }
    } else if (phase === "pause") {
      t = setTimeout(() => setPhase("erasing"), 200);
    } else {
      if (display.length > 0) {
        t = setTimeout(() => setDisplay(d => d.slice(0, -1)), 26);
      } else {
        setIdx(i => i + 1);
        setPhase("typing");
      }
    }
    return () => clearTimeout(t);
  }, [display, phase, idx, slogans]);

  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(0.82rem,1.4vw,1rem)", letterSpacing: "0.05em", color: "var(--gold)" }}>
      {display}
      <span style={{ display: "inline-block", width: "2px", animation: "blink 1s step-end infinite" }}>_</span>
    </span>
  );
}

// ─── STL VIEWER WITH ORBIT CONTROL ───────────────────────────────────────────
function STLViewer({ buffer }) {
  const mountRef = useRef(null);
  const glRef = useRef(null);

  useEffect(() => {
    if (!buffer || !window.THREE) return;
    const THREE = window.THREE;
    const el = mountRef.current;
    if (!el) return;

    // Cleanup
    if (glRef.current) { glRef.current.renderer.dispose(); el.innerHTML = ""; }

    const W = el.offsetWidth, H = el.offsetHeight || 280;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 10000);

    // Parse binary STL
    const geom = new THREE.BufferGeometry();
    const view = new DataView(buffer);
    const triCount = view.getUint32(80, true);
    if (triCount > 0 && buffer.byteLength === 84 + triCount * 50) {
      const pos = new Float32Array(triCount * 9);
      for (let i = 0; i < triCount; i++) {
        const b = 84 + i * 50;
        for (let v = 0; v < 3; v++) {
          const vb = b + 12 + v * 12;
          pos[i * 9 + v * 3] = view.getFloat32(vb, true);
          pos[i * 9 + v * 3 + 1] = view.getFloat32(vb + 4, true);
          pos[i * 9 + v * 3 + 2] = view.getFloat32(vb + 8, true);
        }
      }
      geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    }
    geom.computeVertexNormals();
    geom.center();

    const mat = new THREE.MeshStandardMaterial({ color: 0x8b1a1a, roughness: 0.55, metalness: 0.35 });
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);

    // Fit camera
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fitDist = (maxDim / 2) / Math.tan((45 / 2) * Math.PI / 180) * 1.5;
    camera.position.set(0, fitDist * 0.4, fitDist);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const d1 = new THREE.DirectionalLight(0xffc880, 1.3); d1.position.set(1, 2, 1); scene.add(d1);
    const d2 = new THREE.DirectionalLight(0x8b2020, 0.5); d2.position.set(-1, -0.5, -1); scene.add(d2);

    // ── Orbit state ──
    let autoSpin = true;
    let isDragging = false;
    let lastX = 0, lastY = 0;
    // Spherical coords for orbit
    let theta = 0;    // horizontal angle
    let phi = 0.3;    // vertical angle (radians from horizon)
    const spinSpeed = 0.008;
    const sensitivity = 0.008;
    // Velocity for inertia when dragging ends
    let velTheta = 0, velPhi = 0;

    function updateCamera() {
      const r = fitDist;
      camera.position.set(
        r * Math.cos(phi) * Math.sin(theta),
        r * Math.sin(phi),
        r * Math.cos(phi) * Math.cos(theta)
      );
      camera.lookAt(0, 0, 0);
    }

    // Pointer events
    const dom = renderer.domElement;
    dom.style.cursor = "grab";

    function onPointerDown(e) {
      isDragging = true; autoSpin = false;
      lastX = e.clientX; lastY = e.clientY;
      velTheta = 0; velPhi = 0;
      dom.style.cursor = "grabbing";
      dom.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      velTheta = -dx * sensitivity;
      velPhi = -dy * sensitivity;
      theta += velTheta;
      phi = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, phi + velPhi));
      lastX = e.clientX; lastY = e.clientY;
    }
    function onPointerUp() {
      isDragging = false;
      dom.style.cursor = "grab";
      // Resume auto-spin from current angle after brief inertia
      setTimeout(() => { autoSpin = true; }, 1800);
    }
    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    dom.addEventListener("pointerup", onPointerUp);
    dom.addEventListener("pointercancel", onPointerUp);

    let raf;
    function animate() {
      raf = requestAnimationFrame(animate);
      if (autoSpin) {
        theta += spinSpeed;
      } else if (!isDragging) {
        // inertia decay
        velTheta *= 0.92; velPhi *= 0.92;
        theta += velTheta;
        phi = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, phi + velPhi));
      }
      updateCamera();
      renderer.render(scene, camera);
    }
    animate();
    glRef.current = { renderer };

    return () => {
      cancelAnimationFrame(raf);
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
    };
  }, [buffer]);

  return (
    <div ref={mountRef} style={{ width: "100%", height: "280px", borderRadius: "2px", overflow: "hidden", background: "rgba(12,4,4,0.7)", border: "1px solid rgba(197,160,80,0.15)" }}>
      {!buffer && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "rgba(232,221,216,0.2)", letterSpacing: "0.12em" }}>
          3D PREVIEW
        </div>
      )}
    </div>
  );
}

// ─── COLOUR PICKER ───────────────────────────────────────────────────────────
function ColourPicker({ value, onChange, label, disclaimer }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", marginBottom: "10px" }}>
        {COLORS.map(c => (
          <button
            key={c.name}
            title={c.name}
            onClick={() => onChange(c)}
            style={{
              width: "100%", aspectRatio: "1", border: value?.name === c.name ? "2px solid var(--gold)" : "1px solid rgba(197,160,80,0.2)",
              background: c.hex, cursor: "pointer", borderRadius: "1px",
              boxShadow: value?.name === c.name ? "0 0 0 1px rgba(197,160,80,0.5)" : "none",
              transition: "all 0.15s",
            }}
          />
        ))}
      </div>
      {value && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{ width: 14, height: 14, background: value.hex, border: "1px solid rgba(197,160,80,0.3)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-dim)", letterSpacing: "0.08em" }}>{value.name}</span>
        </div>
      )}
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem", color: "var(--text-dimmer)", letterSpacing: "0.06em", lineHeight: 1.6, fontStyle: "italic" }}>
        {disclaimer}
      </p>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function ManufactorApp() {
  const [lang, setLang] = useState(() => {
    const nav = (navigator.language || "").toLowerCase();
    return nav.startsWith("el") ? "gr" : "en";
  });
  const [page, setPage] = useState("home");
  const [threeLoaded, setThreeLoaded] = useState(false);

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const t = T[lang];

  useEffect(() => {
    if (window.THREE) { setThreeLoaded(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.onload = () => setThreeLoaded(true);
    document.head.appendChild(s);
  }, []);

  // Price calc
  const unitPrice = volume > 0
    ? Math.max(MIN_ORDER, (volume / 1000) * MATERIAL_RATES[material] * LAYER_MULT[layer] * INFILL_MULT[infill] + POST_ADD[post])
    : null;
  const totalPrice = unitPrice !== null ? unitPrice * qty : null;

  function handleFile(file) {
    if (!file) return;
    setStlName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const buf = e.target.result;
      setStlBuffer(buf);
      setVolume(Math.round(parseSTLVolume(buf)));
    };
    reader.readAsArrayBuffer(file);
  }

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  async function handleSubmit() {
    if (!email || !name) return;
    setSending(true);
    // ── In production: POST to Supabase or email API here ──
    // Example: await fetch('/api/quote', { method: 'POST', body: JSON.stringify({...}) })
    await new Promise(r => setTimeout(r, 1600));
    setSending(false);
    setSent(true);
  }

  const gl = "1px solid rgba(197,160,80,0.28)";  // gold line shorthand

  return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--bg)", color: "var(--text)", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Barlow+Condensed:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg: #0c0404;
          --bg2: #110606;
          --bg3: #160808;
          --red: #8b1a1a;
          --red-bright: #c0272d;
          --gold: #c5a050;
          --gold-dim: rgba(197,160,80,0.22);
          --text: #ede4df;
          --text-dim: rgba(237,228,223,0.55);
          --text-dimmer: rgba(237,228,223,0.28);
          --font-display: 'Bebas Neue', sans-serif;
          --font-cond: 'Barlow Condensed', sans-serif;
          --font-body: 'Barlow', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
        @keyframes du1{animation-delay:.0s} @keyframes du2{animation-delay:.12s} @keyframes du3{animation-delay:.24s} @keyframes du4{animation-delay:.38s}
        .fu { opacity:0; animation: fadeUp .65s ease forwards; }
        .fu1 { animation-delay: 0s; }
        .fu2 { animation-delay: .13s; }
        .fu3 { animation-delay: .26s; }
        .fu4 { animation-delay: .42s; }
        ::selection { background: rgba(197,160,80,0.22); }
        html { scroll-behavior: smooth; }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(20px,5vw,72px); height: 60px;
          background: rgba(12,4,4,0.93); backdrop-filter: blur(14px);
          border-bottom: ${gl};
        }
        .nav-logo {
          font-family: var(--font-display); font-size: 1.55rem;
          letter-spacing: .14em; color: var(--text); cursor: pointer; user-select: none;
        }
        .nav-logo em { color: var(--red-bright); font-style: normal; }
        .nav-right { display:flex; align-items:center; gap:28px; }
        .nav-link {
          font-family: var(--font-cond); font-size: .82rem; letter-spacing: .12em;
          text-transform: uppercase; color: var(--text-dim); background: none; border: none; cursor: pointer;
          transition: color .2s; padding-bottom: 2px;
        }
        .nav-link:hover { color: var(--text); }
        .nav-link.act { color: var(--text); border-bottom: 1px solid var(--gold); }
        .lang-toggle { display:flex; border: ${gl}; border-radius:1px; overflow:hidden; }
        .lang-btn {
          font-family: var(--font-mono); font-size: .67rem; letter-spacing: .08em;
          padding: 4px 9px; background:none; border:none; color:var(--text-dimmer); cursor:pointer; transition:all .18s;
        }
        .lang-btn.act { background:rgba(197,160,80,.12); color:var(--gold); }
        .lang-sep { width:1px; background:rgba(197,160,80,.25); }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 9px;
          font-family: var(--font-cond); font-size: .88rem; letter-spacing: .14em; text-transform: uppercase;
          padding: 13px 30px; background: var(--red); color: var(--text); border: none; cursor: pointer;
          transition: background .22s, transform .18s; position: relative; overflow: hidden;
        }
        .btn-primary:hover { background: var(--red-bright); transform: translateY(-1px); }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 9px;
          font-family: var(--font-cond); font-size: .88rem; letter-spacing: .14em; text-transform: uppercase;
          padding: 12px 30px; background: transparent; color: var(--text-dim);
          border: ${gl}; cursor: pointer; transition: all .22s;
        }
        .btn-secondary:hover { color: var(--text); border-color: rgba(197,160,80,.65); }

        /* ── HERO ── */
        .hero {
          position: relative; min-height: 100vh; overflow: hidden;
          display: flex; align-items: center;
          padding: 80px clamp(20px,5vw,72px) 60px;
        }
        .hero-inner {
          position: relative; z-index: 2; width: 100%; max-width: 1320px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
        }
        .hero-left { display: flex; flex-direction: column; gap: 24px; }
        .hero-tag {
          font-family: var(--font-mono); font-size: .72rem; letter-spacing: .15em; color: var(--gold); text-transform: uppercase;
          display: flex; align-items: center; gap: 12px;
        }
        .hero-tag::before { content:''; display:block; width:28px; height:1px; background:var(--gold); }
        .hero-hl {
          font-family: var(--font-display); font-size: clamp(2.8rem,5.5vw,5.2rem);
          line-height: .96; letter-spacing: .03em; color: var(--text);
        }
        .slogan-wrap { min-height: 26px; }
        .hero-sub { font-size: clamp(.88rem,1.3vw,1rem); line-height: 1.8; color: var(--text-dim); font-weight:300; max-width:480px; }
        .hero-ctas { display:flex; gap:14px; flex-wrap:wrap; }
        .hero-right { display:flex; align-items:center; justify-content:center; }
        .printer-box {
          width:100%; max-width:460px; aspect-ratio:1; border:${gl}; position:relative;
          display:flex; align-items:center; justify-content:center; flex-direction:column; gap:10px;
          background: linear-gradient(135deg,rgba(139,26,26,.07),transparent 65%);
        }
        .corner { position:absolute; width:18px; height:18px; }
        .c-tl{top:-1px;left:-1px;border-top:2px solid var(--gold);border-left:2px solid var(--gold);}
        .c-tr{top:-1px;right:-1px;border-top:2px solid var(--gold);border-right:2px solid var(--gold);}
        .c-bl{bottom:-1px;left:-1px;border-bottom:2px solid var(--gold);border-left:2px solid var(--gold);}
        .c-br{bottom:-1px;right:-1px;border-bottom:2px solid var(--gold);border-right:2px solid var(--gold);}
        .printer-inner { position:absolute; inset:16px; border:1px solid rgba(197,160,80,.08); }
        .ph-label { font-family:var(--font-mono); font-size:.66rem; letter-spacing:.13em; color:var(--text-dimmer); text-align:center; text-transform:uppercase; }

        /* ── SECTIONS ── */
        section { padding: clamp(56px,7vw,110px) clamp(20px,5vw,72px); position:relative; }
        .si { max-width:1160px; margin:0 auto; }
        .sec-label {
          font-family: var(--font-mono); font-size:.68rem; letter-spacing:.18em; color:var(--gold); text-transform:uppercase;
          margin-bottom:14px; display:flex; align-items:center; gap:14px;
        }
        .sec-label::after { content:''; width:40px; height:1px; background:rgba(197,160,80,.35); }
        .sec-title { font-family:var(--font-display); font-size:clamp(2rem,3.8vw,3.2rem); letter-spacing:.04em; color:var(--text); margin-bottom:28px; line-height:1; }
        hr.div { height:1px; background:rgba(197,160,80,.22); border:none; margin:0; }

        /* ── CARDS ── */
        .cards3 {
          display: grid; grid-template-columns: repeat(3,1fr);
          border: ${gl}; margin-top:44px;
        }
        .card3 {
          padding:36px 28px; background:var(--bg2);
          border-right: ${gl};
          transition:background .22s;
        }
        .card3:last-child { border-right:none; }
        .card3:hover { background:rgba(139,26,26,.09); }
        .card-num { font-family:var(--font-mono); font-size:.62rem; color:var(--gold); letter-spacing:.12em; margin-bottom:18px; }
        .card-t { font-family:var(--font-cond); font-size:1.1rem; letter-spacing:.07em; color:var(--text); margin-bottom:12px; text-transform:uppercase; }
        .card-b { font-size:.86rem; line-height:1.72; color:var(--text-dim); font-weight:300; }

        /* ── FINISHING ROW ── */
        .finishing-list { margin-top:36px; border:${gl}; }
        .fin-row {
          display:grid; grid-template-columns:200px 1fr; align-items:start;
          padding:22px 28px; border-bottom:${gl}; gap:24px; transition:background .2s;
        }
        .fin-row:last-child { border-bottom:none; }
        .fin-row:hover { background:rgba(139,26,26,.07); }
        .fin-label { font-family:var(--font-cond); font-size:1rem; letter-spacing:.07em; color:var(--text); text-transform:uppercase; }
        .fin-desc { font-size:.86rem; line-height:1.7; color:var(--text-dim); font-weight:300; }

        /* ── MANIFESTO ── */
        .manifesto-txt {
          font-family:var(--font-cond); font-size:clamp(1rem,1.9vw,1.3rem);
          line-height:2; color:var(--text-dim); white-space:pre-line; letter-spacing:.02em;
        }

        /* ── QUOTE PAGE ── */
        .quote-wrap { padding-top:60px; min-height:100vh; background:var(--bg); position:relative; overflow:hidden; }
        .quote-header { padding:52px clamp(20px,5vw,72px) 36px; border-bottom:${gl}; position:relative; z-index:2; }
        .q-grid { display:grid; grid-template-columns:1fr 360px; position:relative; z-index:2; }
        .q-form { padding:44px clamp(20px,5vw,72px); border-right:${gl}; }
        .q-sidebar { padding:44px 36px; position:sticky; top:60px; height:fit-content; }

        /* ── FORM ── */
        .form-group { margin-bottom:24px; }
        label { display:block; font-family:var(--font-mono); font-size:.67rem; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:9px; }
        .fi, .fs, .fta {
          width:100%; background:rgba(255,255,255,.025); border:${gl};
          color:var(--text); font-family:var(--font-body); font-size:.88rem;
          padding:11px 14px; outline:none; transition:border-color .2s; border-radius:0; appearance:none;
        }
        .fi:focus,.fs:focus,.fta:focus { border-color:rgba(197,160,80,.6); background:rgba(197,160,80,.03); }
        .fs { cursor:pointer; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%23c5a050' stroke-width='1.4' fill='none'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:36px; background-color:rgba(12,4,4,.96); }
        option { background:#160808; color:var(--text); }
        .fta { min-height:90px; resize:vertical; line-height:1.6; }

        .upload-zone {
          border:1px dashed rgba(197,160,80,.32); padding:32px;
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
          cursor:pointer; transition:all .2s; text-align:center; background:rgba(255,255,255,.018);
        }
        .upload-zone:hover,.upload-zone.drag { border-color:rgba(197,160,80,.65); background:rgba(197,160,80,.04); }
        .upload-zone.loaded { border-color:rgba(139,26,26,.55); border-style:solid; }
        .uph { font-family:var(--font-mono); font-size:.65rem; letter-spacing:.1em; color:var(--text-dimmer); text-transform:uppercase; }
        .upn { font-family:var(--font-cond); font-size:.9rem; color:var(--text); letter-spacing:.05em; }

        .est-box { border:${gl}; padding:28px; background:rgba(139,26,26,.06); }
        .est-label { font-family:var(--font-mono); font-size:.67rem; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:18px; }
        .est-price { font-family:var(--font-display); font-size:3rem; letter-spacing:.04em; color:var(--text); line-height:1; }
        .est-price span { font-size:1.3rem; color:var(--text-dim); margin-right:3px; }
        .est-range { font-family:var(--font-mono); font-size:.65rem; color:var(--text-dimmer); margin-top:6px; letter-spacing:.07em; }
        .est-note { font-size:.76rem; color:var(--text-dimmer); margin-top:14px; line-height:1.65; font-style:italic; }
        .bdown { margin-top:18px; border-top:${gl}; padding-top:14px; display:flex; flex-direction:column; gap:7px; }
        .brow { display:flex; justify-content:space-between; font-size:.78rem; color:var(--text-dim); }
        .brow span:last-child { font-family:var(--font-mono); color:var(--text); }
        .no-file { font-family:var(--font-mono); font-size:.72rem; color:var(--text-dimmer); letter-spacing:.08em; text-align:center; padding:22px 0; }

        .qty-row { display:flex; align-items:center; border:${gl}; width:fit-content; }
        .qty-btn { width:38px; height:38px; background:none; border:none; color:var(--text); font-size:1.15rem; cursor:pointer; transition:background .18s; font-family:var(--font-cond); }
        .qty-btn:hover { background:rgba(197,160,80,.08); }
        .qty-v { min-width:44px; height:38px; display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-size:.88rem; color:var(--text); border-left:${gl}; border-right:${gl}; }

        .sent-box { text-align:center; padding:72px 40px; }
        .sent-icon { color:var(--gold); margin-bottom:20px; }
        .sent-t { font-family:var(--font-display); font-size:2rem; letter-spacing:.06em; color:var(--text); margin-bottom:10px; }
        .sent-b { font-size:.9rem; color:var(--text-dim); line-height:1.75; }

        footer { border-top:${gl}; padding:28px clamp(20px,5vw,72px); display:flex; align-items:center; justify-content:space-between; }
        .f-logo { font-family:var(--font-display); font-size:1.15rem; letter-spacing:.12em; color:var(--text-dimmer); }
        .f-copy { font-family:var(--font-mono); font-size:.63rem; letter-spacing:.09em; color:var(--text-dimmer); }

        @media(max-width:900px){
          .hero-inner{grid-template-columns:1fr;} .hero-right{display:none;}
          .q-grid{grid-template-columns:1fr;} .q-sidebar{position:static;border-right:none;border-top:${gl};}
          .cards3{grid-template-columns:1fr;}
          .card3{border-right:none;border-bottom:${gl};}
          .card3:last-child{border-bottom:none;}
          .fin-row{grid-template-columns:1fr;}
        }
        @media(max-width:600px){
          .nav-right .nav-link{display:none;}
          .nav-right .nav-link.quote-link{display:block;}
        }
      `}</style>

      {/* NAV */}
      <nav>
        <div className="nav-logo" onClick={() => setPage("home")}>MAN<em>U</em>FACTOR</div>
        <div className="nav-right">
          <button className={`nav-link ${page === "home" ? "act" : ""}`} onClick={() => setPage("home")}>{t.nav_home}</button>
          <button className={`nav-link quote-link ${page === "quote" ? "act" : ""}`} onClick={() => setPage("quote")}>{t.nav_quote}</button>
          <div className="lang-toggle">
            <button className={`lang-btn ${lang === "en" ? "act" : ""}`} onClick={() => setLang("en")}>EN</button>
            <div className="lang-sep" style={{ width: 1, alignSelf: "stretch" }} />
            <button className={`lang-btn ${lang === "gr" ? "act" : ""}`} onClick={() => setLang("gr")}>ΕΛ</button>
          </div>
        </div>
      </nav>

      {page === "home" ? (
        <>
          {/* ── HERO ── */}
          <section className="hero">
            <ParticleCanvas style={{ zIndex: 0 }} />
            <div className="hero-inner">
              <div className="hero-left">
                <div className="hero-tag fu fu1">{t.hero_tag}</div>
                <h1 className="hero-hl fu fu2">{t.hero_headline}</h1>
                <div className="slogan-wrap fu fu3"><Typewriter slogans={t.slogans} /></div>
                <p className="hero-sub fu fu3">{t.hero_sub}</p>
                <div className="hero-ctas fu fu4">
                  <button className="btn-primary" onClick={() => setPage("quote")}>
                    {t.cta_quote}
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5h10M8.5 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button className="btn-secondary" onClick={() => document.getElementById("what")?.scrollIntoView({ behavior: "smooth" })}>
                    {t.cta_learn}
                  </button>
                </div>
              </div>
              <div className="hero-right fu fu4">
                <div className="printer-box">
                  <div className="corner c-tl"/><div className="corner c-tr"/>
                  <div className="corner c-bl"/><div className="corner c-br"/>
                  <div className="printer-inner"/>
                  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ opacity: .1 }}>
                    <rect x="16" y="28" width="40" height="26" rx="2" stroke="var(--text)" strokeWidth="1.4"/>
                    <rect x="24" y="20" width="24" height="10" rx="1" stroke="var(--text)" strokeWidth="1.4"/>
                    <line x1="16" y1="44" x2="56" y2="44" stroke="var(--text)" strokeWidth="1"/>
                    <circle cx="48" cy="36" r="3" fill="var(--text)"/>
                    <rect x="28" y="54" width="16" height="8" stroke="var(--text)" strokeWidth="1.4"/>
                    <line x1="36" y1="20" x2="36" y2="12" stroke="var(--text)" strokeWidth="1.4"/>
                    <line x1="24" y1="12" x2="48" y2="12" stroke="var(--text)" strokeWidth="1.4"/>
                  </svg>
                  <p className="ph-label">Manufactor MK-I<br/><span style={{color:"var(--red-bright)",opacity:.5}}>Render coming soon</span></p>
                </div>
              </div>
            </div>
          </section>

          <hr className="div"/>

          {/* ── WHAT WE DO ── */}
          <section id="what" style={{ background: "var(--bg2)" }}>
            <div className="si">
              <div className="sec-label">01</div>
              <h2 className="sec-title">{t.section_what}</h2>
              <p style={{ fontSize: ".95rem", lineHeight: 1.82, color: "var(--text-dim)", maxWidth: 620, fontWeight: 300 }}>{t.what_p}</p>
              <div className="cards3">
                {[
                  { n: "01", title: t.card_print_title, body: t.card_print_body },
                  { n: "02", title: t.card_finish_title, body: t.card_finish_body },
                  { n: "03", title: t.card_rapid_title, body: t.card_rapid_body },
                ].map(c => (
                  <div className="card3" key={c.n}>
                    <div className="card-num">— {c.n}</div>
                    <div className="card-t">{c.title}</div>
                    <div className="card-b">{c.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <hr className="div"/>

          {/* ── FINISHING ── */}
          <section>
            <div className="si">
              <div className="sec-label">02</div>
              <h2 className="sec-title">Finishing Options</h2>
              <p style={{ fontSize: ".95rem", lineHeight: 1.8, color: "var(--text-dim)", fontWeight: 300, maxWidth: 560, marginBottom: 0 }}>{t.finishing_intro}</p>
              <div className="finishing-list">
                {t.finishing_items.map((fi, i) => (
                  <div className="fin-row" key={i}>
                    <div className="fin-label">{fi.label}</div>
                    <div className="fin-desc">{fi.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <hr className="div"/>

          {/* ── MANIFESTO ── */}
          <section style={{ background: "var(--bg3)", borderTop: "1px solid rgba(197,160,80,0.22)", borderBottom: "1px solid rgba(197,160,80,0.22)" }}>
            <div className="si" style={{ maxWidth: 740 }}>
              <div className="sec-label">03</div>
              <h2 className="sec-title">{t.section_manifesto}</h2>
              <p className="manifesto-txt">{t.manifesto_p}</p>
              <div style={{ marginTop: 40 }}>
                <button className="btn-primary" onClick={() => setPage("quote")}>
                  {t.cta_quote}
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5h10M8.5 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          </section>

          <footer>
            <div className="f-logo">MANUFACTOR</div>
            <div className="f-copy">{t.footer_copy}</div>
          </footer>
        </>
      ) : (
        /* ── QUOTE PAGE ── */
        <div className="quote-wrap">
          {/* Subtle particles in bg */}
          <ParticleCanvas style={{ zIndex: 0, opacity: 0.45 }} />

          <div className="quote-header">
            <div className="sec-label">Quote Request</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem,3.6vw,2.8rem)", letterSpacing: ".04em", marginBottom: 10 }}>{t.quote_title}</h1>
            <p style={{ color: "var(--text-dim)", fontSize: ".88rem", maxWidth: 520, lineHeight: 1.75, fontWeight: 300 }}>{t.quote_sub}</p>
          </div>

          {sent ? (
            <div className="sent-box">
              <div className="sent-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5"/><path d="M14 24l7 7 13-13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="sent-t">{t.sent_title}</div>
              <p className="sent-b">{t.sent_body}</p>
              <div style={{ marginTop: 30 }}>
                <button className="btn-secondary" onClick={() => { setSent(false); setStlBuffer(null); setStlName(""); setVolume(0); }}>
                  New Request
                </button>
              </div>
            </div>
          ) : (
            <div className="q-grid">
              {/* ── FORM COLUMN ── */}
              <div className="q-form">

                {/* Upload */}
                <div className="form-group">
                  <label>{t.upload_label}</label>
                  <div
                    className={`upload-zone${dragOver ? " drag" : ""}${stlBuffer ? " loaded" : ""}`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                  >
                    {stlBuffer ? (
                      <>
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 2v12M8 10l5 5 5-5" stroke="var(--red-bright)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 19v2a2 2 0 002 2h16a2 2 0 002-2v-2" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round"/></svg>
                        <div className="upn">{stlName}</div>
                        <div className="uph">{t.upload_loaded} · {(stlBuffer.byteLength / 1024).toFixed(0)} KB</div>
                      </>
                    ) : (
                      <>
                        <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect x="3" y="7" width="24" height="18" rx="2" stroke="rgba(197,160,80,0.45)" strokeWidth="1.4"/><path d="M15 20V11M10 16l5-5 5 5" stroke="rgba(197,160,80,0.65)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <div className="upn" style={{ color: "var(--text-dim)" }}>.STL</div>
                        <div className="uph">{t.upload_hint}</div>
                      </>
                    )}
                    <input ref={fileRef} type="file" accept=".stl" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
                  </div>
                </div>

                {/* 3D Viewer */}
                {threeLoaded && (
                  <div className="form-group">
                    <label style={{ marginBottom: 6 }}>3D Preview {stlBuffer && <span style={{ color: "var(--text-dimmer)", fontWeight: 400 }}>— drag to rotate</span>}</label>
                    <STLViewer buffer={stlBuffer} />
                  </div>
                )}

                {/* Material */}
                <div className="form-group">
                  <label>{t.mat_label}</label>
                  <select className="fs" value={material} onChange={e => setMaterial(e.target.value)}>
                    {Object.keys(MATERIAL_RATES).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                {/* Colour */}
                <ColourPicker value={color} onChange={setColor} label={t.color_label} disclaimer={t.color_disclaimer} />

                {/* Layer height */}
                <div className="form-group">
                  <label>{t.layer_label}</label>
                  <select className="fs" value={layer} onChange={e => setLayer(e.target.value)}>
                    <option value="0.08">0.08 mm — Ultrafine</option>
                    <option value="0.10">0.10 mm — Superfine</option>
                    <option value="0.12">0.12 mm — Fine</option>
                    <option value="0.16">0.16 mm — Optimal</option>
                    <option value="0.20">0.20 mm — Standard</option>
                    <option value="0.24">0.24 mm — Draft</option>
                    <option value="0.28">0.28 mm — Superdraft</option>
                  </select>
                </div>

                {/* Infill */}
                <div className="form-group">
                  <label>{t.infill_label}</label>
                  <select className="fs" value={infill} onChange={e => setInfill(e.target.value)}>
                    <option value="light">{t.infill_light}</option>
                    <option value="standard">{t.infill_standard}</option>
                    <option value="strong">{t.infill_strong}</option>
                    <option value="solid">{t.infill_solid}</option>
                    <option value="engineering">{t.infill_engineering}</option>
                  </select>
                </div>

                {/* Post-processing */}
                <div className="form-group">
                  <label>{t.post_label}</label>
                  <select className="fs" value={post} onChange={e => setPost(e.target.value)}>
                    <option value="none">{t.post_none}</option>
                    <option value="vapor">{t.post_vapor}</option>
                    <option value="sand">{t.post_sand}</option>
                    <option value="paint">{t.post_paint}</option>
                  </select>
                </div>

                {/* Quantity */}
                <div className="form-group">
                  <label>{t.qty_label}</label>
                  <div className="qty-row">
                    <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <div className="qty-v">{qty}</div>
                    <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
                  </div>
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label>{t.notes_label}</label>
                  <textarea className="fta" value={notes} onChange={e => setNotes(e.target.value)} placeholder={t.notes_placeholder} />
                </div>

                <hr className="div" style={{ margin: "4px 0 24px" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>{t.name_label}</label>
                    <input className="fi" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>{t.email_label}</label>
                    <input className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>

                <div style={{ marginTop: 28 }}>
                  <button
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center", opacity: (!name || !email) ? 0.5 : 1 }}
                    onClick={handleSubmit}
                    disabled={sending || !name || !email}
                  >
                    {sending ? t.btn_sending : t.btn_request}
                    {!sending && <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5h10M8.5 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                </div>
              </div>

              {/* ── SIDEBAR ── */}
              <div className="q-sidebar">
                <div className="est-box">
                  <div className="est-label">{t.estimate_title}</div>
                  {totalPrice !== null ? (
                    <>
                      <div className="est-price"><span>€</span>{totalPrice.toFixed(2)}</div>
                      {qty > 1 && <div className="est-range">€{unitPrice.toFixed(2)} / unit × {qty}</div>}
                      <div className="est-range" style={{ marginTop: 4 }}>
                        Typical range: €{(totalPrice * 0.88).toFixed(2)} – €{(totalPrice * 1.28).toFixed(2)}
                      </div>
                      <div className="bdown">
                        <div className="brow"><span>{t.volume_note}</span><span>{(volume / 1000).toFixed(2)} cm³</span></div>
                        <div className="brow"><span>Material</span><span>{material}</span></div>
                        <div className="brow"><span>Layer</span><span>{layer} mm</span></div>
                        <div className="brow"><span>Infill</span><span>{infill}</span></div>
                        {color && <div className="brow"><span>Colour ref.</span><span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-block", width: 10, height: 10, background: color.hex, border: "1px solid rgba(197,160,80,0.3)" }} />{color.name}</span></div>}
                        {POST_ADD[post] > 0 && <div className="brow"><span>Post-process</span><span>+€{POST_ADD[post].toFixed(2)}</span></div>}
                      </div>
                    </>
                  ) : (
                    <div className="no-file">{t.no_file}</div>
                  )}
                  <p className="est-note">{t.estimate_note}</p>
                </div>

                <div style={{ marginTop: 22, padding: "18px 0", borderTop: "1px solid rgba(197,160,80,0.2)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: ".64rem", letterSpacing: ".1em", color: "var(--text-dimmer)", lineHeight: 2.1 }}>
                    MANUFACTOR STUDIO<br />
                    Athens, Greece<br />
                    Response within 24h
                  </div>
                </div>
              </div>
            </div>
          )}

          <footer style={{ position: "relative", zIndex: 2 }}>
            <div className="f-logo">MANUFACTOR</div>
            <div className="f-copy">{t.footer_copy}</div>
          </footer>
        </div>
      )}
    </div>
  );
}
