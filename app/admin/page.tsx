"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types
export type Store = {
  store_id: number;
  store_name: string;
  center_id: number;
};

type Employee = {
  id: number;
  name: string;
  store_id: number;
  created_at: string;
};

type CustomerFootfall = {
  id: number;
  store_id: number;
  date: string;
  entries: number;
  created_at: string;
};

type EmployeeFootfall = {
  id: number;
  store_id: number;
  employee_id: number;
  date: string;
  entries: number;
  created_at: string;
  employee?: Employee;
};

type ProcessedEmployeeData = {
  date: string;
  [key: string]: number | string;
};

type CriticalViolation = {
  id: number;
  event_name: string;
  resource_name: string;
  event_time: string;
  store_id: number;
  created_at: string;
};

type ViolationAnalysis = {
  cashbox_offence: number;
  door_state: number;
  no_employee: number;
  total_count: number;
};

type AdminDashboardProps = {
  selectedStore: Store | null;
};

export default function AdminDashboard({ selectedStore }: AdminDashboardProps) {
  const [customerData, setCustomerData] = useState<CustomerFootfall[]>([]);
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
      if (!selectedStore) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch customer footfall
        const { data: customerFootfallData, error: customerError } =
          await supabase
            .from("customer_footfall")
            .select("*")
            .eq("store_id", selectedStore.store_id)
            .order("date", { ascending: true });

        if (customerError) throw customerError;
        setCustomerData(customerFootfallData);

        // Fetch employee footfall with employee information
        const { data: employeeFootfallData, error: employeeError } =
          await supabase
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
            .order("date", { ascending: true });

        if (employeeError) throw employeeError;

        const processedData: ProcessedEmployeeData[] = [];
        const employeeSet = new Set<string>();

        (employeeFootfallData as EmployeeFootfall[]).forEach((entry) => {
          const existingEntry = processedData.find(
            (item) => item.date === entry.date
          );
          const employeeName = entry.employee?.name || "Unknown Employee";

          if (existingEntry) {
            existingEntry[employeeName] =
              ((existingEntry[employeeName] as number) || 0) + entry.entries;
          } else {
            const newEntry: ProcessedEmployeeData = { date: entry.date };
            newEntry[employeeName] = entry.entries;
            processedData.push(newEntry);
          }
          employeeSet.add(employeeName);
        });

        setEmployeeData(processedData);
        setEmployeeNames(Array.from(employeeSet));

        // Fetch critical violations
        const { data: violations, error: violationsError } = await supabase
          .from("critical_violations")
          .select("*")
          .eq("store_id", selectedStore.store_id)
          .order("event_time", { ascending: false });

        if (violationsError) throw violationsError;

        setViolationsData(violations);

        // Calculate violation analysis (now based on count instead of score)
        const analysis = violations.reduce(
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
        } else if (typeof error === "object" && error !== null) {
          setError(`Error fetching data: ${JSON.stringify(error)}`);
        } else {
          setError(`An unknown error occurred while fetching data`);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase, selectedStore]);

  if (!selectedStore) return <div>Please select a store</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">
        Dashboard for {selectedStore.store_name}
      </h1>
      {loading ? (
        <div>Loading data for {selectedStore.store_name}...</div>
      ) : error ? (
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
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Customer Footfall</CardTitle>
                <MoreVertical className="h-5 w-5 text-gray-500" />
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
                        dataKey="entries"
                        fill="#ff69b4"
                        name="Entries"
                        label={
                          showDataLabels
                            ? { position: "top", fill: "#000" }
                            : false
                        }
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Checkbox
                    checked={showDataLabels}
                    onCheckedChange={() => setShowDataLabels(!showDataLabels)}
                    id="showLabels"
                  />
                  <label htmlFor="showLabels" className="text-sm">
                    Show/Hide Data Labels
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Employee Footfall</CardTitle>
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={employeeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {employeeNames.map((employee, index) => (
                        <Bar
                          key={employee}
                          dataKey={employee}
                          stackId="a"
                          fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                          name={employee}
                          label={
                            showDataLabels
                              ? { position: "top", fill: "#000" }
                              : false
                          }
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Checkbox
                    checked={showDataLabels}
                    onCheckedChange={() => setShowDataLabels(!showDataLabels)}
                    id="showLabelsEmployee"
                  />
                  <label htmlFor="showLabelsEmployee" className="text-sm">
                    Show/Hide Data Labels
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Violation Analysis</CardTitle>
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-center space-y-2">
                      <div className="text-4xl font-bold text-red-500">
                        {violationAnalysis.total_count}
                      </div>
                      <div className="text-xl text-red-500">
                        Total Violations
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded">
                      <span className="font-medium text-red-500">
                        CASHBOX_OFFENCE_DETECTED
                      </span>
                      <span className="text-red-500">
                        {violationAnalysis.cashbox_offence}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded">
                      <span className="font-medium text-red-500">
                        DOOR_STATE_DETECTED
                      </span>
                      <span className="text-red-500">
                        {violationAnalysis.door_state}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded">
                      <span className="font-medium text-red-500">
                        NO_EMPLOYEE_DETECTED
                      </span>
                      <span className="text-red-500">
                        {violationAnalysis.no_employee}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Critical Violations</CardTitle>
                <MoreVertical className="h-5 w-5 text-gray-500" />
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
                        onClick={() =>
                          toggleEventExpansion(violation.event_name)
                        }
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
        </>
      )}
    </div>
  );
}
