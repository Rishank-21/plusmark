# Migration report mrun_7b8edee281d6465c96fcdaf476525068

- Mode: apply
- Committed: yes
- Reconciled: yes
- Source checksum: 6b6799641be87ebcc6e4d363b5e704f08476ce8d0a2bb9b7745aaca42b601a12

## Steps

| Step | Status | Counts |
| --- | --- | --- |
| catalog | ok | categories_read=12, category_updated=12, subcategory_updated=32, products_read=15, variants_read=42, products_updated=15, images_mapped=25, attributes_mapped=100, variants_updated=42, prices_updated=35, inventory_missing_stock=12, inventory_levels_updated=15, inventory_not_tracked=15, prices_on_request=7, catalog_rows_rebuilt=15 |
| customers | ok | profiles_read=153, customers_updated=150, admin_profiles_not_customers=3, addresses_read=119, addresses_updated=119 |
| admin_users | ok | admin_profiles_read=3, admins_existing=3 |
| orders | ok | orders_read=300, orders_unchanged=300 |
| remaining | ok | reviews_read=74, reviews_updated=71, review_skipped=3, saved_boards_read=195, wishlist_items_unchanged=192, saved_board_skipped=3, coupons_read=42, coupon_budgets_written=19, coupon_minimum_rules=27, coupons_updated=40, coupon_skipped=2, shipping_methods_read=6, shipping_options_updated=5, shipping_method_skipped=1, site_content_read=30, site_content_unchanged=30, payment_events_read=175, payment_events_unchanged=175 |

## Entities

| Entity | Source | Migrated | Skipped | Failed | Source checksum (count / sum / md5) | Target checksum (count / sum / md5) |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| category | 12 | 12 | 0 | 0 | 12 / - / 068afd5c6685 | 12 / - / 068afd5c6685 |
| product | 15 | 15 | 0 | 0 | 15 / - / e2dc314d8569 | 15 / - / e2dc314d8569 |
| variant | 42 | 42 | 0 | 0 | 42 / - / ad1a9347bd71 | 42 / - / ad1a9347bd71 |
| stock | 15 | 15 | 0 | 0 | 15 / 1574.00 / 6bc819826054 | 15 / 1574.00 / 6bc819826054 |
| customer | 150 | 150 | 0 | 0 | 150 / - / fdf45eae6920 | 150 / - / fdf45eae6920 |
| customer_address | 119 | 119 | 0 | 0 | 119 / - / c4acde9dd245 | 119 / - / c4acde9dd245 |
| admin_user | 3 | 3 | 0 | 0 | 3 / - / 01052def460d | 3 / - / 01052def460d |
| order | 300 | 300 | 0 | 0 | 300 / 146296419.40 / 7ed8cc2fb799 | 300 / 146296419.40 / 7ed8cc2fb799 |
| review | 74 | 71 | 3 | 0 | 74 / - / 78a08cb55b06 | 71 / - / b9d7771918dc |
| saved_board | 195 | 192 | 3 | 0 | 195 / - / a03e76af6634 | 192 / - / c2ffaa35b9cb |
| coupon | 42 | 40 | 2 | 0 | 42 / - / 16e617374b45 | 40 / - / 9c5786dbedcc |
| shipping_method | 6 | 5 | 1 | 0 | 6 / - / dae8ff3eb43a | 5 / - / d22186880507 |

## Mismatches

None.

## Skipped and failed records

