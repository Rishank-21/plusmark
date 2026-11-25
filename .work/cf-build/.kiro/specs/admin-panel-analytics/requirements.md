# Requirements Document

## Introduction

This spec defines the Admin_App, a new admin panel for Plusmark stores. It is spec 2 of 4. Spec 1 (supabase-medusa-backend) built the Supabase backend that the Admin_App uses: the Admin_API, Roles and Permissions, the Audit_Log, Security_Events, Store_Settings, and Analytics_Events with their daily rollups. Spec 3 covers the storefront, and spec 4 covers multi-client provisioning.

The Admin_App lets Admin_Users run daily store operations, read Reports (including India GST_Reports), follow trends and Forecasts, and act on Alerts. Scheduled_Reports and Alerts also arrive by email. The Admin_App works on phones and desktops, in Hindi and English. Forecasts and other predictions come from built-in statistical models that run inside Supabase.

The Legacy_Admin keeps working until cutover, so both admins use the same backend during the transition.

Requirements 1 to 4 set the foundations that every Admin_App screen depends on: hosting and sessions, Permissions and PII protection, phone-first UX, and language support.

## Glossary

Terms defined in spec 1 (supabase-medusa-backend) keep their meaning here, including Admin_API, Admin_User, Role, Permission, Audit_Log, Security_Events, Store_Settings, Analytics_Events and Secret. The terms below are new in this spec.

- **Admin_App**: The admin web application built by this spec. It is a static build hosted on Cloudflare Pages at its own subdomain, and it reaches the backend only through Supabase Auth and the Admin_API.
- **Dashboard**: An Admin_App screen that shows KPIs, trend charts and open Alerts for a Reporting_Period.
- **KPI**: A named store metric with a fixed, documented formula, such as net sales, order count or average order value, computed for a Reporting_Period.
- **Report**: A defined view of store data for a Reporting_Period, with filters, grouping, totals and an optional Comparison_Period.
- **Report_Export**: A downloadable file generated from a Report, with the Report's filters and Reporting_Period applied.
- **Background_Export**: A Report_Export that the Backend generates as a background job because the Report_Export has more rows than the export row threshold of Requirement 19.
- **Saved_View**: A named set of filters, columns, grouping, sort order, Reporting_Period and Comparison_Period for a Report or list screen, saved by an Admin_User, the Saved_View's creator. A personal Saved_View is visible to the creator only. A shared Saved_View is visible to every Admin_User who holds the Permission of the Saved_View's screen.
- **Scheduled_Report**: A Report that is generated on a recurring schedule and emailed to named recipients.
- **Scheduled_Run**: One run of a Scheduled_Report for one of the Scheduled_Report's scheduled times, which emails the Report for the Scheduled_Run's Covered_Period to the Scheduled_Report's recipients.
- **Covered_Period**: The Reporting_Period that the emails of a Scheduled_Run cover, set by Requirement 20.
- **Forecast**: A series of predicted future values for one metric, each with a Confidence_Band, produced by a Forecast_Model.
- **Forecast_Series**: The daily values of one forecast metric for one scope: the net sales or the order count of one Sales_Channel in one currency, or the units of one product variant summed over all Sales_Channels. The Backend computes one Forecast for each Forecast_Series.
- **Forecast_Model**: A built-in statistical forecasting method that runs inside Supabase, such as seasonal naive or exponential smoothing.
- **Backtest**: A test of a Forecast_Model in which the model forecasts a past period from the data before that period, and the Forecast is compared with the actual values.
- **WAPE**: Weighted absolute percentage error of a Backtest: the sum of absolute errors (actual minus forecast) divided by the sum of actual values, shown as a percentage.
- **Confidence_Band**: The lower and upper bounds around a Forecast value within which the actual value is expected to fall with a stated probability, such as 80%.
- **Demand_Forecast**: The Forecast of the units of one product variant sold per day, summed over all Sales_Channels.
- **Stock_Out_Prediction**: The predicted first day on which a product variant's cumulative Demand_Forecast exceeds the variant's Available_Quantity summed over all Stock_Locations, set by Requirement 22.
- **Reorder_Suggestion**: A suggested reorder quantity and order-by date for a product variant, set by Requirement 22 from the variant's Demand_Forecast, Available_Quantity, Incoming_Quantity, Lead_Time and Safety_Stock.
- **Anomaly**: An actual metric value that falls outside the Confidence_Band that a Forecast_Model expected for the same time.
- **Alert_Rule**: A configured condition on a metric, Anomaly, stock level or Security_Events entry, with a severity, recipients and delivery channels, that creates an Alert when met.
- **Alert**: A notification created when an Alert_Rule's condition is met. Each Alert is open, acknowledged or resolved.
- **RFM_Segment**: A named group of Customers, such as Champions or At risk, to which the rules of Requirement 16 assign each Customer from the Customer's recency, frequency and monetary scores.
- **Cohort**: A group of customers whose first orders fell in the same calendar month, tracked over later months for retention and revenue.
- **Churn_Risk**: A level (low, medium or high) that estimates how likely a customer is to stop ordering, computed from the customer's order history.
- **Data_Freshness**: The time of the newest data included in a KPI, Report, Forecast or Alert, shown as "data as of" a date and time.
- **PII_Field**: A field that holds personal data of a customer or Admin_User: name, email address, phone number, postal address or IP address. Unmasked access requires the pii:reveal Permission, called the PII Permission in this document.
- **Masked_Value**: A display form of a PII_Field in which `*` replaces more than half of the characters, counted without the `@` and domain of an email address, such as `98******10` or `r****@example.com`.
- **Reveal_Limit**: A Store_Settings value (default 30, allowed 1 to 300) that sets the largest number of different records whose PII_Fields one Admin_User may reveal in any 60-minute period.
- **Diagnostic_Log**: The log output that Admin_API functions write for debugging and monitoring, such as Edge Function logs, separate from the Audit_Log and Security_Events.
- **Sensitive_Action**: An action that requires a TOTP verification within the Re_Authentication_Window: a refund above a configured refund threshold (default ₹10,000), a change to an Admin_User's Roles (including the Roles of an invitation), a save in the Role builder, a reset of an Admin_User's TOTP factor, a change to payment, shipping, email or other provider settings, a change to the Store_Timezone, a Report_Export or other data export, or the confirmation of the Admin_App_Cutover.
- **Store_Timezone**: A configured IANA time zone in Store_Settings (default Asia/Kolkata). The Store_Timezone sets day boundaries for KPIs and Reports and the time zone of every displayed date and time.
- **Default_Admin_Language**: A Store_Settings value, English or Hindi, that sets the language of the Admin_App screens before sign-in and of the emails to recipients with no saved language. English applies when the value is unset.
- **Reporting_Period**: The date range covered by a KPI, Dashboard or Report, with an inclusive start date and end date in the Store_Timezone.
- **Comparison_Period**: A second date range shown against a Reporting_Period: the previous period of equal length, the same period one year earlier, or a custom range.
- **GST_Report**: A Report for India's Goods and Services Tax, such as a GSTR-1 outward supplies report, an HSN-wise summary or a GSTR-3B tax summary, built from the Tax_Invoices, Credit_Notes and Debit_Notes of a Filing_Period and their recorded tax lines.
- **Legacy_Admin**: The existing admin at `src/app/admin` in the current Next.js app.
- **Client_Branding**: A store's name, logo and brand colours, read from Store_Settings and shown in the Admin_App.
- **TOTP**: The time-based one-time password factor of Supabase Auth MFA, entered from an authenticator app. A verified TOTP code raises the session to aal2.
- **Admin_Activity**: A key press, click, tap or scroll by a person in any open Admin_App tab of the browser. Background requests and timers are not Admin_Activity.
- **Idle_Timeout**: A Store_Settings value (default 30 minutes, allowed 5 to 60 minutes) that sets how long a session may go without Admin_Activity before the Admin_App signs the session out.
- **Absolute_Session_Limit**: A Store_Settings value (default 12 hours, allowed 1 to 24 hours) that sets the longest time a session may last after the Admin_User's password sign-in, whatever the Admin_Activity.
- **Re_Authentication_Window**: A Store_Settings value (default 5 minutes, allowed 1 to 15 minutes) that sets how long after a session's last TOTP verification the session may send a Sensitive_Action without a new TOTP verification.
- **Local_Admin_Data**: The Supabase Auth session tokens, the Admin_API responses and the form input that the Admin_App holds in memory or in browser storage (cookies, Web Storage, IndexedDB and Cache Storage) of the Admin_App origin.
- **Session_Rejection**: An Admin_API rejection of a request because the session is below aal2, the session's sign-in is older than the Absolute_Session_Limit, the session's TOTP factor was enrolled outside an invitation acceptance, or the account is disabled or is not an Admin_User.
- **Storefront_Session**: One visit to the storefront, identified by the pseudonymous session ID recorded with Analytics_Events.
- **Dry_Run**: A check of every row of an uploaded CSV file that reports the errors of each row and writes no data.
- **Edit_Conflict**: A save that the Admin_API rejects because the record changed after the Admin_App loaded the record. The rejected save leaves the record unchanged.
- **Refundable_Amount**: For an Order, the total of captured payments and recorded Cash_On_Delivery cash receipts, minus the total already refunded.
- **Payment_Incident**: A payment that the Backend flags for an Admin_User decision, such as a successful payment for a Cart whose items could no longer be reserved.
- **Stock_Location_Priority**: A ranking of Stock_Locations that sets the order in which the Backend reserves stock from each Stock_Location for a new Order.
- **Lifetime_Value**: For a Customer, the total of captured payments and recorded Cash_On_Delivery cash receipts across all of the Customer's Orders, minus the total refunded on those Orders.
- **Account_Deletion_Request**: A Registered_Customer's request to delete the Customer's account and personal data, with a status that records the request's progress.
- **GSTIN**: The 15-character Goods and Services Tax Identification Number that India's GST system issues to a registered business.
- **Valid_GSTIN**: A GSTIN of 15 uppercase letters and digits whose first 2 characters are a GST state code and whose last character equals the result of the GSTIN check-character calculation over the first 14 characters.
- **HSN_Code**: A Harmonized System of Nomenclature code of 4, 6 or 8 digits that classifies a product for India's GST and appears on Tax_Invoices, Credit_Notes, Debit_Notes and GST_Reports.
- **Storefront_Funnel**: The ordered steps of a Storefront_Session, counted from Analytics_Events: session start, product view, cart addition, checkout started and Order placed. Each Storefront_Session counts once at each step that the Storefront_Session reached.
- **View_To_Cart_Rate**: Of the Storefront_Sessions that viewed a product in a Reporting_Period, the percentage that also added the product to a Cart.
- **View_To_Order_Rate**: Of the Storefront_Sessions that viewed a product in a Reporting_Period, the percentage that also placed an Order containing the product.
- **Return_Rate**: For a product and a Reporting_Period, the units of the product on Returns received in the Reporting_Period divided by the units of the product sold in the Reporting_Period, shown as a percentage.
- **New_Customer**: For a Reporting_Period, a Customer whose first Order was placed in the Reporting_Period.
- **Returning_Customer**: For a Reporting_Period, a Customer who placed an Order in the Reporting_Period and whose first Order was placed before the Reporting_Period.
- **Abandoned_Cart**: A Cart with at least one line item that went a configured abandonment delay (default 60 minutes) without a change and without becoming an Order. The Cart stays an Abandoned_Cart if the Cart later becomes an Order.
- **Recovered_Cart**: An Abandoned_Cart that became an Order within a configured recovery window (default 7 days) after the abandonment delay ended.
- **UTM_Parameters**: The utm_source, utm_medium and utm_campaign values in the URL on which a Storefront_Session started, recorded with Analytics_Events.
- **Sell_Through_Rate**: For a product variant and a Reporting_Period, the units sold in the Reporting_Period divided by the sum of those units and the stocked quantity across all Stock_Locations at the end of the Reporting_Period, shown as a percentage.
- **Days_Of_Cover**: For a product variant, the Available_Quantity summed over all Stock_Locations divided by the average units sold per day in a configured cover window (default the last 30 days). A product variant with no units sold in the cover window shows "no recent sales" instead of a number.
- **Filing_Month**: The calendar month, in the Store_Timezone, for which the store files GSTR-1 and GSTR-3B (the GST return month).
- **Filing_Period**: The period that one GST_Report covers: one Filing_Month, or one quarter in the Store_Timezone (April to June, July to September, October to December or January to March). A GST_Report covers the GST_Documents dated in the GST_Report's Filing_Period.
- **Financial_Year**: The Indian financial year from 1 April to 31 March in the Store_Timezone, such as 2026-27 for 1 April 2026 to 31 March 2027.
- **Tax_Invoice**: The GST invoice that the Backend issues for an Order when the Order's first fulfillment is marked shipped, dated with the date of that shipment in the Store_Timezone.
- **Credit_Note**: A GST document, issued for a refund, a Return or an item canceled after an Order's Tax_Invoice was issued, that reduces the taxable value and tax of the Tax_Invoice and references the Tax_Invoice.
- **Debit_Note**: A GST document, issued for an increase after an Order's Tax_Invoice was issued, such as from an exchange or an Order edit, that increases the taxable value and tax of the Tax_Invoice and references the Tax_Invoice.
- **GST_Document**: A Tax_Invoice, Credit_Note or Debit_Note. Each GST_Document records at issue the buyer name, the buyer GSTIN, the Place_Of_Supply and, for each line, the product variant, HSN_Code, Unit_Quantity_Code, GST_Treatment, quantity, taxable value, GST rate and tax amount of each GST_Tax_Head from the recorded tax lines.
- **Place_Of_Supply**: For GST, the Indian state or union territory in which a supply is made, set for each GST_Document by Requirement 18.
- **GST_Supply_Type**: The GSTR-1 class of a Tax_Invoice: B2B when the Tax_Invoice records a buyer GSTIN that is a Valid_GSTIN; B2C large when the Tax_Invoice records no Valid_GSTIN of the buyer, the supply is inter-state and the invoice value is above a configured B2C large threshold (default ₹1,00,000); and B2C small for every other Tax_Invoice.
- **GST_Tax_Head**: One of the parts into which the GST on a supply is split: IGST (integrated tax) on an inter-state supply, CGST (central tax) and SGST (state or union territory tax) on an intra-state supply, and cess, an extra levy on some goods.
- **GST_Treatment**: The GST class of a product variant: taxable, zero-rated, nil-rated, exempt or non-GST (default taxable).
- **Unit_Quantity_Code**: The GST unit of measure code, such as NOS or KGS, reported with each HSN_Code.
- **Special_Date**: A named date, such as a festival or a sale day, that an Admin_User sets in settings and that the Admin_App marks on Forecast and trend charts.
- **Trend_Window**: A configured number of days (default 28, allowed 7 to 90) that ends with the last full day in the Store_Timezone. Trending products compare the units sold in the last Trend_Window with the units sold in the Trend_Window of equal length just before it.
- **Lead_Time**: For a product variant, the number of days from ordering stock from a supplier to receiving the stock: the variant's lead-time attribute, or a configured default lead time (default 7 days) for a variant without a lead-time attribute.
- **Safety_Stock**: The extra units of a product variant that a Reorder_Suggestion adds to cover Demand_Forecast error during the variant's Lead_Time.
- **Incoming_Quantity**: For an Inventory_Item at a Stock_Location, the units that the Medusa inventory level records as incoming: ordered from a supplier and not yet stocked.
- **Purchase_List**: A CSV or XLSX file of Reorder_Suggestions, one row per product variant, for ordering stock from suppliers.
- **Alert_Subject**: The record or metric that an Alert is about, such as a product variant for a low-stock Alert_Rule or the store's daily net sales for an Anomaly Alert_Rule.
- **Reconciliation_Job**: A Scheduler job that runs once a day and recomputes the previous day's KPI and Report totals directly from the Order data, for comparison with the totals that Reports show.
- **Metric_Dictionary**: An Admin_App screen that describes every KPI and Report measure.
- **Admin_App_Cutover**: The switch from the Legacy_Admin to the Admin_App as the store's only admin, confirmed by an Admin_User who holds the owner Role.
- **Period_Orders**: For a Reporting_Period, the Orders placed in the Reporting_Period other than canceled Orders.
- **Alert_Severity**: The level that an Alert_Rule gives to the Alerts that the Alert_Rule creates: critical, warning or info, from highest to lowest.
- **Stale_Data_Limit**: A Store_Settings value (default 60 minutes, allowed 15 to 240 minutes) that sets how far a KPI's Data_Freshness may lie before the current time before the Dashboard shows a stale-data warning.
- **Catalog_CSV**: A CSV file with one row per product variant that holds the product's fields, the variant's options and prices, and the product's category and collection assignments, in the column format that the Admin_App's catalog export writes.
- **CSV_Size_Limit**: A Store_Settings value (default 10 MB, allowed 1 to 25 MB, where 1 MB is 1,048,576 bytes) that sets the largest CSV file that the Admin_API accepts for a Dry_Run.
- **CSV_Row_Limit**: A Store_Settings value (default 10,000 data rows, allowed 100 to 25,000 data rows) that sets the most data rows, not counting the heading row, that the Admin_API accepts in one CSV file.
- **Adjustment_Reason**: A reason that an Admin_User gives for a stock adjustment, chosen from a list in Store_Settings that holds 1 to 50 reasons (default received, damaged, lost, found, count correction and other).
- **Stock_CSV**: A CSV file with one stock adjustment per row: the SKU, the Stock_Location, a signed quantity change, an Adjustment_Reason and an optional note.
- **List_Page_Size**: A Store_Settings value (default 25 rows, allowed 10 to 100 rows) that sets the number of rows on each page of an Admin_App list.
- **Bulk_Ship_CSV**: A CSV file with one shipment per row: the fulfillment ID, the carrier, the tracking number and the tracking URL.
- **COD_Refusal_Count**: For a Customer, the number of Cash_On_Delivery Orders recorded as refused at delivery since Cash_On_Delivery was last enabled for the Customer, counted across the Customer ID, the normalized email address and the normalized phone number as in spec 1.
- **Erased_Customer**: A Customer whose personal data the Backend erased or anonymized under a completed Account_Deletion_Request.
- **Code_Alphabet**: The 32 symbols from which the Admin_API builds generated promotion codes: the uppercase letters A to Z other than I and O, and the digits 2 to 9.
- **Promotion_Code_Length**: A Store_Settings value (default 10 characters, allowed 8 to 16 characters) that sets the length of each generated promotion code.
- **Code_Attempt_Window**: A Store_Settings value (default 24 hours, allowed 1 to 168 hours) that sets the period, ending at the current time, over which the Promotions screen counts the promotion code attempts that the Rate_Limiter blocked.
- **Contrast_Ratio**: The WCAG 2.2 contrast ratio between two colours, from 1:1 to 21:1, computed from the relative luminance of the two colours.
- **Logo_Size_Limit**: A Store_Settings value (default 1 MB, allowed 1 to 5 MB, where 1 MB is 1,048,576 bytes) that sets the largest logo file that the Admin_API accepts for the Client_Branding.
- **Credential_Check**: A Backend request to a Payment_Provider, made with the Payment_Provider's configured Secrets, that confirms that the Payment_Provider accepts those credentials.
- **Invitation_Link**: The link in an invitation email through which the invited person accepts the invitation to become an Admin_User.
- **System_Role**: One of the predefined Roles of spec 1 (owner, manager, catalog editor, order manager, support agent and read-only analyst), which no Admin_User can edit or delete.
- **Report_Bucket**: A day, a week from Monday to Sunday or a calendar month, in the Store_Timezone, into which a Report splits the Reporting_Period. A partial Report_Bucket starts before the Reporting_Period's start date or ends after the Reporting_Period's end date, and covers only the bucket's days inside the Reporting_Period.
- **Analytics_Rollup**: A stored total for one Store_Timezone day, such as one day's net sales in one Sales_Channel and currency, that the Backend builds from the Order data and Analytics_Events and that KPIs, Reports and Forecasts read.

