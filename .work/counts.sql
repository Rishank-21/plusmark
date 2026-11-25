select 'orders', count(*) from medusa."order"
union all select 'customers', count(*) from medusa.customer
union all select 'products', count(*) from medusa.product
union all select 'variants', count(*) from medusa.product_variant
union all select 'carts', count(*) from medusa.cart
union all select 'prices', count(*) from medusa.price
union all select 'inventory_items', count(*) from medusa.inventory_item
union all select 'categories', count(*) from medusa.product_category
union all select 'collections', count(*) from medusa.product_collection
union all select 'auth_users', count(*) from auth.users
union all select 'events', count(*) from ext.analytics_event
union all select 'payments', count(*) from medusa.payment
union all select 'promotions', count(*) from medusa.promotion
union all select 'reviews', count(*) from ext.product_review
union all select 'enquiries', count(*) from ext.enquiry
union all select 'quotations', count(*) from ext.quotation
union all select 'admin_users', count(*) from ext.admin_user_link
union all select 'alerts', count(*) from ext.alert
union all select 'order_facts', count(*) from ext.order_fact
union all select 'sales_rollup_rows', count(*) from ext.daily_sales_rollup
order by 1;
