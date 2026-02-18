#  Sequence Diagram — SETS

## Overview

This diagram maps the lifecycle of a ticket from creation to automatic escalation. It demonstrates the coordination between the layered architecture and the background job system.

---

## Main Flow: Ticket Lifecycle & SLA Escalation

```mermaid
sequenceDiagram
    actor U as  User
    participant C as TicketController
    participant S as TicketService
    participant E as EscalationEngine
    participant R as Repository
    participant DB as  Database
    actor A as  Agent
    participant SCH as  Scheduler

    rect rgb(230, 245, 255)
        Note over U, DB: Phase 1: Creation & Auto-Priority
        U ->> C: POST /tickets {desc, impact}
        C ->> S: createTicket(dto)
        S ->> S: assignPriority(impact, category)
        S ->> S: calculateSLADeadline(priority)
        S ->> R: save(ticket)
        R ->> DB: INSERT
        S -->> C: Ticket (P1, SLA: 2h)
        C -->> U: 201 Created (ID: #123)
    end

    rect rgb(240, 240, 240)
        Note over A, DB: Phase 2: Status Update
        A ->> C: PUT /tickets/123/status {IN_PROGRESS}
        C ->> S: updateStatus(123, IN_PROGRESS)
        S ->> R: findById(123)
        S ->> R: save(updated)
        S -->> C: OK
        C -->> A: 200 OK
    end

    rect rgb(255, 230, 230)
        Note over SCH, DB: Phase 3: SLA Breach & Auto-Escalation
        SCH ->> E: runEscalationCheck()
        E ->> R: findBreachedTickets()
        R ->> DB: SELECT WHERE now > sla_deadline
        DB -->> R: [Ticket #123]
        E ->> S: escalate(123)
        S ->> S: setEscalationLevel(L1)
        S ->> R: save(escalated_ticket)
        S ->> A:  Notify: Ticket #123 Escalated!
    end
```

### Sequence Flow Summary

| Phase | Trigger | Actor/System | Action | Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **1. Submission** | Form submitted | `User` | Priority & SLA calculation | Ticket #ID created with deadline. |
| **2. Processing** | Agent starts work | `Agent` | Status change | Progress tracked with timestamp. |
| **3. Monitoring** | Cron Job (5 min) | `Scheduler` | Breach check | Ticket bumped to next level. |
| **4. Alerting** | SLA Breach | `EscalationEngine` | Send notification | Agent/Senior notified immediately. |
