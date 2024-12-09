"use client";

import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createClient } from "@supabase/supabase-js";
import type { CustomerFootfall } from "@/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  dateRange: { from: Date; to: Date };
  storeId: number;
}

export function CustomerFootfallChart({ dateRange, storeId }: Props) {
  const [data, setData] = useState<CustomerFootfall[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("customer_footfall")
        .select("*")
        .eq("store_id", storeId)
        .gte("date", dateRange.from.toISOString())
        .lte("date", dateRange.to.toISOString())
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching customer footfall data:", error);
        return;
      }

      setData(data);
    };

    fetchData();
  }, [dateRange, storeId]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <Line
          type="monotone"
          dataKey="entries"
          stroke="#8884d8"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
