-   The core product

    -   The core product is a tool that reads data from from
        calibration/asset management software and clones it into a
        postgresql server.

    -   The data on this server is used to create a highly customizable
        kanban board to promote efficiency in calibration and testing
        labs.

    -   The secondary goal of this data is to provide granularity and
        use data from the kanban board to track the amount of time a
        unit is in a column.

    -   The tertiary goal is to then use this recorded data to provide
        forecasts for when instruments will be done in the future. In
        phase A we will lay the foundation to allow for forecasting teh
        completion of other equipment, but not implement it.

        -   This will predict time between columns as well as time until
            the final column.
        -   It will use data points from the joined row to make
            inferences
        -   Different factors in the joined query row are variable that
            influence predictions tenant will have its own model, the
            admin can change what will and will not influence
            predictions in the global settings menu.

-   Functionality

    -   Pulling data from the external databases is a read only action.
    -   This tool will not ever write data to the external databases.
    -   We will not be implementing multi-tenancy in phase A, but we
        will lay the foundation for it.
    -   I think we want multiple users per instance for sure. This tool
        will be called Kalban. The Kalban admin should be able to create
        and configure boards and configure card layouts.
    -   Lab techs should be able to access them by going to
        localip:3000/boardname or something. Lab techs can only move
        cards between columns and switch between boards (the boards will
        be like tabs at the top of the UI The tool needs to recall what
        tab was last open when the page was last accessed and default to
        that tab. It can store this in the browser\'s cookies or
        something. I think this first version will need to be a Docker
        container.
    -   The tool should assume you are a lab tech until you try and open
        the global settings menu or the board settings menu.
    -   In this first version it will be 1 admin and maybe 4 or 5
        concurrent boards. I can\'t imagine this app will be very
        data-intensive. I would love to be able to support a team of 100
        techs and 20 dashboards one day in phase b, so lay the
        foundation for that capability now.

-   Languages

    -   Frontend

        -   React with TypeScript

    -   Database

        -   The app will store data in Postgres
        -   ProCal uses SQL Server express 2019, that is where we will
            be pulling data from, before putting it into our Postgres
            server.

    -   Backend

        -   Node.js with TypeScript and Express framework. Express
            provides HTTP routing, middleware support, and API
            endpoints. This stack offers shared language with the
            frontend, excellent PostgreSQL integration via libraries
            like pg, SQL Server connectivity via mssql, and extensive
            LLM training data for development support.

-   UX

    -   Set up

        -   In our first iteration of the app, we will only be able to
            select ProCal from the dropdown during setup.
            []{#anchor}MetCal and []{#anchor-1}IndySoft will be greyed
            out in the dropdown. You can infer the back end set up
            required to allow this.
        -   After Selecting an external tool from the dropdown, the app
            will ask you to enter credentials

    -   Selecting Data to sync

        -   The user must be able to select data from external tool to
            set up a sync
        -   This tool must be able to find tables in the schema, then
            pick tables to read.
        -   This tool must have the ability to do a join query, and also
            the ability to only select the wanted columns from the
            query.
        -   For proCal, we will be Joining tables "Calibrations" and
            "Instruments" the shared column will be
            []{#anchor-2}Inst_ID. This is a one-to-many relationship
            where there are more calibration rows that instrument rows.
            We want to select the highest []{#anchor-3}Job_no from the
            calibration row when joining with an instrument row. This
            config is unique to ProCal, Indysoft and Metcal
            []{#anchor-4}do this differently.

    -   Configuring the kanban board

        -   The user must be able to add and remove columns from the
            Kanban board,

    -   Color

        -   Mostly white or off white (#d5d7d9)
        -   Dark Grey (#2e3941) and medium gray (#586167)
        -   Blue (#314C9F)

    -   Interface Scaling

        -   The interface must be dynamic to scale automatically as the
            user the number of cards and columns change.

        -   On top of this the user must be manually able to change and
            lock the scale of the board

            -   A lab tech should be able to do this, they should not
                need to access the settings menu, this should be on
                []{#anchor-5}the board UI.

        -   The lab techs must also be able to adjust the scaling on the
            cards.

        -   Teh cards need to be legible at 1080P on any screen above 24
            inches.

        -   It may be hard to imagine how many cards will be on screen
            at a time but really it doesn\'t matter how many cards there
            are if this is built correctly. We will only be syncing
            cards that match instruments that fit each columns filter.
            Each column will have a sort feature so the users can decide
            what shows up at the top. Each column will be individually
            scrollable when cards exceed the visible area. After a
            configurable period of inactivity (set in global settings),
            columns will automatically scroll back to the top.
            Implementation: JavaScript scroll event listeners detect
            user interaction, start/reset an idle timer using
            setTimeout, and use scrollTo({top: 0, behavior: \'smooth\'})
            to return to top when the timer expires.

    -   Cards

        -   The cards are the results of the joined query; the data that
            displays on these cards can be configured separately from
            the rows in the joined query. This second stage of filtering
            happens in the card settings menu.
        -   Each card represents a calibration job (Job_no) moving
            through the lab workflow. While multiple calibration jobs
            may reference the same instrument (Inst_ID) over time, each
            job is tracked independently through the kanban columns. The
            Job_no serves as the unique identifier for card movement
            tracking. When the same instrument returns for calibration
            next year, it will have a new Job_no and be treated as a
            separate card journey through the workflow.

    -   Settings

        -   The board setting menu will have a section with a list of
            the You can drag and drop the columns to arrange their
            order, you can also click on the columns to configure their
            sorting/filtering. The board setting menu will also have a
            card configuration editor.
        -   Outlier detection thresholds (minimum time in column before
            counting toward predictions) will be configurable in the
            global settings menu, with separate thresholds possible for
            each column type. The UI should explain the use case for
            this feature via tooltip

    -   Error Handling

        -   If and when the external SQL Server is unreachable, or if
            there is a partial sync failure, It holds the last state,
            and an error displays on screen until the server is
            reachable; the error will also have a go to settings button.
        -   The llm building this will have to identify relevant error
            codes from SQL express 2019 and then add error handling that
            explains the error in clear english.

-   Database

    -   We will store store the original external data separately from
        the Kanban state data because:

        -   Audit trail: Keep original data intact for debugging
        -   Rollback capability: Revert to last known good state
        -   Performance: Optimized kanban queries vs. raw sync data
        -   Data integrity: Sync failures don\'t corrupt working state

    -   Tentative Plan for the table structure, unless you feel that we
        should do it otherwise.

        -   raw_sync_data (ProCal mirror)

        -   kanban_cards (processed view)

        -   column_transitions (time tracking events)

            -   card_id
            -   column_id
            -   entered_at
            -   exited_at
            -   sequence_number (for A1, A2, A3 tracking)
            -   is_outlier (boolean, configurable threshold)
            -   transition_type (forward, backward, rework)
            -   Inst_ID
            -   Job_No

        -   prediction_models (ML training data)

    -   Time Tracking Logic: When a card moves between columns:

        -   Close the previous column record (set exited_at timestamp)
            Create a new column record (set entered_at timestamp,
            increment sequence_number if returning to a previously
            visited column) This dual-record approach ensures accurate
            time calculations and handles backward movement tracking.

-   Backend

    -   Pull Frequency from main server

        -   This will be user configurable there will definitely need to
            be a manual refresh button, but the user will be able to
            schedule intervals is well. In phase A we will lay the
            foundation to allow for real time synching, but not
            implement it.

    -   Real-time Infrastructure Foundation (Phase A):

        -   Implement WebSocket infrastructure using Socket.io with
            Express to lay the foundation for real-time updates in
            Phase B. In Phase A, the WebSocket server will be configured
            but not actively push updates. This includes setting up
            Socket.io server integration, client-side connection
            handling, and message routing architecture without
            implementing live data broadcasting.

-   Questions you need to answer before creating and artifact

    -   Do you have any questions for me before we get started?

    -   Do you see any bad ideas here

    -   Do you have any Idea what the architecture for this should look
        like.

    -   How the fuck are we going to count how long a card is in a
        column for?

        -   What if a card goes backward into a previous column, how
            should that impact the record of how long it was in a
            column?

            -   Treat it as separate time buckets (Column A: 2 days,
                Column B: 1 day, Column A again: 3 days)\"
            -   It is important to understand that most instruments will
                only be in each column once. When the instrument goes
                back into column A the second time, it needs to be
                counted as column A2, if that makes sense. It should
                only impact the forecasting of instruments that go to
                column A twice.
            -   We also need to think about outliers, if someone
                accidently puts something in a column and it only sits
                there for a few minutes, it shouldn\'t be counted.

        -   How would this impact the forecast?
