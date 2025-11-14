modules/auth/presentation/
├── 📂 controllers/                 # API Endpoints (4 files)
│   ├── auth.controller.ts
│   ├── password.controller.ts
│   ├── roles.controller.ts
│   └── permissions.controller.ts
│
├── 📂 dto/                        # Data Transfer Objects (15 total)
│   ├── auth/
│   │   ├── register.dto.ts        ✅ EXISTS
│   │   ├── login.dto.ts           ✅ EXISTS  
│   │   ├── refresh-token.dto.ts   ✅ EXISTS
│   │   ├── verify-email.dto.ts
│   │   └── resend-verification.dto.ts
│   │
│   ├── password/
│   │   ├── change-password.dto.ts ✅ EXISTS
│   │   ├── request-password-reset.dto.ts
│   │   └── reset-password.dto.ts
│   │
│   ├── roles/
│   │   ├── create-role.dto.ts     ✅ EXISTS
│   │   ├── assign-role.dto.ts     ✅ EXISTS
│   │   └── remove-role.dto.ts     ✅ EXISTS
│   │
│   └── permissions/
│       ├── create-permission.dto.ts      ✅ EXISTS
│       ├── assign-permission-to-role.dto.ts ✅ EXISTS
│       └── check-user-permission.dto.ts  ✅ EXISTS
│
├── 📂 guards/                     # Authentication Guards (4 files)
│   ├── jwt-auth.guard.ts
│   ├── refresh-token.guard.ts
│   ├── roles.guard.ts
│   └── permissions.guard.ts
│
├── 📂 strategies/                 # Passport Strategies (2 files)
│   ├── jwt.strategy.ts
│   └── refresh-token.strategy.ts
│
└── 📂 decorators/                 # Custom Decorators (4 files)
├── current-user.decorator.ts
├── roles.decorator.ts
├── permissions.decorator.ts
└── public.decorator.ts
