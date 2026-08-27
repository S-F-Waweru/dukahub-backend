# MAON:duka Backend Project Report

Reviewed project: `C:\Code\Personal\dukahub-backend`

Date reviewed: 2026-07-02

## Executive Summary

MAON:duka already has a good backend foundation for a multi-tenant SaaS: NestJS, TypeScript, PostgreSQL/TypeORM, clean architecture-style module boundaries, JWT auth, merchant management, inventory, stock movements, sales/orders/customers, payments, health checks, Swagger/Scalar API docs, and event-driven hooks.

The strongest part of the current system is the intended architecture: modules are split into domain, application, infrastructure, and presentation layers. That is a good base for inventory, POS, online store, and later AI features.

The main issue is that the project is not yet MVP-ready for a real multi-tenant inventory/POS SaaS. It builds successfully, but there are runtime and security launch blockers:

- Stock routes are currently unauthenticated.
- Tenant isolation is inconsistent on direct `findById` lookups.
- Stock changes are not transactional or concurrency-safe.
- Order totals appear uninitialized at runtime.
- POS/payment flows do not reliably mark orders paid and deduct stock as one consistent workflow.
- Request validation is not globally enabled.
- Database sync is enabled in the root config.
- Tests are effectively absent.

Recommended MVP focus: make inventory accurate, tenant-safe, auditable, and transactionally correct before expanding online store and AI features.

## Current Project Structure

The codebase is organized like this:

```text
src/
  app.module.ts
  main.ts
  config/
  common/
  health/
  shared/
  modules/
    merchant-auth/
    merchant/
    inventory/
    sales/
    payments/
```

Most business modules follow this shape:

```text
module/
  domain/          entities, value objects, events, repository interfaces
  application/     use cases, services, event handlers
  infrastructure/  TypeORM schemas, repositories, adapters
  presentation/    controllers, DTOs, guards
```

This is a good pattern for the product because:

- Inventory rules can live in domain entities and value objects.
- POS and online orders can share the same stock engine.
- Payment providers can be swapped through adapters.
- Later AI features can read from stable inventory, sales, customer, and payment models without polluting core business logic.

## What Is Implemented

### Auth and Users

Implemented:

- Registration
- Login
- Refresh tokens
- Logout
- Email verification structures
- Password reset structures
- JWT strategy
- Role and permission entities/repositories

Risks:

- Roles are not included in the JWT/request user object, but `RolesGuard` expects `user.roles`.
- Debug logs expose sensitive registration/password flow data.
- Email verification appears structurally present, but should be tested end to end.
- Merchant creation and user registration are not cleanly joined into one reliable onboarding transaction.

### Merchant

Implemented:

- Merchant entity and schema
- Create merchant
- Get current merchant
- Update merchant info
- Update payment info

Risks:

- `GET /merchant/:id` allows access by merchant ID and should be restricted or removed for normal merchants.
- Payment configuration should move out of the merchant profile into store/payment settings later.
- Onboarding flow should guarantee that each registered owner has one merchant and correct owner role.

### Inventory

Implemented:

- Products
- Variants
- Categories
- Stock in
- Stock out
- Stock adjustment
- Stock movements
- Low stock concept
- Product and variant value objects

Risks:

- `StockController` has the JWT guard commented out.
- Product/variant lookup by ID is not tenant scoped in several repositories.
- Stock mutation is not protected against concurrent updates.
- Stock movements are not written in the same DB transaction as stock updates.
- `StockOutUseCase` does not `await` `variantRepo.update(variant)`.
- `AdjustStockUseCase` has incorrect quantity direction logic and does not update the variant after adjustment.
- Low stock implementation is incomplete/inconsistent.
- No reserved stock field exists for online checkout.

### Sales, POS, Online Orders, Customers

Implemented:

- POS order creation
- Online order creation
- Order listing and lifecycle transitions
- Customer entity/repository/controller
- Event handlers for order paid/cancelled

Risks:

