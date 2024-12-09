import { supabase } from "@/lib/supabase";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

async function getEmployeeTimeLogData() {
  const { data, error } = await supabase
    .from("employee_time_log")
    .select("date, avg_login_time, avg_logout_time")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching employee time log data:", error);
    return [];
  }

  return data;
}

export async function EmployeeTimeLogChart() {
  const data = await getEmployeeTimeLogData();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="avg_login_time" fill="#8884d8" />
        <Bar dataKey="avg_logout_time" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}
