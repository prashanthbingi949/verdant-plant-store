export type ProductImageRecord = {
  slug: string;
  name?: string | null;
  category?: string | null;
  subcategory?: string | null;
  product_type?: "Plants" | "Gardening Supplies" | null;
  image_url?: string | null;
  image_urls?: string[];
};

const CATEGORY_IMAGES: Record<string, string> = {
  "indoor-decorative-greens": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=88",
  "outdoor-landscape-plants": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=88",
  "succulents-cacti": "https://images.unsplash.com/photo-1676089650339-333baa5a7e0b?auto=format&fit=crop&w=1200&q=88",
  "fruit-vegetable-saplings": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=88",
  "seasonal-flowering-plants": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=88",
  "pots-planters": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=88",
  "soil-growing-media": "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=88",
  "fertilizers-nutrients": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=88",
  "pest-control": "https://images.unsplash.com/photo-1621460248083-6271cc4437a8?auto=format&fit=crop&w=1200&q=88",
  "tools-equipment": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=88",
};

const CATEGORY_BY_TERM: Array<[RegExp, string]> = [
  [/monstera|peace-lily|zz-plant|money-plant|pothos|philodendron|fiddle|snake|bird-of-paradise/i, "indoor-decorative-greens"],
  [/jade|aloe|haworthia|echeveria|cactus|cacti|succulent/i, "succulents-cacti"],
  [/bougainvillea|ixora|areca|duranta|frangipani|polyalthia|hedge|large tree|tree/i, "outdoor-landscape-plants"],
  [/lemon tree|guava|tomato|chilli|basil|mint|sapling|vegetable|fruit tree/i, "fruit-vegetable-saplings"],
  [/petunia|marigold|geranium|chrysanthemum|dahlia|calendula|flowering|seasonal/i, "seasonal-flowering-plants"],
  [/pot|planter|grow bag|terracotta|ceramic|plastic pot/i, "pots-planters"],
  [/soil|potting mix|cocopeat|compost/i, "soil-growing-media"],
  [/fertilizer|vermicompost|manure|seaweed|pellet|plant food|neem cake/i, "fertilizers-nutrients"],
  [/neem oil|pesticide|insect|fungicide|pest/i, "pest-control"],
  [/watering|trowel|pruner|sprayer|spray bottle|stake|trellis|tool/i, "tools-equipment"],
];

function isGenericAsset(value: string | null | undefined) {
  if (!value) return true;
  const normalized = value.toLowerCase();
  return normalized.includes("/product-assets/")
    || normalized.startsWith("data:image/svg+xml")
    || /placeholder|default-image|image-not-found|no-image/.test(normalized);
}

function svgData(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) result = (result * 31 + value.charCodeAt(index)) >>> 0;
  return result;
}

function palette(slug: string) {
  const palettes = [
    ["#7da05b", "#4f783f", "#d9d3c5"],
    ["#89ab63", "#5d8447", "#e2ddd1"],
    ["#719255", "#486b3d", "#cec8ba"],
    ["#95ae71", "#5f8148", "#ded8cb"],
  ];
  return palettes[hash(slug) % palettes.length];
}

