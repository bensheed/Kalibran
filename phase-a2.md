**Phase A2: Setup Flow Overhaul**

**1. Create a new, visually appealing setup UI.**
    *   Use the color scheme from `prd.md`:
        *   Background: `#d5d7d9` (off-white)
        *   Text and borders: `#2e3941` (dark grey) and `#586167` (medium grey)
        *   Accent color: `#314C9F` (blue)
    *   The UI will be a single page, with clear steps.

**2. Change the setup order.**
    *   **Step 1: Admin PIN Configuration.** The first thing the user does is create an admin PIN. This will prevent the "Application not configured" error during setup.
    *   **Step 2: External Tool Selection.** The user will select the external tool (ProCal, MetCal, etc.).
    *   **Step 3: Database Configuration.** After the PIN is set, the user will configure the database connection.
    *   **Step 4: Data Sync Configuration.** The user will configure the data sync settings.

**3. Implement the new setup flow.**
    *   Create a new route for the setup page.
    *   Create a new React component for the setup UI.
    *   Update the backend to handle the new setup order in a single transaction.
    *   The backend will now first check for a PIN, then for database configuration, etc.

**4. Update the application logic.**
    *   The application will no longer check for `setupRequired: true` in the same way. Instead, it will check for the presence of a PIN and a valid database connection. If either is missing, it will redirect to the setup page.

**5. Validation and Error Handling**
    *   **Client-Side Validation:**
        *   The "Next" button on the PIN step will be disabled until a valid 4-digit PIN is entered.
        *   The "Next" button on the Database step will be disabled until all fields are filled.
    *   **Backend Logging:**
        *   Add detailed logging to the setup controller to track the entire setup process.
    *   **Frontend Logging:**
        *   Add detailed logging to the `handleSubmit` function in `Setup.tsx` to log the setup data and any errors that occur.

**6. UX/UI Improvements**
    *   Add a loading indicator to the "Complete Setup" button to provide feedback to the user.
    *   Add a database connection test to the database configuration step to provide immediate feedback to the user.
    *   Add a "Test Connection" button to the database configuration step.
    *   Add a success message after the database connection is successfully tested.

**7. Future Development: DataSync.tsx**
    *   **Table Selection:** Allow the user to view and select tables from the connected external database.
    *   **Join Query Builder:** Provide a UI for building join queries between the selected tables.
        *   The user should be able to specify the join type (e.g., INNER JOIN, LEFT JOIN).
        *   The user should be able to select the columns for the join condition.
    *   **Column Selection:** Allow the user to select which columns from the joined query result should be available on the Kanban cards.
    *   **Sync Schedule:** Provide options for setting the data sync frequency (e.g., manual, every 5 minutes, every hour).