## Assumptions

Owner decisions:

1. The Admin_App is a separate application on its own subdomain. It is a static build hosted on the Cloudflare Pages free tier, has no server runtime of its own, and talks directly to Supabase.
2. Forecasts, Anomaly detection, Churn_Risk and other predictions use built-in statistical models that run inside Supabase. No external AI service or paid service is used.
3. The scope includes a phone-friendly admin, India GST_Reports, Scheduled_Reports and Alerts by email, and Hindi and English.
4. The Legacy_Admin keeps working until cutover, and both admins use the same backend until then.
5. The Admin_App uses Next.js 15, React 19, Tailwind CSS 3 and TypeScript.

Other assumptions:

6. The spec 1 backend is in place. This spec may add Admin_API functions, tables and scheduled jobs that follow spec 1's conventions for Permission checks, aal2 MFA and Audit_Log entries.
7. Scheduled work in this spec, such as Scheduled_Reports, Alert_Rule evaluation and Forecast runs, runs inside Supabase. Emails go through the email provider configured in the spec 1 backend.
8. The store sells in India and prices are in INR. The default Store_Timezone is Asia/Kolkata.
9. PII_Fields are masked for every Admin_User by default. An Admin_User who holds the PII Permission reveals the PII_Fields of one record at a time, and each reveal is recorded in the Audit_Log.
10. Admin_API writes accept a request ID, so a write retried after a timeout is applied once. Where spec 1 lacks this, this spec adds it.
11. Spec 4 sets each client's initial Client_Branding during provisioning. After provisioning, an Admin_User who holds the settings Permission edits the Client_Branding in the Admin_App (Requirement 12).
12. E-invoicing (IRN), e-way bills, input tax credit and filing returns on the GST portal are out of scope. GST_Reports help the store prepare returns, and the store or the store's tax adviser files them.

## Requirements

### Requirement 1: Admin_App hosting, sign-in and sessions

**User Story:** As a store owner, I want the Admin_App hosted separately with mandatory MFA and strict session limits, so that a stolen password or an unattended device gives no access to the store.

#### Acceptance Criteria

1. THE Admin_App SHALL run as static files only, served by the Cloudflare Pages free tier from a configured admin subdomain (default `admin.<store domain>`) on an origin separate from the storefront and the Legacy_Admin.
2. THE Admin_App SHALL authenticate Admin_Users through Supabase Auth only.
3. THE Admin_App SHALL read and write store data through the Admin_API only.
4. THE Admin_App SHALL limit the configuration values in the static build to the Supabase project URL and the Supabase public key, keeping every Secret out of the build.
5. THE Admin_App SHALL serve every HTML page, including the not-found page, with a Content-Security-Policy header that sets `frame-ancestors 'none'` and limits `connect-src` to the Admin_App origin and the Supabase project.
6. THE Admin_App SHALL serve every response with a Strict-Transport-Security header whose max-age is at least 31,536,000 seconds.
7. WHEN a person accepts an invitation, THE Admin_App SHALL require the person to enrol a TOTP factor and verify one TOTP code from that factor before the Admin_API records the invitation as accepted.
8. IF a session reaches aal2 with a TOTP factor that was enrolled outside an invitation acceptance, THEN THE Admin_API SHALL reject every request from the session.
9. WHEN Supabase Auth accepts an Admin_User's email address and password, THE Admin_App SHALL require a TOTP verification before showing any admin screen.
10. IF Supabase Auth rejects a sign-in, THEN THE Admin_App SHALL show the same sign-in error message for every rejected combination of email address and password, without stating whether the email address has an account.
11. IF a Supabase Auth account that is not an Admin_User signs in, THEN THE Admin_App SHALL show a message that the account is not an Admin_User and show no admin screen.
12. IF an Admin_User who has no verified TOTP factor signs in, THEN THE Admin_App SHALL show a message that TOTP enrolment needs a new invitation from an Admin_User who holds the owner Role, and show no admin screen.
13. IF Supabase Auth rejects a TOTP code, THEN THE Admin_App SHALL show an invalid-code message and accept another code.
14. IF Supabase Auth rejects 5 consecutive TOTP codes in one session, with no accepted code in between, THEN THE Admin_App SHALL sign the session out of Supabase Auth and show a message that the session ended after 5 rejected codes.
15. IF a request comes from a session below aal2, THEN THE Admin_API SHALL reject the request.
16. IF a request comes from a session whose sign-in is older than the Absolute_Session_Limit, THEN THE Admin_API SHALL reject the request.
17. IF a Sensitive_Action request comes from a session whose last TOTP verification is older than the Re_Authentication_Window, THEN THE Admin_API SHALL reject the request.
18. WHEN an Admin_User submits a Sensitive_Action and the session's last TOTP verification is older than the Re_Authentication_Window, THE Admin_App SHALL require a new TOTP verification before sending the request, in addition to the Admin_API check.
19. IF the Admin_API rejects a Sensitive_Action because the session's last TOTP verification is older than the Re_Authentication_Window, THEN THE Admin_App SHALL require a new TOTP verification and then resend the request with the Admin_User's input unchanged.
20. WHEN 60 seconds remain before a session reaches the Idle_Timeout, THE Admin_App SHALL show a warning in every open Admin_App tab with a control that keeps the session active.
21. WHEN a session has had no Admin_Activity for the Idle_Timeout, THE Admin_App SHALL sign the session out of Supabase Auth.
22. WHEN 10 minutes remain before a session reaches the Absolute_Session_Limit, THE Admin_App SHALL show a warning that states the time at which the session ends.
23. WHEN a session reaches the Absolute_Session_Limit, THE Admin_App SHALL sign the session out of Supabase Auth, in addition to the Admin_API check.
24. THE Admin_App SHALL show a sign-out control on every screen shown while a session exists, including the TOTP verification screen.
25. WHEN a session ends by sign-out, Idle_Timeout, Absolute_Session_Limit or 5 rejected TOTP codes, or the Admin_App receives a Session_Rejection, THE Admin_App SHALL remove the session and all Local_Admin_Data from every open Admin_App tab within 2 seconds and show the sign-in screen.
26. IF Supabase Auth is unreachable or returns an error when the Admin_App signs a session out, THEN THE Admin_App SHALL remove the session and all Local_Admin_Data from every open Admin_App tab within 2 seconds and show the sign-in screen.
27. IF the Admin_App receives a Session_Rejection because the Admin_User is disabled, THEN THE Admin_App SHALL show an account-disabled message on the sign-in screen.
28. WHEN an Admin_User who holds the owner Role resets another Admin_User's TOTP factor, THE Admin_API SHALL remove every TOTP factor of that Admin_User and end every session of that Admin_User.
29. WHEN an Admin_User who holds the owner Role resets another Admin_User's TOTP factor, THE Admin_API SHALL write an Audit_Log entry with the owner, the Admin_User whose factor was reset and the time of the reset.
30. WHEN an Admin_User who holds the owner Role resets another Admin_User's TOTP factor, THE Admin_API SHALL send that Admin_User a new invitation that keeps the Admin_User's current Roles.
31. IF an Admin_User saves an Idle_Timeout, Absolute_Session_Limit or Re_Authentication_Window outside the value's allowed range, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous value.

### Requirement 2: Permission-aware screens and PII protection

**User Story:** As a store owner, I want each Admin_User to see only the screens, actions and personal data that the Admin_User's Role allows, so that staff can do their jobs without exposing customer data.

#### Acceptance Criteria

1. THE Admin_App SHALL show a navigation entry only for a screen whose required Permission the signed-in Admin_User holds.
2. THE Admin_App SHALL show an action control only for an action whose required Permission the signed-in Admin_User holds.
3. THE Admin_API SHALL check on every request that the Admin_User is active and holds the request's required Permission, regardless of which screens and controls the Admin_App displayed.
4. IF an Admin_User opens a screen, such as by URL, without the screen's required Permission, THEN THE Admin_App SHALL show a permission message that names the missing Permission in place of the screen.
5. IF the Admin_API denies a request for a missing Permission, THEN THE Admin_App SHALL show a permission message that names the missing Permission and keep the Admin_User's input.
6. WHEN the signed-in Admin_User's Roles change during a session, THE Admin_App SHALL show the navigation entries and action controls of the new Permissions from the next screen that the Admin_User opens.
7. THE Admin_API SHALL return every PII_Field as a Masked_Value in every response other than a reveal response, the packing-slip and shipping-label responses of Requirement 8 and the exports of criterion 9.
8. THE Admin_API SHALL write every PII_Field as a Masked_Value in Report_Exports and other data exports, other than the exports of criterion 9.
9. WHEN an Admin_User who holds the PII Permission and the reports:export Permission selects the option to include unmasked personal data in an export and passes the Sensitive_Action re-authentication of Requirement 1, THE Admin_API SHALL write the export's PII_Fields as unmasked values.
10. WHEN the Admin_API writes unmasked PII_Field values into an export, THE Admin_API SHALL write an Audit_Log entry that names the Admin_User, the export and each included PII_Field before returning the export.
11. THE Admin_API SHALL write every PII_Field as a Masked_Value in Diagnostic_Log entries.
12. IF an Admin_API request fails, THEN THE Admin_API SHALL return an error response in which every PII_Field appears only as a Masked_Value.
13. WHILE the signed-in Admin_User holds the PII Permission, THE Admin_App SHALL show a reveal control on each record that contains Masked_Values.
14. WHEN an Admin_User who holds the PII Permission reveals the PII_Fields of a record, THE Admin_API SHALL write an Audit_Log entry with the Admin_User, the record and the revealed field names before returning the unmasked values.
15. WHEN an Admin_User reveals the PII_Fields of a record, THE Admin_App SHALL show unmasked values for that record only, keeping the PII_Fields of every other record as Masked_Values.
16. WHEN an Admin_User leaves the screen on which a record's PII_Fields were revealed, THE Admin_App SHALL discard the unmasked values and show Masked_Values whenever the record is shown again, including after the browser's back or forward navigation.
17. THE Admin_App SHALL hold unmasked PII_Field values in memory only, keeping the values out of browser storage.
18. IF an Admin_User requests a reveal that would exceed the Reveal_Limit, THEN THE Admin_API SHALL reject the reveal.
19. IF an Admin_User requests a reveal that would exceed the Reveal_Limit, THEN THE Admin_API SHALL record a Security_Event with the Admin_User and the record.
20. IF the Admin_API rejects a reveal for the Reveal_Limit, THEN THE Admin_App SHALL show a message that states the time at which the Admin_User can reveal another record.
21. IF an Admin_User saves a Reveal_Limit outside the allowed range of 1 to 300 records, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous value.

### Requirement 3: Phone-first responsive UX, accessibility and performance

**User Story:** As an Admin_User working from a phone, I want the Admin_App to be complete, accessible and fast on a small screen and a mobile network, so that I can run the store away from a desk.

#### Acceptance Criteria

1. THE Admin_App SHALL lay out every screen without page-level horizontal scrolling at every viewport width of 320 CSS px or more, with wide data tables scrolling inside the table container.
2. WHILE the viewport width is below 768 px, THE Admin_App SHALL let an Admin_User complete every action of order processing (including Returns, refunds and Payment_Incidents), fulfillment, stock adjustment, customer lookup, Dashboard review and Alert handling with touch input and the on-screen keyboard only.
3. WHILE the viewport width is below 768 px, THE Admin_App SHALL make every control and every piece of information that the actions in criterion 2 use available on tap or focus, with no step that needs hover.
4. THE Admin_App SHALL meet every WCAG 2.2 Level A and Level AA success criterion on every screen, in English and in Hindi, in every screen state, including open dialogs, open menus, error states and loading states.
5. THE Admin_App SHALL give every interactive control, other than links inside running text, a touch target of at least 44 × 44 CSS pixels that overlaps no other control's touch target.
6. THE Admin_App SHALL keep the compressed JavaScript that the browser transfers while loading any screen opened directly with an empty browser cache within a configured initial JavaScript budget (default 200 KB, allowed 100 to 300 KB, where 1 KB is 1,024 bytes).
7. WHEN the sign-in screen or the Dashboard is loaded under Lighthouse's default mobile throttling (simulated slow 4G with 4× CPU slowdown), THE Admin_App SHALL reach Largest Contentful Paint within a configured first-load budget (default 3 seconds, allowed 1 to 4 seconds), taken as the median of 5 Lighthouse runs.
8. WHILE an Admin_API request is pending, THE Admin_App SHALL show a loading state in the screen area that awaits the response.
9. WHILE an Admin_API request is pending, THE Admin_App SHALL disable the control that sent the request.
10. IF an Admin_API request is rejected, fails on the network or exceeds the request timeout, THEN THE Admin_App SHALL re-enable the control that sent the request.
11. IF the Admin_API rejects a request, THEN THE Admin_App SHALL show the reason that the Admin_API returns and keep the Admin_User's input.
12. IF an Admin_API request fails on the network or receives no response within a configured request timeout (default 15 seconds, allowed 5 to 60 seconds), THEN THE Admin_App SHALL show an error message with a retry control and keep the Admin_User's input.
13. THE Admin_App SHALL send every Admin_API write with an Idempotency_Key that the Admin_App creates when the Admin_User submits the write and reuses for every retry of that write.
14. WHEN the Admin_API receives a write whose Idempotency_Key matches a write applied within a configured key retention period (default 24 hours, allowed 24 to 168 hours), THE Admin_API SHALL return the earlier write's result without applying the write again.
15. IF the Admin_API receives a write whose Idempotency_Key matches an earlier write with a different request body, THEN THE Admin_API SHALL reject the write and leave the data unchanged.
16. IF the Admin_API receives a write whose Idempotency_Key matches a write still in progress, THEN THE Admin_API SHALL reject the second write with an in-progress error and let the first write complete.

### Requirement 4: Hindi and English

**User Story:** As an Admin_User, I want to use the Admin_App in Hindi or English, so that I can work in the language I read best.

#### Acceptance Criteria