function plantSvg(slug: string) {
  const [leafA, leafB, pot] = palette(slug);
  const kind = slug.toLowerCase();
  const isSnake = kind.includes("snake-plant");
  const isAloe = kind.includes("aloe");
  const isCactus = kind.includes("cactus");
  const isHaworthia = kind.includes("haworthia");
  const isEcheveria = kind.includes("echeveria");
  const isPeace = kind.includes("peace-lily");
  const isMonstera = kind.includes("monstera");
  const isMoney = kind.includes("money-plant") || kind.includes("money-plant");
  const isFiddle = kind.includes("fiddle");
  const isBird = kind.includes("bird-of-paradise");
  const isFlowering = /bougainvillea|ixora|petunia|marigold|geranium|chrysanthemum|dahlia|calendula|lavender/.test(kind);
  const isFruitVeg = /lemon|guava|tomato|chilli|basil|mint/.test(kind);
  const isPalm = /areca|frangipani|polyalthia/.test(kind);
  const isDuranta = kind.includes("duranta");

  const leaves = isSnake
    ? `<path d="M275 500C226 336 234 164 286 82c42 124 32 279-11 418Z" fill="${leafA}"/><path d="M319 505C299 329 344 160 402 94c24 143-3 283-83 411Z" fill="${leafB}"/><path d="M242 502C188 374 168 264 205 189c67 90 68 210 37 313Z" fill="${leafB}"/>`
    : isCactus
      ? `<path d="M286 503V214h38v289Z" fill="${leafB}"/><path d="M286 336h-57c-21 0-37 17-37 38v43h28v-33c0-9 7-17 17-17h49Z" fill="${leafA}"/><path d="M324 286h54c21 0 37 17 37 38v35h-27v-25c0-9-7-16-16-16h-48Z" fill="${leafA}"/>`
      : isEcheveria || isHaworthia
        ? `<g fill="${leafA}">${Array.from({ length: 10 }, (_, index) => {
            const angle = index * 36;
            return `<ellipse cx="300" cy="356" rx="26" ry="92" transform="rotate(${angle} 300 356)"/>`;
          }).join("")}</g><circle cx="300" cy="356" r="38" fill="${leafB}"/>`
        : isAloe
          ? `<path d="M300 508C269 387 246 205 274 87c42 92 50 260 26 421Z" fill="${leafA}"/><path d="M300 507c28-140 61-307 100-392 12 114-13 269-83 393Z" fill="${leafB}"/><path d="M284 507c-59-124-105-243-105-344 73 68 98 177 105 344Z" fill="${leafB}"/><path d="M311 508c49-110 102-189 160-236-21 114-78 181-151 248Z" fill="${leafA}"/>`
          : isBird
            ? `<g fill="${leafA}"><path d="M300 505V190c-22-82 6-137 72-167 17 88-4 153-64 191v164Z"/><path d="M315 306c78-61 148-62 204-15-24 83-104 106-204 56Z" fill="${leafB}"/><path d="M292 394c-73-45-137-26-176 29 55 66 120 65 176 12Z" fill="${leafB}"/></g><path d="M371 164c48-83 96-92 141-70-20 61-58 81-126 71Z" fill="#e78d46"/>`
            : isFiddle
              ? `<path d="M300 505V168" stroke="#6b573e" stroke-width="10" stroke-linecap="round"/><g fill="${leafA}"><path d="M300 238c-84-28-126-91-95-143 83-4 119 42 95 143Z"/><path d="M307 324c77-30 139-13 160 44-70 44-124 27-160-44Z" fill="${leafB}"/><path d="M297 405c-72-31-124-11-143 42 64 44 115 26 143-42Z" fill="${leafA}"/></g>`
              : `<g fill="${leafA}">
                  <path d="M300 506V244C228 208 151 221 110 272c58 67 121 88 190 50Z"/>
                  <path d="M307 320c48-83 122-116 202-88-18 91-92 119-202 102Z" fill="${leafB}"/>
                  <path d="M302 394c-66-50-145-41-184 10 50 60 116 65 184 18Z" fill="${leafB}"/>
                  <path d="M303 245c-40-71-24-139 27-184 50 67 44 121-27 184Z" fill="${leafB}"/>
                </g>`;

  const flower = isFlowering ? `<g fill="#b47cca"><circle cx="249" cy="205" r="14"/><circle cx="276" cy="190" r="12"/><circle cx="417" cy="257" r="13"/><circle cx="441" cy="243" r="10"/></g>` : "";
  const monstera = isMonstera ? `<g fill="#f1f1e7"><ellipse cx="181" cy="325" rx="11" ry="30" transform="rotate(-35 181 325)"/><ellipse cx="416" cy="269" rx="12" ry="31" transform="rotate(28 416 269)"/><ellipse cx="393" cy="410" rx="10" ry="26" transform="rotate(35 393 410)"/></g>` : "";
  const moneyOrDuranta = isMoney || isDuranta ? `<path d="M300 505V190" stroke="#6b573e" stroke-width="9" stroke-linecap="round"/>` : "";
  const palm = isPalm ? `<path d="M300 505V145" stroke="#6b573e" stroke-width="10"/><path d="M300 214C223 154 151 152 102 188 165 230 229 239 300 214Z" fill="${leafA}"/><path d="M300 214c77-61 147-63 198-25-60 43-124 49-198 25Z" fill="${leafB}"/>` : "";

  return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><ellipse cx="300" cy="548" rx="135" ry="20" fill="#000" opacity=".08"/>${moneyOrDuranta}${palm}${leaves}${flower}${monstera}<path d="M212 505h176l-20 58H232Z" fill="${pot}"/><ellipse cx="300" cy="505" rx="88" ry="15" fill="#786f63"/></svg>`);
}

function supplySvg(slug: string) {
  const kind = slug.toLowerCase();
  const [, accent, base] = palette(slug);
  const potLike = /pot|planter|grow-bag/.test(kind);
  const soil = /soil|compost|potting-mix|cocopeat/.test(kind);
  const fertilizer = /fertilizer|vermicompost|manure|neem-cake|seaweed|pellet|plant-food/.test(kind);
  const pest = /neem-oil|pesticide|insect|fungicide|pest/.test(kind);
  const watering = /watering-can/.test(kind);
  const trowel = /trowel/.test(kind);
  const pruner = /pruner/.test(kind);
  const spray = /sprayer|spray-bottle/.test(kind);
  const stake = /stake/.test(kind);
  const trellis = /trellis/.test(kind);
  let art = `<rect x="207" y="176" width="186" height="276" rx="26" fill="${base}" stroke="${accent}" stroke-width="8"/><rect x="225" y="210" width="150" height="70" rx="16" fill="#eef0df"/><rect x="255" y="304" width="90" height="18" rx="9" fill="${accent}"/>`;
  if (potLike) art = `<path d="M180 205h240l-24 290H204Z" fill="${base}" stroke="${accent}" stroke-width="8"/><path d="M165 205h270" stroke="${accent}" stroke-width="16" stroke-linecap="round"/><path d="M208 260h184" stroke="#eef0df" stroke-width="14" stroke-linecap="round"/>`;
  if (soil) art = kind.includes("cocopeat-block") ? `<path d="M160 250l230-50 74 86-233 53Z" fill="#a95c33"/><path d="M231 339l233-53v130l-230 54Z" fill="#7f452a"/><path d="M160 250l71 89-1 131-71-88Z" fill="#95502e"/>` : `<path d="M182 208h236l-30 282H212Z" fill="${base}" stroke="${accent}" stroke-width="8"/><path d="M182 236h236" stroke="#eef0df" stroke-width="26"/><path d="M235 316h130" stroke="${accent}" stroke-width="16" stroke-linecap="round"/><path d="M230 363h140" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>`;
  if (fertilizer || pest) art = `<path d="M215 190h170v300H215Z" fill="${base}" stroke="${accent}" stroke-width="8"/><path d="M250 190v-42h100v42" fill="none" stroke="${accent}" stroke-width="12" stroke-linecap="round"/><rect x="238" y="258" width="124" height="58" rx="12" fill="#eef0df"/><circle cx="300" cy="390" r="42" fill="${accent}" opacity=".82"/>`;
  if (watering) art = `<path d="M170 244h232c34 0 58 25 58 57v172H170V301c0-32 25-57 57-57Z" fill="${accent}"/><path d="M225 244c-8-71 19-112 75-112s83 41 75 112" fill="none" stroke="#536635" stroke-width="24" stroke-linecap="round"/><path d="M402 330c78-58 132-65 151-42-28 58-81 75-151 76" fill="${accent}"/>`;
  if (trowel) art = `<path d="M333 342c13 50 18 93 16 123" stroke="#9a6335" stroke-width="34" stroke-linecap="round"/><path d="M308 334L176 124c-16-25 11-55 39-40l148 82c29 16 35 52 11 75L355 339c-10 10-35 10-47-5Z" fill="#737a82"/>`;
  if (pruner) art = `<path d="M273 314L192 225" stroke="#7b5335" stroke-width="28" stroke-linecap="round"/><path d="M327 314l81-89" stroke="#7b5335" stroke-width="28" stroke-linecap="round"/><path d="M279 309l-87-111" stroke="#70777e" stroke-width="14" stroke-linecap="round"/><path d="M321 309l87-111" stroke="#70777e" stroke-width="14" stroke-linecap="round"/><circle cx="300" cy="310" r="29" fill="#8b9159"/>`;
  if (spray) art = `<path d="M244 214h112c21 0 37 16 37 37v232H244Z" fill="${base}" stroke="${accent}" stroke-width="8"/><path d="M275 214v-40h70v40" fill="none" stroke="${accent}" stroke-width="10"/><path d="M356 274h82l45-33" stroke="${accent}" stroke-width="14" stroke-linecap="round"/><circle cx="234" cy="213" r="12" fill="${accent}"/>`;
  if (stake) art = `<path d="M217 170v316M300 170v316M383 170v316" stroke="${accent}" stroke-width="12" stroke-linecap="round"/><path d="M193 486h214" stroke="#7b6b54" stroke-width="14" stroke-linecap="round"/>`;
  if (trellis) art = `<path d="M186 170v320M414 170v320M186 225h228M186 300h228M186 375h228M186 450h228M186 170L414 490M414 170L186 490" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>`;
  return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><ellipse cx="300" cy="548" rx="145" ry="20" fill="#000" opacity=".08"/>${art}</svg>`);
}

