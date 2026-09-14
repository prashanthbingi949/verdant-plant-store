# Verdant Production Release QA

## Release gate

Verdant is release-ready only when the automated checks pass and the manual browser matrix below passes on the same commit.

## Automated checks

- `npm ci`
- `npm run lint`
- `npm run build`
- `npm run start`
- `npm run qa:smoke`

The GitHub Actions workflow `.github/workflows/release-qa.yml` runs the automated gate on `main` and pull requests.

## Desktop matrix

Run at 1280px and 1440px-equivalent viewport widths.

- 100% zoom
- 90% zoom
- 80% zoom

Verify no horizontal overflow and correct header alignment.

## Tablet / iPad matrix

Test portrait and landscape around 768px–1024px CSS widths.

- Home navigation
- Shop category rail, filters and four-column product grid
- Product detail gallery, purchase block and save
- Favourites grid
- Mini cart and Cart
- Checkout form, order summary and payment action
- Admin header horizontal navigation
- Admin Product Master and Inventory controls

## Mobile matrix

Test around 375px and 430px CSS widths.

- Home navigation and hero
- Shop two-column product grid
- Search and category filters
- Product detail image gallery and mobile purchase bar
- Favourite save state persistence
- Mini cart drawer scrolling and delete controls
- Cart delete controls, quantity controls and summary
- Checkout stacking and payment action
- Order confirmation and tracking links
- Admin navigation and form overflow

## Core customer flow

1. Home → Shop.
2. Home product → Product Detail.
3. Save product → Favourites → verify same state on Shop/Product/Home.
4. Shop filter/category/mood link → expected filtered catalogue.
5. Add one product → mini cart quantity remains 1 after navigation and reload.
6. Change quantity → line total and CTA totals remain correct.
7. Delete item → item disappears and totals recalculate.
8. Cross delivery threshold → free delivery state updates.
9. Cart → Checkout.
10. Checkout → Razorpay test payment → confirmation.
11. Confirmation → Track order.

## CMS / commerce flow

1. Product Master save → storefront reflection.
2. Compare-at price appears only when valid and greater than selling price.
3. Product image and alt text flow through to Product Detail.
4. Related / Complete the Corner curation follows Product Master order.
5. Draft / archived products stay out of the public catalogue.
6. Inventory stock movement updates on-hand stock and movement history.
7. Reorder rule saves correctly.
8. Admin order status updates persist and tracking reflects the status.

## Negative / failure states

- Empty cart
- Empty search
- Unknown product slug
- Draft/archived product slug
- Out-of-stock product
- Failed Product Master save
- Failed image upload
- Unauthorized admin route
- Expired admin session
- Payment-return failure / missing order parameters

## Content and visual gate

- Shop hides SKU, full description and category/subcategory metadata from product tiles.
- Product Detail retains full editorial product content.
- Shop CTA reads `View details`.
- Dark green buttons use cream text; no dark-on-dark CTA text.
- Product delete actions use icon-only controls with accessible labels.
- Actual Cart header does not display the item-count label.
- Cart and mini-cart item quantities never multiply on reload/navigation.
