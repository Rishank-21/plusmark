import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw = json.load(open(os.path.join(ROOT, "data", "catalog.json"), encoding="utf-8"))
assets = json.load(open(os.path.join(ROOT, "_research", "cloudinary-assets.json"), encoding="utf-8"))
prod_imgs = {x.split("/")[-1] for x in assets["products"]}
vids = {x.split("/")[-1] for x in assets["videos"]}

SERIES = {
    "metallic-premium": {"name": "Metallic Premium", "rank": 1,
        "surface": "High Gloss Marker Grade HPL Sheet",
        "frame": "Aluminium anodized frame, heavy-duty",
        "corners": "Signature Dual-Tone corners - red cap over black connector",
        "sizes": ["3 x 4 ft", "4 x 4 ft", "5 x 4 ft", "6 x 4 ft", "8 x 4 ft"]},
    "eco-premium": {"name": "Eco Premium", "rank": 2,
        "surface": "Marker Grade HPL Sheet",
        "frame": "Ribbed aluminium anodized frame",
        "corners": "ABS Dual-Tone corners",
        "sizes": ["2 x 3 ft", "3 x 4 ft", "4 x 4 ft", "5 x 4 ft", "6 x 4 ft", "8 x 4 ft"]},
    "deluxe-standard": {"name": "Deluxe Standard", "rank": 3,
        "surface": "High gloss melamine writing surface",
        "frame": "Deluxe anodized aluminium frame",
        "corners": "Electroplated chrome corners",
        "sizes": ["3 x 4 ft", "4 x 4 ft", "5 x 4 ft", "6 x 4 ft", "8 x 4 ft"]},
    "eco-regular": {"name": "Eco Regular", "rank": 4,
        "surface": "High gloss melamine writing surface",
        "frame": "Lightweight ribbed aluminium anodized frame",
        "corners": "Standard plastic corners",
        "sizes": ["1 x 1 ft", "2 x 2 ft", "2 x 3 ft", "2 x 4 ft", "3 x 4 ft",
                   "4 x 4 ft", "5 x 4 ft", "6 x 4 ft", "8 x 4 ft"]},
}

