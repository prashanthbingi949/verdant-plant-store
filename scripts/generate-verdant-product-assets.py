#!/usr/bin/env python3
"""Generate one exact product cutout per Verdant SKU using the OpenAI Images API.

Requirements:
  - Python 3.10+
  - OPENAI_API_KEY environment variable
  - Pillow (`python -m pip install pillow`)

The OpenAI image API currently exposes square image sizes such as 1536x1536;
this script requests 1536x1536 transparent PNGs, then preserves transparency
while resizing them to the Verdant delivery standard of 1600x1600.
"""
from __future__ import annotations

import base64
import concurrent.futures
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

try:
    from PIL import Image
except ImportError:
    print("Missing Pillow. Install it with: python -m pip install pillow", file=sys.stderr)
    raise SystemExit(2)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "verdant-product-assets"
ZIP_NAME = ROOT / "verdant-product-assets.zip"
API_URL = "https://api.openai.com/v1/images/generations"
MODEL = "gpt-image-2"
# Image generation is intentionally sequential. Four concurrent requests were
# enough to trigger HTTP 429s on the user's current API limits.
CONCURRENCY = 1
SOURCE_SIZE = "1536x1536"
TARGET_SIZE = (1600, 1600)
BETWEEN_REQUEST_DELAY = 2.5
MAX_ATTEMPTS = 8