function exactPlaceholder(product: ProductImageRecord) {
  const category = `${product.category || ""} ${product.subcategory || ""}`.toLowerCase();
  const haystack = `${product.slug} ${product.name || ""}`.toLowerCase();
  const isPlantRecord = product.product_type === "Plants"
    || /indoor|decorative|greens|outdoor|landscape|succulent|cacti|flower|sapling|plant|tree|shrub|hedge|herb/.test(`${category} ${haystack}`)
    || /aloe|jade|monstera|snake|fiddle|bird-of-paradise|peace-lily|zz-plant|money-plant|bougainvillea|ixora|areca|duranta|frangipani|polyalthia|haworthia|echeveria|cactus|lemon|guava|tomato|chilli|basil|mint|petunia|marigold|geranium|chrysanthemum|dahlia|calendula|lavender/.test(haystack);
  return isPlantRecord ? plantSvg(product.slug) : supplySvg(product.slug);
}

export function productImage(product: ProductImageRecord) {
  const uploaded = [product.image_url, ...(product.image_urls || [])].find((value) => !isGenericAsset(value));
  if (uploaded) return uploaded;
  return exactPlaceholder(product);
}

export function productImages(product: ProductImageRecord) {
  const primary = productImage(product);
  const uploaded = [product.image_url, ...(product.image_urls || [])].filter((value): value is string => Boolean(value) && !isGenericAsset(value));
  return Array.from(new Set([primary, ...uploaded].filter(Boolean)));
}

export const productImageAssets = {
  exactPlaceholder: true,
  categoryImages: CATEGORY_IMAGES,
};