1. THE Admin_App SHALL provide every user-interface string, including labels, messages, accessible names, Admin_API error messages and the display names of statuses, Permissions and KPIs, in English and in Hindi.
2. THE Admin_App SHALL show a language switch for English and Hindi on the sign-in screen, on the TOTP screens and in the account menu of every admin screen.
3. WHEN a person selects English or Hindi with the language switch, THE Admin_App SHALL show the current screen in the selected language within 2 seconds, keeping any input entered on the screen.
4. WHEN a signed-in Admin_User selects English or Hindi, THE Admin_App SHALL save the selection to the Admin_User's profile and show every screen in the selected language on each device where the Admin_User signs in.
5. WHEN an Admin_User completes sign-in, THE Admin_App SHALL show screens in the language saved in the Admin_User's profile, or, for a profile with no saved language, in the language shown on the sign-in screen.
6. WHILE no Admin_User is signed in, THE Admin_App SHALL show screens in the Default_Admin_Language until a person selects another language with the language switch.
7. IF Store_Settings sets no Default_Admin_Language, or the Admin_App cannot read the setting, THEN THE Admin_App SHALL use English as the Default_Admin_Language.
8. IF a user-interface string has no Hindi text, THEN THE Admin_App SHALL show the English text for that string only, marked as English for assistive technologies, and keep every other string on the screen in Hindi.
9. THE Admin_App SHALL show every number with the digits 0 to 9 and with lakh and crore digit grouping (for example 12,34,567), in English and in Hindi.
10. THE Admin_App SHALL show every INR amount with the ₹ sign, 2 decimal places and lakh and crore digit grouping, with a minus sign before the ₹ sign for a negative amount (for example ₹12,34,567.50 and -₹500.00), in English and in Hindi.
11. THE Admin_App SHALL show an amount in a currency other than INR with the currency's ISO 4217 code, the currency's number of decimal places and lakh and crore digit grouping, in English and in Hindi.
12. THE Admin_App SHALL show every date as day, month and 4-digit year, in that order, in English and in Hindi (for example 5 Mar 2025 or 5 मार्च 2025).
13. THE Admin_App SHALL show every time on a 12-hour clock with the active language's AM or PM marker (for example 2:05 PM), in English and in Hindi.
14. THE Admin_App SHALL show every date and time in the Store_Timezone, whatever the time zone of the Admin_User's device.
15. WHEN an Admin_User enters a date or a time, THE Admin_App SHALL read the date or time in the Store_Timezone, whatever the time zone of the Admin_User's device.
16. WHEN the Backend sends a Scheduled_Report email or an Alert email, THE Backend SHALL write the email, including the headings of any CSV attachment, in the language saved in the recipient's profile, or in the Default_Admin_Language for a recipient with no saved language.
17. WHEN an Admin_User creates a Report_Export or other data export, THE Admin_App SHALL write the column headings in the exporting Admin_User's language, except a GST_Report export, which keeps the GST portal headers of Requirement 18.
18. WHEN an Admin_User imports a CSV file that the Admin_App exported, THE Admin_App SHALL accept the file's column headings in English or in Hindi.
19. THE Admin_App SHALL show store data, such as product names, customer names and order notes, as stored and untranslated in either language, with PII_Fields shown by the rules of Requirement 2.

### Requirement 5: Dashboard and KPIs

**User Story:** As a store owner, I want a Dashboard of KPIs with fixed formulas and period comparisons, so that I can see how the store is doing and trust the numbers.

#### Acceptance Criteria

1. THE Admin_API SHALL compute gross sales as the sum of unit price times quantity over the line items of the Period_Orders, before discounts, without shipping and without tax, removing the tax included in each tax-inclusive price.
2. THE Admin_API SHALL compute discounts as the sum of the discount amounts on the Period_Orders and their line items, without tax, removing the tax included in each tax-inclusive discount amount.
3. THE Admin_API SHALL compute refunds as the sum of the amounts refunded during the Reporting_Period on Orders other than canceled Orders, without refunded tax and refunded shipping.
4. THE Admin_API SHALL compute net sales as gross sales minus discounts minus refunds.
5. THE Admin_API SHALL compute order count as the number of Period_Orders.
6. THE Admin_API SHALL compute units as the sum of the line-item quantities of the Period_Orders.
7. THE Admin_API SHALL compute average order value for each currency as the gross sales minus the discounts of the Period_Orders in that currency, divided by the number of Period_Orders in that currency.
8. THE Admin_API SHALL compute conversion rate as the number of Storefront_Sessions started in the Reporting_Period that reached the Order placed step of the Storefront_Funnel, divided by the number of Storefront_Sessions started in the Reporting_Period, as a percentage.
9. THE Admin_API SHALL compute returning-customer rate as the number of Customers who placed Period_Orders and are Returning_Customers for the Reporting_Period, divided by the number of Customers who placed Period_Orders, as a percentage.
10. THE Admin_API SHALL compute abandoned-cart recovery rate as the number of Recovered_Carts among the Abandoned_Carts whose abandonment delay ended in the Reporting_Period, divided by the number of those Abandoned_Carts, as a percentage.
11. IF the divisor of average order value, conversion rate, returning-customer rate or abandoned-cart recovery rate is zero, THEN THE Dashboard SHALL show a dash in place of the KPI value.
12. IF a Reporting_Period has no records for gross sales, discounts, refunds, net sales, order count or units, THEN THE Dashboard SHALL show that KPI as 0, in each currency shown on the Dashboard for a monetary KPI.
13. THE Dashboard SHALL offer the Reporting_Period presets today, yesterday, last 7 days, last 30 days, last 90 days, month to date and custom range, with last 30 days selected when an Admin_User opens the Dashboard.
14. THE Dashboard SHALL set each preset's dates in the Store_Timezone, where today is the current date, yesterday is the day before today, each last N days preset covers today and the N-1 days before today, and month to date covers the first day of the current month to today.
15. IF an Admin_User applies a custom Reporting_Period or a custom Comparison_Period whose start date is after its end date or whose end date is after today, THEN THE Dashboard SHALL reject the range with an error message and keep the previous range.
16. THE Dashboard SHALL set the previous-period Comparison_Period to the same number of days as the Reporting_Period, ending on the day before the Reporting_Period's start date.
17. THE Dashboard SHALL set the same-period-one-year-earlier Comparison_Period by moving the Reporting_Period's start date and end date back one calendar year, with 29 February moved to 28 February.
18. WHEN an Admin_User selects a Comparison_Period, THE Dashboard SHALL show each KPI's absolute change as the KPI value minus the KPI's Comparison_Period value, per currency for a monetary KPI.
19. WHEN an Admin_User selects a Comparison_Period, THE Dashboard SHALL show each KPI's percentage change as the absolute change divided by the absolute value of the KPI's Comparison_Period value, as a percentage.
20. IF a KPI value or the KPI's Comparison_Period value is a dash, THEN THE Dashboard SHALL show a dash in place of the KPI's absolute change and percentage change.
21. IF a KPI's Comparison_Period value is 0, THEN THE Dashboard SHALL show a dash in place of the KPI's percentage change.
22. THE Dashboard SHALL compute each absolute change and each percentage change from the unrounded KPI values.
23. THE Dashboard SHALL show gross sales, discounts, refunds, net sales and average order value as one value per currency, for each currency of the store's Regions and each other currency with Period_Orders or refunds in the Reporting_Period, with no conversion between currencies and no total across currencies.
24. THE Dashboard SHALL show each monetary KPI and each monetary change rounded half up to the currency's minor unit.
25. THE Dashboard SHALL show each percentage KPI and each percentage change rounded half up to 1 decimal place.
26. THE Dashboard SHALL show the Data_Freshness of each KPI.
27. IF a KPI's Data_Freshness is older than the Stale_Data_Limit, THEN THE Dashboard SHALL show a stale-data warning on the KPI.
28. IF an Admin_User saves a Stale_Data_Limit outside the allowed range of 15 to 240 minutes, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous value.
29. IF the Admin_API fails to return a KPI, THEN THE Dashboard SHALL show an error with a retry control in place of that KPI and keep showing every other KPI.
30. WHEN an Admin_User selects a KPI, THE Admin_App SHALL open the KPI's Report with the Dashboard's Reporting_Period and Comparison_Period applied.
31. THE Dashboard SHALL show the number of open Alerts delivered in the Admin_App to the signed-in Admin_User.
32. THE Dashboard SHALL list up to 5 of the signed-in Admin_User's open Alerts, ordered by Alert_Severity from highest to lowest and then by creation time from newest to oldest.
33. IF the signed-in Admin_User has no open Alerts, THEN THE Dashboard SHALL show a no-open-Alerts message in place of the Alert list.
34. THE Dashboard SHALL show the net sales Forecast of Requirement 21 for the Default_Sales_Channel in each currency of the store's Regions, over the forecast horizon of Requirement 21, with the Forecast's Confidence_Band.
35. IF no net sales Forecast is available for a currency, THEN THE Dashboard SHALL show in place of that Forecast a message that states whether the series has less than the minimum history of Requirement 21 or has no completed Forecast run.
36. IF an Admin_User who lacks the reports:read Permission opens the Dashboard, THEN THE Admin_App SHALL show the permission message of Requirement 2 in place of the Dashboard and show no KPI, Alert or Forecast value.
37. IF an Admin_User who lacks the reports:read Permission requests Dashboard KPI or Forecast data, THEN THE Admin_API SHALL reject the request and return no values.

### Requirement 6: Catalog management

**User Story:** As a catalog manager, I want to manage products, prices and media in the Admin_App, with previews before bulk changes and imports, so that I can keep the catalog correct without developer help.

#### Acceptance Criteria

1. THE Admin_App SHALL let an Admin_User who holds the catalog:write Permission create, edit and delete products, variants, options, categories, collections, tags, product types and attributes.
2. WHEN an Admin_User starts to delete a catalog record, THE Admin_App SHALL ask the Admin_User to confirm the deletion, naming the record.
3. IF an Admin_User deletes a product that has a variant on any Order, THEN THE Admin_API SHALL reject the deletion and leave the product unchanged.
4. IF the Admin_API rejects a product deletion because the product has Orders, THEN THE Admin_App SHALL show a message that the product has Orders, with a control that unpublishes the product.
5. IF an Admin_User deletes a category that has child categories, THEN THE Admin_API SHALL reject the deletion and leave the category tree unchanged.
6. THE Admin_App SHALL show categories as a tree that an Admin_User reorders and moves by drag and drop or with move controls that need no dragging.
7. IF an Admin_User moves a category under the category itself or under one of the category's descendants, THEN THE Admin_API SHALL reject the move and leave the category tree unchanged.
8. THE Admin_App SHALL show the upload progress of each product media file as a percentage.
9. IF the Admin_API rejects a product media file, THEN THE Admin_App SHALL show the file-type or file-size error that the Admin_API returns for that file and continue uploading the other selected files.
10. THE Admin_App SHALL let an Admin_User who holds the pricing:write Permission set each variant's prices per currency and Region.
11. IF an Admin_User saves a price below zero or with more decimal places than the currency's minor unit, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous price.
12. THE Admin_App SHALL let an Admin_User who holds the pricing:write Permission schedule a Price_List with a start date and time and an end date and time in the Store_Timezone.
13. IF an Admin_User saves a Price_List whose end is at or before the Price_List's start, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous Price_List.
14. THE Admin_App SHALL export the products that match the product list's filters to a Catalog_CSV file.
15. WHEN an Admin_User starts a catalog export, THE Admin_App SHALL require the re-authentication of a Sensitive_Action.
16. WHEN an Admin_User imports an unchanged Catalog_CSV file that the Admin_App exported, THE Admin_API SHALL leave every exported product, variant, option, price and category and collection assignment unchanged (round-trip property).
17. WHEN an Admin_User uploads a Catalog_CSV file, THE Admin_App SHALL show the file's Dry_Run result, with the row number and the error of every rejected row and the number of records that the import would create and update.
18. IF a Catalog_CSV file is larger than the CSV_Size_Limit, THEN THE Admin_API SHALL reject the file before the Dry_Run with a message that states the CSV_Size_Limit.
19. IF a Catalog_CSV file has more data rows than the CSV_Row_Limit, THEN THE Admin_API SHALL reject the file before the Dry_Run with a message that states the CSV_Row_Limit.
20. IF a Catalog_CSV file has no data rows or lacks a required column, THEN THE Admin_API SHALL reject the file with a message that names each missing column or states that the file has no data rows.
21. IF an Admin_User saves a CSV_Size_Limit or a CSV_Row_Limit outside the value's allowed range, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous value.
22. IF a Catalog_CSV file's Dry_Run reports one or more errors, THEN THE Admin_App SHALL keep the import confirmation control disabled for that file.
23. IF an Admin_User confirms the import of a Catalog_CSV file whose Dry_Run reported an error, THEN THE Admin_API SHALL reject the import and write no data.
24. WHEN an Admin_User confirms the import of a Catalog_CSV file with an error-free Dry_Run, THE Admin_API SHALL apply every row of the file or, if any row fails, no row of the file.
25. IF a row fails while the Admin_API applies a confirmed Catalog_CSV file, THEN THE Admin_App SHALL show the row number and the error, with a message that no row of the file was applied.
26. IF a record in a Catalog_CSV file changed after the file's Dry_Run, THEN THE Admin_API SHALL reject the confirmation as an Edit_Conflict, apply no row and require a new Dry_Run.
27. IF an Admin_User confirms a Catalog_CSV import while another Catalog_CSV import is being applied, THEN THE Admin_API SHALL reject the second import with an in-progress message and write no data.
28. WHEN an Admin_User prepares a bulk edit of status, percentage price change or category for selected products, THE Admin_App SHALL show a preview of each selected product's current and new values before the Admin_User can confirm the bulk edit.
29. THE Admin_API SHALL round each price that a bulk percentage price change computes half up to the currency's minor unit.
30. IF a bulk percentage price change would set a price below zero, THEN THE Admin_API SHALL reject the bulk edit and change no product.
31. WHEN an Admin_User confirms a bulk edit, THE Admin_API SHALL apply the bulk edit to every selected product or, if any product fails, to no product.
32. IF a selected product changed after the bulk edit preview, THEN THE Admin_API SHALL reject the bulk edit as an Edit_Conflict and change no product.
33. THE Admin_App SHALL let an Admin_User who holds the catalog:write Permission publish or unpublish a product.
34. THE Admin_App SHALL open a storefront preview of a product, including an unpublished product, in a new browser tab.
35. WHEN an Admin_User starts to leave a screen that has unsaved changes, THE Admin_App SHALL ask the Admin_User to confirm discarding the changes.
36. IF an Admin_User saves a record that changed after the Admin_App loaded the record, THEN THE Admin_API SHALL reject the save as an Edit_Conflict.
37. IF the Admin_API rejects a catalog save as an Edit_Conflict, THEN THE Admin_App SHALL show an edit-conflict message with a control that reloads the record, and keep the Admin_User's input.

### Requirement 7: Inventory management

**User Story:** As an inventory manager, I want to see and correct stock per Stock_Location, with a reason and a history for every change, so that the stock that customers see matches the stock on the shelves.

#### Acceptance Criteria

1. THE Admin_App SHALL show, for each Inventory_Item at each Stock_Location, the stocked quantity, the reserved quantity, the quantity in Active_Inventory_Holds and the Available_Quantity.
2. WHEN an Admin_User who holds the inventory:adjust Permission adjusts the stock of an Inventory_Item at a Stock_Location, THE Admin_App SHALL require an Adjustment_Reason and accept an optional note of up to 500 characters before sending the adjustment.
3. IF the Admin_API receives a stock adjustment without an Adjustment_Reason or with a note longer than 500 characters, THEN THE Admin_API SHALL reject the adjustment and leave the stock unchanged.
4. IF the Admin_API receives a stock adjustment whose quantity change is 0 or not a whole number, THEN THE Admin_API SHALL reject the adjustment and leave the stock unchanged.
5. THE Admin_App SHALL send each stock adjustment as a signed quantity change to the stocked quantity.
6. WHEN the Admin_API receives two stock adjustments for the same Inventory_Item at the same Stock_Location at the same time, THE Admin_API SHALL apply both quantity changes, so that the stocked quantity changes by the sum of the two.
7. WHEN the Admin_API applies a stock adjustment, THE Admin_API SHALL record, in the same transaction, an Inventory_Movement with the quantity change, the Adjustment_Reason, the note, the Admin_User, the Stock_Location and the time.
8. IF the Admin_API rejects a stock adjustment because the adjustment would set the stocked quantity below zero, THEN THE Admin_App SHALL show a message that states the current stocked quantity at the Stock_Location.
9. IF an Admin_User saves an Adjustment_Reason list with fewer than 1 or more than 50 reasons, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous list.
10. WHEN an Admin_User removes a reason from the Adjustment_Reason list, THE Admin_API SHALL keep that reason on the Inventory_Movements recorded before the removal.
11. WHEN an Admin_User opens an Inventory_Item, THE Admin_App SHALL show the Inventory_Item's Inventory_Movements, newest first, in pages of the List_Page_Size, each with the quantity change, Adjustment_Reason, note, actor, Stock_Location and time.
12. IF an Inventory_Item has no Inventory_Movements, THEN THE Admin_App SHALL show a no-movements message in place of the history.
13. THE Admin_App SHALL show a low-stock list of the variants that manage inventory and whose Sellable_Quantity in any Sales_Channel is at or below the configured low-stock threshold (default 5), each with the Sales_Channel and the Sellable_Quantity.
14. IF no variant is at or below the low-stock threshold, THEN THE Admin_App SHALL show a no-low-stock message in place of the low-stock list.
15. IF an Admin_User saves a low-stock threshold outside the allowed range of 0 to 1,000 units, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous value.
16. THE Admin_App SHALL show, for each variant, the Active_Inventory_Holds and Reservations that claim the variant's stock, each with the claimed quantity and the Stock_Location, the expiry time of each Active_Inventory_Hold and the Order display number of each Reservation.
17. THE Admin_App SHALL let an Admin_User change the Stock_Location_Priority by reordering the Stock_Locations by drag and drop or with move controls that need no dragging.
18. WHEN an Admin_User saves a new Stock_Location_Priority, THE Backend SHALL reserve stock in the new order for Orders placed after the save and leave existing Reservations unchanged.
19. WHEN an Admin_User uploads a Stock_CSV file, THE Admin_App SHALL show the file's Dry_Run result, with the row number and the error of every rejected row, before the Admin_User can confirm the import.
20. IF a Stock_CSV file is larger than the CSV_Size_Limit or has more data rows than the CSV_Row_Limit, THEN THE Admin_API SHALL reject the file before the Dry_Run with a message that states the exceeded limit.
21. WHEN the Admin_API runs the Dry_Run of a Stock_CSV file, THE Admin_API SHALL report as an error each row with an unknown SKU, an unknown Stock_Location, a missing Adjustment_Reason or a quantity change that would set the stocked quantity below zero.
22. IF a Stock_CSV file's Dry_Run reports one or more errors, THEN THE Admin_API SHALL reject a confirmation of the file and write no data.
23. WHEN an Admin_User confirms a Stock_CSV file with an error-free Dry_Run, THE Admin_API SHALL apply every row as a stock adjustment with an Inventory_Movement or, if any row fails, apply no row of the file.

