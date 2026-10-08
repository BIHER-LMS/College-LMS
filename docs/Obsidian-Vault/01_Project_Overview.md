# Project Overview

The **College Multi-Tenant Learning Management System (LMS)** — branded as **Aura Academia** — is an enterprise academic administration and learning platform designed for multiple higher education institutions under a unified architecture.

## Hierarchy
It separates:
1. **System-wide governance** (Super Admin)
2. **Localized institutional governance** (College Admin)
3. **Departmental management** (HOD) - *Currently under development*
4. **Faculty workflows**
5. **Student learning environments**

## Key Design Principles
- **Multi-tenant architecture** with strict data isolation per college.
- **Firebase Auth** for identity management.
- **Supabase (PostgreSQL)** for persistence.
- **Role-based access control (RBAC)** with granular permissions.
- **Vercel** multi-service deployment routing `/api/*` to backend and `/*` to frontend.
- **Reactive frontend** with real-time polling (for workflows like approval).

## Related Knowledge Nodes
- Architecture: [[03_Architecture]]
- Modules: [[07_Faculty_Portal_Integration]]
- Engineering Logs: [[06_Development_Log_&_Bugs]]
- Conversation & Strategic Decisions: [[08_Conversation_History_&_Decisions]]
- Reasoning & Problem Solving: [[09_Reasoning_&_Problem_Solving_Graph]]
