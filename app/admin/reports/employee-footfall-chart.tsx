"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createClient } from "@supabase/supabase-js";
import type { EmployeeFootfall } from "@/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  dateRange: { from: Date; to: Date };
  storeId: number;
}

export function EmployeeFootfallChart({ dateRange, storeId }: Props) {
  const [data, setData] = useState<EmployeeFootfall[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("employee_footfall")
        .select(
          `
          *,
          employees (
            name
          )
        `
        )
        .eq("store_id", storeId)
        .gte("date", dateRange.from.toISOString())
        .lte("date", dateRange.to.toISOString())
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching employee footfall data:", error);
        return;
      }

      setData(data);
    };

    fetchData();
  }, [dateRange, storeId]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis
          dataKey="date"
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <Bar dataKey="entries" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