### Requirement 8: Order list and order detail

**User Story:** As an Admin_User who handles Orders, I want to find any Order and see the Order's full details and history, so that I can answer customers and act on the Order correctly.

#### Acceptance Criteria

1. THE Admin_App SHALL let an Admin_User filter the Order list by Order status, payment status, fulfillment status, placement date range, Sales_Channel, Region, payment method (including Cash_On_Delivery), Order total range in a chosen currency and promotion code, showing only the Orders that match every chosen filter.
2. IF an Admin_User enters a placement date range whose start is after its end, or an Order total range whose minimum is above its maximum, THEN THE Admin_App SHALL show a field-level error and keep the previous filters.
3. WHEN an Admin_User searches Orders by display number, THE Admin_API SHALL return the Order whose display number equals the search term.
4. WHEN an Admin_User searches Orders by complete email address or complete phone number, THE Admin_API SHALL return the Orders whose email address or phone number equals the search term, comparing email addresses without regard to letter case and phone numbers in E.164 format, with +91 added to a number that has no country code.
5. WHEN the Admin_API returns Orders found by email address or phone number, THE Admin_App SHALL show the matching Orders with every PII_Field as a Masked_Value, without showing the searched email address or phone number in the results.
6. THE Admin_App SHALL keep a searched email address or phone number out of the screen URL, Saved_Views and browser storage.
7. THE Admin_API SHALL write a searched email address or phone number to the Diagnostic_Log only as a Masked_Value.
8. IF no Order matches the search or the filters, THEN THE Admin_App SHALL show a no-matching-Orders message with a control that clears the search and the filters.
9. THE Admin_App SHALL show the PII_Fields on the Order list and the Order detail as Masked_Values, which an Admin_User who holds the PII Permission reveals one record at a time under Requirement 2.
10. THE Admin_App SHALL let an Admin_User save the Order list's filters, columns and sort order as a Saved_View and apply the Saved_View later.
11. THE Admin_App SHALL show the Order list in pages of the List_Page_Size, sorted newest first until the Admin_User chooses another sort order.
12. WHILE an Admin_User pages through the Order list, THE Admin_App SHALL show each Order at most once, including when new Orders are placed between page loads.
13. IF an Admin_User saves a List_Page_Size outside the allowed range of 10 to 100 rows, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous value.
14. WHEN an Admin_User opens an Order, THE Admin_App SHALL show the Order's line items, the totals breakdown (subtotal, discounts, shipping, tax and total), payments, fulfillments, Returns and Refundable_Amount.
15. WHEN an Admin_User opens an Order, THE Admin_App SHALL show a timeline built from the Order's Audit_Log entries and order events, newest first, each with the actor and the time.
16. THE Admin_App SHALL let an Admin_User who holds the order:update Permission add an internal note of 1 to 2,000 characters to an Order, shown with the authoring Admin_User and the time.
17. IF an Admin_User opens an Order that does not exist, THEN THE Admin_App SHALL show an Order-not-found message.
18. THE Admin_App SHALL offer for an Order only the actions that the Backend's order state machine allows from the Order's current Order, payment and fulfillment statuses.
19. IF the Admin_API receives an Order action that the order state machine does not allow from the Order's current statuses, THEN THE Admin_API SHALL reject the action and leave the Order unchanged.
20. THE Admin_App SHALL provide a printable invoice and a printable packing slip for each Order.
21. THE Admin_App SHALL print each PII_Field on an invoice as a Masked_Value, or as the unmasked value while the printing Admin_User has the Order's PII_Fields revealed under Requirement 2.
22. WHEN an Admin_User who holds the order:fulfill Permission prints a packing slip or a shipping label for an Order, THE Admin_API SHALL write an Audit_Log entry with the Admin_User, the Order and the document type before returning the full shipping name, shipping address and shipping phone number that the printout shows.
23. THE Admin_App SHALL print every PII_Field on a packing slip as a Masked_Value, other than the shipping name, shipping address and shipping phone number that the Admin_API returns under criterion 22.
24. IF the Admin_API rejects a change to an Order as an Edit_Conflict, THEN THE Admin_App SHALL show an edit-conflict message with a control that reloads the Order.

### Requirement 9: Fulfillment, Cash_On_Delivery, Returns, refunds and payment incidents

**User Story:** As an Admin_User who ships and services Orders, I want to fulfill, deliver, return and refund Orders with server-checked amounts and actions that apply once, so that each Order's stock and money stay correct.

#### Acceptance Criteria

