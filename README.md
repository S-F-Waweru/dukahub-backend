# DukaHub Backend - NestJS API

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=flat&logo=graphql&logoColor=white)](https://graphql.org/)

> **Multi-tenant merchant platform API with Clean Architecture**

Backend API for DukaHub - AI-powered merchant platform for Kenyan small businesses with M-Pesa integration, inventory management, POS, and real-time features.

---

## 🏗️ Architecture

Built with **Clean Architecture** principles for maintainability, testability, and scalability:

```
+---------------------------+
|   Presentation Layer      |
|  Controllers, DTOs        |
|  GraphQL Resolvers        |
|  Guards, WebSockets       |
+------------+--------------+
             |
             v
+------------+--------------+
|   Application Layer       |
|  Use Cases (Business      |
|  Workflows)               |
|  Application Services     |
+------------+--------------+
             |
             v
+------------+--------------+
|      Domain Layer         |
|  Entities, Value Objects  |
|  Business Rules           |
|  Repository Interfaces    |
+------------+--------------+
             ^
             |
+------------+--------------+
|  Infrastructure Layer     |
|  TypeORM Repositories     |
|  External APIs (M-Pesa)   |
|  Redis Cache, Bull Queue  |
+---------------------------+
```

### Key Principles
- **Domain-Driven Design (DDD)**
- **Dependency Inversion**
- **SOLID Principles**
- **Multi-tenant isolation**
- **Event-driven architecture**

---

## 📦 Tech Stack

### Core Framework
- **NestJS 10.x** - Progressive Node.js framework
- **TypeScript 5.x** - Type safety
- **Node.js 18+** - Runtime environment

### Database & Caching
- **PostgreSQL 15+** - Multi-tenant data store
- **TypeORM 0.3.x** - ORM with repository pattern
- **Redis 7.x** - Caching & pub/sub

### API Layers
- **GraphQL** (Apollo Server 4.x) - Flexible queries
- **REST API** - Standard endpoints
- **Socket.io 4.x** - Real-time WebSockets

### Authentication & Security
- **JWT** - Access & refresh tokens
- **Passport.js** - Authentication strategies
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **Throttler** - Rate limiting

### Background Jobs
- **Bull** - Queue management
- **Cron** - Scheduled tasks

### External Integrations
- **M-Pesa Daraja API** - Mobile payments
- **OpenAI/Anthropic** - AI features
- **Africa's Talking** - SMS notifications
- **SendGrid** - Email service

---

## 📁 Project Structure

```
src/
├── main.ts                     # App entry point
├── app.module.ts               # Root module
│
├── modules/
│   ├── auth/                   # Authentication module
│   │   ├── domain/            # Entities, VOs, interfaces
│   │   ├── application/       # Use cases & services
│   │   ├── infrastructure/    # Repos, adapters
│   │   └── presentation/      # Controllers, DTOs, guards
│   │
│   ├── inventory/             # Inventory management
│   ├── sales/                 # POS & orders
│   ├── payment/               # M-Pesa integration
│   ├── ai/                    # AI features
│   ├── notification/          # WebSockets, email, SMS
│   └── analytics/             # Reports & dashboards
│
├── shared/
│   ├── domain/                # Base entities, interfaces
│   ├── infrastructure/        # Database, Redis, events
│   └── decorators/            # Custom decorators
│
└── config/                    # Configuration files
    ├── database.config.ts
    ├── jwt.config.ts
    └── redis.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 18.x
PostgreSQL >= 15.x
Redis >= 7.x
npm or yarn
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/dukahub-backend.git
cd dukahub-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=dukahub

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# M-Pesa
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-passkey

# Email
SENDGRID_API_KEY=your-key
SENDGRID_FROM_EMAIL=noreply@dukahub.co.ke

# AI
OPENAI_API_KEY=your-key
```

4. **Run database migrations**
```bash
npm run migration:run
```

5. **Start development server**
```bash
npm run start:dev
```

API available at: `http://localhost:3000`

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📡 API Endpoints

### REST API
```
POST   /auth/register          # Register new user
POST   /auth/login             # Login
POST   /auth/refresh           # Refresh token
POST   /auth/logout            # Logout

GET    /products               # List products
POST   /products               # Create product
PUT    /products/:id           # Update product
DELETE /products/:id           # Delete product

POST   /orders                 # Create order
GET    /orders/:id             # Get order

POST   /payments/mpesa         # Initiate M-Pesa payment
POST   /payments/callback      # M-Pesa callback
```

### GraphQL Endpoint
```
/graphql
```

Example query:
```graphql
query {
  products(merchantId: "123") {
    id
    name
    price
    quantity
  }
}

mutation {
  createProduct(input: {
    name: "Product Name"
    sku: "SKU-001"
    price: 1000
    quantity: 50
  }) {
    id
    name
  }
}
```

### WebSocket Events
```
ws://localhost:3000

Events:
- stock-update
- new-order
- low-stock-alert
- payment-received
```

---

## 🔐 Authentication Flow

```
1. User registers -> Email verification sent
2. User verifies email
3. User logs in -> Access token (15min) + Refresh token (7 days)
4. API calls use Bearer token
5. Access token expires -> Auto-refresh using refresh token
6. Refresh token expires -> Re-login required
```

### Multi-tenancy
Every request automatically filtered by `merchantId`:
```typescript
@UseGuards(JwtAuthGuard, TenantGuard)
@Get('products')
async getProducts(@CurrentUser('merchantId') merchantId: string) {
  // Data automatically isolated by tenant
}
```

---

## 🎯 Key Features Implementation

### 1. M-Pesa Integration
```typescript
// Initiate STK push
POST /payments/mpesa
{
  "phoneNumber": "254712345678",
  "amount": 1000,
  "accountReference": "ORDER-123"
}

// Handles callback automatically
POST /payments/mpesa/callback
```

### 2. Real-time Stock Alerts
```typescript
// WebSocket emits on low stock
socket.on('low-stock-alert', (data) => {
  console.log(data.productName, data.currentStock);
});
```

### 3. AI Features
```typescript
POST /ai/analyze-sales
{
  "period": "last_30_days"
}

Response: AI-generated insights
```

---

## 🔧 Development Scripts

```bash
# Development
npm run start:dev        # Hot reload

# Production
npm run build            # Compile TypeScript
npm run start:prod       # Run production

# Database
npm run migration:generate    # Generate migration
npm run migration:run         # Run migrations
npm run migration:revert      # Rollback migration

# Code Quality
npm run lint             # ESLint
npm run format           # Prettier
```

---

## 📊 Performance Targets

| Metric | Target | Implementation |
|--------|--------|----------------|
| API Response | < 200ms | Redis caching, DB indexing |
| GraphQL Query | < 300ms | DataLoader (N+1 prevention) |
| WebSocket Latency | < 100ms | Redis pub/sub |
| Concurrent Users | 1000+ | Horizontal scaling |

---

## 🔒 Security Features

- ✅ JWT with short expiration (15 min)
- ✅ HttpOnly cookies for refresh tokens
- ✅ HTTPS only
- ✅ CORS configured
- ✅ Rate limiting (100 req/min)
- ✅ Input validation (class-validator)
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ Password hashing (bcrypt)
- ✅ Tenant isolation (row-level security)
- ✅ Helmet.js security headers

---

## 📈 Monitoring

```bash
# Health check
GET /health

# Metrics (Prometheus format)
GET /metrics
```

---

## 🐳 Docker Deployment

```bash
# Build image
docker build -t dukahub-backend .

# Run with docker-compose
docker-compose up -d
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- Follow Clean Architecture layers
- Write unit tests for use cases
- Use TypeScript strict mode
- Follow ESLint rules
- Document complex logic

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 📞 Support

- **Documentation**: [docs.dukahub.co.ke](https://docs.dukahub.co.ke)
- **Issues**: [GitHub Issues](https://github.com/yourusername/dukahub-backend/issues)
- **Email**: support@dukahub.co.ke

---

**Built with ❤️ for Kenyan merchants**