- review 0fa5a33d-d40e-4ee8-ad75-2d7cffdf6643: review 0fa5a33d-d40e-4ee8-ad75-2d7cffdf6643: no product for slug "ghost-13"
- review 77ca032e-21b8-4c52-a023-3a2b1e26ce92: review 77ca032e-21b8-4c52-a023-3a2b1e26ce92: no product for slug "ghost-38"
- review 7dca1d5e-74c1-43b2-a2b9-b25e39017e1a: review 7dca1d5e-74c1-43b2-a2b9-b25e39017e1a: no product for slug "ghost-49"
- saved_board 81465f98-fc68-43da-a153-0d2c0231451d:ghost-3: saved_board 81465f98-fc68-43da-a153-0d2c0231451d:ghost-3: no product for slug "ghost-3"
- saved_board 76fa1868-f2bd-4e7e-a15c-8a258a12acf4:ghost-18: saved_board 76fa1868-f2bd-4e7e-a15c-8a258a12acf4:ghost-18: no product for slug "ghost-18"
- saved_board 4f340885-bf0f-4741-a0c1-f8328ba8cca0:ghost-38: saved_board 4f340885-bf0f-4741-a0c1-f8328ba8cca0:ghost-38: no product for slug "ghost-38"
- coupon a8865711-0143-4aec-a092-c22bd8df452d: coupon a8865711-0143-4aec-a092-c22bd8df452d: percentage 150.00 is over 100
- coupon c1847fdf-ec66-4627-acad-63df92c409c3: coupon c1847fdf-ec66-4627-acad-63df92c409c3: ends_at Thu Jan 01 2026 00:00:00 GMT+0530 (India Standard Time) is before starts_at Sun Mar 01 2026 00:00:00 GMT+0530 (India Standard Time)
- shipping_method freight: shipping_method freight: price on request: a flat Shipping_Option needs a price

## Step reasons

- [catalog] note variant 54ae965f-0dc4-48c4-a49e-e17a81ef1929: track_inventory is on but stock is empty, no inventory level created
- [catalog] note variant 7b1201dd-ede0-49dc-a83f-51ab99c90bc8: track_inventory is on but stock is empty, no inventory level created
- [catalog] note variant 14239cc0-67d1-4eb3-a4e0-a8c40090117e: track_inventory is on but stock is empty, no inventory level created
- [catalog] note variant 5a876ac5-72b9-4b03-ad9c-9622045200f5: track_inventory is on but stock is empty, no inventory level created
- [catalog] note variant 7f8b04f1-5ea1-48e8-ab21-e8b3bdeaf5d0: track_inventory is on but stock is empty, no inventory level created
- [catalog] note variant a1b5abad-ff8f-4488-acce-55cdc986dd10: track_inventory is on but stock is empty, no inventory level created
- [catalog] note variant 8c988e51-2603-4db5-abdd-69ef39776d11: track_inventory is on but stock is empty, no inventory level created
- [catalog] note variant 4a9fccd7-1edb-4502-ac9a-3041f8c97669: track_inventory is on but stock is empty, no inventory level created
- [catalog] note variant 0a5d4bb5-969a-4254-a73e-d7e5716b6c6a: track_inventory is on but stock is empty, no inventory level created
- [catalog] note variant 36c26f1d-fba6-4332-a729-4ec666f177d6: track_inventory is on but stock is empty, no inventory level created
- [catalog] note variant b4855258-07b1-4722-a0a2-0d9d16ac7c27: track_inventory is on but stock is empty, no inventory level created
- [catalog] note variant c165fcd7-1ad4-4e28-ae18-1cfd36a732ef: track_inventory is on but stock is empty, no inventory level created
- [remaining] review 0fa5a33d-d40e-4ee8-ad75-2d7cffdf6643: no product for slug "ghost-13"
- [remaining] review 7dca1d5e-74c1-43b2-a2b9-b25e39017e1a: no product for slug "ghost-49"
- [remaining] review 77ca032e-21b8-4c52-a023-3a2b1e26ce92: no product for slug "ghost-38"
- [remaining] saved_board 4f340885-bf0f-4741-a0c1-f8328ba8cca0:ghost-38: no product for slug "ghost-38"
- [remaining] saved_board 76fa1868-f2bd-4e7e-a15c-8a258a12acf4:ghost-18: no product for slug "ghost-18"
- [remaining] saved_board 81465f98-fc68-43da-a153-0d2c0231451d:ghost-3: no product for slug "ghost-3"
- [remaining] coupon a8865711-0143-4aec-a092-c22bd8df452d: percentage 150.00 is over 100
- [remaining] coupon c1847fdf-ec66-4627-acad-63df92c409c3: ends_at Thu Jan 01 2026 00:00:00 GMT+0530 (India Standard Time) is before starts_at Sun Mar 01 2026 00:00:00 GMT+0530 (India Standard Time)
- [remaining] shipping_method freight: price on request: a flat Shipping_Option needs a price
