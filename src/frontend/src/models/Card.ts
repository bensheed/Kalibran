export interface Card {
    id?: number;
    job_no: string;
    inst_id: string;
    data: any; // JSONB - contains additional fields from external system
}
