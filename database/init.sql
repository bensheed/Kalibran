-- Kalibran - Phase A: Initial Database Schema
-- This script creates the foundational tables for the application.

-- Global settings for the application
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(255) PRIMARY KEY,
    setting_value TEXT
);

-- User table for future multi-user support
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'tech'))
);

-- Kanban boards
CREATE TABLE IF NOT EXISTS boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    card_layout_config JSONB
);

-- Columns for each Kanban board
CREATE TABLE IF NOT EXISTS columns (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    column_order INTEGER NOT NULL,
    filter_rules JSONB
);

-- Stores raw data from external sources (e.g., ProCal)
-- Columns will be dynamic, but Inst_ID and Job_no are expected
CREATE TABLE IF NOT EXISTS raw_sync_data (
    id SERIAL PRIMARY KEY,
    Inst_ID VARCHAR(255),
    Job_no VARCHAR(255),
    data JSONB -- To store the rest of the row data
);

-- A view to provide a clean data source for the frontend
CREATE OR REPLACE VIEW kanban_cards_view AS
SELECT 
    id,
    Inst_ID,
    Job_no,
    data
FROM 
    raw_sync_data;

-- Tracks the movement of cards between columns
CREATE TABLE IF NOT EXISTS column_transitions (
    id SERIAL PRIMARY KEY,
    job_no VARCHAR(255) NOT NULL,
    inst_id VARCHAR(255),
    column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    entered_at TIMESTAMPTZ NOT NULL,
    exited_at TIMESTAMPTZ,
    sequence_number INTEGER NOT NULL,
    is_outlier BOOLEAN NOT NULL DEFAULT FALSE
);

-- Stores serialized machine learning models for future forecasting
CREATE TABLE IF NOT EXISTS prediction_models (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER, -- FK to a future tenants table
    model_name VARCHAR(255) NOT NULL,
    model_data BYTEA,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_column_transitions_job_no ON column_transitions(job_no);
CREATE INDEX IF NOT EXISTS idx_raw_sync_data_inst_id ON raw_sync_data(Inst_ID);
CREATE INDEX IF NOT EXISTS idx_raw_sync_data_job_no ON raw_sync_data(Job_no);
