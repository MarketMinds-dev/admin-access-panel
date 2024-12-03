// types.ts
export type Store = {
  store_id: number;
  store_name: string;
  center_id: number;
  center_name: string;
  center_location: string;
};

export type Center = {
  id: number;
  name: string;
  location: string;
};

export type EmployeeFootfall = {
  id: number;
  store_id: number;
  employee_id: number; // Changed from 'employe_id' to 'employee_id'
  date: string; // Changed from Date to string
  event_type: "login" | "logout"; // Specified the exact string literals
  entries: number;
  created_at: string; // Changed from timestamp to string
  employee?: Employee;
};

export type Employee = {
  id: number;
  name: string;
  store_id: number;
  created_at: string;
};

export type CustomerFootfall = {
  id: number;
  store_id: number;
  date: string;
  gender: string;
  entries: number;
  created_at: string;
};

export type ProcessedEmployeeData = {
  date: string;
  [key: string]: number | string;
};

export type CriticalViolation = {
  id: number;
  event_name: string;
  resource_name: string;
  event_time: string;
  store_id: number;
  created_at: string;
};

export type ViolationAnalysis = {
  cashbox_offence: number;
  door_state: number;
  no_employee: number;
  total_count: number;
};