- Order totals are likely broken at runtime: `Order` has `_subtotal`, `_deliveryFee`, `_total`, but the constructor does not initialize them while repository persistence reads `order.subtotal.value`.
- POS order creation checks stock but does not reserve or deduct stock immediately.
- Stock deduction happens on `order.paid`, but cash payments and callbacks do not clearly publish/order-mark-paid consistently.
- Customer lookups need tenant checks.
- Order item product name is currently using `variant.productId`, not actual product name.

### Payments

Implemented:

- Payment transaction schema
- M-Pesa STK adapter
- Payment initiation
- Cash processing
- Callback handler
- Reconciliation use case structure

Risks:

- `POST /payments/initiate` is public and trusts `merchantId` from the request body.
- Cash payment creates a completed transaction but does not publish an event or mark the order paid.
- M-Pesa callback updates the transaction but does not mark the order paid.
- Callback endpoint depends on infrastructure IP allowlisting but does not enforce application-level signature/source validation.
- Payment status endpoints need careful customer-safe response shaping.

### Health and API Docs

Implemented:

- Health, liveness, readiness endpoints
- Swagger UI
- Scalar API reference

Risks:

- CORS is open.
- API docs may expose internal routes in production unless protected or disabled.

## Build and Test Status

Build:

```text
npm run build
Result: success
```

Tests:

```text
npm test -- --runInBand
Result: failed because Jest found 0 matching tests
```

The repository has a test folder and at least one source test-like file, but Jest is configured to look under `src` for `*.spec.ts`; the existing file name does not match that pattern. Practically, there is no active automated test coverage right now.

## Security Findings

### Critical

1. Stock endpoints are unauthenticated.

File: `src/modules/inventory/presentation/controllers/stock-controller.ts`

The controller has:

```ts
// @UseGuards(JwtAuthGuard)
```

Impact: anyone who can reach the API can stock in, stock out, adjust stock, and read stock movement history if no other protection exists.

2. Tenant isolation is incomplete.

Examples:

- `ProductVariantRepository.findById(id)` filters only by ID.
- `ProductRepository.findById(id)` filters only by ID.
- `CategoryRepository.findById(id)` filters only by ID.
- `StockMovementRepository.findByVariantId(variantId)` filters only by variant ID.

Impact: one merchant may access or mutate another merchant's products, variants, categories, or stock movements if they know or guess IDs.

3. Open payment initiation trusts body `merchantId`.

File: `src/modules/payments/presentation/controllers/payment.controller.ts`

Impact: a malicious request could initiate payment records under another merchant unless the order is fetched and merchant ownership is derived from the order.

4. Global validation pipe is missing.

DTOs use `class-validator`, but `main.ts` does not register `ValidationPipe`.

Impact: invalid bodies, unknown fields, bad UUIDs, negative values, and type mismatches may reach use cases.

### High

5. `synchronize: true` is active in root TypeORM config.

File: `src/app.module.ts`

Impact: production-like environments can have schema drift or accidental destructive schema changes. Use migrations instead.

6. CORS is fully open.

File: `src/main.ts`

Impact: browser clients from any origin can call the API. Restrict to configured frontend/storefront domains.

7. Logging can leak sensitive data.

Files:

- `src/common/interceptors/logging.interceptor.ts`
- `src/modules/merchant-auth/domain/entities/user.entity.ts`
- `src/modules/merchant-auth/domain/value-objects/password.vo.ts`
- `src/modules/merchant-auth/presentation/controllers/auth.controller.ts`

Impact: passwords, tokens, emails, and auth internals may appear in logs.

8. JWT fallback secret exists.

File: `src/modules/merchant-auth/presentation/strategies/jwt.strategy.ts`

Impact: if env config fails, the app can run with a known fallback secret.

### Medium

9. Role guard likely denies valid users.

`RolesGuard` checks `user.roles`, but JWT validation returns only `userId`, `merchantId`, and `email`.

10. API docs and reference should be protected/disabled in production.