PRODUCTS = [
    ("batch-1-plants", "golden-money-plant", "Golden Money Plant"),
    ("batch-1-plants", "marble-queen-money-plant", "Marble Queen Money Plant"),
    ("batch-1-plants", "snake-plant-laurentii", "Snake Plant Laurentii"),
    ("batch-1-plants", "snake-plant-moonshine", "Snake Plant Moonshine"),
    ("batch-1-plants", "peace-lily-classic", "Peace Lily Classic"),
    ("batch-1-plants", "peace-lily-sensation", "Peace Lily Sensation"),
    ("batch-1-plants", "zz-plant-raven", "ZZ Plant Raven"),
    ("batch-1-plants", "zz-plant-green", "ZZ Plant Green"),
    ("batch-1-plants", "monstera-deliciosa", "Monstera Deliciosa"),
    ("batch-1-plants", "monstera-adansonii", "Monstera Adansonii"),
    ("batch-1-plants", "bougainvillea-pink", "Bougainvillea Pink"),
    ("batch-1-plants", "ixora-red", "Ixora Red"),
    ("batch-1-plants", "areca-palm-hedge", "Areca Palm Hedge"),
    ("batch-1-plants", "duranta-green-hedge", "Duranta Green Hedge"),
    ("batch-1-plants", "frangipani-tree", "Frangipani Tree"),
    ("batch-1-plants", "polyalthia-tree", "Polyalthia Tree"),
    ("batch-1-plants", "aloe-vera-premium", "Aloe Vera Premium"),
    ("batch-1-plants", "aloe-vera-compact", "Aloe Vera Compact"),
    ("batch-1-plants", "haworthia-zebra", "Haworthia Zebra"),
    ("batch-1-plants", "echeveria-rosette", "Echeveria Rosette"),
    ("batch-1-plants", "golden-barrel-cactus", "Golden Barrel Cactus"),
    ("batch-1-plants", "bunny-ears-cactus", "Bunny Ears Cactus"),
    ("batch-1-plants", "lemon-tree-sapling", "Lemon Tree Sapling"),
    ("batch-1-plants", "guava-tree-sapling", "Guava Tree Sapling"),
    ("batch-1-plants", "tomato-sapling", "Tomato Sapling"),
    ("batch-1-plants", "chilli-sapling", "Chilli Sapling"),
    ("batch-1-plants", "basil-plant", "Basil Plant"),
    ("batch-1-plants", "mint-plant", "Mint Plant"),
    ("batch-1-plants", "petunia-mix", "Petunia Mix"),
    ("batch-1-plants", "marigold-orange", "Marigold Orange"),
    ("batch-1-plants", "geranium-pink", "Geranium Pink"),
    ("batch-1-plants", "chrysanthemum-white", "Chrysanthemum White"),
    ("batch-1-plants", "dahlia-bloom", "Dahlia Bloom"),
    ("batch-1-plants", "calendula-gold", "Calendula Gold"),
    ("batch-2-pots-soil", "matte-plastic-pot", "Matte Plastic Pot"),
    ("batch-2-pots-soil", "self-watering-plastic-pot", "Self-Watering Plastic Pot"),
    ("batch-2-pots-soil", "classic-terracotta-pot", "Classic Terracotta Pot"),
    ("batch-2-pots-soil", "terracotta-bowl", "Terracotta Bowl"),
    ("batch-2-pots-soil", "ivory-ceramic-pot", "Ivory Ceramic Pot"),
    ("batch-2-pots-soil", "speckled-ceramic-planter", "Speckled Ceramic Planter"),
    ("batch-2-pots-soil", "fabric-grow-bag-12l", "Fabric Grow Bag 12L"),
    ("batch-2-pots-soil", "fabric-grow-bag-20l", "Fabric Grow Bag 20L"),
    ("batch-2-pots-soil", "premium-potting-mix", "Premium Potting Mix"),
    ("batch-2-pots-soil", "indoor-potting-mix", "Indoor Potting Mix"),
    ("batch-2-pots-soil", "cocopeat-block", "Cocopeat Block"),
    ("batch-2-pots-soil", "fine-cocopeat", "Fine Cocopeat"),
    ("batch-2-pots-soil", "red-soil-5kg", "Red Soil 5kg"),
    ("batch-2-pots-soil", "red-soil-10kg", "Red Soil 10kg"),
    ("batch-2-pots-soil", "garden-compost", "Garden Compost"),
    ("batch-2-pots-soil", "leaf-compost", "Leaf Compost"),
    ("batch-3-fertilizers-pest-control", "organic-cow-manure", "Organic Cow Manure"),
    ("batch-3-fertilizers-pest-control", "neem-cake-granules", "Neem Cake Granules"),
    ("batch-3-fertilizers-pest-control", "premium-vermicompost", "Premium Vermicompost"),
    ("batch-3-fertilizers-pest-control", "earthworm-castings", "Earthworm Castings"),
    ("batch-3-fertilizers-pest-control", "seaweed-liquid-feed", "Seaweed Liquid Feed"),
    ("batch-3-fertilizers-pest-control", "balanced-liquid-plant-food", "Balanced Liquid Plant Food"),
    ("batch-3-fertilizers-pest-control", "slow-release-green-pellets", "Slow-Release Green Pellets"),
    ("batch-3-fertilizers-pest-control", "flowering-plant-pellets", "Flowering Plant Pellets"),
    ("batch-3-fertilizers-pest-control", "cold-pressed-neem-oil", "Cold-Pressed Neem Oil"),
    ("batch-3-fertilizers-pest-control", "neem-oil-concentrate", "Neem Oil Concentrate"),
    ("batch-3-fertilizers-pest-control", "garden-insect-shield", "Garden Insect Shield"),
    ("batch-3-fertilizers-pest-control", "plant-safe-insect-control", "Plant-safe Insect Control"),
    ("batch-3-fertilizers-pest-control", "copper-fungicide", "Copper Fungicide"),
    ("batch-3-fertilizers-pest-control", "bio-fungicide", "Bio Fungicide"),
    ("batch-4-tools", "long-spout-watering-can", "Long-Spout Watering Can"),
    ("batch-4-tools", "compact-watering-can", "Compact Watering Can"),
    ("batch-4-tools", "steel-hand-trowel", "Steel Hand Trowel"),
    ("batch-4-tools", "ergonomic-hand-trowel", "Ergonomic Hand Trowel"),
    ("batch-4-tools", "bypass-pruner", "Bypass Pruner"),
    ("batch-4-tools", "precision-plant-pruner", "Precision Plant Pruner"),
    ("batch-4-tools", "fine-mist-sprayer", "Fine Mist Sprayer"),
    ("batch-4-tools", "garden-spray-bottle", "Garden Spray Bottle"),
    ("batch-4-tools", "bamboo-plant-stakes", "Bamboo Plant Stakes"),
    ("batch-4-tools", "support-stake-set", "Support Stake Set"),
    ("batch-4-tools", "climbing-plant-trellis", "Climbing Plant Trellis"),
    ("batch-4-tools", "fan-trellis", "Fan Trellis"),
]

