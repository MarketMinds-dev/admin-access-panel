"use client";

import { useState } from "react";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerFootfallChart } from "./customer-footfall-chart";
import { CustomerGenderChart } from "./customer-gender-chart";
import { EmployeeFootfallChart } from "./employee-footfall-chart";
import { EmployeeEventChart } from "./employee-event-chart";
import { ReportsSummary } from "./reports-summary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [selectedStore, setSelectedStore] = useState<string>("1");

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports Dashboard</h1>
        <div className="flex gap-4">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Store 1</SelectItem>
              <SelectItem value="2">Store 2</SelectItem>
              <SelectItem value="3">Store 3</SelectItem>
            </SelectContent>
          </Select>
          <CalendarDateRangePicker date={dateRange} setDate={setDateRange} />
        </div>
      </div>

      <Tabs defaultValue="customer-footfall" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customer-footfall">Customer Footfall</TabsTrigger>
          <TabsTrigger value="employee-footfall">Employee Footfall</TabsTrigger>
        </TabsList>
        <TabsContent value="customer-footfall" className="space-y-4">
          <ReportsSummary
            type="customer"
            dateRange={dateRange}
            storeId={parseInt(selectedStore)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Footfall Over Time</CardTitle>
                <CardDescription>Daily entries tracked by date</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <CustomerFootfallChart
                  dateRange={dateRange}
                  storeId={parseInt(selectedStore)}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
                <CardDescription>Customer entries by gender</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <CustomerGenderChart
                  dateRange={dateRange}
                  storeId={parseInt(selectedStore)}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="employee-footfall" className="space-y-4">
          <ReportsSummary
            type="employee"
            dateRange={dateRange}
            storeId={parseInt(selectedStore)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Employee Footfall</CardTitle>
                <CardDescription>
                  Daily employee entries and exits
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <EmployeeFootfallChart
                  dateRange={dateRange}
                  storeId={parseInt(selectedStore)}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Event Distribution</CardTitle>
                <CardDescription>Entry/Exit events by type</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <EmployeeEventChart
                  dateRange={dateRange}
                  storeId={parseInt(selectedStore)}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
