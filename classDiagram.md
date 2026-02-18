#  Class Diagram — SETS

## Overview

The SETS class structure follows a **Service-Repository** pattern. Business logic for SLA calculation and escalation level selection is encapsulated within the `TicketService`.

---

## Mermaid Class Diagram

```mermaid
classDiagram
    direction TB

    %% Enums
    class Role { <<enumeration>> ADMIN, SUPPORT, USER }
    class Priority { <<enumeration>> P1, P2, P3, P4 }
    class Status { <<enumeration>> OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED }

    %% Entities
    class User {
        +Long id
        +String name
        +Role role
    }

    class Ticket {
        +Long id
        +String title
        +Priority priority
        +Status status
        +DateTime slaDeadline
        +isBreached() boolean
    }

    class Escalation {
        +Long id
        +int level
        +DateTime escalatedAt
    }

    %% Management Layer
    class TicketController {
        -TicketService ticketService
        +create(TicketDTO)
        +update(Long, Status)
        +assign(Long, AgentId)
    }

    class TicketService {
        -TicketRepository repo
        -SlaProvider slaProvider
        +createTicket(dto)
        +updateStatus(id, status)
        +processSlaBreaches()
    }

    class SlaProvider {
        +getDeadline(Priority) DateTime
        +calculatePriority(Category, Impact) Priority
    }

    class TicketRepository {
        <<interface>>
        +save(Ticket)
        +findBreached()
        +findByUser(Id)
    }

    %% Relationships
    User "1" --> "*" Ticket : owns/assignee
    Ticket "1" *-- "*" Escalation : logs
    TicketController ..> TicketService : uses
    TicketService ..> TicketRepository : uses
    TicketService ..> SlaProvider : uses
```

### Architectural Design Summary

| Pattern / Principle | Application in SETS | Rationale |
| :--- | :--- | :--- |
| **Layered Architecture** | Controller → Service → Repo | Clear separation between transport, business, and data layers. |
| **Service Encapsulation** | `SlaProvider` in `TicketService` | Centralizes priority and deadline logic away from API routes. |
| **Repository Pattern** | `TicketRepository` interface | Abstracts persistence details for better testability. |
| **State Management** | Enum-based `Status` | Ensures type-safe transitions throughout the ticket lifecycle. |
| **Observer Logic** | Notification trigger in Service | Handled within service flow to ensure alerts follow state changes. |