11. Health endpoint disk path checks whole `C:\` on Windows, which may not represent deploy storage.

12. Refresh token is returned in response body as well as cookie. Prefer cookie-only for browser clients.

## Inventory MVP Gaps

For an inventory-first MVP, the missing pieces are:

1. Transaction-safe stock engine.

Every stock mutation should happen inside a database transaction:

- Load variant with tenant scope.
- Lock row for update.
- Validate stock.
- Update stock.
- Insert stock movement.
- Commit.

2. Reserved stock.

Add `reservedStock` to product variants.

Needed for online store checkout:

- `availableStock = currentStock - reservedStock`
- Reserve stock when checkout starts or order is created.
- Deduct reserved stock when paid.
- Release reservation if cancelled/expired.

3. Complete movement audit trail.

Every stock movement should include:

- merchantId
- store/branchId later
- variantId
- movementType
- quantity
- previousStock
- newStock
- unitCost
- referenceType
- referenceId
- performedBy
- reason/notes
- timestamp

4. Proper adjustment logic.

Adjustment should set stock to the new quantity:

```text
difference = newQuantity - currentStock
if difference > 0: increase
if difference < 0: decrease by abs(difference)
then persist variant and movement
```

5. Bulk stock import.

Important for Kenyan MSE onboarding. Many users will start from notebooks, Excel, WhatsApp lists, or existing POS exports.

6. Product search and barcode/SKU lookup.

For POS speed:

- search by name
- search by SKU
- barcode field
- category filter
- low stock filter
- active/inactive filter

7. Cost and margin reporting.

Inventory MVP should expose:

- stock on hand value at cost
- stock on hand value at selling price
- gross margin per product
- dead stock/slow-moving stock
- fast-moving products

8. Supplier and purchase records.

Not necessarily full purchase orders on day one, but at least track source/supplier on stock-in.

9. Multi-store/branch model.

Maybe not day-one MVP, but design now:

- merchant
- store/branch
- user belongs to merchant and optionally branch
- inventory can be global or branch-specific

## POS MVP Gaps

Minimum POS flow should be:

```text
cashier logs in
search/scan product
cart calculates totals
choose payment method
complete sale
stock deducts atomically
receipt is generated
sale appears in reports
cashier shift is auditable
```

Current gaps:

- POS sale is not atomic with stock deduction.
- Cash payment does not mark order paid.
- Order paid event does not guarantee transaction rollback if stock deduction fails.
- No receipt number model.
- No cashier shift/session.
- No returns/refunds/exchanges.
- No offline/poor network handling.

For informal-sector MSEs, POS must tolerate slow networks and human mistakes. Add:

- held sales
- sale reversal
- receipt reprint
- cash drawer/shift summary
- simple discounts
- customer optional
- quick product creation during sale

## Online Store MVP Gaps

The backend has online order concepts, but a SaaS online store will also need:

- Storefront public product catalog per merchant.
- Public-safe product DTOs.
- Slugs/subdomains/custom domains later.
- Cart/session model.
- Checkout stock reservation.
- Delivery zones and fees.
- Customer contact verification.
- Order status notifications.
- Public payment status polling.
- Merchant store settings.
- Product images.
- Terms/return policy per store.

For MVP, keep online store narrow:

```text
merchant publishes products
customer places order
stock is reserved
customer pays by M-Pesa STK
merchant sees order
stock deducts when paid
reservation expires if unpaid
```

## Multi-Tenant SaaS Architecture Recommendation

Keep the current modular monolith for MVP. Do not split into microservices yet.

Recommended architecture:

```text
NestJS Modular Monolith
  Auth and Identity
  Merchant and Subscription
  Inventory
  Sales/POS
  Payments
  Storefront
  Notifications
  Reporting
  AI Insights later

PostgreSQL
  tenant-scoped tables with merchant_id
  indexes by merchant_id and hot query fields
  migrations only

Redis later
  queues
  payment reconciliation
  notification jobs
  rate limiting store
  cache hot catalog data

Object Storage later
  product images
  receipts/invoices
  exports
