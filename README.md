# 🎯 SETS — Smart Escalation Ticket System

A production-grade, full-stack ticketing system with automated SLA enforcement and multi-level smart escalation.

---

## 🏗 Architecture

```
SETS follows a Layered Architecture (75% backend / 25% frontend):
  Controller → Service → Repository → Database
```

**Design Patterns Used:**
- **Repository Pattern** — `UserRepository`, `TicketRepository` abstract all DB queries
- **Service Layer** — `TicketService`, `EscalationEngine` for pure business logic
- **Strategy Pattern** — `SlaProvider` for priority-to-deadline calculation
- **Observer Pattern** — `NotificationService` triggered by state changes
- **Factory Pattern** — `TicketService.createTicket()` auto-assigns priority and SLA
- **State Machine** — Valid status transition enforcement in `TicketService.updateStatus()`

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18

### Setup

```bash
# Install backend dependencies
cd backend
npm install

# Seed the database (creates SQLite DB + demo data)
npm run seed

# Start the server
npm start
```

**Open:** http://localhost:5001

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 🔴 Admin | admin@sets.local | admin123 |
| 🟡 Support Agent | agent@sets.local | agent123 |
| 🔵 User | user@sets.local | user123 |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Get current user |

### Tickets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/tickets` | Any | Create ticket (auto-priority) |
| GET | `/api/tickets` | Any | Get tickets (role-filtered) |
| GET | `/api/tickets/:id` | Any | Get ticket details |
| PUT | `/api/tickets/:id/status` | Support, Admin | Update ticket status |
| PUT | `/api/tickets/:id/assign` | Admin | Assign ticket to agent |
| GET | `/api/tickets/admin/metrics` | Admin | Dashboard metrics |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | Any | Get my notifications |
| PUT | `/api/notifications/:id/read` | Any | Mark as read |
| PUT | `/api/notifications/mark-all-read` | Any | Mark all as read |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | Admin | List all users |
| GET | `/api/admin/agents` | Admin | List support agents |

---

## ⏱ SLA Windows

| Priority | Window | Auto-assigned For |
|----------|--------|-------------------|
| P1 | 2 hours | Payment (High/Medium), Technical (High) |
| P2 | 6 hours | Payment (Low), Technical (Medium), Account (High) |
| P3 | 24 hours | Technical (Low), Account (Medium), General (High) |
| P4 | 72 hours | Account (Low), General (Medium/Low) |

---

## 🔄 Escalation Engine

A background cron job runs **every 5 minutes**. It queries all tickets where:
- `sla_deadline < NOW()`
- `status NOT IN (RESOLVED, CLOSED)`
- `escalation_level < 3`

And escalates them to the next level (max Level 3 → Admin).

---

## 📁 Project Structure

```
sesd-project/
├── backend/
│   └── src/
│       ├── config/          # DB + Seed
│       ├── models/          # Sequelize ORM models
│       ├── repositories/    # Data access layer
│       ├── services/        # Business logic
│       ├── controllers/     # API route handlers
│       ├── middlewares/     # JWT + RBAC
│       ├── routes/          # Express routers
│       └── jobs/            # Cron + Escalation Engine
├── frontend/
│   ├── index.html           # Login
│   ├── dashboard.html       # Role-adaptive dashboard
│   ├── tickets.html         # Ticket management
│   ├── admin.html           # Admin panel
│   ├── css/style.css        # Design system
│   └── js/                  # API client + modules
├── idea.md
├── useCaseDiagram.md
├── sequenceDiagram.md
├── classDiagram.md
└── ErDiagram.md
```

---

## 📋 Documentation

- [idea.md](./idea.md) — Project scope and key features
- [useCaseDiagram.md](./useCaseDiagram.md) — Use Case Diagram (Mermaid)
- [sequenceDiagram.md](./sequenceDiagram.md) — Ticket lifecycle sequence
- [classDiagram.md](./classDiagram.md) — Class structure and relationships
- [ErDiagram.md](./ErDiagram.md) — Database schema and relationships