CATEGORIES = [
    {"id": "white-boards", "name": "White Boards", "subject": "Whiteboard",
     "description": "Marker boards in HPL and melamine surfaces, magnetic and non-magnetic.",
     "image": "plusmark/products/metallic-premium-white-board",
     "subcategories": [
        {"id": "white-boards-non-magnetic", "name": "Non-Magnetic White Boards", "image": "plusmark/products/metallic-premium-white-board"},
        {"id": "white-boards-magnetic", "name": "Magnetic White Boards", "image": "plusmark/products/metallic-premium-magnetic-board"},
        {"id": "white-boards-ceramic", "name": "Ceramic White Boards", "image": "plusmark/products/metallic-premium-ceramic-board"}]},
    {"id": "chalk-boards", "name": "Chalk Boards", "subject": "Chalkboard",
     "description": "Non-reflective chalk faces that stay glare-free from the back bench.",
     "image": "plusmark/products/metallic-premium-chalk-board",
     "subcategories": [
        {"id": "chalk-boards-non-magnetic", "name": "Non-Magnetic Chalk Boards", "image": "plusmark/products/metallic-premium-chalk-board"},
        {"id": "chalk-boards-magnetic", "name": "Magnetic Chalk Boards", "image": "plusmark/products/metallic-premium-magnetic-chalk-board"},
        {"id": "chalk-boards-ceramic", "name": "Ceramic Chalk Boards", "image": "plusmark/products/metallic-premium-ceramic-chalk-board"}]},
    {"id": "notice-boards", "name": "Notice Boards", "subject": "Notice board",
     "description": "Cork, fabric and acrylic display boards for corridors and offices.",
     "image": "plusmark/products/metallic-premium-notice-board",
     "subcategories": [
        {"id": "notice-boards-pin-up", "name": "Pin-Up Boards", "image": "plusmark/products/fabric-notice-board"},
        {"id": "notice-boards-adc", "name": "Acrylic Door Cover (ADC)", "image": "plusmark/products/deluxe-45mm-adc-notice-board-double-door"}]},
    {"id": "double-sided-boards", "name": "Double-Sided Boards", "subject": "Double sided board",
     "description": "Two writing faces on one frame - chalk on one side, marker on the other.",
     "image": "plusmark/products/eco-premium-both-side-board", "subcategories": []},
    {"id": "schedule-boards", "name": "Schedule Boards", "subject": "Schedule board",
     "description": "Dry-wipe timetable boards made in the design and size you ask for.",
     "image": "plusmark/products/dry-wipe-schedule-board", "subcategories": []},
    {"id": "display-boards", "name": "Display Boards", "subject": "Display board",
     "description": "Acrylic folder boards for reports, charts and production data.",
     "image": "plusmark/products/acrylic-folder-display-board", "subcategories": []},
    {"id": "specialty-boards", "name": "Specialty Display Boards", "subject": "Specialty board",
     "description": "Grooved coloured boards, perforated boards, practice boards and key hangers.",
     "image": "plusmark/products/grooved-boards", "subcategories": []},
    {"id": "clipboards", "name": "Clipboards", "subject": "Clipboard",
     "description": "Acrylic and MDF base clipboards with chrome electroplated clips.",
     "image": "plusmark/products/laminate-mdf-base-clipboard",
     "subcategories": [
        {"id": "clipboards-mdf", "name": "MDF Base", "image": "plusmark/products/laminate-mdf-base-clipboard"},
        {"id": "clipboards-acrylic", "name": "Acrylic Base", "image": "plusmark/products/heavy-duty-clear-acrylic-clipboard"}]},
    {"id": "board-stands", "name": "Board Stands & Storage", "subject": "Board stand",
     "description": "Mobile and fixed stands, racks and storage units for boards up to 8 ft.",
     "image": "plusmark/products/four-leg-stand",
     "subcategories": [
        {"id": "board-stands-stands", "name": "Display Stands", "image": "plusmark/products/telescopic-stand"},
        {"id": "board-stands-storage", "name": "Storage & Racks", "image": "plusmark/products/file-rack"}]},
    {"id": "school-benches", "name": "School Benches", "subject": "School bench",
     "description": "Cast-iron and wooden benches and study tables for classrooms and labs.",
     "image": "plusmark/products/pds-sb-801", "subcategories": []},
    {"id": "board-study-essentials", "name": "Board & Study Essentials", "subject": "Study essential",
     "description": "Letters and figures sets and classroom accessories.",
     "image": "plusmark/products/letters-and-figures-set", "subcategories": []},
]

NON_BOARD_CATS = {"clipboards", "school-benches", "board-stands", "board-study-essentials",
                   "specialty-boards", "display-boards", "schedule-boards", "notice-boards"}

# The live CDN names the double-sided videos without the "-board" suffix.
VIDEO_ALIAS = {
    "metallic-premium-both-side-board": "metallic-premium-both-side",
    "eco-premium-both-side-board": "eco-premium-both-side",
}

