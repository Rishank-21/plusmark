/**
 * Product copy transcribed from Plusmark's printed catalogue ("Inside page").
 * Only fields the catalogue actually states are overridden; anything it does
 * not mention keeps the value already in catalog.json.
 */
export interface CatalogCopy {
  /** About section, in the catalogue's own terms. */
  about: string[];
  /** "What it is built from" bullets, in the catalogue's own terms. */
  built: string[];
  usage: string;
  surface?: string;
  frame?: string;
  /** null clears a value the catalogue does not support. */
  corners?: string | null;
}

export const CATALOG_COPY: Record<string, CatalogCopy> = {
  /* ---------------------------- White boards ---------------------------- */
  "metallic-premium-white-board": {
    about: [
      "The Metallic Premium White Board uses high-quality, durable materials with a High Gloss Marker Grade HPL Sheet. Heavy-duty framing with Signature Dual-Tone Corners gives it a solid, professional build.",
      "The ultra-smooth, high-gloss surface is made for effortless writing and easy erasing. It suits high-end offices, educational institutions and professional environments, and is extremely long-lasting and highly resistant to wear and tear."
    ],
    built: [
      "Material — High-quality, durable materials with High Gloss Marker Grade HPL Sheet",
      "Design — Heavy-duty framing with Signature Dual-Tone Corners",
      "Surface — Ultra-smooth, high-gloss surface for effortless writing and easy erasing",
      "Durability — Extremely long-lasting and highly resistant to wear and tear"
    ],
    usage: "High-end offices, educational institutions and professional environments",
    surface: "High Gloss Marker Grade HPL Sheet"
  },
  "eco-premium-white-board": {
    about: [
      "The Eco Premium White Board pairs premium-grade materials with a High Gloss Marker Grade HPL Sheet for enhanced durability. Its ABS Dual-Tone Corner Design adds strength and a refined appearance.",
      "The smooth, high-gloss surface gives a seamless writing experience. It is made for schools, institutes and corporate environments, and is reliable and long-lasting for daily institutional use."
    ],
    built: [
      "Material — Premium-grade materials with High Gloss Marker Grade HPL Sheet",
      "Design — ABS Dual-Tone Corner Design for added strength and refined appearance",
      "Surface — Smooth, high-gloss surface for a seamless writing experience",
      "Durability — Reliable and long-lasting for daily institutional use"
    ],
    usage: "Schools, institutes and corporate environments",
    surface: "High Gloss Marker Grade HPL Sheet"
  },
  "deluxe-standard-white-board": {
    about: [
      "The Deluxe Standard White Board uses regular quality materials with Electroplated Chrome Corners for a clean, professional look.",
      "Its High Gloss Melamine Writing Surface is smooth and easy to clean. It suits standard offices, classrooms and coaching centres, and is dependable for regular use."
    ],
    built: [
      "Material — Regular quality materials",
      "Design — Electroplated Chrome Corners for a clean, professional look",
      "Surface — High Gloss Melamine Writing Surface, smooth and easy to clean",
      "Durability — Dependable for regular use"
    ],
    usage: "Standard offices, classrooms and coaching centres",
    surface: "High Gloss Melamine Writing Surface"
  },
  "eco-regular-white-board": {
    about: [
      "The Eco Regular White Board is a cost-effective board built from regular materials. Its lightweight frame with standard plastic corners is easy to handle and install.",
      "The High Gloss Melamine Writing Surface suits basic writing needs. It is ideal for home offices, tuition classes and small classrooms, and is good for light, budget-friendly use."
    ],
    built: [
      "Material — Cost-effective, regular materials",
      "Design — Lightweight frame with standard plastic corners, easy to handle and install",
      "Surface — High Gloss Melamine Writing Surface suitable for basic writing needs",
      "Durability — Good for light use and budget-friendly applications"
    ],
    usage: "Home offices, tuition classes and small classrooms",
    surface: "High Gloss Melamine Writing Surface"
  },

  /* ---------------------------- Chalk boards ---------------------------- */
  "metallic-premium-chalk-board": {
    about: [
      "The Metallic Premium Chalk Board uses high-quality materials with rigid core construction, finished in heavy-duty aluminium framing with Signature Dual-Tone Corners.",
      "Its Hardcore Chalk Grade HPL Sheet has enhanced scratch resistance and is non-reflective and glare-free, with clear visibility from all angles. It is built for intensive daily institutional use and is wall-mountable, easy to install."
    ],
    built: [
      "Material — High-quality materials with rigid core construction",
      "Design — Heavy-duty aluminium framing with Signature Dual-Tone Corners",
      "Surface — Hardcore Chalk Grade HPL Sheet with enhanced scratch resistance; non-reflective and glare-free with clear visibility from all angles",
      "Durability — Designed for intensive daily institutional use",
      "Installation — Wall-mountable, easy to install"
    ],
    usage: "Schools, colleges, offices and institutional classrooms",
    surface: "Hardcore Chalk Grade HPL Sheet"
  },
  "eco-premium-chalk-board": {
    about: [
      "The Eco Premium Chalk Board uses premium-grade strong materials with an ABS Dual-Tone Corner Design for added strength.",
      "Its Hardcore Chalk Grade HPL Sheet has enhanced scratch resistance and is non-reflective and glare-free, with clear visibility from all angles. It is reliable and long-lasting for regular institutional use."
    ],
    built: [
      "Material — Premium-grade strong materials",
      "Design — ABS Dual-Tone Corner Design for added strength",
      "Surface — Hardcore Chalk Grade HPL Sheet with enhanced scratch resistance; non-reflective and glare-free with clear visibility from all angles",
      "Durability — Reliable and long-lasting for regular institutional use"
    ],
    usage: "Classrooms, training rooms and offices",
    surface: "Hardcore Chalk Grade HPL Sheet"
  },
  "deluxe-standard-chalk-board": {
    about: [
      "The Deluxe Standard Chalk Board uses regular quality materials with balanced performance and Electroplated Chrome Corners for a clean finish.",
      "Its Chalk Grade HPL Sheet is non-reflective and glare-free, with clear visibility from all angles. It is durable and dependable for everyday use."
    ],
    built: [
      "Material — Regular quality materials with balanced performance",
      "Design — Electroplated Chrome Corners for a clean finish",
      "Surface — Chalk Grade HPL Sheet; non-reflective, glare-free, with clear visibility from all angles",
      "Durability — Durable and dependable for everyday use"
    ],
    usage: "Classrooms, coaching centres and offices",
    surface: "Chalk Grade HPL Sheet"
  },
  "eco-regular-chalk-board": {
    about: [
      "The Eco Regular Chalk Board is a cost-effective board with a lightweight frame and standard plastic corners.",
      "Its Chalk Grade HPL Sheet is non-reflective and glare-free, with clear visibility from all angles. It suits home classrooms, tuition classes and small institutions, and is made for light, economical use."
    ],
    built: [
      "Material — Cost-effective, regular materials",
      "Design — Lightweight frame with standard plastic corners",
      "Surface — Chalk Grade HPL Sheet; non-reflective, glare-free, with clear visibility from all angles",
      "Durability — Suitable for light and economical use"
    ],
    usage: "Home classrooms, tuition classes and small institutions",
    surface: "Chalk Grade HPL Sheet"
  },

  /* ---------------------------- Magnetic boards -------------------------- */
  "metallic-premium-magnetic-board": {
    about: [
      "The Metallic Premium Magnetic Board has a resin-coated writing surface suitable for marker (white) and chalk (green) boards. It accepts magnetic accessories such as magnets, charts and holders.",
      "Heavy-duty aluminium framing with Signature Dual-Tone Corners holds a smooth writing surface for regular writing and erasing. For heavy chalk usage without a magnetic requirement, Plusmark recommends the non-magnetic premium or ceramic boards for longer surface life."
    ],
    built: [
      "Surface — Resin coated writing surface suitable for marker (white) and chalk (green) boards",
      "Magnetic use — Compatible with magnets, charts and holders",
      "Design — Heavy-duty aluminium framing with Signature Dual-Tone Corners",
      "Finish — Smooth writing surface for regular writing and erasing"
    ],
    usage: "Marker or chalk writing with magnetic accessories",
    surface: "Resin coated writing surface"
  },
  "metallic-premium-magnetic-chalk-board": {
    about: [
      "The Metallic Premium Magnetic Chalk Board has a resin-coated writing surface suitable for chalk (green) boards, and accepts magnetic accessories such as magnets, charts and holders.",
      "Heavy-duty aluminium framing with Signature Dual-Tone Corners holds a smooth writing surface for regular writing and erasing. For heavy chalk usage without a magnetic requirement, Plusmark recommends the non-magnetic premium or ceramic boards for longer surface life."
    ],
    built: [
      "Surface — Resin coated writing surface suitable for chalk (green) boards",
      "Magnetic use — Compatible with magnets, charts and holders",
      "Design — Heavy-duty aluminium framing with Signature Dual-Tone Corners",
      "Finish — Smooth writing surface for regular writing and erasing"
    ],
    usage: "Chalk writing with magnetic accessories",
    surface: "Resin coated writing surface for chalk (green)"
  },
  "deluxe-standard-magnetic-board": {
    about: [
      "The Deluxe Standard Magnetic Board has a resin-coated writing surface available in white and green options. It is suitable for standard magnetic accessories.",
      "The aluminium frame uses Electroplated Chrome Corners, and the smooth surface suits daily classroom or office writing. Balanced construction keeps it dependable for regular use."
    ],
    built: [
      "Surface — Resin coated writing surface in white and green options",
      "Magnetic use — Suitable for standard magnetic accessories",
      "Design — Aluminium frame with Electroplated Chrome Corners",
      "Finish — Smooth surface for daily classroom or office writing",
      "Build — Balanced construction for regular use"
    ],
    usage: "Daily classroom or office writing with magnetic accessories",
    surface: "Resin coated writing surface (white and green options)",
    frame: "Aluminium frame",
    corners: "Electroplated Chrome Corners"
  },
  "deluxe-standard-magnetic-chalk-board": {
    about: [
      "The Deluxe Standard Magnetic Chalk Board has a resin-coated writing surface in green. It is suitable for standard magnetic accessories.",
      "The aluminium frame uses Electroplated Chrome Corners, and the smooth surface suits daily classroom writing. Balanced construction keeps it dependable for regular use."
    ],
    built: [
      "Surface — Resin coated writing surface for chalk (green)",
      "Magnetic use — Suitable for standard magnetic accessories",
      "Design — Aluminium frame with Electroplated Chrome Corners",
      "Finish — Smooth surface for daily classroom writing",
      "Build — Balanced construction for regular use"
    ],
    usage: "Daily chalk writing with magnetic accessories",
    surface: "Resin coated writing surface for chalk (green)",
    frame: "Aluminium frame",
    corners: "Electroplated Chrome Corners"
  },
  "eco-regular-magnetic-board": {
    about: [
      "The Eco Regular Magnetic Board has a resin-coated writing surface in white and green variants. It supports basic magnetic accessories.",
      "A lightweight aluminium frame with standard plastic corners keeps it easy to handle, and the functional writing surface covers basic requirements. It is the economical option in the range, designed for light usage."
    ],
    built: [
      "Surface — Resin coated writing surface in white and green variants",
      "Magnetic use — Supports basic magnetic accessories",
      "Design — Lightweight aluminium frame with standard plastic corners",
      "Finish — Functional writing surface for basic requirements",
      "Build — Economical option designed for light usage"
    ],
    usage: "Basic writing and light magnetic use",
    surface: "Resin coated writing surface (white and green variants)",
    frame: "Lightweight aluminium frame",
    corners: "Standard plastic corners"
  },
  "eco-regular-magnetic-chalk-board": {
    about: [
      "The Eco Regular Magnetic Chalk Board has a resin-coated writing surface in green. It supports basic magnetic accessories.",
      "A lightweight aluminium frame with standard plastic corners keeps it easy to handle, and the functional writing surface covers basic requirements. It is the economical option in the range, designed for light usage."
    ],
    built: [
      "Surface — Resin coated writing surface for chalk (green)",
      "Magnetic use — Supports basic magnetic accessories",
      "Design — Lightweight aluminium frame with standard plastic corners",
      "Finish — Functional writing surface for basic requirements",
      "Build — Economical option designed for light usage"
    ],
    usage: "Basic chalk writing and light magnetic use",
    surface: "Resin coated writing surface for chalk (green)",
    frame: "Lightweight aluminium frame",
    corners: "Standard plastic corners"
  },

  /* ---------------------------- Ceramic boards -------------------------- */
  "metallic-premium-ceramic-board": {
    about: [
      "The Metallic Premium Ceramic Board has a ceramic steel / porcelain enamel steel surface, available as a white board for marker writing or a chalk board for chalk writing. The hard, non-porous surface is made for continuous writing and frequent cleaning, with consistent performance over a very long product life.",
      "It is finished in an aluminium frame with Signature Dual-Tone Corners. Where magnetic use is not required, the non-magnetic Metallic Premium boards are a more economical alternative with similar writing performance."
    ],
    built: [
      "Surface — Ceramic steel / porcelain enamel steel, in white board (marker) and chalk board options",
      "Product life — Designed for very long life under regular institutional use",
      "Performance — Hard, non-porous surface for continuous writing and frequent cleaning",
      "Finish — Smooth writing surface with consistent performance over time",
      "Maintenance — Easy to clean and maintain for daily classroom use",
      "Design — Aluminium frame with Signature Dual-Tone Corners"
    ],
    usage: "Institutional white board (marker) or chalk board use",
    surface: "Ceramic steel / porcelain enamel steel surface",
    frame: "Aluminium frame"
  },
  "metallic-premium-ceramic-chalk-board": {
    about: [
      "The Metallic Premium Ceramic Chalk Board has a ceramic steel / porcelain enamel steel surface made for chalk writing. The hard, non-porous surface is made for continuous writing and frequent cleaning, with consistent performance over a very long product life.",
      "It is finished in an aluminium frame with Signature Dual-Tone Corners. Where magnetic use is not required, the non-magnetic Metallic Premium boards are a more economical alternative with similar writing performance."
    ],
    built: [
      "Surface — Ceramic steel / porcelain enamel steel for chalk writing",
      "Product life — Designed for very long life under regular institutional use",
      "Performance — Hard, non-porous surface for continuous writing and frequent cleaning",
      "Finish — Smooth writing surface with consistent performance over time",
      "Maintenance — Easy to clean and maintain for daily classroom use",
      "Design — Aluminium frame with Signature Dual-Tone Corners"
    ],
    usage: "Institutional chalk writing with a long-life surface",
    surface: "Ceramic steel / porcelain enamel steel surface",
    frame: "Aluminium frame"
  },
  "deluxe-standard-ceramic-board": {
    about: [
      "The Deluxe Standard Ceramic Board has a ceramic steel / porcelain enamel steel surface, available as a white board for marker writing or a chalk board for chalk writing. The hard, non-porous surface suits continuous writing and frequent cleaning, with consistent performance over a very long product life.",
      "It is finished in an aluminium frame with Electroplated Chrome Corners. Where magnetic use is not required, the non-magnetic Eco Premium boards are a more economical alternative with similar writing performance."
    ],
    built: [
      "Surface — Ceramic steel / porcelain enamel steel, in white board (marker) and chalk board options",
      "Product life — Designed for very long life under regular institutional use",
      "Performance — Hard, non-porous surface for continuous writing and frequent cleaning",
      "Finish — Smooth writing surface with consistent performance over time",
      "Maintenance — Easy to clean and maintain for daily classroom use",
      "Design — Aluminium frame with Electroplated Chrome Corners"
    ],
    usage: "Institutional white board (marker) or chalk board use",
    surface: "Ceramic steel / porcelain enamel steel surface",
    frame: "Aluminium frame",
    corners: "Electroplated Chrome Corners"
  },

  /* --------------------------- Notice boards ---------------------------- */
  "metallic-premium-notice-board": {
    about: [
      "The Metallic Premium Notice Board is built on premium aluminium construction with Signature Dual-Tone Corners. A 2 mm Blazer Cloth surface holds colour for the long term over a soft, pin-friendly core made for frequent and heavy pin usage.",
      "It is the highest grade of the range, designed for long-term institutional use. Available colours: Royal & Navy Blue, Almond & Dark Green, Red, Maroon, Light Gray and Dark Gray."
    ],
    built: [
      "Material — Premium aluminium construction with Signature Dual-Tone Corners",
      "Surface — 2 mm Blazer Cloth with long-lasting colour retention",
      "Core — Soft pin-friendly core for frequent and heavy pin usage",
      "Durability — Highest grade, designed for long-term institutional use",
      "Colours — Royal & Navy Blue, Almond & Dark Green, Red, Maroon, Light Gray, Dark Gray"
    ],
    usage: "Schools, colleges, corporate and government offices",
    surface: "2 mm Blazer Cloth"
  },
  "eco-premium-notice-board": {
    about: [
      "The Eco Premium Notice Board uses premium-grade construction for reliable performance. Its 2 mm Blazer Cloth surface suits regular institutional use over a soft core made for repeated pinning.",
      "It is long-lasting with consistent performance. Available colours: Royal & Navy Blue, Almond & Dark Green, Red, Maroon, Light Gray and Dark Gray."
    ],
    built: [
      "Material — Premium-grade construction for reliable performance",
      "Surface — 2 mm Blazer Cloth suitable for regular institutional use",
      "Core — Soft core material for repeated pinning",
      "Durability — Long-lasting with consistent performance",
      "Colours — Royal & Navy Blue, Almond & Dark Green, Red, Maroon, Light Gray, Dark Gray"
    ],
    usage: "Classrooms, offices and institutions",
    surface: "2 mm Blazer Cloth"
  },
  "deluxe-standard-notice-board": {
    about: [
      "The Deluxe Standard Notice Board uses standard quality materials with Electroplated Chrome Corners. A Super Fine Velvet Cloth surface handles everyday pin usage over a soft core suited to normal pinning.",
      "It is reliable for daily use. Available colours: Red, Blue, Maroon and Green."
    ],
    built: [
      "Material — Standard quality materials with Electroplated Chrome Corners",
      "Surface — Super Fine Velvet Cloth for everyday pin usage",
      "Core — Soft core suitable for normal pin use",
      "Durability — Reliable for daily use",
      "Colours — Red, Blue, Maroon, Green"
    ],
    usage: "Classrooms, coaching centres and offices",
    surface: "Super Fine Velvet Cloth"
  },
  "eco-regular-notice-board": {
    about: [
      "The Eco Regular Notice Board uses economical materials with standard plastic corners. A Super Fine Velvet Cloth surface covers basic pin-up needs over a soft core for light pin usage.",
      "It is best for home classrooms, tuition classes and small offices, and suits light, occasional use. Available colours: Red, Blue, Maroon and Green."
    ],
    built: [
      "Material — Economical materials with standard plastic corners",
      "Surface — Super Fine Velvet Cloth for basic pin-up needs",
      "Core — Soft core for light pin usage",
      "Durability — Suitable for light and occasional use",
      "Colours — Red, Blue, Maroon, Green"
    ],
    usage: "Home classrooms, tuition classes and small offices",
    surface: "Super Fine Velvet Cloth"
  },
  "cork-notice-board": {
    about: [
      "The Cork Notice Board uses a high-quality natural cork surface over a soft, resilient base built for smooth pin insertion and firm holding. It allows frequent pinning and removal without surface damage or loss of grip.",
      "The uniform cork texture gives a neat, professional appearance, and the surface is long-lasting for regular notice display. It is available in Metallic Premium, Eco Premium and Deluxe frame variants."
    ],
    built: [
      "Surface — High-quality natural cork suitable for repeated pin use",
      "Core — Soft and resilient base for smooth pin insertion and firm holding",
      "Performance — Frequent pinning and removal without surface damage or loss of grip",
      "Finish — Uniform cork texture with a neat and professional appearance",
      "Durability — Long-lasting performance for regular notice display",
      "Design options — Metallic Premium, Eco Premium and Deluxe frame variants"
    ],
    usage: "Regular notice display with repeated pin use",
    surface: "High-quality natural cork"
  },
  "fabric-notice-board": {
    about: [
      "The Fabric Notice Board is made for repeated pin use, with a soft core that lets pins go in easily and hold firmly.",
      "Fabric colour and board layout can be provided as per customer requirement. The durable fabric surface suits regular notice display, and the board is available in Metallic Premium, Eco Premium and Deluxe frame variants."
    ],
    built: [
      "Surface — Fabric notice board suitable for repeated pin use",
      "Core — Soft core for easy pin insertion and firm holding",
      "Colour — Available in the customer's preferred fabric colour",
      "Customisation — Fabric colour and board layout as per customer requirement",
      "Design options — Metallic Premium, Eco Premium and Deluxe frame variants"
    ],
    usage: "Regular notice display with custom fabric colour",
    surface: "Fabric"
  },
  "combination-board": {
    about: [
      "The Combination Board carries a dry wipe white board on one side and a fabric notice board on the other, so marker writing and pin-up display sit in a single board.",
      "The marker face erases cleanly, while the durable fabric takes repeated pinning and removal without losing grip. It is available in Metallic Premium, Eco Premium and Deluxe frame variants."
    ],
    built: [
      "Surface — Dry wipe white board on one side, fabric notice board on the other",
      "Function — Marker writing plus pin-up display in a single board",
      "Performance — Smooth marker writing with easy erase and a durable fabric surface for repeated pin use",
      "Durability — Long-lasting surface performance for regular notice display",
      "Design options — Metallic Premium, Eco Premium and Deluxe frame variants"
    ],
    usage: "Marker writing and pin-up display in one board",
    surface: "Dry wipe white board one side, fabric notice board on the other"
  },
  "acrylic-folder-display-board": {
    about: [
      "The Acrylic Folder Display Board uses transparent front folders for easy document viewing. It is made for charts, reports, SOPs and production data, and papers can be inserted and replaced quickly.",
      "Folder size and quantity are as per customer requirement, and a strong aluminium frame makes the board suitable for industrial use."
    ],
    built: [
      "Visibility — Transparent front folders for easy document viewing",
      "Display — Ideal for charts, reports, SOPs and production data",
      "Access — Papers can be inserted and replaced quickly",
      "Custom layout — Folder size and quantity as per customer requirement",
      "Frame — Strong aluminium frame suitable for industrial use"
    ],
    usage: "Charts, reports, SOPs and production data",
    surface: "Transparent acrylic front folders",
    frame: "Strong aluminium frame"
  },

  /* ----------------------- Acrylic door covered ------------------------- */
  "deluxe-45mm-adc-notice-board-double-door": {
    about: [
      "The Deluxe 45 mm ADC Notice Board is an acrylic door covered notice board with a double door design. Deluxe 45 mm triple aluminium framing adds strength and a premium appearance, and the transparent acrylic cover protects notices from dust and handling.",
      "A secure double-door system keeps the display controlled. It is suited to offices, institutions, housing societies, hospitals and public areas."
    ],
    built: [
      "Type — Acrylic door covered notice board, double door design",
      "Framing — Deluxe 45 mm triple aluminium framing",
      "Cover — Transparent acrylic door cover protecting notices from dust and handling",
      "Locking — Secure double-door system for controlled notice display",
      "Application — Offices, institutions, housing societies, hospitals and public areas"
    ],
    usage: "Offices, institutions, housing societies, hospitals and public areas",
    surface: "Transparent acrylic door cover",
    frame: "Deluxe 45 mm triple aluminium frame",
    corners: null
  },
  "eco-adc-notice-board-single-door": {
    about: [
      "The Eco ADC Notice Board is an acrylic door covered notice board with a single door. Lightweight aluminium framing keeps it economical and practical, while the transparent acrylic cover protects notices from dust and handling.",
      "A single-door locking system keeps the display safe and controlled, with smooth door operation and clear visibility of notices. The clean, simple finish suits regular indoor applications."
    ],
    built: [
      "Type — Acrylic door covered notice board, single door design",
      "Framing — Lightweight aluminium framing for economical and practical use",
      "Cover — Transparent acrylic door cover protecting notices from dust and handling",
      "Locking — Single-door locking system for safe and controlled display",
      "Performance — Smooth door operation with clear visibility of notices",
      "Finish — Clean and simple finish for regular indoor applications"
    ],
    usage: "Regular indoor notice display",
    surface: "Transparent acrylic door cover",
    frame: "Lightweight aluminium frame",
    corners: null
  },

  /* --------------------- Board & study essentials ----------------------- */
  "four-line-square-line-practice-board": {
    about: [
      "The Four Line & Square Line Practice Board is specially designed for handwriting improvement. It helps ensure proper letter size, spacing and alignment, while the square grid section supports accurate number writing and basic maths practice.",
      "Line marking is provided as per school or customer requirements. The smooth writing surface suits daily classroom use and primary or early learning classes."
    ],
    built: [
      "Purpose — Specially designed for handwriting improvement",
      "Guidance — Proper letter size, spacing and alignment",
      "Practice — Square grid section for number writing and basic maths",
      "Marking — Line marking as per school or customer requirements",
      "Surface — Smooth writing surface suitable for daily classroom use"
    ],
    usage: "Handwriting improvement and early learning classes",
    surface: "Line-marked writing surface"
  },
  "key-hanger-board": {
    about: [
      "The Key Hanger Board is a secure key management system with a locking facility. A lockable acrylic door keeps keys in place while leaving them clearly visible.",
      "The professional, durable design suits offices, companies and workshops. Capacities run from 15/20 keys at 1 × 1.5 ft up to 150 keys at 3 × 4 ft."
    ],
    built: [
      "Security — Lockable acrylic door",
      "Visibility — Keys remain clearly visible",
      "Build — Professional and durable design",
      "Use — Offices, companies and workshops",
      "Capacities — 15/20 keys (1 × 1.5 ft), 30 keys (1.5 × 2 ft), 50 keys (2 × 2 ft), 100 keys (2 × 3 ft), 150 keys (3 × 4 ft)"
    ],
    usage: "Key management in offices, companies and workshops",
    surface: "Lockable acrylic door",
    corners: null
  },
  "student-study-table": {
    about: [
      "The Student Study Table is made for daily study and homework, with a smooth white board writing surface that is easy to clean and maintain.",
      "It works as a study, reading or laptop table, and folds flat when not in use. The writing area measures 16 × 24 inches."
    ],
    built: [
      "Use — Daily study and homework; also a reading and laptop table",
      "Surface — Smooth white board writing surface, easy to clean and maintain",
      "Design — Foldable and space-saving",
      "Writing area — 16 × 24 inches"
    ],
    usage: "Daily study, homework, reading and laptop use",
    surface: "Smooth white board writing surface"
  },
  "letters-and-figures-set": {
    about: [
      "Plusmark supplies a 112-piece letter set and a 100-piece figure set. Letters are available in 12 mm, 18 mm, 24 mm and 36 mm sizes, with quantities per character as listed in Plusmark's catalogue.",
      "The figure set covers the digits 0–9, supplied in multiples."
    ],
    built: [
      "Letters — 112 pieces",
      "Figures — 100 pieces",
      "Letter sizes — 12 mm, 18 mm, 24 mm and 36 mm",
      "Figures — digits 0–9, supplied in multiples"
    ],
    usage: "Lettering and numbering for displays",
    corners: null
  },

  /* ----------------------------- Display -------------------------------- */
  "grooved-boards": {
    about: [
      "The Grooved Display Board is suitable for hotels, reception areas and leisure centres. It is offered in nine sizes in landscape and portrait, finished with a golden anodized frame.",
      "Felt colours available: Red and Maroon."
    ],
    built: [
      "Use — Hotels, reception areas and leisure centres",
      "Sizes — Nine sizes in landscape and portrait",
      "Frame — Golden anodized frame",
      "Felt colours — Red and Maroon"
    ],
    usage: "Hotels, reception areas and leisure centres",
    surface: "Felt",
    frame: "Golden anodized frame"
  },
  "perforated-board": {
    about: [
      "The Perforated Display Board is a black perforated board, popular for displaying information both vertically and horizontally.",
      "It is used in offices, hotels and many other public places."
    ],
    built: [
      "Finish — Black perforated board",
      "Display — Information can be shown vertically and horizontally",
      "Use — Offices, hotels and other public places"
    ],
    usage: "Offices, hotels and other public places",
    surface: "Black perforated board"
  },
  "dry-wipe-schedule-board": {
    about: [
      "The Dry Wipe Schedule Board is made in any design and any size. Before ordering, Plusmark needs the quantity, the sizes, and a sketch of the board as per your requirements — the sketch can be supplied in CorelDRAW, Photoshop or a Word file.",
      "Where Plusmark prepares the design itself, additional charges apply."
    ],
    built: [
      "Design — Any design or any size",
      "Before ordering — quantity, sizes and a sketch of the board",
      "Sketch format — CorelDRAW, Photoshop or Word file",
      "Design service — additional charges when Plusmark prepares the design"
    ],
    usage: "Custom schedule boards made to the customer's design",
    corners: null
  },

  /* ----------------------------- Clipboards ----------------------------- */
  "laminate-mdf-base-clipboard": {
    about: [
      "The Laminate MDF Base Clipboard has an HPL Sheet wood-grade face with a smooth, premium appearance. A chrome electroplated clip with a rust-resistant finish holds the sheets, and dual-side cap rivets give a uniform finish on both sides.",
      "The rounded edge provides a safe, clean finish. It is available in two sizes."
    ],
    built: [
      "Base — HPL Sheet Wood Grade with a smooth, premium appearance",
      "Clip — Chrome electroplated, rust-resistant finish",
      "Rivets — Dual-side cap rivets for a uniform finish on both sides",
      "Edge — Rounded edge for a safe, clean finish",
      "Sizes — Two sizes"
    ],
    usage: "Clipboard use with a laminate wood finish",
    corners: null
  },
  "graphic-mdf-base-clipboard": {
    about: [
      "The Graphic MDF Base Clipboard carries premium graphic printing that is sharp and fade-resistant. A chrome electroplated clip with a rust-resistant finish holds the sheets, and dual-side cap rivets keep the finish uniform on both sides.",
      "It is available in six different sizes."
    ],
    built: [
      "Print — Premium graphic printing, sharp and fade-resistant",
      "Clip — Chrome electroplated, rust-resistant finish",
      "Rivets — Dual-side cap rivets for a uniform finish on both sides",
      "Sizes — Six different sizes"
    ],
    usage: "Clipboard use with printed graphics",
    corners: null
  },
  "pre-lam-mdf-base-clipboard": {
    about: [
      "The Pre-Lam MDF Base Clipboard has a smooth pre-lam wood finish. A chrome electroplated clip with a rust-resistant finish holds the sheets, and dual-side cap rivets give a uniform finish on both sides.",
      "The rounded edge provides a safe, clean finish. It is available in two sizes."
    ],
    built: [
      "Base — Pre-Lam wood finish, smooth to the touch",
      "Clip — Chrome electroplated, rust-resistant finish",
      "Rivets — Dual-side cap rivets for a uniform finish on both sides",
      "Edge — Rounded edge for a safe, clean finish",
      "Sizes — Two sizes"
    ],
    usage: "Clipboard use with a pre-lam wood finish",
    corners: null
  },
  "crystal-clear-base-clipboard": {
    about: [
      "The Crystal Clear Base Clipboard uses a crystal-clear acrylic base with glass-like clarity and a modern appeal. The chrome electroplated clip has a rust-resistant finish, and dual-side cap rivets keep a uniform look on both sides.",
      "The heavy-duty clear acrylic has high impact strength and is shatter-resistant. It is available in two sizes and four variants."
    ],
    built: [
      "Base — Crystal clear acrylic with glass-like clarity",
      "Clip — Chrome electroplated, rust-resistant finish",
      "Rivets — Dual-side cap rivets for a uniform look on both sides",
      "Build — Heavy-duty clear acrylic with high impact strength and shatter resistance",
      "Options — Two sizes and four variants"
    ],
    usage: "Clipboard use with a clear acrylic base",
    corners: null
  },
  "crystal-colour-base-clipboard": {
    about: [
      "The Crystal Colour Base Clipboard has a crystal-tint acrylic base — a modern transparent colour with an elegant appeal. The rounded edge keeps the corners soft for safety and comfort.",
      "A chrome electroplated clip gives anti-rust protection, and the dual-cap rivet system keeps the appearance balanced and neat. It is available in two sizes."
    ],
    built: [
      "Base — Crystal-tint acrylic with a modern transparent colour",
      "Edge — Rounded corners for safety and comfort",
      "Clip — Chrome electroplated with anti-rust protection",
      "Rivets — Dual-cap rivet system for a balanced, neat appearance",
      "Sizes — Two sizes"
    ],
    usage: "Clipboard use with a coloured transparent base",
    corners: null
  },
  "heavy-duty-clear-acrylic-clipboard": {
    about: [
      "The Heavy Duty Clear Acrylic Clipboard uses clear acrylic with high impact strength and a shatter-resistant body. The chrome electroplated clip has a rust-resistant finish, and dual-side cap rivets keep a uniform look on both sides."
    ],
    built: [
      "Base — Heavy-duty clear acrylic with high impact strength",
      "Durability — Shatter-resistant body",
      "Clip — Chrome electroplated, rust-resistant finish",
      "Rivets — Dual-side cap rivets for a uniform look on both sides"
    ],
    usage: "Clipboard use where a stronger clear acrylic base is needed",
    corners: null
  }
};
