# TechRealest 🏠

A comprehensive **Real Estate Management Web Application** that combines the best features from industry-leading platforms like Buildium, AppFolio, TenantCloud, RentRedi, Avail, and Re-Leased.

![TechRealest Dashboard](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 📊 Dashboard
- Key metrics cards (Total Properties, Tenants, Active Leases, Monthly Revenue, Occupancy Rate)
- Revenue trend charts (6-month visualization)
- Payment overview with pie charts
- Upcoming lease expirations alerts
- Recent activity feed
- Property type distribution

### 🏘️ Property Management
- Property listing with grid view
- Filter by status and type
- Search functionality
- Add/Edit/Delete properties
- Property details (bedrooms, bathrooms, square footage, value)
- Amenity tracking

### 👥 Tenant Management
- Tenant profiles with contact information
- Employment and income tracking
- Emergency contact management
- Credit score tracking
- Background check status
- Property assignment

### 📄 Lease Management
- Lease creation with automatic numbering
- Fixed-term and month-to-month leases
- Start/end date tracking
- Monthly rent and deposit management
- Late fee configuration
- Status workflow (Draft → Pending → Active → Expired)

### 💳 Payment & Rent Collection
- Payment recording and tracking
- Multiple payment methods
- Payment status tracking (Pending, Completed, Failed)
- Due date management
- Revenue reporting

### 🔧 Maintenance Request System
- Create and track maintenance tickets
- Priority levels (Low, Medium, High, Emergency)
- Status workflow (Pending → Approved → In Progress → Completed)
- Category classification (Plumbing, Electrical, HVAC, etc.)
- Cost tracking (estimated vs actual)

### 📈 Reports & Analytics
- Revenue by property charts
- Property type distribution
- Payment collection rate
- Key performance indicators

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Bun or npm
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zisinyoro-byte/TechRealest.git
cd TechRealest
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DATABASE_URL="your_database_url"
DIRECT_URL="your_direct_url"
NEXTAUTH_SECRET="your_secret_key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Push database schema:
```bash
bun run db:push
```

5. Start the development server:
```bash
bun run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Seeding Demo Data

Click the **"Seed Demo Data"** button on the sidebar to populate the database with sample:
- 8 Properties
- 15 Tenants
- 12 Leases
- 20 Payments
- 10 Maintenance Requests

## 📁 Project Structure

```
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── dashboard/
│   │   │   ├── properties/
│   │   │   ├── tenants/
│   │   │   ├── leases/
│   │   │   ├── payments/
│   │   │   ├── maintenance/
│   │   │   └── seed/
│   │   ├── layout.tsx
│   │   └── page.tsx       # Main application
│   ├── components/ui/     # shadcn/ui components
│   ├── hooks/
│   └── lib/
│       └── db.ts          # Prisma client
├── .env.example
├── package.json
└── tailwind.config.ts
```

## 🎨 Color Scheme

The application uses an emerald/teal color scheme for a professional real estate feel:
- Primary: Emerald-600 (#10b981)
- Background: Gray-50/White
- Text: Gray-900
- Accents: Blue, Yellow, Red for status indicators

## 📱 Responsive Design

- Mobile-first approach
- Responsive sidebar navigation
- Adaptive grid layouts
- Touch-friendly interface

## 🔐 Security

- Environment variables for sensitive data
- Prisma ORM prevents SQL injection
- Input validation with Zod

## 📝 License

MIT License

## 👤 Author

Built with ❤️ for small real estate businesses
