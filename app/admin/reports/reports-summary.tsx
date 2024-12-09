"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  type: "customer" | "employee";
  dateRange: { from: Date; to: Date };
  storeId: number;
}

export function ReportsSummary({ type, dateRange, storeId }: Props) {
  const [summaryData, setSummaryData] = useState<{
    totalEntries: number;
    avgDailyEntries: number;
    peakDate: string;
    peakEntries: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from(type === "customer" ? "customer_footfall" : "employee_footfall")
          .select("*")
          .eq("store_id", storeId)
          .gte("date", dateRange.from.toISOString())
          .lte("date", dateRange.to.toISOString());

        if (error) throw error;

        const totalEntries = data.reduce((sum, row) => sum + row.entries, 0);
        const avgDailyEntries = Math.round(totalEntries / data.length);
        const peakDay = data.reduce((max, row) =>
          row.entries > max.entries ? row : max
        );

        setSummaryData({
          totalEntries,
          avgDailyEntries,
          peakDate: peakDay.date,
          peakEntries: peakDay.entries,
        });
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };

    fetchData();
  }, [type, dateRange, storeId]);

  if (!summaryData) {
    return <div>Loading summary...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.totalEntries}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Daily Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summaryData.avgDailyEntries}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Peak Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Date(summaryData.peakDate).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Peak Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.peakEntries}</div>
        </CardContent>
      </Card>
    </div>
  );
}