LIVE = {
    "metallic-premium-white-board": ("Metallic Premium White Board", "white-boards", "metallic-premium", False, False, None),
    "metallic-premium-chalk-board": ("Metallic Premium Chalk Board", "chalk-boards", "metallic-premium", False, False, None),
    "metallic-premium-magnetic-board": ("Metallic Premium Magnetic Board", "white-boards", "metallic-premium", True, False, "white-boards-magnetic"),
    "metallic-premium-magnetic-chalk-board": ("Metallic Premium Magnetic Chalk Board", "chalk-boards", "metallic-premium", True, False, "chalk-boards-magnetic"),
    "metallic-premium-ceramic-board": ("Metallic Premium Ceramic Board", "white-boards", "metallic-premium", False, False, "white-boards-ceramic"),
    "metallic-premium-ceramic-chalk-board": ("Metallic Premium Ceramic Chalk Board", "chalk-boards", "metallic-premium", False, False, "chalk-boards-ceramic"),
    "metallic-premium-notice-board": ("Metallic Premium Notice Board", "notice-boards", "metallic-premium", False, False, None),
    "metallic-premium-both-side-board": ("Metallic Premium Double-Sided Board", "double-sided-boards", "metallic-premium", False, True, None),
    "eco-premium-white-board": ("Eco Premium White Board", "white-boards", "eco-premium", False, False, "white-boards-non-magnetic"),
    "eco-premium-chalk-board": ("Eco Premium Chalk Board", "chalk-boards", "eco-premium", False, False, "chalk-boards-non-magnetic"),
    "eco-premium-notice-board": ("Eco Premium Notice Board", "notice-boards", "eco-premium", False, False, "notice-boards-pin-up"),
    "eco-premium-both-side-board": ("Eco Premium Double-Sided Board", "double-sided-boards", "eco-premium", False, True, None),
    "eco-regular-white-board": ("Eco Regular White Board", "white-boards", "eco-regular", False, False, "white-boards-non-magnetic"),
    "eco-regular-chalk-board": ("Eco Regular Chalk Board", "chalk-boards", "eco-regular", False, False, "chalk-boards-non-magnetic"),
    "eco-regular-magnetic-board": ("Eco Regular Magnetic Board", "white-boards", "eco-regular", True, False, "white-boards-magnetic"),
    "eco-regular-magnetic-chalk-board": ("Eco Regular Magnetic Chalk Board", "chalk-boards", "eco-regular", True, False, "chalk-boards-magnetic"),
    "eco-regular-notice-board": ("Eco Regular Notice Board", "notice-boards", "eco-regular", False, False, "notice-boards-pin-up"),
    "deluxe-standard-white-board": ("Deluxe Standard White Board", "white-boards", "deluxe-standard", False, False, "white-boards-non-magnetic"),
    "deluxe-standard-chalk-board": ("Deluxe Standard Chalk Board", "chalk-boards", "deluxe-standard", False, False, "chalk-boards-non-magnetic"),
    "deluxe-standard-magnetic-board": ("Deluxe Standard Magnetic Board", "white-boards", "deluxe-standard", True, False, "white-boards-magnetic"),
    "deluxe-standard-magnetic-chalk-board": ("Deluxe Standard Magnetic Chalk Board", "chalk-boards", "deluxe-standard", True, False, "chalk-boards-magnetic"),
    "deluxe-standard-ceramic-board": ("Deluxe Standard Ceramic Board", "white-boards", "deluxe-standard", False, False, "white-boards-ceramic"),
    "deluxe-standard-notice-board": ("Deluxe Standard Notice Board", "notice-boards", "deluxe-standard", False, False, "notice-boards-pin-up"),
    "deluxe-45mm-adc-notice-board-double-door": ("Deluxe 45 MM ADC Notice Board (Double Door)", "notice-boards", "deluxe-standard", False, False, "notice-boards-adc"),
    "eco-adc-notice-board-single-door": ("Eco ADC Notice Board (Single Door)", "notice-boards", "eco-regular", False, False, "notice-boards-adc"),
    "laminate-mdf-base-clipboard": ("Laminate MDF Base Clipboard", "clipboards", None, None, None, "clipboards-mdf"),
    "graphic-mdf-base-clipboard": ("Graphic MDF Base Clipboard", "clipboards", None, None, None, "clipboards-mdf"),
    "pre-lam-mdf-base-clipboard": ("Pre-Lam MDF Base Clipboard", "clipboards", None, None, None, "clipboards-mdf"),
    "crystal-clear-base-clipboard": ("Crystal Clear Base Clipboard", "clipboards", None, None, None, "clipboards-acrylic"),
    "crystal-colour-base-clipboard": ("Crystal Colour Base Clipboard", "clipboards", None, None, None, "clipboards-acrylic"),
    "heavy-duty-clear-acrylic-clipboard": ("Heavy Duty Clear Acrylic Clipboard", "clipboards", None, None, None, "clipboards-acrylic"),
    "cork-notice-board": ("Cork Notice Board", "notice-boards", None, None, None, "notice-boards-pin-up"),
    "fabric-notice-board": ("Fabric Notice Board", "notice-boards", None, None, None, "notice-boards-pin-up"),
    "acrylic-folder-display-board": ("Acrylic Folder Display Board", "display-boards", None, None, None, None),
    "dry-wipe-schedule-board": ("Dry Wipe Schedule Board", "schedule-boards", None, None, None, None),
    "four-line-square-line-practice-board": ("Four Line & Square Line Practice Board", "specialty-boards", None, None, None, None),
    "grooved-boards": ("Grooved Coloured Display Board", "specialty-boards", None, None, None, None),
    "perforated-board": ("Perforated Display Board", "specialty-boards", None, None, None, None),
    "key-hanger-board": ("Key Hanger Board", "specialty-boards", None, None, None, None),
    "letters-and-figures-set": ("Letters and Figures Set", "board-study-essentials", None, None, None, None),
    "combination-board": ("Combination Board", "notice-boards", None, None, None, None),
    "acrylic-door-cover-notice-board": ("Acrylic Door Cover Notice Board", "notice-boards", "deluxe-standard", False, False, "notice-boards-adc"),
    "four-leg-stand": ("Four Leg Board Stand", "board-stands", None, None, None, "board-stands-stands"),
    "three-leg-stand": ("Three Leg Board Stand", "board-stands", None, None, None, "board-stands-stands"),
    "zig-zag-stand": ("Zig Zag Board Stand", "board-stands", None, None, None, "board-stands-stands"),
    "revolving-stand": ("Revolving Board Stand", "board-stands", None, None, None, "board-stands-stands"),
    "telescopic-stand": ("Telescopic Board Stand", "board-stands", None, None, None, "board-stands-stands"),
    "file-rack": ("File Rack", "board-stands", None, None, None, "board-stands-storage"),
    "magazine-stand": ("Magazine Stand", "board-stands", None, None, None, "board-stands-storage"),
    "newspaper-stand": ("Newspaper Stand", "board-stands", None, None, None, "board-stands-storage"),
    "letter-box": ("Letter Box", "board-stands", None, None, None, "board-stands-storage"),
    "first-aid-box": ("First Aid Box", "board-study-essentials", None, None, None, None),
    "student-study-table": ("Student Study Table", "school-benches", None, None, None, None),
    "pds-500": ("PDS 500 Classroom Bench", "school-benches", None, None, None, None),
}
for i in range(801, 816):
    LIVE["pds-sb-%d" % i] = ("PDS SB-%d School Bench" % i, "school-benches", None, None, None, None)

