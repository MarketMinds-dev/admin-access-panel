"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  dateRange: { from: Date; to: Date };
  storeId: number;
}

export function EmployeeEventChart({ dateRange, storeId }: Props) {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("employee_footfall")
        .select("*")
        .eq("store_id", storeId)
        .gte("date", dateRange.from.toISOString())
        .lte("date", dateRange.to.toISOString());

      if (error) {
        console.error("Error fetching employee footfall data:", error);
        return;
      }

      const eventData = data.reduce((acc, curr) => {
        acc[curr.event_type] = (acc[curr.event_type] || 0) + curr.entries;
        return acc;
      }, {} as Record<string, number>);

      setData(
        Object.entries(eventData).map(([name, value]) => ({
          name,
          value: Number(value),
        }))
      );
    };

    fetchData();
  }, [dateRange, storeId]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