1. WHEN an Admin_User creates a fulfillment for an Order, THE Admin_App SHALL let the Admin_User choose the Stock_Location and each line item's quantity, up to the line item's unfulfilled quantity (the line item's quantity minus the quantity already fulfilled).
2. IF a fulfillment request sets a line item's quantity above the line item's unfulfilled quantity, or sets every quantity to 0, THEN THE Admin_API SHALL reject the fulfillment and leave the Order unchanged, including when two fulfillment requests for the same Order arrive at the same time.
3. THE Admin_App SHALL let an Admin_User who holds the order:fulfill Permission mark a fulfillment shipped with the carrier, the tracking number and the tracking URL.
4. IF a tracking URL does not start with `https://`, THEN THE Admin_API SHALL reject the shipment with a field-level error and leave the fulfillment unchanged.
5. WHEN an Admin_User uploads a Bulk_Ship_CSV file, THE Admin_App SHALL show the file's Dry_Run result, with the row number and the error of every rejected row, before the Admin_User can confirm the file.
6. WHEN the Admin_API runs the Dry_Run of a Bulk_Ship_CSV file, THE Admin_API SHALL report as an error each row whose fulfillment is unknown, already shipped, canceled or named in an earlier row of the file.
7. IF a Bulk_Ship_CSV file is larger than the CSV_Size_Limit or has more data rows than the CSV_Row_Limit, THEN THE Admin_API SHALL reject the file before the Dry_Run with a message that states the exceeded limit.
8. IF a Bulk_Ship_CSV file's Dry_Run reports one or more errors, THEN THE Admin_API SHALL reject a confirmation of the file and mark no fulfillment shipped.
9. WHEN an Admin_User confirms a Bulk_Ship_CSV file with an error-free Dry_Run, THE Admin_API SHALL mark every fulfillment in the file shipped or, if any row fails, mark no fulfillment in the file shipped.
10. THE Admin_App SHALL let an Admin_User who holds the order:fulfill Permission mark a shipped fulfillment delivered.
11. IF the Admin_API receives a delivery for a fulfillment that is not shipped, THEN THE Admin_API SHALL reject the delivery and leave the fulfillment unchanged.
12. WHEN an Admin_User marks a Cash_On_Delivery Order's fulfillment delivered, THE Admin_App SHALL require the Admin_User to record either the cash amount received or a refused delivery.
13. IF a recorded Cash_On_Delivery cash amount differs from the Order's amount due (the Order total minus the payments already recorded), THEN THE Admin_App SHALL show the difference and require the Admin_User to confirm the amount before sending the delivery.
14. IF the Admin_API receives a Cash_On_Delivery cash amount that is not above zero or has more decimal places than the currency's minor unit, THEN THE Admin_API SHALL reject the delivery and leave the Order unchanged.
15. THE Admin_App SHALL let an Admin_User create a Return for fulfilled items, up to each line item's fulfilled quantity minus the quantity already on Returns.
16. IF a Return request exceeds a line item's fulfilled quantity minus the quantity already on Returns, THEN THE Admin_API SHALL reject the Return and leave the Order unchanged.
17. WHEN an Admin_User receives a Return, THE Admin_App SHALL require each received item to be marked resaleable or not resaleable and require a Stock_Location for the resaleable items.
18. WHEN the Admin_API records a received Return, THE Admin_API SHALL add each resaleable item to the stocked quantity at the chosen Stock_Location with an Inventory_Movement and leave the stocked quantity unchanged for each not resaleable item.
19. WHEN an Admin_User prepares an exchange, a claim or an order edit, THE Admin_App SHALL show the amount difference computed by the Backend before the Admin_User can confirm the Order_Change.
20. IF the Order changed after the Backend computed an Order_Change's amount difference, THEN THE Admin_API SHALL reject the confirmation as an Edit_Conflict and leave the Order unchanged.
21. WHEN an Admin_User who holds the payment:refund Permission submits a refund, THE Admin_App SHALL require a refund reason and an amount above zero and at or below the Order's Refundable_Amount.
22. IF the Admin_API receives a refund whose amount is not above zero, has more decimal places than the currency's minor unit or exceeds the Order's Refundable_Amount at the time of processing, THEN THE Admin_API SHALL reject the refund and leave the Order's payments unchanged, including when two refunds for the same Order arrive at the same time.
23. WHEN an Admin_User submits a refund above the refund threshold, THE Admin_App SHALL require the re-authentication of a Sensitive_Action.
24. IF the Payment_Provider rejects a refund, THEN THE Admin_API SHALL record the refund as failed, leave the Refundable_Amount unchanged and return the Payment_Provider's error.
25. IF the Payment_Provider gives no result for a refund within the request timeout, THEN THE Admin_API SHALL record the refund as pending and reject further refunds on the Order until the Payment_Provider confirms or rejects the pending refund.
26. IF an Admin_User saves a refund threshold outside the allowed range of ₹0 to ₹10,00,000, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous value.
27. THE Admin_App SHALL show a queue of unresolved Payment_Incidents, oldest first, each with the Order display number, the payment amount and the time at which the Backend flagged the Payment_Incident.
28. IF no Payment_Incident is unresolved, THEN THE Admin_App SHALL show a no-incidents message in place of the queue.
29. THE Admin_App SHALL let an Admin_User resolve each Payment_Incident by refunding the payment in full, which needs the payment:refund Permission, or by accepting the Order as a backorder.
30. WHEN an Admin_User resolves a Payment_Incident with a refund above the refund threshold, THE Admin_App SHALL require the re-authentication of a Sensitive_Action.
31. IF an Admin_User resolves a Payment_Incident that another Admin_User already resolved, THEN THE Admin_API SHALL reject the second resolution and return the first resolution's Admin_User, action and time.
32. THE Admin_App SHALL send each fulfillment, shipment, delivery, Return, Order_Change, refund and Payment_Incident action with the Idempotency_Key of Requirement 3, reusing the key for every repeated click or retry of the same confirmed action.

### Requirement 10: Customer management

**User Story:** As an Admin_User who looks after Customers, I want to find any Customer and see the Customer's Orders, value and risk, with personal data masked unless the Admin_User's Role allows it, so that I can serve Customers without exposing their data.

#### Acceptance Criteria

1. THE Admin_App SHALL show the Customer list to an Admin_User who holds the customer:read Permission, in pages of the List_Page_Size, newest Customer first.
2. THE Admin_App SHALL show every PII_Field on the Customer list and the Customer profile, including saved addresses, as a Masked_Value, which an Admin_User who holds the PII Permission reveals one record at a time under Requirement 2.
3. WHEN an Admin_User searches Customers by complete email address or complete phone number, THE Admin_API SHALL return the Customers whose email address or phone number equals the search term, comparing email addresses without regard to letter case and phone numbers in E.164 format, with +91 added to a number that has no country code.
4. WHEN the Admin_API returns Customers found by email address or phone number, THE Admin_App SHALL show the matching Customers with every PII_Field as a Masked_Value, without showing the searched email address or phone number in the results.
5. THE Admin_App SHALL keep a searched Customer email address or phone number out of the screen URL, Saved_Views and browser storage.
6. THE Admin_API SHALL write a searched Customer email address or phone number to the Diagnostic_Log only as a Masked_Value.
7. IF no Customer matches the search, THEN THE Admin_App SHALL show a no-matching-Customers message with a control that clears the search.
8. WHEN an Admin_User opens a Customer profile, THE Admin_App SHALL show the Customer's Lifetime_Value in each currency of the Customer's Orders, RFM_Segment, Churn_Risk, Customer_Groups, Cash_On_Delivery status and saved addresses.
9. WHEN an Admin_User opens a Customer profile, THE Admin_App SHALL show the Customer's Orders newest first, in pages of the List_Page_Size.
10. IF a Customer has no Orders, THEN THE Admin_App SHALL show a no-Orders message in place of the Customer's Orders and a dash in place of the Lifetime_Value, RFM_Segment and Churn_Risk.
11. IF an Admin_User opens a Customer that does not exist, THEN THE Admin_App SHALL show a Customer-not-found message.
12. THE Admin_App SHALL let an Admin_User who holds the customer:write Permission add a Customer to a Customer_Group and remove the Customer from a Customer_Group.
13. WHEN the Admin_API adds a Customer to or removes a Customer from a Customer_Group, THE Admin_API SHALL change only that Customer's membership and leave every other membership of the Customer_Group unchanged, including when other Admin_Users change the Customer_Group at the same time.
14. THE Admin_App SHALL show each Customer's Cash_On_Delivery status as enabled or disabled, with the Customer's COD_Refusal_Count.
15. THE Admin_App SHALL show the control that re-enables Cash_On_Delivery only for a Customer whose Cash_On_Delivery is disabled, and only to an Admin_User who holds the cod:manage Permission.
16. WHEN an Admin_User who holds the cod:manage Permission re-enables Cash_On_Delivery for a Customer, THE Admin_API SHALL enable Cash_On_Delivery for the Customer and set the Customer's COD_Refusal_Count to 0 in one transaction.
17. IF the Admin_API receives a Cash_On_Delivery re-enable for a Customer whose Cash_On_Delivery is enabled, THEN THE Admin_API SHALL reject the re-enable and leave the COD_Refusal_Count unchanged.
18. THE Admin_App SHALL show the status and the request date of each Account_Deletion_Request on the Customer profile as read-only information, with no control that changes the Account_Deletion_Request.
19. WHILE a Customer is an Erased_Customer, THE Admin_App SHALL show an erased marker on the Customer profile in place of the Customer's PII_Fields.
20. THE Admin_App SHALL let an Admin_User who holds the customer:write Permission add an internal note of 1 to 2,000 characters to a Customer profile, shown newest first with the authoring Admin_User and the time.
21. IF the Admin_API receives a Customer note with fewer than 1 or more than 2,000 characters after leading and trailing whitespace is removed, THEN THE Admin_API SHALL reject the note with a field-level error and save no note.
22. THE Admin_App SHALL send each Customer_Group change, Cash_On_Delivery re-enable and Customer note with the Idempotency_Key of Requirement 3, reusing the key for every repeated click or retry of the same action.
23. WHEN an Admin_User starts a Customer export, THE Admin_App SHALL require the re-authentication of a Sensitive_Action.
24. THE Admin_App SHALL export the Customers that match the Customer list's search, or every Customer when no search is applied, with PII_Fields written under the export rules of Requirement 2.

### Requirement 11: Promotions management

**User Story:** As an Admin_User who runs offers, I want to create Promotions and Campaigns, generate codes and see each Promotion's use, cost and misuse, so that I can run offers that stay within budget.

#### Acceptance Criteria

1. THE Admin_App SHALL let an Admin_User who holds the promotion:write Permission create, edit and disable Promotions and Campaigns, including each Promotion's per-Customer usage limit and stacking setting (whether the Promotion combines with other Promotions on the same Cart).
2. IF the Admin_API rejects a Promotion or Campaign save, THEN THE Admin_App SHALL show the Admin_API's validation message next to each rejected field and keep the Admin_User's input.
3. IF an Admin_User saves a Promotion or Campaign whose end date and time is at or before its start date and time, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous values.
4. IF an Admin_User saves a percentage discount that is not above 0 or is above 100, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous value.
5. IF an Admin_User saves a fixed discount amount or a Campaign spend budget that is not above zero or has more decimal places than the currency's minor unit, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous value.
6. IF an Admin_User saves a per-Customer usage limit or a Campaign usage budget that is not a whole number of 1 or more, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous value.
7. IF the Admin_API rejects a Promotion or Campaign save as an Edit_Conflict, THEN THE Admin_App SHALL show an edit-conflict message with a control that reloads the record, and keep the Admin_User's input.
8. THE Admin_App SHALL let an Admin_User give a Promotion one code that the Admin_User enters, or generate a batch of 1 to 10,000 codes for the Promotion.
9. IF an Admin_User enters a code that matches an existing promotion code of the store, THEN THE Admin_API SHALL reject the code with a field-level error and create no code.
10. IF an Admin_User requests a batch of fewer than 1 or more than 10,000 codes, THEN THE Admin_API SHALL reject the request with a field-level error and create no code.
11. WHEN the Admin_API generates a batch of codes, THE Admin_API SHALL build each code from Promotion_Code_Length characters of the Code_Alphabet, each character chosen by a cryptographically secure random generator.
12. WHEN the Admin_API generates a batch of codes, THE Admin_API SHALL give each code a value that differs from every other promotion code of the store, including the codes of the same batch and of batches generated at the same time.
13. WHEN the Admin_API generates a batch of codes, THE Admin_API SHALL create every code of the batch or, if any code fails, no code of the batch.
14. THE Admin_App SHALL send each code batch request with the Idempotency_Key of Requirement 3, so that a repeated click or retry creates at most one batch.
15. IF an Admin_User saves a Promotion_Code_Length or a Code_Attempt_Window outside the value's allowed range, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous value.
16. THE Admin_App SHALL show each Campaign's budget progress as the spend or usage count consumed, the Campaign's spend or usage budget, and the consumed percentage rounded half up to 1 decimal place.
17. IF a Campaign has no spend or usage budget, THEN THE Admin_App SHALL show a no-budget label in place of the budget progress.
18. THE Admin_App SHALL show each Promotion's usage statistics per currency, with no conversion between currencies: the number of Orders other than canceled Orders that used the Promotion, the net sales of those Orders by the formula of Requirement 5, and the total discount that the Promotion gave on those Orders.
19. IF no Order other than a canceled Order used a Promotion, THEN THE Admin_App SHALL show a no-usage message in place of the Promotion's usage statistics.
20. WHEN an Admin_User disables a Promotion, THE Promotion_Engine SHALL stop applying the Promotion from the first Cart request that the Backend receives after the Admin_API confirms the change.
21. THE Admin_App SHALL show on the Promotions screen the number of promotion code attempts that the Rate_Limiter blocked in the last Code_Attempt_Window, with the Code_Attempt_Window's length in hours.
22. THE Admin_App SHALL let an Admin_User download a Promotion's codes as a CSV file, as a data export that needs the Sensitive_Action re-authentication of Requirement 1.

### Requirement 12: Store settings and configuration

**User Story:** As a store owner, I want to configure the store, its providers and its notifications in the Admin_App, with every value checked and every change recorded, so that I can run the store without developer help and trace any change.

#### Acceptance Criteria

1. THE Admin_App SHALL provide settings screens for the store profile, Client_Branding (logo upload and brand colours), Regions with their countries and currencies, tax rates, the store's GSTIN, HSN_Code settings, Sales_Channels, Stock_Locations, Shipping_Options, Serviceability_Rules, Payment_Providers, Optional_Features, Rate_Limiter rules, notification rules and templates, and the Store_Settings values that this spec defines, such as the Idle_Timeout, the Reveal_Limit and the List_Page_Size.
2. THE Admin_App SHALL show the settings screens only to an Admin_User who holds the settings:write Permission.
3. WHEN an Admin_User saves a change to payment, shipping, email or other provider settings, THE Admin_App SHALL require the re-authentication of a Sensitive_Action.
4. IF the Admin_API rejects a settings value, THEN THE Admin_App SHALL show the Admin_API's error message next to each rejected field and keep the Admin_User's input.
5. IF the Admin_API rejects a settings save as an Edit_Conflict, THEN THE Admin_App SHALL show an edit-conflict message with a control that reloads the settings, and keep the Admin_User's input.
6. IF an Admin_User saves a store GSTIN that is not 15 characters long or whose last character fails the GSTIN check-character calculation, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous value.
7. WHILE an Admin_User edits a brand colour, THE Admin_App SHALL show the Contrast_Ratio between the brand colour and the text colour shown on the brand colour, rounded down to 2 decimal places.
8. IF the Contrast_Ratio between a brand colour and the text colour shown on the brand colour is below 4.5:1, the WCAG 2.2 Level AA minimum for normal text, THEN THE Admin_API SHALL reject the brand colour with a field-level error that states the Contrast_Ratio and keep the previous colour.
9. IF the content of an uploaded logo file is not a PNG or WebP image (for example, an SVG file), whatever the file's name or declared type, THEN THE Admin_API SHALL reject the file with a message that names PNG and WebP as the accepted formats and keep the previous logo.
10. IF an uploaded logo file is larger than the Logo_Size_Limit, THEN THE Admin_API SHALL reject the file with a message that states the Logo_Size_Limit and keep the previous logo.
11. IF an Admin_User saves a Logo_Size_Limit outside the allowed range of 1 to 5 MB, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous value.
12. WHEN an Admin_User uploads a Serviceability_Rule CSV file, THE Admin_App SHALL show the file's Dry_Run result, with the row number and the error of every rejected row, before the Admin_User can confirm the import.
13. IF a Serviceability_Rule CSV file is larger than the CSV_Size_Limit or has more data rows than the CSV_Row_Limit, THEN THE Admin_API SHALL reject the file before the Dry_Run with a message that states the exceeded limit.
14. WHEN the Admin_API runs the Dry_Run of a Serviceability_Rule CSV file, THE Admin_API SHALL report as an error each row whose postal code fails the postal code format of the row's country, whose postal code range starts above the range's end, or whose postal code appears in an earlier row of the file.
15. IF a Serviceability_Rule CSV file's Dry_Run reports one or more errors, THEN THE Admin_API SHALL reject a confirmation of the file and write no data.
16. WHEN an Admin_User confirms a Serviceability_Rule CSV file with an error-free Dry_Run, THE Admin_API SHALL apply every row of the file or, if any row fails, no row of the file.
17. WHEN an Admin_User enables a Payment_Provider, THE Admin_API SHALL enable the Payment_Provider only after the Payment_Provider's Credential_Check passes.
18. IF a Payment_Provider's Credential_Check fails or gives no result within the request timeout of Requirement 3, THEN THE Admin_App SHALL show the reason that the Admin_API returns and show the Payment_Provider as disabled.
19. THE Admin_API SHALL return each Secret only as a configured or missing status, sending no part of the Secret's value to the Admin_App.
20. WHEN an Admin_User edits a notification template, THE Admin_App SHALL show a preview of the template in English and in Hindi, filled with sample data.
21. WHEN an Admin_User sends a test notification from a template, THE Admin_API SHALL send the test notification only to the email address or phone number on the requesting Admin_User's profile, for the template's channel.
22. IF the requesting Admin_User's profile has no email address or phone number for the template's channel, THEN THE Admin_App SHALL disable the test-send control and show a message that names the missing contact detail.
23. WHEN an Admin_User saves a change on a settings screen, THE Admin_API SHALL write an Audit_Log entry with the Admin_User, the changed record, the changed field names and, for each field other than a Secret, the values before and after the change.
24. IF an Admin_User saves any configured value that this document defines outside the value's allowed range, THEN THE Admin_API SHALL reject the save with a field-level error that states the allowed range and keep the previous value.

### Requirement 13: Staff, Roles, Audit_Log and Security_Events

**User Story:** As a store owner, I want to invite staff, give each person the right Roles and review what Admin_Users changed and what the Backend blocked, so that access stays limited and every change can be traced.

#### Acceptance Criteria

1. THE Admin_App SHALL let an Admin_User who holds the admin_user:manage Permission invite a new Admin_User by email address with one or more selected Roles.
2. IF an Admin_User sends an invitation with no Role, or to the email address of an existing Admin_User or of a pending invitation, THEN THE Admin_API SHALL reject the invitation with a field-level error and send no email.
3. THE Admin_App SHALL list pending invitations, each with the email address as a Masked_Value, the Roles, the last sent time, the expiry time and controls that resend or revoke the invitation.
4. IF no invitation is pending, THEN THE Admin_App SHALL show a no-pending-invitations message in place of the list.
5. WHEN an Admin_User resends an invitation, THE Admin_API SHALL send a new Invitation_Link that expires 72 hours after sending and invalidate the invitation's earlier Invitation_Link.
6. WHEN an Admin_User revokes an invitation, THE Admin_API SHALL invalidate the invitation's Invitation_Link.
7. IF a person presents an Invitation_Link that was sent more than 72 hours earlier, was replaced by a resend, was revoked or was already accepted, THEN THE Admin_API SHALL reject the invitation and grant no Role.
8. IF the Admin_API rejects an Invitation_Link, THEN THE Admin_App SHALL show a message that the invitation is no longer valid and that a new invitation is needed.
9. WHEN an Admin_User assigns Roles (in an invitation or to an existing Admin_User), saves a Role in the Role builder or resets an Admin_User's TOTP factor, THE Admin_App SHALL require the re-authentication of a Sensitive_Action.
10. THE Admin_App SHALL provide, to an Admin_User who holds the role:manage Permission, a Role builder that creates and edits custom Roles from selected Permissions and shows a description of each Permission in the Admin_User's chosen language.
11. IF an Admin_User saves a custom Role with no Permission or with the name of another Role, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous Role.
12. THE Admin_App SHALL show each System_Role as read-only, with the System_Role's Permissions and no edit or delete control.
13. IF the Admin_API receives a change to or a deletion of a System_Role, THEN THE Admin_API SHALL reject the request and leave the System_Role unchanged.
14. IF an Admin_User deletes a custom Role that an Admin_User or a pending invitation holds, THEN THE Admin_API SHALL reject the deletion with a message that states the number of Admin_Users and pending invitations that hold the Role.
15. IF the Admin_API rejects a Role save as an Edit_Conflict, THEN THE Admin_App SHALL show an edit-conflict message with a control that reloads the Role, and keep the Admin_User's selections.
16. THE Admin_App SHALL let an Admin_User who holds the admin_user:manage Permission disable an Admin_User.
17. IF the Admin_API rejects a Role change or the disabling of an Admin_User because the change would leave the store without an active Admin_User holding the owner Role, THEN THE Admin_App SHALL show a message that the store needs at least one active owner.
18. IF two Role changes or disablings that arrive at the same time would together leave the store without an active Admin_User holding the owner Role, THEN THE Admin_API SHALL apply the change that completes first and reject the other.
19. THE Admin_App SHALL show the Audit_Log viewer and the Security_Events viewer only to an Admin_User who holds the audit:read Permission.
20. THE Admin_App SHALL provide an Audit_Log viewer that filters entries by actor, action, record type, record and date range, and lists the entries newest first in pages of the List_Page_Size.
21. THE Admin_App SHALL provide a Security_Events viewer that filters Security_Events by actor, event type, record and date range, and lists the Security_Events newest first in pages of the List_Page_Size.
22. WHILE an Admin_User pages through the Audit_Log viewer or the Security_Events viewer, THE Admin_App SHALL show each entry at most once, including when new entries are written between page loads.
23. IF an Admin_User enters a date range whose start is after its end in the Audit_Log viewer or the Security_Events viewer, THEN THE Admin_App SHALL show a field-level error and keep the previous filters.
24. IF no entry matches the filters of the Audit_Log viewer or the Security_Events viewer, THEN THE Admin_App SHALL show a no-matching-entries message with a control that clears the filters.
25. WHEN an Admin_User opens an Audit_Log entry, THE Admin_App SHALL show each changed field's value before and after the change, with every PII_Field shown as a Masked_Value, which an Admin_User who holds the PII Permission reveals under Requirement 2.
26. WHEN an Admin_User exports the Audit_Log entries or Security_Events that match the viewer's filters, THE Admin_App SHALL require the re-authentication of a Sensitive_Action.
27. THE Admin_App SHALL send each invitation, resend, revocation, Role save, Role change and disabling with the Idempotency_Key of Requirement 3, reusing the key for every repeated click or retry of the same action.

### Requirement 14: Reviews, Enquiries and Quotations

**User Story:** As an Admin_User who answers Customers, I want one place to moderate product reviews, answer Enquiries and price Quotations, so that no Customer request waits unseen.

#### Acceptance Criteria

1. THE Admin_App SHALL show, to an Admin_User who holds the review:moderate Permission, a product review moderation queue that lists pending reviews, oldest first, before approved and rejected reviews, in pages of the List_Page_Size.
2. IF no product review is pending, THEN THE Admin_App SHALL show a no-pending-reviews message in place of the pending reviews.
3. THE Admin_App SHALL let an Admin_User approve or reject one product review, or approve or reject 1 to 100 selected product reviews in one bulk action.
4. WHEN an Admin_User rejects one or more product reviews, THE Admin_App SHALL require a rejection reason of 1 to 500 characters before sending the rejection.
5. IF the Admin_API receives a review rejection whose reason has fewer than 1 or more than 500 characters after leading and trailing whitespace is removed, THEN THE Admin_API SHALL reject the action with a field-level error and change no review.
6. IF the Admin_API receives a moderation action for more than 100 product reviews, THEN THE Admin_API SHALL reject the action and change no review.
7. WHEN the Admin_API applies a moderation action, THE Admin_API SHALL change every product review in the action or, if any review fails, no review.
8. THE Admin_App SHALL show, to an Admin_User who holds the enquiry:manage Permission, an Enquiry inbox that lists Enquiries newest first in pages of the List_Page_Size, each with the Enquiry's status and assignee.
9. IF the Enquiry inbox holds no Enquiry, THEN THE Admin_App SHALL show a no-Enquiries message in place of the list.
10. THE Admin_App SHALL show the contact details of each Enquiry as Masked_Values, which an Admin_User who holds the PII Permission reveals one Enquiry at a time under Requirement 2.
11. THE Admin_App SHALL let an Admin_User move an Enquiry's status from new to in_progress, from in_progress to closed, and from closed back to in_progress.
12. IF the Admin_API receives an Enquiry status change other than new to in_progress, in_progress to closed or closed to in_progress, THEN THE Admin_API SHALL reject the change and leave the Enquiry unchanged.
13. THE Admin_App SHALL offer as assignees of an Enquiry only the active Admin_Users who hold the enquiry:manage Permission.
14. IF the Admin_API receives an Enquiry assignment to an Admin_User who is disabled or lacks the enquiry:manage Permission, THEN THE Admin_API SHALL reject the assignment and leave the Enquiry unchanged.
15. WHEN an Admin_User writes a reply to an Enquiry, THE Admin_App SHALL start the reply from a template that the Admin_User selects, or from an empty reply, and let the Admin_User edit the reply before sending.
16. IF the Admin_API receives an Enquiry reply with fewer than 1 or more than 10,000 characters after leading and trailing whitespace is removed, THEN THE Admin_API SHALL reject the reply with a field-level error and send no email.
17. WHEN an Admin_User sends a reply to an Enquiry, THE Admin_API SHALL send the reply by email to the email address recorded with the Enquiry.
18. WHEN the Admin_API sends a reply to an Enquiry, THE Admin_API SHALL store the reply text on the Enquiry with the sending Admin_User and the time.
19. THE Admin_App SHALL let an Admin_User who holds the quotation:manage Permission price each item of a requested Quotation, set the Quotation's expiry date and send the Quotation to the Customer.
20. IF the Admin_API receives a Quotation with an item price that is missing, is not above zero or has more decimal places than the currency's minor unit, THEN THE Admin_API SHALL reject the Quotation with a field-level error and leave the Quotation unchanged.
21. IF the Admin_API receives a Quotation whose expiry date is today or earlier in the Store_Timezone, THEN THE Admin_API SHALL reject the Quotation with a field-level error and leave the Quotation unchanged.
22. IF the Admin_API receives new prices for a Quotation that is expired or converted, THEN THE Admin_API SHALL reject the prices and leave the Quotation unchanged.
23. THE Admin_App SHALL list Quotations by status (requested, priced, accepted, converted or expired) in pages of the List_Page_Size.
24. IF a product review, Enquiry or Quotation changed after the Admin_App loaded the record, THEN THE Admin_API SHALL reject an Admin_User's change to the record as an Edit_Conflict and leave the record unchanged.
25. IF the Admin_API rejects a change to a product review, Enquiry or Quotation as an Edit_Conflict, THEN THE Admin_App SHALL show an edit-conflict message with a control that reloads the record, and keep the Admin_User's input.
26. THE Admin_App SHALL show navigation badges with the counts of pending product reviews, new Enquiries and requested Quotations, each badge only to an Admin_User who holds the Permission of the badge's screen (review:moderate, enquiry:manage or quotation:manage).
27. THE Admin_App SHALL refresh the navigation badge counts on each navigation to another screen and, while an Admin_App screen is open, no more than 60 seconds after the previous refresh.
28. WHERE the reviews, Enquiries or Quotations Optional_Feature is enabled, THE Admin_App SHALL show that feature's navigation entry and navigation badge.
29. THE Admin_App SHALL send each moderation action, Enquiry status change, assignment, reply and Quotation send with the Idempotency_Key of Requirement 3, reusing the key for every repeated click or retry of the same action.
30. THE Admin_App SHALL show review text, Enquiry messages, Quotation notes and every other text that Customers enter as plain text, interpreting no HTML or script in the text.

### Requirement 15: Sales and product Reports

**User Story:** As a store owner, I want sales and product Reports built on the Dashboard's KPI formulas, so that I can see what sells, in which Sales_Channels and Regions, and how each product converts, with numbers that match the Dashboard.

#### Acceptance Criteria

1. THE Admin_App SHALL show the sales and product Reports only to an Admin_User who holds the reports:read Permission.
2. THE Admin_App SHALL show the sales Report's measures for each day, week or month Report_Bucket of the Reporting_Period, as the Admin_User selects, with each partial Report_Bucket marked as partial.
3. THE Admin_API SHALL compute the sales Report's gross sales, discounts, refunds, net sales, order count, units and average order value for each Report_Bucket and for the Reporting_Period with the KPI formulas of Requirement 5, per currency, with no conversion between currencies.
4. THE Admin_API SHALL compute the sales Report's tax as the sum of the tax lines on the line items and the shipping of the Period_Orders, per currency.
5. THE Admin_API SHALL compute the sales Report's shipping as the sum of the shipping amounts of the Period_Orders after shipping discounts and without tax, per currency.
6. THE Admin_API SHALL return each sales Report total equal to the matching Dashboard KPI of Requirement 5 for the same Reporting_Period, filters and currency.
7. THE Admin_App SHALL let an Admin_User group a sales Report by Sales_Channel, Region, currency, payment method, product, category or collection.
8. WHILE a sales Report is grouped by payment method, THE Admin_API SHALL place each Order paid with more than one payment method under "mixed" and each Order with no payment method under "(none)".
9. WHILE a sales Report is grouped by product, category or collection, THE Admin_App SHALL show only the line-item measures: the units, gross sales, discounts, refunds, net sales and tax of the line items.
10. WHILE a sales Report is grouped by category or collection, THE Admin_API SHALL count each line item in every category or collection of the line item's product, and count each line item whose product has no category or collection, or no longer exists, under "(none)".
11. WHILE a sales Report is grouped by category or collection, THE Admin_App SHALL state on the Report that the rows can add up to more than the Report total.
12. THE Admin_API SHALL group line items by the product ID stored on each Order line and label each product group with the product title stored on the group's most recent Order line, so that a renamed or deleted product appears under a stored title.
13. THE Admin_App SHALL show a product performance Report with each product's units, net sales per currency, product views (the number of Storefront_Sessions that viewed the product), View_To_Cart_Rate, View_To_Order_Rate and Return_Rate.
14. IF the divisor of an average order value, View_To_Cart_Rate, View_To_Order_Rate or Return_Rate in a sales or product Report is zero, THEN THE Admin_App SHALL show a dash in place of the value.
15. THE Admin_App SHALL list the top products and the bottom products of the Reporting_Period by units or by net sales in a currency that the Admin_User selects, each list holding a configured number of products (default 20, allowed 5 to 100), with ties broken by product title in alphabetical order.
16. THE Admin_API SHALL include in the bottom products list each product that was published at any time in the Reporting_Period and sold no units in the Reporting_Period, with 0 units and 0 net sales.
17. THE Admin_App SHALL state on each sales and product Report that refunds count on the refund date, whatever the placement date of the refunded Order.
18. IF no Period_Order, refund or product view matches a sales or product Report's Reporting_Period and filters, THEN THE Admin_App SHALL show a no-data message in place of the Report's rows.

### Requirement 16: Customer and marketing Reports

**User Story:** As a store owner, I want Reports on who buys, who comes back, where shoppers drop off and which campaigns bring Orders, so that I can spend marketing effort where the effort pays.

#### Acceptance Criteria

1. THE Admin_App SHALL show the customer and marketing Reports only to an Admin_User who holds the reports:read Permission.
2. THE Admin_App SHALL show the customer and marketing Reports as aggregate counts, amounts and percentages only, and open any drill-down to individual Customers as the Customer list of Requirement 10, with that Requirement's Permission and PII_Field rules.
3. THE Admin_App SHALL show the number of New_Customers and Returning_Customers for the Reporting_Period and, per currency, the net sales of each group's Period_Orders by the formulas of Requirement 5.
4. THE Admin_App SHALL show a Cohort table with one row per Cohort and columns for month 0 (the first-order month) to month N (default 12, allowed 3 to 24), each cell holding the percentage of the Cohort's Customers who placed a non-canceled Order in that month, the number of those Orders and, per currency, the net sales of those Orders.
5. THE Admin_App SHALL mark as partial each Cohort cell whose month has not ended in the Store_Timezone, and leave empty each Cohort cell whose month has not started.
6. THE Admin_API SHALL compute RFM values for each Customer with a non-canceled Order placed in the RFM lookback, a configured number of days that ends on the current date in the Store_Timezone (default 365, allowed 90 to 730): recency as the days since the Customer's last non-canceled Order, frequency as the number of the Customer's non-canceled Orders placed in the RFM lookback, and monetary as the Lifetime_Value formula applied to those Orders, per currency.
7. THE Admin_API SHALL score each Customer's recency, frequency and monetary values from 1 to 5 as 5 × (the number of scored Customers whose value is equal to or worse than the Customer's value) ÷ (the number of scored Customers), rounded up, so that tied values take the higher score, where fewer days, more Orders and a larger amount are better, comparing monetary values only within one currency and giving a Customer with Orders in several currencies the highest of the Customer's monetary scores.
8. THE Admin_API SHALL assign each scored Customer the RFM_Segment of the first matching rule in a configured ordered list of rules over the recency score (R), frequency score (F) and monetary score (M) (allowed 1 to 20 rules, the last rule matching every Customer), by default Champions (R≥4, F≥4, M≥4), Loyal (F≥4), New (F=1, R≥4), At risk (R≤2, F≥3), Hibernating (R≤2, F≤2) and Others (every Customer).
9. THE Admin_API SHALL set the Churn_Risk of a Customer with 2 or more non-canceled Orders from the days since the Customer's last non-canceled Order divided by the median days between the Customer's consecutive non-canceled Orders, with a median of 0 days taken as 1 day: low up to 1.5, medium above 1.5 up to 3 and high above 3 (limits default 1.5 and 3, allowed 1 to 10, the first limit below the second).
10. THE Admin_API SHALL set the Churn_Risk of a Customer with 1 non-canceled Order from the days since that Order: low up to 60 days, medium above 60 up to 180 days and high above 180 days (limits default 60 and 180 days, allowed 7 to 730 days, the first limit below the second), and set no Churn_Risk for a Customer with no non-canceled Order.
11. THE Admin_API SHALL use the RFM_Segment and Churn_Risk definitions of this Requirement for the Customer profile of Requirement 10.
12. THE Admin_App SHALL show, as of the current date, the number of Customers in each RFM_Segment and at each Churn_Risk level, and, per currency, the number of Customers in each Lifetime_Value band, with band limits configured per currency (default 1,000, 5,000 and 20,000 in the currency's major unit, such as ₹1,000; allowed 1 to 10 limits, each above 0 and above the previous limit) and each band including the band's lower limit.
13. THE Admin_App SHALL show the Storefront_Funnel of the Storefront_Sessions started in the Reporting_Period, with the number of Storefront_Sessions at each step and each step's conversion as a percentage of the previous step, and a dash where the previous step has 0 Storefront_Sessions.
14. THE Admin_App SHALL show, per Cart currency, the number and value of the Abandoned_Carts whose abandonment delay ended in the Reporting_Period and of the Recovered_Carts among those Abandoned_Carts, with each Cart's value as the Cart's line-item subtotal after discounts and without tax, and the abandoned-cart recovery rate of Requirement 5, with a dash where the rate's divisor is zero.
15. THE Admin_App SHALL show the Storefront_Sessions started in the Reporting_Period, the Period_Orders and, per currency, the net sales of those Period_Orders by the utm_source, utm_medium or utm_campaign of the UTM_Parameters, or by referrer domain, as the Admin_User selects, attributing each Period_Order to the Storefront_Session in which the Order was placed.
16. THE Admin_API SHALL place the Storefront_Sessions that have no value for the selected grouping under "(direct)", and the Period_Orders without a Storefront_Session, such as Orders placed by an Admin_User or imported, under "(unattributed)".
17. THE Admin_App SHALL list the top search terms and the top zero-result search terms of the Reporting_Period by number of searches (list length default 20, allowed 5 to 100), after converting each term to lower case, removing leading and trailing whitespace and collapsing each run of inner whitespace to one space, with ties broken by term in alphabetical order and each term that contains "@" or 7 or more digits shown as a Masked_Value.
18. IF a customer or marketing Report section has no Customers, Storefront_Sessions, Carts or searches for the Reporting_Period, THEN THE Admin_App SHALL show a no-data message in place of the section's rows.

### Requirement 17: Operations Reports

**User Story:** As an Admin_User who runs operations, I want inventory, payment, shipping and promotion Reports, so that I can fix stock, payment and delivery problems before the problems cost sales.

#### Acceptance Criteria

1. THE Admin_App SHALL show the operations Reports only to an Admin_User who holds the reports:read Permission.
2. THE Admin_App SHALL show an inventory Report with, for each product variant that manages inventory, the stocked quantity, the reserved quantity and the Available_Quantity at each Stock_Location, the Sell_Through_Rate and the Days_Of_Cover.
3. THE Admin_App SHALL list as slow movers the product variants that manage inventory, have a stocked quantity above 0 and sold no units in the slow-mover window, a configured number of days that ends on the current date in the Store_Timezone (default 60, allowed 7 to 365).
4. THE Admin_App SHALL show the stock value, computed as the stocked quantity times the cost, only for the product variants with a cost attribute, with a total per currency that leaves out the variants without a cost attribute and with the number of variants without a cost attribute shown beside the total.
5. THE Admin_App SHALL show, per currency, each payment method's number of Period_Orders and sum of Order totals, each with the payment method's percentage of the currency's total, with each Order paid with more than one payment method under "mixed".
6. THE Admin_App SHALL show, by Payment_Provider and payment method, the number of online payment attempts in the Reporting_Period and the percentages of those attempts that succeeded and that failed.
7. THE Admin_App SHALL show the Cash_On_Delivery share as the number of Period_Orders with the Cash_On_Delivery payment method divided by the number of Period_Orders, as a percentage.
8. THE Admin_API SHALL compute the Cash_On_Delivery refusal rate as the number of refused Cash_On_Delivery delivery outcomes recorded in the Reporting_Period divided by the number of delivered and refused Cash_On_Delivery delivery outcomes recorded in the Reporting_Period, as a percentage.
9. THE Admin_App SHALL show the refunds made in the Reporting_Period by refund reason, with the number of refunds and, per currency, the refunded amount for each reason, and with refunds that have no reason under "(none)".
10. THE Admin_API SHALL compute, by Stock_Location and Shipping_Option, the median and 90th percentile, by the nearest-rank method, of the hours from Order placement to the Order's first shipment, for each Order whose first fulfillment shipped in the Reporting_Period.
11. THE Admin_API SHALL compute, by Stock_Location and Shipping_Option, the median and 90th percentile, by the nearest-rank method, of the hours from shipment to delivery, for each fulfillment delivered in the Reporting_Period.
12. THE Admin_App SHALL show as a backlog the number of non-canceled Orders that have a line item not yet shipped, in age bands of 0 to 1, 2 to 3, 4 to 7 and over 7 whole days since placement.
13. IF the divisor of a Sell_Through_Rate, an online payment attempt percentage, the Cash_On_Delivery share, the refusal rate or an average discount per Order is zero, or a shipping Report group has no fulfillments, THEN THE Admin_App SHALL show a dash in place of the value.
14. THE Admin_App SHALL list the postal codes for which storefront postal code checks in the Reporting_Period found delivery unavailable or found no Serviceability_Rule, with the number of those checks for each postal code, most checks first with ties in postal code order, in a list of a configured length (default 20, allowed 5 to 100).
15. THE Admin_App SHALL show, for each Promotion and per currency, the redemptions (the Period_Orders that used the Promotion), the discount cost (the discount that the Promotion gave on those Period_Orders, without tax), the net sales of those Period_Orders by the formulas of Requirement 5 and the average discount per Order as the discount cost divided by the redemptions.
16. THE Admin_App SHALL show the number of promotion code attempts that the Rate_Limiter blocked in the Reporting_Period.
17. IF a Stock_Location, Shipping_Option, Payment_Provider or Promotion shown in an operations Report was deleted, THEN THE Admin_App SHALL show the record under the record's last saved name, marked as deleted.
18. IF an operations Report section has no rows for the Reporting_Period and filters, THEN THE Admin_App SHALL show a no-data message in place of the section's rows.

### Requirement 18: India GST_Reports

**User Story:** As a store owner registered for GST, I want GST_Reports that match the Order tax lines and the GST portal's formats, so that the store's GSTR-1 and GSTR-3B filings need no manual rework.

#### Acceptance Criteria

1. THE Admin_API SHALL return GST_Report data only to an Admin_User who holds the gst:read Permission, and a GST_Report export only to an Admin_User who holds the gst:read Permission and the reports:export Permission.
2. WHERE the GST Optional_Feature is enabled, WHILE the store GSTIN in Store_Settings is a Valid_GSTIN, THE Admin_App SHALL show the GST_Reports, each for one Filing_Period that the Admin_User chooses: a Filing_Month when the GST filing frequency in Store_Settings is monthly, or a quarter when the GST filing frequency is quarterly (default monthly, allowed monthly or quarterly).
3. IF the GST Optional_Feature is disabled, or the store GSTIN is missing or is not a Valid_GSTIN, THEN THE Admin_App SHALL show, in place of the GST_Reports, a message that names each missing or invalid setting.
4. WHEN the first fulfillment of an Order is marked shipped, THE Backend SHALL issue the Order's only Tax_Invoice, covering the Order's line items and shipping that are not canceled at that time, dated with the shipment date in the Store_Timezone.
5. IF an Order is canceled before the Order's first fulfillment is marked shipped, THEN THE Backend SHALL issue no Tax_Invoice for the Order.
6. THE Backend SHALL number the Tax_Invoices, the Credit_Notes and the Debit_Notes each from a separate consecutive series for the Financial_Year that contains the GST_Document's date, with each number at most 16 characters long, made only of letters, digits, hyphens and slashes, and unique among the GST_Documents of the Financial_Year.
7. THE Backend SHALL assign the numbers of each series in a Financial_Year with no gap, no duplicate and no reused number, including when two or more GST_Documents of the series are issued at the same time.
8. THE Backend SHALL keep each issued GST_Document's number, date and recorded content unchanged when the Order, the Customer, the product variant or Store_Settings change later.
9. WHEN a refund, a Return (including the items returned in an exchange) or an item cancellation reduces the taxable value or tax of an Order after the Order's Tax_Invoice was issued, THE Backend SHALL issue one Credit_Note for the reduction that references the Tax_Invoice, counting a Return and the Return's refund as one reduction.
10. WHEN the new items of an exchange or an Order edit add taxable value or tax to an Order after the Order's Tax_Invoice was issued, THE Backend SHALL issue one Debit_Note for the increase that references the Tax_Invoice.
11. THE Backend SHALL set each Tax_Invoice's Place_Of_Supply to the state of the Order's shipping address, or, for an Order with no shipping address state, the state of the billing address, or, for an Order with neither, the store's state in Store_Settings, and give each Credit_Note and Debit_Note the Place_Of_Supply of the referenced Tax_Invoice.
12. THE Admin_API SHALL report each GST_Document as intra-state, with the CGST and SGST of the recorded tax lines, when the GST state code of the GST_Document's Place_Of_Supply equals the first two digits of the store GSTIN, and as inter-state, with the IGST of the recorded tax lines, otherwise.
13. IF a Tax_Invoice records a buyer GSTIN that is not a Valid_GSTIN, THEN THE Admin_App SHALL show at the top of the GST_Report a warning that names the Tax_Invoice and states that the GST_Report counts the Tax_Invoice as B2C.
14. THE Admin_App SHALL show the GSTR-1 GST_Report in the sections B2B (each B2B Tax_Invoice by buyer GSTIN); B2C large (each B2C large Tax_Invoice with the Place_Of_Supply); B2C small (taxable value and tax per Place_Of_Supply and GST rate, net of the Credit_Notes and Debit_Notes dated in the Filing_Period that reference B2C small Tax_Invoices); Credit_Notes and Debit_Notes that reference B2B Tax_Invoices; Credit_Notes and Debit_Notes that reference B2C large Tax_Invoices; nil-rated, exempt and non-GST supplies, each split into inter-state and intra-state supplies to buyers with and without a Valid_GSTIN; HSN summary; and documents issued, with each series' first and last number in the Filing_Period, total count and canceled count.
15. THE Admin_App SHALL show the HSN summary in a B2B part, for the GST_Documents of B2B Tax_Invoices, and a B2C part, for every other GST_Document, each with one row per HSN_Code, Unit_Quantity_Code and GST rate that holds the HSN_Code, description, Unit_Quantity_Code, total quantity, total value, taxable value, rate, IGST, CGST, SGST and cess, net of the Credit_Notes and Debit_Notes dated in the Filing_Period.
16. IF a line of a GST_Document dated in the Filing_Period has no HSN_Code, an HSN_Code that is not 4, 6 or 8 digits, an HSN_Code with fewer digits than the HSN minimum length (default 4, allowed 4, 6 or 8) or no Unit_Quantity_Code, THEN THE Admin_App SHALL show at the top of the GST_Report a warning that names the product variant, the GST_Document and the reason.
17. THE Admin_App SHALL show the GSTR-3B GST_Report for outward supplies only, with no input tax credit: the taxable value and each GST_Tax_Head of the taxable, zero-rated, nil-rated and exempt, and non-GST supplies, by the GST_Treatment recorded on each line and net of the Credit_Notes and Debit_Notes dated in the Filing_Period, and the taxable value and IGST of the inter-state supplies to buyers without a Valid_GSTIN by Place_Of_Supply and GST rate.
18. IF a GST_Report section's taxable value or GST_Tax_Head total differs by 1 paisa or more from the sum of the recorded tax lines of the section's GST_Documents, THEN THE Admin_App SHALL show at the top of the GST_Report an error that names the section and the difference.
19. IF a GST_Report section's taxable value or GST_Tax_Head total differs from the sum of the recorded tax lines of the section's GST_Documents, THEN THE Admin_API SHALL reject every export of the GST_Report with an error that names the section and the difference.
20. IF a GST_Report has one or more warnings, THEN THE Admin_App SHALL ask the Admin_User to confirm the warnings before the Admin_App sends a request to export the GST_Report.
21. WHEN an Admin_User exports a GST_Report, THE Admin_API SHALL produce one ZIP file that holds a summary file of the GST_Report's warnings and one CSV file per section, with the untranslated column headers (Requirement 4), the column order and the value formats of the GST portal offline tool template version recorded in Store_Settings, and each amount with 2 decimal places as recorded.
22. THE Admin_API SHALL write each B2B receiver name into a GST_Report export unmasked, as recorded on the Tax_Invoice, as an exception to criterion 8 of Requirement 2, and leave every other PII_Field out of the GST_Report export.

### Requirement 19: Report filters, comparisons, Saved_Views and Report_Exports

**User Story:** As an Admin_User who works with Reports, I want the same filters on every Report, saved views and safe exports, so that I can repeat an analysis and share data without leaking personal data.

#### Acceptance Criteria

1. THE Admin_App SHALL show on every Report other than a GST_Report one common filter bar with the Reporting_Period (with the presets, the default of last 30 days and the custom range checks of Requirement 5), the Comparison_Period (with the rules of Requirement 5), Sales_Channel, Region and currency, and the Report's own filters, grouping and sort order.
2. THE Admin_API SHALL return a Saved_View only to an Admin_User who holds the Permission of the Saved_View's screen, and a Report_Export only to an Admin_User who holds the Report's Permission and the reports:export Permission and who passes the Sensitive_Action re-authentication of Requirement 1.
3. WHEN an Admin_User applies a Reporting_Period, Comparison_Period, filter, grouping or sort order, THE Admin_App SHALL record the applied values in the screen URL, keeping a preset Reporting_Period as the preset and leaving out searched PII_Field values, so that opening the URL applies the same values.
4. IF a screen URL or a Saved_View holds a filter value that is invalid or no longer exists, such as a deleted Sales_Channel, THEN THE Admin_App SHALL apply the other values and show a message that names each ignored filter value.
5. THE Admin_App SHALL let an Admin_User save a Report's applied Reporting_Period, Comparison_Period, filters, columns, grouping and sort order, other than searched PII_Field values, as a personal or shared Saved_View.
6. IF an Admin_User saves a Saved_View whose name, after removal of leading and trailing whitespace, is empty, is longer than 80 characters or matches, ignoring letter case, the name of another Saved_View of the same creator, or saves a new Saved_View after creating the Saved_View limit (default 50, allowed 10 to 200) of Saved_Views, THEN THE Admin_API SHALL reject the save with a field-level error that states the broken rule.
7. WHEN an Admin_User other than the creator opens a shared Saved_View, including a Saved_View whose creator is disabled, THE Admin_App SHALL open the Saved_View read-only, with the viewing Admin_User's own Permissions and PII_Field masking applied.
8. THE Admin_API SHALL accept an edit or deletion of a Saved_View only from the Saved_View's creator, and, for a shared Saved_View whose creator is disabled, a deletion from an Admin_User who holds the owner Role.
9. THE Admin_API SHALL generate each Report_Export, other than a GST_Report export, as the CSV file in UTF-8 with a byte-order mark or the XLSX file that the Admin_User chooses, with PII_Fields written by the rules of Requirement 2.
10. THE Admin_API SHALL return a Report_Export of up to the export row threshold (default 10,000 rows, allowed 1,000 to 100,000) as an immediate download, and generate a Report_Export of more rows as a Background_Export.
11. THE Admin_App SHALL show the requesting Admin_User each running Background_Export's progress and, when the Background_Export's file is ready, an in-app notice with a download control.
12. IF an Admin_User requests a Background_Export while the Admin_User has the running export limit (default 2, allowed 1 to 5) of Background_Exports running, THEN THE Admin_API SHALL reject the request with a message that states the limit.
13. IF a requested Report_Export has more than 1,000,000 data rows, THEN THE Admin_API SHALL reject the request with a message that states the limit and the Report_Export's row count.
14. THE Admin_API SHALL serve a Background_Export file only to the requesting Admin_User in a signed-in session, until the export file lifetime (default 24 hours, allowed 1 to 72 hours) after the file was ready ends, and then delete the file.
15. IF an Admin_User opens the download of a Background_Export after the export file lifetime ended, THEN THE Admin_App SHALL show a message that the file expired.
16. IF a Background_Export fails, THEN THE Admin_API SHALL mark the Background_Export as failed with the reason and keep no partial file.
17. WHEN the Admin_API generates a Report_Export, THE Admin_API SHALL write an Audit_Log entry with the Admin_User, the Report, the filters, the Reporting_Period, the row count, the format and whether PII_Fields were unmasked.
18. THE Admin_API SHALL write in each Report_Export other than a GST_Report export each amount exactly as stored in the amount's currency at full minor-unit precision, each percentage with 4 decimal places, each date as YYYY-MM-DD, each date and time in ISO 8601 with the Store_Timezone offset (such as 2026-11-01T09:30:00+05:30) and an empty cell for each value that the screen shows as a dash.
19. IF a value in a text column of a Report_Export starts with =, +, -, @, a tab or a carriage return, THEN THE Admin_API SHALL write the value with a leading apostrophe, so that spreadsheet programs run no formula.
20. THE Admin_API SHALL name each Report_Export file with the Report's English name in lower case, the Reporting_Period's start and end dates, the Store_Timezone with "/" replaced by "-" and the creation time in the Store_Timezone, such as sales_2026-10-01_2026-10-31_Asia-Kolkata_20261101T093000.csv.
21. IF a Report has no rows for a Report_Export's Reporting_Period and filters, THEN THE Admin_API SHALL write the Report_Export with the heading row only.

### Requirement 20: Scheduled_Reports by email

**User Story:** As a store owner, I want Reports emailed to staff on a schedule without personal data, so that the team sees the store's numbers without opening the Admin_App.

#### Acceptance Criteria

1. THE Admin_API SHALL return, pause, resume and delete Scheduled_Reports only for an Admin_User who holds the reports:read Permission, and accept the creation or edit of a Scheduled_Report only from an Admin_User who also holds the reports:export Permission, because each Scheduled_Report email carries Report data out of the Admin_App.
2. THE Admin_App SHALL let an Admin_User create or edit a Scheduled_Report with a Report, a frequency (daily, weekly on a chosen weekday, or monthly on a chosen day from 1 to 28 or on the month's last day), a time of day in the Store_Timezone, the CSV attachment option on or off, and recipients chosen from the active Admin_Users who hold the reports:read Permission.
3. IF an Admin_User saves a Scheduled_Report with no recipient, with a recipient who is not an active Admin_User holding the reports:read Permission (such as a typed email address), with more recipients than the recipient limit (default 20, allowed 1 to 50) or with a monthly day other than 1 to 28 or the last day, or creates a Scheduled_Report while the store has the Scheduled_Report limit (default 50, allowed 1 to 200) of Scheduled_Reports, THEN THE Admin_API SHALL reject the save with a field-level error that states the broken rule.
4. THE Backend SHALL set the Covered_Period of each Scheduled_Run to the last complete day of a daily Scheduled_Report, the last complete week from Monday to Sunday of a weekly Scheduled_Report or the last complete calendar month of a monthly Scheduled_Report, in the Store_Timezone, that ended at or before the Scheduled_Run's scheduled time.
5. IF a Scheduled_Report's time of day falls in a daylight-saving gap of the Store_Timezone or occurs twice on one day, THEN THE Backend SHALL run that day's Scheduled_Run once, at the end of the gap or at the first occurrence of the time.
6. WHEN a Scheduled_Run runs, THE Backend SHALL email each active recipient who holds the reports:read Permission, in the recipient's language of Requirement 4, the Report's KPI summary for the Covered_Period, the Data_Freshness, a link to the Report with the Covered_Period applied that the Admin_App opens only in a signed-in session, and a one-click unsubscribe link for that recipient and that Scheduled_Report.
7. IF the Data_Freshness of a Scheduled_Run lies more than the Stale_Data_Limit before the time at which the Backend builds the Scheduled_Run's emails, THEN THE Backend SHALL add to each email a stale-data note that states the Data_Freshness.
8. THE Backend SHALL leave every PII_Field, masked or unmasked, out of the subject, the body and the attachment of every Scheduled_Report email.
9. WHERE a Scheduled_Report's CSV attachment option is on, THE Backend SHALL attach to each email of the Scheduled_Report the Report's rows for the Covered_Period as a CSV file with the formats of Requirement 19.
10. IF a Scheduled_Run's CSV file is larger than the attachment size limit (default 5 MB, allowed 1 to 10 MB, where 1 MB is 1,048,576 bytes), THEN THE Backend SHALL send each email of the Scheduled_Run without the CSV file and with a note to open the Report through the email's link.
11. THE Backend SHALL send at most one email to each recipient for each scheduled time of a Scheduled_Report, also when the Scheduler runs the Scheduled_Report's job again for that scheduled time.
12. IF the Scheduler was stopped at a scheduled time of a Scheduled_Report and resumes within the catch-up window (default 24 hours, allowed 0 to 72 hours) after that scheduled time, THEN THE Backend SHALL run the missed Scheduled_Run once, for the missed Scheduled_Run's Covered_Period, with each email marked as late.
13. IF the Scheduler resumes after the catch-up window of a missed scheduled time has ended, THEN THE Backend SHALL record the missed Scheduled_Run as skipped and send no email for the missed Scheduled_Run.
14. IF a Scheduled_Report email fails to send, THEN THE Backend SHALL retry the send up to the configured number of retry attempts (default 3, allowed 0 to 10), waiting longer before each retry attempt than before the previous retry attempt.
15. IF a Scheduled_Report email still fails after the last retry attempt, THEN THE Backend SHALL record the send as failed, with the recipient and the error, on the Scheduled_Report and count the Scheduled_Run as a failed Scheduler job for the Alert_Rule of Requirement 23.
16. WHEN an Admin_User pauses or deletes a Scheduled_Report, THE Backend SHALL send none of the Scheduled_Report's unsent emails, including those of a Scheduled_Run in progress.
17. WHILE a Scheduled_Report is paused, THE Backend SHALL record each scheduled time of the Scheduled_Report that passes as skipped, with no email and no catch-up after a resume.
18. WHEN a person uses the unsubscribe link of a Scheduled_Report email, THE Backend SHALL remove the link's recipient from that Scheduled_Report only, without asking for sign-in, record the removal with the reason "unsubscribed" and show a confirmation, also when the recipient was already removed.
19. IF the recipient or the Scheduled_Report in an unsubscribe link has been altered, or the link's Scheduled_Report was deleted, THEN THE Backend SHALL change no recipient and show a message that the link is not valid.
20. WHEN a Scheduled_Run runs, THE Backend SHALL skip each recipient who is disabled or no longer holds the reports:read Permission, remove the recipient from the Scheduled_Report with the reason, and record the Scheduled_Run as skipped when no recipient remains.
21. THE Admin_App SHALL list the store's Scheduled_Reports, each with the Report, the frequency and time, the status (active or paused), the next scheduled time (none while paused), the last Scheduled_Run's result (sent, sent late, partly failed, failed or skipped), the recipients, each recipient removal with the reason and the time, and pause, resume and delete controls, with PII_Fields shown by the rules of Requirement 2.

### Requirement 21: Forecasts and trends

**User Story:** As a store owner, I want Forecasts of sales, Orders and product demand with each Forecast's accuracy shown, and lists of growing and declining products, so that I can plan stock and spending on numbers I can check.

#### Acceptance Criteria

1. THE Admin_API SHALL return Forecasts, Backtest results and trend lists only to an Admin_User who holds the reports:read Permission.
2. THE Backend SHALL produce for each Forecast_Series, other than a Forecast_Series of criterion 4, one Forecast value and one 80% Confidence_Band for each Store_Timezone day of the forecast horizon (default 30 days, allowed 7 to 90 days), starting on the day on which the Backend computes the Forecast.
3. THE Backend SHALL raise to 0 each Forecast value and each Confidence_Band bound below 0 in an order count or units Forecast_Series.
4. IF a Forecast_Series has fewer days than the minimum history (default 8 weeks, allowed 8 to 52 weeks), counting from the placement day of the first non-canceled Order that counts in the Forecast_Series to the last full day with both days included, or every Forecast_Model is left out under criterion 6, THEN THE Admin_App SHALL show "not enough data" in place of the Forecast_Series' Forecast.
5. THE Backend SHALL choose for each Forecast_Series the Forecast_Model with the lowest Backtest WAPE over a holdout of the last full days in the Store_Timezone (default 28 days, allowed 7 to 56 days), from seasonal naive with a 7-day season, a moving average over the moving-average window (default 28 days, allowed 7 to 90 days) and Holt-Winters exponential smoothing with weekly seasonality, taking the first in that order when WAPEs are equal after rounding to 2 decimal places.
6. IF a Forecast_Series has fewer days before the holdout than a Forecast_Model needs (7 days for seasonal naive, the moving-average window for the moving average and 14 days for Holt-Winters), THEN THE Backend SHALL leave that Forecast_Model out of the choice for the Forecast_Series.
7. IF the actual values of a Forecast_Series in the holdout sum to 0 or less, THEN THE Backend SHALL choose seasonal naive for the Forecast_Series without comparing WAPEs.
8. IF a product variant with at least the minimum history sold no units in the inactivity window (default 90 days, allowed 30 to 365 days) that ends on the last full day, THEN THE Backend SHALL set every Forecast value and Confidence_Band bound of the variant's Demand_Forecast to 0, with no Forecast_Model choice.
9. THE Admin_App SHALL show with each Forecast the chosen Forecast_Model, the Backtest WAPE and the Data_Freshness, with "no recent sales" in place of the Backtest WAPE under criterion 7 and in place of the Forecast_Model and the Backtest WAPE under criterion 8.
10. WHEN the Store_Timezone clock first reaches or passes the forecast refresh time (default 02:00) on a calendar day, THE Backend SHALL recompute every Forecast_Series from the data up to the end of the previous Store_Timezone day.
11. IF a Forecast_Series fails to recompute, THEN THE Backend SHALL keep the Forecast_Series' previous Forecast, Forecast_Model, Backtest WAPE and Data_Freshness, and count the refresh run as a failed Scheduler job for the Alert_Rule of Requirement 23.
12. THE Admin_App SHALL let an Admin_User add, edit and delete Special_Dates, each with a name and a date, on a settings screen of Requirement 12.
13. THE Admin_App SHALL mark on each Forecast and trend chart each Special_Date inside the chart's date range, labelled with the Special_Date's name.
14. THE Admin_App SHALL list as growing the products whose units sold rose, and as declining the products whose units sold fell, from the previous Trend_Window to the last Trend_Window, with each product's units in both Trend_Windows and the percentage change (the change in units divided by the previous Trend_Window's units).
15. IF a product sold 0 units in the previous Trend_Window, THEN THE Admin_App SHALL show a dash and the label "new" in place of the product's percentage change.
16. THE Admin_API SHALL include in each trend list only the products that sold at least the minimum volume (default 10 units, allowed 1 to 1,000 units) in the two Trend_Windows combined.
17. THE Admin_API SHALL sort each trend list by the absolute change in units, largest first, then by the units sold in the last Trend_Window, most first, then by product title in alphabetical order.
18. IF the store has no non-canceled Order placed on or before the first day of the previous Trend_Window, THEN THE Admin_App SHALL show "not enough data" in place of the trend lists.
19. THE Backend SHALL build every Forecast_Series and trend list from the non-canceled Orders, including the Orders that the Migration_Tool copied from the Legacy_Schema, counting each Order on the Order's original placement day in the Store_Timezone and in the Sales_Channel and currency recorded on the Order, and counting each day with no Orders as 0.
20. THE Backend SHALL compute the daily net sales of a Forecast_Series with the formulas of Requirement 5, counting each refund on the refund's day in the Store_Timezone, whatever the refunded Order's placement day.

### Requirement 22: Stock_Out_Predictions and Reorder_Suggestions

**User Story:** As an inventory manager, I want each product variant's predicted stock-out date with a suggested reorder quantity and order-by date, so that I can reorder before customers find a product out of stock.

#### Acceptance Criteria

1. THE Admin_API SHALL return Stock_Out_Predictions and Reorder_Suggestions only to an Admin_User who holds the reports:read Permission, and generate a Purchase_List only for an Admin_User who also holds the reports:export Permission and passes the Sensitive_Action re-authentication of Requirement 1.
2. THE Backend SHALL compute a Stock_Out_Prediction and a Reorder_Suggestion only for each product variant that manages inventory and has a Demand_Forecast.
3. THE Backend SHALL set a product variant's Stock_Out_Prediction to the first day on which the variant's Demand_Forecast, summed from the current day, exceeds the variant's Available_Quantity summed over all Stock_Locations.
4. IF a product variant's Available_Quantity summed over all Stock_Locations is 0 or less, THEN THE Backend SHALL set the variant's Stock_Out_Prediction to the current day, shown as "out of stock now", whatever the Demand_Forecast.
5. IF a product variant's Demand_Forecast, summed from the current day, stays at or below the variant's summed Available_Quantity for the whole forecast horizon of Requirement 21, THEN THE Admin_App SHALL show "no stock-out within the forecast horizon" as the variant's Stock_Out_Prediction.
6. THE Backend SHALL compute each product variant's Safety_Stock as the standard normal quantile of the service level (default 95%, allowed 80% to 99.9%), times the sample standard deviation of the variant's daily errors (actual minus forecast) in the chosen Forecast_Model's Backtest, times the square root of the variant's Lead_Time in days, and as 0 for a variant whose Demand_Forecast has no Backtest.
7. THE Backend SHALL compute each Reorder_Suggestion's quantity as the variant's Demand_Forecast summed from the current day over the Lead_Time plus the review period (default 7 days, allowed 1 to 90 days), plus the Safety_Stock, minus the Available_Quantity and the Incoming_Quantity summed over all Stock_Locations, rounded up to a whole multiple of the variant's pack size (default 1, allowed 1 to 10,000), with 0 in place of a result below 0.
8. IF the Lead_Time plus the review period is longer than the forecast horizon, THEN THE Backend SHALL count the last forecast day's Demand_Forecast value for each day after the forecast horizon.
9. THE Backend SHALL set each Reorder_Suggestion's order-by date to the variant's Stock_Out_Prediction minus the variant's Lead_Time in days.
10. IF a Reorder_Suggestion's order-by date is the current day or earlier, THEN THE Admin_App SHALL show "order now" in place of the order-by date.
11. IF a product variant has no stock-out within the forecast horizon, THEN THE Admin_App SHALL show a dash in place of the Reorder_Suggestion's order-by date.
12. THE Admin_App SHALL list each product variant that manages inventory with the variant's Stock_Out_Prediction and Reorder_Suggestion, sorted by order-by date, earliest first, with the variants without an order-by date last, and then by SKU in alphabetical order.
13. THE Admin_App SHALL show on the Reorder_Suggestion list the Data_Freshness of the Demand_Forecasts and a flag on each product variant that allows backorders.
14. THE Admin_App SHALL let an Admin_User filter the Reorder_Suggestion list by category and by collection.
15. IF the Reorder_Suggestion list has no rows for the applied filters, THEN THE Admin_App SHALL show an empty-state message in place of the list.
16. WHEN an Admin_User exports the Reorder_Suggestion list, THE Admin_API SHALL generate a Purchase_List as a Report_Export under Requirement 19, with one row per listed product variant that holds the SKU, the variant name, the Available_Quantity, the Incoming_Quantity, the reorder quantity, the pack size, the order-by date and the Lead_Time.
17. IF Requirement 21 shows "not enough data" in place of a product variant's Demand_Forecast, THEN THE Admin_App SHALL show "not enough data" in place of the variant's Stock_Out_Prediction and Reorder_Suggestion.

### Requirement 23: Alerts and Anomaly detection

**User Story:** As a store owner, I want Alerts when stock, sales, payments, deliveries, jobs or security go wrong, each sent once to the right people, so that problems get fixed before they cost sales.

#### Acceptance Criteria

1. THE Admin_API SHALL accept a change to an Alert_Rule only from an Admin_User who holds the alerts:manage Permission, and return, acknowledge or resolve an Alert only for an Admin_User who holds the alerts:manage Permission or one of the recipient Roles of the Alert_Rule that created the Alert.
2. THE Backend SHALL seed at installation these default Alert_Rules for stock and metrics, each listed as name (Alert_Subject, Alert_Severity) and condition: low-stock (product variant that manages inventory, warning) for a Sellable_Quantity in any Sales_Channel at or below the low-stock threshold of Requirement 7; stock-out (product variant, warning) for a Stock_Out_Prediction no more than the stock-out window (default 14 days, allowed 1 to 90 days) after the current day; Anomaly (net sales or order count Forecast_Series with the minimum history of Requirement 21, warning) for an Anomaly in the previous full Store_Timezone day's value, judged against the Confidence_Band of the anomaly band probability (default 95%, allowed 90% to 99.9%); payment failure (Payment_Provider, critical) for a failed share of the Payment_Provider's payment attempts in the last 60 minutes above the failure threshold (default 20%, allowed 5% to 90%), with at least the minimum attempt count (default 10, allowed 5 to 1,000) of attempts; and Cash_On_Delivery refusal (store, warning) for a refused share of the Cash_On_Delivery Orders recorded as delivered or refused in the last 7 days above the refusal threshold (default 30%, allowed 5% to 90%), with at least 10 such Orders.
3. THE Backend SHALL seed at installation these default Alert_Rules for operations and security, each listed as name (Alert_Subject, Alert_Severity) and condition: job failure (Scheduler job, critical) for a failed run of the Scheduler job; webhook failure (Webhook_Handler, critical) for more processing failures in the last 60 minutes than the webhook failure count (default 5, allowed 1 to 1,000); Security_Events (store, critical) for more Security_Events in the last 60 minutes than the Security_Events count (default 20, allowed 1 to 10,000); Payment_Incident (Payment_Incident, critical) for a new Payment_Incident; unmasked-export (export, info) for an export written with unmasked PII_Fields; and reconciliation (KPI or Report and day, critical) for a difference that the Reconciliation_Job finds.
4. THE Admin_App SHALL let an Admin_User edit each Alert_Rule's configured values, Alert_Severity, cooldown, recipient Roles (default the owner and manager System_Roles, or the owner System_Role only for the unmasked-export Alert_Rule) and email delivery (default on), and disable and enable the Alert_Rule (default enabled).
5. IF an Admin_User saves an Alert_Rule with no recipient Role, THEN THE Admin_API SHALL reject the save with a field-level error and keep the previous Alert_Rule.
6. WHILE an Alert_Rule is disabled, THE Backend SHALL skip every evaluation of the Alert_Rule.
7. WHEN a Scheduler job run fails, a Webhook_Handler processing failure occurs, a Payment_Incident is created, the Admin_API writes an export with unmasked PII_Fields or the Reconciliation_Job finds a difference, THE Backend SHALL evaluate the job failure, webhook failure, Payment_Incident, unmasked-export or reconciliation Alert_Rule that matches the event within 1 minute of the event.
8. WHEN the nightly Forecast refresh of Requirement 21 ends, THE Backend SHALL evaluate the stock-out and Anomaly Alert_Rules.
9. THE Backend SHALL evaluate the low-stock, payment failure, Cash_On_Delivery refusal and Security_Events Alert_Rules at the evaluation interval (default 15 minutes, allowed 5 to 60 minutes).
10. WHEN an Alert_Rule's condition is met for an Alert_Subject that has an open or acknowledged Alert from that Alert_Rule, THE Backend SHALL update that Alert's last-matched time and match count, with no new Alert and no new in-app or email delivery.
11. WHEN an Alert_Rule's condition is met for an Alert_Subject whose last Alert from that Alert_Rule was resolved less than the Alert_Rule's cooldown (default 24 hours, allowed 0 to 168 hours) earlier, THE Backend SHALL create no new Alert.
12. WHEN the Backend creates an Alert, THE Backend SHALL deliver the Alert in the Admin_App to every active Admin_User who holds one of the Alert_Rule's recipient Roles.
13. WHERE an Alert_Rule's email delivery is on, WHEN the Backend creates a critical Alert from the Alert_Rule, THE Backend SHALL email the Alert within 1 minute to every active Admin_User who holds one of the Alert_Rule's recipient Roles.
14. WHERE an Alert_Rule's email delivery is on, THE Backend SHALL email each warning or info Alert of the Alert_Rule within one digest interval (default 60 minutes, allowed 15 to 1,440 minutes) of the Alert's creation to every active Admin_User who holds one of the Alert_Rule's recipient Roles, grouped into at most one email per Alert_Rule and recipient per digest interval.
15. THE Backend SHALL leave every PII_Field, masked or unmasked, out of every Alert title and Alert email, and link each Alert title, in the Admin_App and in Alert emails, to the Alert's page in the Admin_App, which opens only in a signed-in session.
16. THE Admin_API SHALL accept an acknowledgment of an open Alert, and a resolution of an open or acknowledged Alert other than a Payment_Incident Alert, each with a note of 1 to 500 characters after removal of leading and trailing whitespace, and record the Admin_User, the time and the note.
17. IF the Admin_API receives an acknowledgment or resolution with a note of fewer than 1 or more than 500 characters, an acknowledgment of an acknowledged or resolved Alert, a resolution of a resolved Alert or a resolution of a Payment_Incident Alert, THEN THE Admin_API SHALL reject the request, leave the Alert unchanged and return the Alert's current status.
18. WHEN the condition of an open or acknowledged low-stock, stock-out, Anomaly, payment failure or Cash_On_Delivery refusal Alert is not met for the Alert's Alert_Subject in 2 consecutive evaluations, THE Backend SHALL resolve the Alert and record the Alert as resolved automatically.
19. THE Backend SHALL resolve each job failure, webhook failure, Security_Events, unmasked-export and reconciliation Alert only on an Admin_User's resolution of the Alert, and each Payment_Incident Alert on an Admin_User's resolution of the Alert's Payment_Incident under Requirement 9, recording that Admin_User and the time.
20. THE Admin_App SHALL show the Alert history newest first, in pages of the List_Page_Size, filterable by Alert_Rule, Alert_Severity, status and creation date range, with each Alert's Alert_Rule, Alert_Subject, Alert_Severity, status, creation time, last-matched time and match count, and each acknowledgment and resolution with the Admin_User or "resolved automatically", the time and the note, with PII_Fields shown by the rules of Requirement 2.
21. IF no Alert matches the Alert history's filters, THEN THE Admin_App SHALL show an empty-state message in place of the Alert history.

### Requirement 24: Analytics correctness, freshness and performance

**User Story:** As a store owner, I want Report numbers that match the Orders to the paisa, recent data and fast Reports on a large store, so that I can trust and use the numbers every day.

#### Acceptance Criteria

1. THE Admin_API SHALL return the Reconciliation_Job results and the Metric_Dictionary only to an Admin_User who holds the reports:read Permission.
2. THE Admin_API SHALL return Report totals that equal, to the minor unit (the paisa for INR), the totals computed directly from the Order data for the same Reporting_Period and filters.
3. WHEN the Store_Timezone clock first reaches or passes the reconciliation time (default 03:00) on a calendar day, THE Backend SHALL run the Reconciliation_Job for the previous Store_Timezone day.
4. IF the Reconciliation_Job finds a KPI or Report total that differs from the total computed from the Order data, THEN THE Backend SHALL create the reconciliation Alert of Requirement 23 with the KPI or Report, the day, both totals and the difference.
5. IF the Reconciliation_Job finds a difference for a day, THEN THE Backend SHALL rebuild that day's Analytics_Rollups from the Order data.
6. THE Admin_App SHALL show on a data health screen the last Reconciliation_Job run's time and result (no difference, differences found or failed), with each difference's KPI or Report, day, both totals and difference, or a no-run-yet message before the first run.
7. THE Backend SHALL refresh the Analytics_Rollups at intervals of at most 15 minutes.
8. WHEN an Order placed on an earlier Store_Timezone day is canceled, refunded or changed by an Order_Change, THE Backend SHALL update the Analytics_Rollups of the Order's placement day by the next Analytics_Rollup refresh, whatever the day's age.
9. THE Admin_App SHALL show the Data_Freshness on every KPI and Report.
10. THE Admin_API SHALL return each Report with a Reporting_Period of up to 2 years, for a store with up to 1,000,000 Orders, within the response time target (default 3 seconds at the 95th percentile, allowed 1 to 10 seconds).
11. IF a Report query runs longer than the query timeout (default 20 seconds, allowed 5 to 60 seconds), THEN THE Admin_API SHALL cancel the query and return a message that suggests a shorter Reporting_Period or a Report_Export under Requirement 19.
12. THE Admin_API SHALL compute every KPI and Report total separately for each currency.
13. THE Backend SHALL count each record in the Store_Timezone day that contains the record's time, including on the 23-hour and 25-hour days of a Store_Timezone with daylight saving.
14. WHEN an Admin_User saves a change to the Store_Timezone, THE Backend SHALL rebuild every Analytics_Rollup, Forecast and Report_Bucket in the new Store_Timezone.
15. WHILE the rebuild of criterion 14 is in progress, THE Admin_App SHALL show a rebuild-in-progress message on every KPI and Report in place of the KPI's or Report's values.
16. THE Admin_App SHALL show in the Metric_Dictionary, in English and in Hindi, for every KPI and Report measure, the formula, the source data, the date that places a record in a Reporting_Period and the Reports that use the KPI or measure.
17. THE Admin_API SHALL compute each KPI and Report measure by the formula, the source data and the placing date that the Metric_Dictionary shows for the KPI or measure.

### Requirement 25: Backend additions and Legacy_Admin cutover

**User Story:** As a store owner, I want the Admin_App's new backend parts built to the same rules as spec 1 and a controlled switch from the Legacy_Admin, so that security stays the same and the store keeps running during the change.

#### Acceptance Criteria

1. THE Admin_App SHALL read and write store data only through Permission-checked `api.admin_*` functions of the Admin_API.
2. IF a request from an Admin_User session reads or writes a table directly instead of calling an `api.admin_*` function, THEN THE Backend SHALL reject the request under the database grants of spec 1.
3. THE Backend SHALL keep every new table of this spec in the Extension_Schema and leave every Medusa_Parity_Table unchanged.
4. THE Backend SHALL pass the Parity_Check of spec 1 with every migration of this spec applied.
5. THE Backend SHALL run each new recurring task of this spec, including the Forecast refresh, Alert_Rule evaluation, Scheduled_Runs, the Reconciliation_Job and the deletion of expired Background_Export files, as a Scheduler job that writes a run record with the start time, the end time and the result (succeeded or failed).
6. WHEN a new `api.admin_*` function of this spec changes data, THE Admin_API SHALL write, in the same transaction as the change, an Audit_Log entry with the Admin_User, the action, the changed record and the changed field names.
7. THE Backend SHALL add these Permissions to the Permission list, each granted by default to the listed System_Roles: pii:reveal (owner, manager and support agent), reports:export (owner, manager and read-only analyst), alerts:manage (owner and manager), gst:read (owner, manager and read-only analyst) and enquiry:manage (owner, manager and support agent).
8. THE Admin_App SHALL offer each Permission of criterion 7 in the Role builder of Requirement 13 for adding to custom Roles.
9. THE Backend SHALL add the backend parts that this spec needs: Idempotency_Key checks on every Admin_API write (Requirement 3), Edit_Conflict version checks, the reveal function with the Reveal_Limit (Requirement 2), TOTP enrolment through invitations only (Requirement 1), Tax_Invoice, Credit_Note and Debit_Note numbering (Requirement 18), the Analytics_Rollup refresh of changed past days (Requirement 24), Forecasts (Requirement 21), Alerts (Requirement 23), Scheduled_Reports (Requirement 20), and Saved_Views and Background_Exports (Requirement 19).
10. THE Admin_API SHALL return the cutover readiness results only to, and accept the Admin_App_Cutover confirmation only from, an Admin_User who holds the owner Role.
11. WHEN an Admin_User opens the cutover readiness screen, THE Admin_App SHALL show each of these readiness items by name as passed or failed: the Migration_Tool cutover of spec 1 is confirmed; every active Admin_User has a verified TOTP factor; at least one active Admin_User holds the owner Role; every enabled Payment_Provider other than Cash_On_Delivery passes a Credential_Check run when the screen opens; and the email provider of spec 1 is configured.
12. IF an Admin_User confirms the Admin_App_Cutover while any readiness item of criterion 11 fails, THEN THE Admin_API SHALL reject the confirmation and return the name of each failed item.
13. WHILE the Admin_App_Cutover is unconfirmed, THE Legacy_Admin SHALL keep serving every Legacy_Admin route with the route's current behavior.
14. WHEN an Admin_User confirms the Admin_App_Cutover with the Sensitive_Action re-authentication of Requirement 1, THE Admin_API SHALL record the Admin_App_Cutover as confirmed and write an Audit_Log entry with the Admin_User and the time.
15. WHILE the Admin_App_Cutover is confirmed, THE Legacy_Admin SHALL redirect every Legacy_Admin route to the Admin_App.
16. WHILE the Admin_App_Cutover is confirmed, THE Backend SHALL reject every write request from the Legacy_Admin.
