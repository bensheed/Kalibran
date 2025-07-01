export interface Column {
    id: number;
    board_id: number;
    name: string;
    column_order: number;
    filter_rules: any; // JSONB
}