products = []
for slug, (name, cat, series, mag, dbl, sub) in LIVE.items():
    has_img = slug in prod_imgs
    video_key = VIDEO_ALIAS.get(slug, slug)
    poster = "plusmark/videos/" + video_key if video_key in vids else None
    if series:
        sizes = SERIES[series]["sizes"]
    elif cat in NON_BOARD_CATS:
        sizes = ["Standard size", "Made to order"]
    else:
        sizes = SERIES["eco-premium"]["sizes"]
    products.append({
        "slug": slug,
        "name": name,
        "categoryId": cat,
        "seriesId": series,
        "subcategoryIds": [sub] if sub else [],
        "magnetic": bool(mag),
        "doubleSided": bool(dbl),
        "sizes": sizes,
        "images": (["plusmark/products/" + slug] if has_img else ([poster] if poster else [])),
        "imageSource": ("product" if has_img else ("video-poster" if poster else "none")),
        "videoId": poster,
        "surface": SERIES[series]["surface"] if series else None,
        "frame": SERIES[series]["frame"] if series else None,
        "corners": SERIES[series]["corners"] if series else None,
    })

out = {
    "brand": raw["brand"],
    "series": SERIES,
    "categories": CATEGORIES,
    "products": products,
    "institutions": raw["institutions"],
    "assurances": raw["assurances"],
    "media": {"industries": assets["industries"], "clients": assets["clients"], "videos": assets["videos"]},
}
os.makedirs(os.path.join(ROOT, "src", "data"), exist_ok=True)
json.dump(out, open(os.path.join(ROOT, "src", "data", "catalog.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("products", len(products), "categories", len(CATEGORIES))
