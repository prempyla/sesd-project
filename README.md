# SETS - Smart Escalation Ticket System

A production-grade, full-stack ticketing system designed to streamline customer support workflows through automated Service Level Agreement (SLA) enforcement and multi-level smart escalation.

## Key Features
- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Admins, Support Agents, and End Users.
- **Automated Routing & SLA:** Tickets are automatically triaged with dynamic deadlines based on calculated priority.
- **Background Escalation Engine:** Unresolved tickets breach their SLA are systematically escalated up the management chain via scheduled background jobs.
- **Real-Time Notification System:** Users are kept strictly up to date on ticket assignments, resolutions, and escalations.

## Tech Stack
- **Backend Environment:** Node.js, Express.js
- **Database Architecture:** PostgreSQL (Production) / SQLite (Local) via Sequelize ORM
- **Authentication:** Stateless JWT (JSON Web Tokens) with Bcrypt hashing
- **Frontend Client:** Vanilla HTML5, CSS3, ES6 JavaScript (No-build SPA architecture)

## Architecture

SETS adheres to a Layered Architecture (Backend API / Frontend SPA):
`Controller -> Service -> Repository -> Database`

**Design Patterns Implemented:**
- **Repository Pattern:** Abstracts all database queries.
- **Service Layer:** Isolates pure business logic.
- **Strategy Pattern:** Enables flexible priority-to-deadline calculations.
- **Observer Pattern:** Triggers internal notifications on state changes.
- **State Machine:** Enforces valid status transitions during ticket lifecycles.

## Quick Start

### Prerequisites
- Node.js (v18 or higher)

### Setup Instructions

```bash
# Install backend dependencies
cd backend
npm install

# Seed the database with demo data
npm run seed

# Start the application
npm start
```

Access the application at: `http://localhost:5001`

## Authentication Roles

The system is seeded with the following logical roles for testing purposes:

- **Admin Account**: `admin@sets.local` / `admin123`
- **Support Agent**: `agent@sets.local` / `agent123`
- **Standard User**: `user@sets.local` / `user123`

## Core Mechanics

### SLA Integration
Service Level Agreement deadlines are automatically calculated upon ticket creation based on category impact mappings:
- **P1 Priority:** 2 hours
- **P2 Priority:** 6 hours
- **P3 Priority:** 24 hours
- **P4 Priority:** 72 hours

### Escalation Engine
A background cron process runs continuously handling stale tickets. The engine automatically escalates a ticket's internal level if:
1. The assigned SLA deadline has elapsed.
2. The ticket state is open or in progress.
3. The ticket has not yet reached the maximum escalation threshold.

## Technical Documentation

Project diagrams and technical planning documents are available in the root directory:
- `idea.md` - Project scope, features, and core requirements
- `useCaseDiagram.md` - System interaction boundaries and actor mappings
- `sequenceDiagram.md` - Technical lifecycle of ticket state mutations
- `classDiagram.md` - Application class structures
- `ErDiagram.md` - Relational database schema
