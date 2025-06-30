# Kalibran - Phase B Development Plan

This document outlines the development plan for Phase B, building upon the foundation established in Phase A. The primary goals for this phase are to introduce predictive forecasting, enable real-time updates, implement multi-tenancy, and expand support for more external databases.

### Core Architectural Principles for Phase B
- **Scalability:** All new features will be designed to support a larger scale of users, boards, and data as outlined in the PRD.
- **Modularity:** The forecasting and data sync components will be developed as distinct services to ensure maintainability.
- **Data-Driven Insights:** The core focus is to move from a data visualization tool to a predictive, intelligent platform.

---

### Step 1: Full Multi-Tenancy Implementation

The foundation for multi-tenancy was laid in Phase A. This step involves fully activating it across the application.

1.  **Database Schema Updates:**
    -   Add a `tenant_id` column to all relevant tables: `users`, `boards`, `columns`, `raw_sync_data`, `column_transitions`, and `settings`.
    -   Create a new `tenants` table to store tenant-specific information.
    -   Apply foreign key constraints to link tables to the `tenants` table.
2.  **Backend API Refactoring:**
    -   Update all API endpoints to be tenant-aware. Every database query must be scoped to the `tenant_id` of the authenticated user.
    -   Modify the authentication middleware to extract the `tenant_id` from the user's session or token and make it available to the request context.
3.  **User Authentication and Tenant Scoping:**
    -   Transition from a simple PIN to a full username/password authentication system using a library like Passport.js.
    -   When a user logs in, their `tenant_id` will determine the data they can access.

---

### Step 2: Real-Time Data Synchronization

This step activates the WebSocket infrastructure created in Phase A to provide real-time updates to the Kanban boards.

1.  **Backend - Real-Time Service:**
    -   Implement a listener service that monitors the `raw_sync_data` table for changes. This could be achieved using database triggers (e.g., PostgreSQL's `NOTIFY/LISTEN`) or a scheduled polling mechanism that checks for new or updated rows since the last sync.
    -   When a change is detected, the service will process the new data and determine which boards and columns are affected.
2.  **WebSocket Broadcasting:**
    -   Use the existing Socket.io server to broadcast update events to the relevant clients.
    -   Implement a room-based system where each client joins a room corresponding to the board they are viewing (e.g., `board:123`).
    -   When a card is updated, moved, or created, the backend will emit an event only to the clients in that board's room.
3.  **Frontend - Real-Time State Updates:**
    -   Enhance the frontend state management (Zustand/Redux) to handle incoming WebSocket events.
    -   Write logic to intelligently update the board state without requiring a full re-fetch of all data. This includes adding, removing, or updating cards in the appropriate columns.

---

### Step 3: Predictive Forecasting

This is a major feature to provide predictive insights based on historical data.

1.  **Forecasting Service Architecture:**
    -   Decide on the ML framework. For simplicity, a JavaScript-based library like `TensorFlow.js` could be integrated directly into the Node.js backend. For more complex models, a separate Python microservice using `scikit-learn` or `pandas` might be more appropriate.
2.  **Model Training and Development:**
    -   Use the data in the `column_transitions` table as the primary source for training.
    -   The model will be trained to predict `exited_at - entered_at` (time in column) based on various factors from the joined instrument and calibration data.
    -   Develop a scheduled job that retrains the model for each tenant periodically to ensure it adapts to new data.
3.  **Prediction API Endpoints:**
    -   `POST /api/models/train`: An admin-triggered endpoint to initiate model training for their tenant.
    -   `GET /api/cards/:job_no/predict`: An endpoint to get the forecasted completion time for a specific card, as well as the predicted time for its next few column transitions.
4.  **Frontend Integration:**
    -   **Admin UI:** Create a settings page where admins can select the variables from their synced data that should be used as features in the prediction model.
    -   **Kanban Board UI:** Display the predictions on the cards. This could be an estimated completion date or the number of days remaining, with a tooltip to show more detailed predictions.

---

### Step 4: Expanded External Database Support

This step involves activating the greyed-out options for MetCal and IndySoft.

1.  **Research and Abstraction:**
    -   Thoroughly document the database schemas for MetCal and IndySoft, focusing on the tables and columns equivalent to ProCal's "Instruments" and "Calibrations".
    -   Identify the correct join logic and unique identifiers for each system.
2.  **Data Sync Service Refactoring:**
    -   Refactor the `SyncService` from Phase A into a more abstract, strategy-based service.
    -   Create separate "connector" modules for ProCal, MetCal, and IndySoft. Each connector will contain the specific queries and logic required to extract data from that source.
    -   The main service will use the appropriate connector based on the user's configuration.
3.  **Frontend UI Updates:**
    -   Enable the "MetCal" and "IndySoft" options in the setup dropdown.
    -   Create dynamic setup forms that ask for the specific credentials and configuration details required for the selected database type.

---

### Step 5: Advanced User and Team Management

This step expands on the simple user model to support larger teams.

1.  **Roles and Permissions System:**
    -   Implement a role-based access control (RBAC) system.
    -   Define roles like `Admin`, `Board Manager`, and `Lab Tech`.
    -   Admins can create/edit boards and manage users. Board Managers can configure boards they are assigned to. Lab Techs can only view boards and move cards.
2.  **User Management UI:**
    -   Build an interface for admins to invite, create, and assign roles to new users within their tenant.
    -   Allow users to manage their own profiles (e.g., change password).
3.  **Backend API Security:**
    -   Update all relevant API endpoints with middleware that checks the user's role and permissions before allowing access to the resource.