PLANT_TERMS = re.compile(r"plant|palm|tree|lily|monstera|snake|aloe|haworthia|echeveria|cactus|bougainvillea|ixora|duranta|frangipani|polyalthia|basil|mint|petunia|marigold|geranium|chrysanthemum|dahlia|calendula", re.I)


def product_prompt(name: str) -> str:
    name_l = name.lower()
    if PLANT_TERMS.search(name):
        return (
            f"Create one photorealistic ecommerce product cutout of the exact product '{name}'. "
            "Depict the named species or cultivar accurately and recognizably, as a single healthy nursery plant. "
            "Show the whole sellable plant only, centered, with natural realistic leaves, stems, flowers or fruit appropriate to the named plant. "
            "Use a simple neutral nursery pot unless the product name itself specifies a distinctive container type. "
            "Transparent background with clean alpha edges, centered composition, generous transparent margins, realistic studio lighting, crisp botanical detail. "
            "No text, branding, watermark, logo, labels, unrelated props, multiple products, or scene background. "
        )
    if "pot" in name_l or "planter" in name_l or "grow bag" in name_l:
        return (
            f"Create one photorealistic ecommerce product cutout of the exact product '{name}'. "
            "Show the exact named container by itself, centered, upright, empty unless the product inherently requires contents, with its characteristic material, shape, rim, handles and finish. "
            "Transparent background, clean alpha edges, realistic studio lighting, crisp product detail. "
            "No plant inside, no soil inside unless integral to the product, no text, branding, watermark, logo, props, or other objects."
        )
    if "cocopeat" in name_l:
        return (
            f"Create one photorealistic ecommerce product cutout of the exact product '{name}'. "
            "Show only the cocopeat material as the named retail form: a compact compressed block for 'Cocopeat Block' or a clean loose mound of fine cocopeat for 'Fine Cocopeat'. "
            "Transparent background, realistic fibrous texture, centered, crisp edges, studio lighting. No bag, no plant, no tools, no labels, no branding, no watermark, no other objects."
        )
    if "soil" in name_l or "compost" in name_l or "potting mix" in name_l or "manure" in name_l or "castings" in name_l or "granules" in name_l or "pellets" in name_l:
        return (
            f"Create one photorealistic ecommerce product cutout of the exact product '{name}'. "
            "Represent the named gardening material in its most useful catalog form: either one neat retail bag when the product is normally sold packaged, or one clean material mound when it is normally shown loose. "
            "Do not invent a brand or readable label. Transparent background, crisp alpha edges, centered, realistic texture and studio light. No plant, no tools, no unrelated objects, no watermark."
        )
    return (
        f"Create one photorealistic ecommerce product cutout of the exact gardening product '{name}'. "
        "Show only that single item in a clean neutral product-shot form, centered and fully visible, with realistic material, shape, proportions, and fine detail appropriate to the named product. "
        "Transparent background, crisp alpha edges, realistic studio lighting, no text, no branding, no watermark, no props, no second product, no unrelated items."
    )


def api_generate(prompt: str) -> bytes:
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set.")
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "size": SOURCE_SIZE,
        "quality": "high",
        "background": "transparent",
        "output_format": "png",
    }
    body = json.dumps(payload).encode("utf-8")
    request = Request(API_URL, data=body, method="POST", headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    })
    with urlopen(request, timeout=600) as response:
        data = json.loads(response.read().decode("utf-8"))
    image_b64 = data.get("data", [{}])[0].get("b64_json")
    if not image_b64:
        raise RuntimeError(f"Image API returned no b64_json: {json.dumps(data)[:1200]}")
    return base64.b64decode(image_b64)


