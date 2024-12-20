"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  ChevronDown,
  ChevronRight,
  MoreVertical,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/StoreContext";
import {
  CriticalViolation,
  CustomerFootfall,
  EmployeeFootfall,
  ProcessedEmployeeData,
  ViolationAnalysis,
} from "@/types";

const AdminDashboard: React.FC = () => {
  const { selectedStore, selectedDate } = useStore();
  const [customerData, setCustomerData] = useState<
    { date: string; male: number; female: number }[]
  >([]);
  const [employeeData, setEmployeeData] = useState<ProcessedEmployeeData[]>([]);
  const [employeeNames, setEmployeeNames] = useState<string[]>([]);
  const [violationsData, setViolationsData] = useState<CriticalViolation[]>([]);
  const [violationAnalysis, setViolationAnalysis] = useState<ViolationAnalysis>(
    {
      cashbox_offence: 0,
      door_state: 0,
      no_employee: 0,
      total_count: 0,
    }
  );
  const [showDataLabels, setShowDataLabels] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  const toggleEventExpansion = (eventName: string) => {
    setExpandedEvents((current) =>
      current.includes(eventName)
        ? current.filter((name) => name !== eventName)
        : [...current, eventName]
    );
  };

  useEffect(() => {
    async function fetchData() {
      if (!selectedStore || !selectedDate) return;

      setLoading(true);
      setError(null);

      try {
        let startDate: Date, endDate: Date;

        // Determine date range based on selectedDate
        if (selectedDate.toDateString() === new Date().toDateString()) {
          // Today
          startDate = new Date(selectedDate);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(selectedDate);
          endDate.setHours(23, 59, 59, 999);
        } else if (
          selectedDate.getTime() >
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ) {
          // Last 7 days
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
        } else {
          // Last 30 days
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
        }

        const [customerFootfallData, employeeFootfallData, violations] =
          await Promise.all([
            supabase
              .from("customer_footfall")
              .select("*")
              .eq("store_id", selectedStore.store_id)
              .gte("date", startDate.toISOString())
              .lte("date", endDate.toISOString())
              .order("date", { ascending: true }),
            supabase
              .from("employee_footfall")
              .select(
                `
              *,
              employee:employees (
                id,
                name,
                store_id,
                created_at
              )
            `
              )
              .eq("store_id", selectedStore.store_id)
              .gte("date", startDate.toISOString())
              .lte("date", endDate.toISOString())
              .order("date", { ascending: true }),
            supabase
              .from("critical_violations")
              .select("*")
              .eq("store_id", selectedStore.store_id)
              .gte("event_time", startDate.toISOString())
              .lte("event_time", endDate.toISOString())
              .order("event_time", { ascending: false }),
          ]);

        if (customerFootfallData.error) throw customerFootfallData.error;
        if (employeeFootfallData.error) throw employeeFootfallData.error;
        if (violations.error) throw violations.error;

        // Process customer footfall data
        const processedCustomerData: {
          date: string;
          male: number;
          female: number;
        }[] = [];
        const dateMap = new Map<string, { male: number; female: number }>();

        (customerFootfallData.data as CustomerFootfall[]).forEach((entry) => {
          const date = entry.date;
          if (!dateMap.has(date)) {
            dateMap.set(date, { male: 0, female: 0 });
          }

          if (entry.gender === "Male") {
            dateMap.get(date)!.male += entry.entries;
          } else if (entry.gender === "Female") {
            dateMap.get(date)!.female += entry.entries;
          }
        });

        dateMap.forEach((value, key) => {
          processedCustomerData.push({
            date: key,
            male: value.male,
            female: value.female,
          });
        });
        setCustomerData(processedCustomerData);

        // Process employee footfall data
        const processedData: ProcessedEmployeeData[] = [];
        const employeeSet = new Set<string>();

        (employeeFootfallData.data as EmployeeFootfall[]).forEach((entry) => {
          const existingEntry = processedData.find(
            (item) => item.date === entry.date
          );
          const employeeName = entry.employee?.name || "Unknown Employee";

          if (existingEntry) {
            if (entry.event_type === "login") {
              existingEntry[`${employeeName}_login`] = new Date(
                entry.created_at
              ).toLocaleTimeString();
            } else if (entry.event_type === "logout") {
              existingEntry[`${employeeName}_logout`] = new Date(
                entry.created_at
              ).toLocaleTimeString();
            }
          } else {
            const newEntry: ProcessedEmployeeData = { date: entry.date };
            if (entry.event_type === "login") {
              newEntry[`${employeeName}_login`] = new Date(
                entry.created_at
              ).toLocaleTimeString();
            } else if (entry.event_type === "logout") {
              newEntry[`${employeeName}_logout`] = new Date(
                entry.created_at
              ).toLocaleTimeString();
            }
            processedData.push(newEntry);
          }
          employeeSet.add(employeeName);
        });

        setEmployeeData(processedData);
        setEmployeeNames(Array.from(employeeSet));

        setViolationsData(violations.data);

        const analysis = violations.data.reduce(
          (acc, curr) => {
            switch (curr.event_name) {
              case "CASHBOX_OFFENCE_DETECTED":
                acc.cashbox_offence += 1;
                break;
              case "DOOR_STATE_DETECTED":
                acc.door_state += 1;
                break;
              case "NO_EMPLOYEE_DETECTED":
                acc.no_employee += 1;
                break;
            }
            acc.total_count += 1;
            return acc;
          },
          {
            cashbox_offence: 0,
            door_state: 0,
            no_employee: 0,
            total_count: 0,
          } as ViolationAnalysis
        );

        setViolationAnalysis(analysis);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error instanceof Error) {
          setError(`Error fetching data: ${error.message}`);
        } else {
          setError(`An unknown error occurred while fetching data`);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase, selectedStore, selectedDate]);

  if (!selectedStore) {
    return <div>Please select a store</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">
          Loading data for {selectedStore.store_name} (
          {selectedDate?.toLocaleDateString()} -{" "}
          {new Date().toLocaleDateString()})...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <details className="mt-2">
            <summary className="cursor-pointer">Debug Information</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
              {JSON.stringify({ selectedStore, error }, null, 2)}
            </pre>
          </details>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">
        Dashboard for {selectedStore.store_name} (
        {selectedDate?.toLocaleDateString()} - {new Date().toLocaleDateString()}
        )
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Customer Footfall by Gender</CardTitle>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="male"
                    stackId="gender"
                    fill="hsl(var(--primary))"
                    name="Male Customers"
                    label={
                      showDataLabels
                        ? { position: "top", fill: "hsl(var(--foreground))" }
                        : false
                    }
                  />
                  <Bar
                    dataKey="female"
                    stackId="gender"
                    fill="red"
                    name="Female Customers"
                    label={
                      showDataLabels
                        ? { position: "top", fill: "hsl(var(--foreground))" }
                        : false
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Checkbox
                id="showLabels"
                checked={showDataLabels}
                onCheckedChange={(checked) =>
                  setShowDataLabels(checked as boolean)
                }
              />
              <label htmlFor="showLabels" className="text-sm">
                Show/Hide Data Labels
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Employee Attendance</CardTitle>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Login Time</TableHead>
                    <TableHead>Logout Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeData.map((entry, index) =>
                    employeeNames.map((name) => (
                      <TableRow key={`${index}-${name}`}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{name}</TableCell>
                        <TableCell>{entry[`${name}_login`] || "N/A"}</TableCell>
                        <TableCell>
                          {entry[`${name}_logout`] || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Violation Analysis</CardTitle>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-red-500">
                    {violationAnalysis.total_count}
                  </div>
                  <div className="text-xl text-red-500">Total Violations</div>
                </div>
              </div>
              <div className="space-y-4">
                {Object.entries(violationAnalysis).map(
                  ([key, value]) =>
                    key !== "total_count" && (
                      <div
                        key={key}
                        className="flex justify-between items-center bg-gray-50 p-4 rounded"
                      >
                        <span className="font-medium text-red-500">
                          {key.toUpperCase()}
                        </span>
                        <span className="text-red-500">{value}</span>
                      </div>
                    )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Critical Violations</CardTitle>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Resource Name</TableHead>
                  <TableHead>Event Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violationsData.map((violation) => (
                  <TableRow
                    key={violation.id}
                    className="cursor-pointer"
                    onClick={() => toggleEventExpansion(violation.event_name)}
                  >
                    <TableCell>{violation.id}</TableCell>
                    <TableCell className="flex items-center gap-2 text-red-500">
                      {expandedEvents.includes(violation.event_name) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {violation.event_name}
                    </TableCell>
                    <TableCell>{violation.resource_name}</TableCell>
                    <TableCell>
                      {new Date(violation.event_time).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
