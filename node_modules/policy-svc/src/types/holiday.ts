export type HolidayType = "PUBLIC" | "COMPANY" | "SPECIAL";

export interface CompanyHolidayRow {
  id: number;
  holiday_date: string; 
  name: string;
  holiday_type: HolidayType;
  company_key: string | null;
  location: string | null;
  is_recurring: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateHolidayDTO {
  holiday_date: string; 
  name: string;
  holiday_type?: HolidayType; 
  company_key?: string | null; 
  location?: string | null;  
  is_recurring?: boolean;     
  notes?: string | null;
  created_by?: string | null;
}

export interface UpdateHolidayDTO {
  holiday_date?: string;
  name?: string;
  holiday_type?: HolidayType;
  company_key?: string | null;
  location?: string | null;
  is_recurring?: boolean;
  notes?: string | null;
}

export interface ListHolidaysFilter {
  start?: string; // YYYY-MM-DD
  end?: string;   // YYYY-MM-DD
  company_key?: string | null; // if omitted => all; if null => global only; if "ESL" => global + ESL (recommended behavior in service)
  location?: string | null;
  holiday_type?: HolidayType;
  year?: number; 
}
