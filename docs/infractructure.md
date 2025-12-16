# 🏗️ DukaHub - Infrastructure Layer Complete Overview

## 📋 LAYER PURPOSE

**Connects Domain Business Logic to External World** (Database, Email,
Cache, etc.)

------------------------------------------------------------------------

## 📁 FOLDER STRUCTURE

    modules/auth/infrastructure/
    ├── 📂 repositories/ (6 files)
    │   ├── user.repository.ts
    │   ├── role.repository.ts
    │   ├── permission.repository.ts
    │   ├── refresh-token.repository.ts
    │   ├── email-verification-token.repository.ts
    │   └── password-reset-token.repository.ts
    │
    ├── 📂 persistence/typeorm/
    │   ├── 📂 schemas/ (8 files)
    │   │   ├── user.schema.ts
    │   │   ├── role.schema.ts
    │   │   ├── permission.schema.ts
    │   │   ├── refresh-token.schema.ts
    │   │   ├── email-verification-token.schema.ts
    │   │   ├── password-reset-token.schema.ts
    │   │   ├── role-permission.schema.ts
    │   │   └── user-role.schema.ts
    │   │
    │   └── 📂 migrations/
    │
    ├── 📂 adapters/
    │   ├── bcrypt.adapter.ts
    │   └── sendgrid-email.adapter.ts
    │
    └── 📂 cache/
        └── auth-cache.service.ts

------------------------------------------------------------------------

## 🔄 DATA FLOW PATTERN

### Domain → Infrastructure → Database

Domain Entity (Business Rules)\
↓\
Repository Interface (Contract)\
↓\
Repository Implementation (Infrastructure)\
↓ toSchema()\
Database Schema (TypeORM)\
↓\
PostgreSQL Table

### Database → Infrastructure → Domain

PostgreSQL Table\
↓\
Database Schema (TypeORM)\
↓ toDomain()\
Repository Implementation (Infrastructure)\
↓\
Domain Entity (Business Rules)

------------------------------------------------------------------------

## 🎯 REPOSITORY RESPONSIBILITIES

### Each Repository Provides:

-   CRUD Operations\
-   Custom Queries\
-   Bulk Operations\
-   Relationship Management\
-   Data Mapping

### Mapper Pattern

``` ts
toSchema(entity): Schema
toDomain(schema): Entity
```

------------------------------------------------------------------------

## 🗃️ DATABASE SCHEMAS SUMMARY

### Core Tables

-   users\
-   roles\
-   permissions

### Token Tables

-   refresh_tokens\
-   email_verification_tokens\
-   password_reset_tokens

### Relationship Tables

-   user_roles\
-   role_permissions

------------------------------------------------------------------------

## 🔐 SECURITY FEATURES

### Token Security

-   Token hashing\
-   Expiration handling\
-   One‑time usage\
-   Cleanup of expired tokens

### Data Protection

-   Password hashing\
-   Email/phone validation\
-   Multi‑tenant isolation

------------------------------------------------------------------------

## ⚡ PERFORMANCE OPTIMIZATIONS

### Database Indexes

-   Unique constraints\
-   Foreign key indexes\
-   Query optimization indexes

### Caching Ready

-   Redis integration\
-   Cache invalidation\
-   Monitoring hooks

------------------------------------------------------------------------

## DEPENDENCIES

-   @nestjs/typeorm\
-   typeorm\
-   pg\
-   bcrypt\
-   @sendgrid/mail\
-   redis

------------------------------------------------------------------------

## ✅ COMPLETION STATUS

Infrastructure Layer: **100% COMPLETE 🎉**\
Next: Presentation Layer\
Last Updated: Infrastructure Layer Complete