```

Recommended tenant isolation pattern:

- All tenant-owned tables must include `merchantId`.
- All repository methods that read tenant data must accept `merchantId`.
- Do not expose raw `findById(id)` for tenant-owned records.
- Add composite uniqueness per merchant where needed.
- Example: SKU should likely be unique per merchant, not globally unique.

Recommended module dependency direction:

```text
Presentation -> Application -> Domain
Infrastructure -> Domain interfaces
Cross-module communication via application services/events
```

Avoid direct circular business logic between sales, inventory, and payments. Define explicit use cases:

- `CompletePOSTransactionUseCase`
- `CreateOnlineOrderUseCase`
- `ReserveStockUseCase`
- `CapturePaymentUseCase`
- `MarkOrderPaidUseCase`

## Database and Schema Improvements

Inventory:

- Add `reservedStock`.
- Add `barcode`.
- Add `imageUrl` or product media table.
- Make SKU unique per merchant, not global.
- Add branch/store support later.
- Add indexes:
  - `(merchantId, name)`
  - `(merchantId, categoryId)`
  - `(merchantId, isActive)`
  - `(productId, sku)`
  - `(merchantId, createdAt)` on stock movements

Sales:

- Fix order total initialization.
- Store item snapshots: product name, sku, variant attributes, unit price, tax amount.
- Add receipt number.
- Add cashier/user ID.
- Add payment status and fulfillment status carefully.

Payments:

- Link payment transaction to order and merchant safely.
- Add idempotency keys or provider transaction uniqueness.
- Add provider callback event log.
- Add reconciliation attempts.

SaaS:

- Add subscription plan table.
- Add usage limits.
- Add billing status.
- Add merchant settings table.
- Add audit log table.

## Edge Cases to Handle

### Inventory Edge Cases

- Two cashiers sell the last item at the same time.
- Stock out happens while stock adjustment is in progress.
- Online order reserves stock but customer never pays.
- Merchant deletes product with stock or pending orders.
- SKU duplicate across same merchant.
- SKU duplicate across different merchants should be allowed.
- Negative stock should be explicitly allowed or blocked by policy.
- Damaged/expired goods.
- Returns after sale.
- Supplier gives bonus stock/free items.
- Unit cost changes over time.
- Product variant deleted but appears in old orders.
- Category deleted while products still exist.
- Stock movement history must remain immutable.

### POS Edge Cases

- Cashier cancels sale after payment.
- M-Pesa payment succeeds but callback arrives late.
- M-Pesa callback arrives twice.
- Customer pays wrong amount.
- Partial payment.
- Split payment: cash + M-Pesa.
- Receipt reprint.
- Refund and stock restoration.
- Shift close mismatch.

### Online Store Edge Cases

- Customer checks out item with 1 stock while POS sells it.
- Delivery fee changes after order placement.
- Payment succeeds after order reservation expires.
- Customer retries STK push many times.
- Merchant disables product while customer has it in cart.
- Public catalog should not leak cost price or supplier info.

### Multi-Tenant Edge Cases

- User belongs to multiple merchants later.
- Staff user moves between branches.
- Merchant subscription expires.
- Suspended merchant attempts API use.
- Admin support user needs scoped access.
- Tenant data export/delete request.

## AI Readiness

Do not add AI before inventory and sales data are reliable. AI features later should depend on clean event/audit data.

Good future AI features:

- Reorder suggestions.
- Slow-moving stock detection.
- Demand forecasting.
- Suggested stock quantities before market days/holidays.
- Natural language inventory search.
- Product description generation for online store.
- Anomaly detection for suspicious stock adjustments.
- M-Pesa/payment reconciliation assistant.

Prepare now by adding:

- Clean stock movement audit log.
- Stable product/category naming.
- Sales history with item snapshots.
- Merchant settings and business type.
- Data export APIs.
- Background job system.
- Aggregated reporting tables or materialized views later.

## Kenya and East Africa Product Considerations

For Kenyan MSEs and informal businesses, MVP should prioritize speed, simplicity, and trust:

- Fast product creation.
- Works with M-Pesa first.
- Phone-number-first customer records.
- Simple receipt sharing by SMS/WhatsApp later.
- Low-bandwidth frontend.
- Offline-tolerant POS roadmap.
- Kiswahili-friendly labels later.
- KES defaults.
- Simple tax settings, with room for KRA/eTIMS integration.
- Simple onboarding from Excel or phone photos later.

Compliance areas to plan for:

- Kenya data protection obligations for customer/user personal data.
- KRA/eTIMS readiness for tax invoice flows where applicable.
- Payment provider rules for M-Pesa callbacks and transaction records.

This report is not legal advice; confirm exact compliance requirements with current KRA, ODPC, and payment provider guidance before launch.

## Recommended MVP Scope

### MVP 1: Inventory Core

Must have:

- Secure merchant auth.
- Merchant onboarding.
- Product/category/variant CRUD.
- Stock in/out/adjustment.
- Transaction-safe stock movements.
- Low stock report.
- Product search/SKU/barcode.
- Basic stock valuation report.
- CSV/Excel import/export.

Do not add yet:

- Advanced ecommerce themes.
- AI.
- Multi-branch complexity unless required by first customers.

### MVP 2: POS

Must have:

- Create sale.
- Cash and M-Pesa payment.
- Atomic stock deduction.
- Receipt.
- Sales history.
- Refund/reversal.
- Cashier roles.

### MVP 3: Online Store

Must have:

- Public catalog.
- Product images.
- Checkout.
- M-Pesa STK.
- Stock reservation.
- Order management.
- Delivery settings.

### MVP 4: AI and Analytics

Add only after data is reliable:

- reorder recommendations
- stock insights
- sales summaries
- demand prediction

## Priority Roadmap

### Week 1: Launch Blockers

1. Add global `ValidationPipe`.
2. Lock down CORS.
3. Remove JWT fallback secret.
4. Remove sensitive logs.
5. Protect `StockController` with JWT and permissions.
6. Make tenant-owned repositories merchant-scoped.
7. Disable TypeORM synchronize and add migrations.
8. Fix order total initialization.
9. Fix stock adjustment logic.
10. Add tests for auth, inventory, and order creation.

### Week 2: Inventory Reliability

1. Add DB transactions and row locks for stock mutations.
2. Add reserved stock.
3. Make POS sale and stock deduction atomic.
4. Add idempotency for stock/order/payment operations.
5. Add low-stock implementation.
6. Add pagination and search.

### Week 3: POS MVP

1. Complete cash payment to mark order paid.
2. Complete M-Pesa callback to mark order paid.
3. Add receipt numbers.
4. Add refunds/reversals.
5. Add cashier roles.

### Week 4: Online Store MVP

1. Public storefront catalog.
2. Product image support.
3. Cart/checkout.
4. Stock reservation expiry.
5. Public payment status.
6. Merchant order dashboard APIs.

## Top Questions Before Implementation

1. Should one merchant be allowed to have multiple shops/branches in the MVP, or should branch support wait?
2. Should stock ever be allowed to go negative for informal businesses that sell before updating purchases?
3. Is POS expected to work offline or just tolerate slow networks at first?
4. Do you want one online store per merchant with a subdomain, or just API support first?
5. Is eTIMS required for MVP customers, or should the system only keep fields ready for later integration?

## Final Assessment

The project is promising and has the right modular direction, but the stated completion in old docs is too optimistic. Current backend status is closer to:

- Architecture foundation: 70 percent
- Auth foundation: 60 percent
- Inventory feature shape: 65 percent
- Inventory production reliability: 35 percent
- POS feature shape: 45 percent
- Payments feature shape: 45 percent
- Online store readiness: 25 percent
- SaaS production readiness: 30 percent
- Test confidence: 5 percent

Best next move: make inventory tenant-safe, transaction-safe, and well-tested. That will become the core truth of the whole product: POS, online store, analytics, and AI all depend on inventory data being correct.