def save_png(raw: bytes, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    tmp = destination.with_suffix(".raw.png")
    tmp.write_bytes(raw)
    with Image.open(tmp) as image:
        rgba = image.convert("RGBA")
        resized = rgba.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
        resized.save(destination, format="PNG", optimize=True)
    tmp.unlink(missing_ok=True)


def retry_delay_for(exc: HTTPError, attempt: int) -> float:
    retry_after = exc.headers.get("Retry-After") if exc.headers else None
    if retry_after:
        try:
            return min(120.0, max(1.0, float(retry_after)))
        except ValueError:
            pass
    # Conservative exponential backoff for rate limits/transient failures.
    return min(120.0, 8.0 * (2 ** (attempt - 1)))


def generate_one(item: tuple[str, str, str]) -> tuple[str, bool, str]:
    batch, slug, name = item
    destination = OUT / batch / f"{slug}.png"
    if destination.exists():
        return slug, True, "exists"

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            raw = api_generate(product_prompt(name))
            save_png(raw, destination)
            time.sleep(BETWEEN_REQUEST_DELAY)
            return slug, True, "generated"
        except HTTPError as exc:
            try:
                body = exc.read().decode("utf-8", errors="replace")
            except Exception:
                body = ""
            if exc.code == 429 and attempt < MAX_ATTEMPTS:
                delay = retry_delay_for(exc, attempt)
                print(f"  {slug}: rate limited (429). Waiting {delay:.0f}s before retry {attempt + 1}/{MAX_ATTEMPTS}…", flush=True)
                time.sleep(delay)
                continue
            detail = f"HTTP {exc.code}: {body[:800]}" if body else f"HTTP {exc.code}: {exc.reason}"
            return slug, False, detail
        except (URLError, TimeoutError, RuntimeError, OSError) as exc:
            if attempt == MAX_ATTEMPTS:
                return slug, False, str(exc)
            delay = min(60.0, 4.0 * attempt)
            print(f"  {slug}: transient error. Waiting {delay:.0f}s before retry {attempt + 1}/{MAX_ATTEMPTS}…", flush=True)
            time.sleep(delay)
    return slug, False, "unknown error"


def write_manifest() -> None:
    manifest = {
        "generated_standard": "1600x1600 PNG RGBA",
        "source_generation_size": SOURCE_SIZE,
        "model": MODEL,
        "batches": {},
    }
    for batch, slug, name in PRODUCTS:
        manifest["batches"].setdefault(batch, []).append({
            "name": name,
            "slug": slug,
            "filename": f"{slug}.png",
        })
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def zip_assets() -> None:
    import zipfile
    if ZIP_NAME.exists():
        ZIP_NAME.unlink()
    with zipfile.ZipFile(ZIP_NAME, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(OUT.rglob("*.png")):
            zf.write(path, path.relative_to(OUT))
        zf.write(OUT / "manifest.json", Path("manifest.json"))


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    write_manifest()
    print(f"Generating {len(PRODUCTS)} exact SKU assets with {MODEL}…")
    print(f"Mode: sequential / rate-limit safe (delay {BETWEEN_REQUEST_DELAY:.1f}s, max {MAX_ATTEMPTS} attempts)")
    failures = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
        futures = [executor.submit(generate_one, item) for item in PRODUCTS]
        completed = 0
        for future in concurrent.futures.as_completed(futures):
            slug, ok, status = future.result()
            completed += 1
            print(f"[{completed:02d}/{len(PRODUCTS)}] {slug}: {'OK' if ok else 'FAIL'} ({status})")
            if not ok:
                failures.append((slug, status))
    write_manifest()
    if failures:
        print("\nFailures:")
        for slug, reason in failures:
            print(f"- {slug}: {reason}")
        print("\nFix the failures and run the script again; completed assets are skipped.")
        return 1
    zip_assets()
    print(f"\nDone. ZIP: {ZIP_NAME}")
    print("Upload verdant-product-assets.zip back into this chat for the one-pass site ingestion.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
