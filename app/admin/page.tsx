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
import { ChevronDown, ChevronRight, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Updated types based on the actual schema and Supabase response
type Store = {
  id: number;
  name: string;
  center_id: number;
  created_at: string;
};

type CustomerFootfall = {
  id: number;
  store_id: number;
  date: string;
  entries: number;
  created_at: string;
  store: Store;
};

type Employee = {
  id: number;
  name: string;
  store_id: number;
  created_at: string;
};

type EmployeeFootfall = {
  id: number;
  store_id: number;
  employee_id: number;
  date: string;
  entries: number;
  created_at: string;
  employee: Employee;
  store: Store;
};

type ProcessedEmployeeData = {
  date: string;
  store_name: string;
  employee_entries: {
    [key: string]: number;
  };
};

type Violation = {
  id: number;
  event_name: string;
  resource_name: string;
  event_time: string;
  score: number;
  store_id: number;
  created_at: string;
  updated_at: string;
};

type ViolationAnalysis = {
  cashbox_offence: number;
  door_state: number;
  no_employee: number;
  total_score: number;
};

export default function AdminDashboard() {
  const [customerData, setCustomerData] = useState<CustomerFootfall[]>([]);
  const [employeeData, setEmployeeData] = useState<ProcessedEmployeeData[]>([]);
  const [violationsData, setViolationsData] = useState<Violation[]>([]);
  const [violationAnalysis, setViolationAnalysis] = useState<ViolationAnalysis>(
    {
      cashbox_offence: 0,
      door_state: 0,
      no_employee: 0,
      total_score: 0,
    }
  );
  const [showDataLabels, setShowDataLabels] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Fetch customer footfall with store information
      const { data: customerFootfall, error: customerError } = await supabase
        .from("customer_footfall")
        .select(
          `
          id,
          store_id,
          date,
          entries,
          created_at,
          store:stores (
            id,
            name,
            center_id,
            created_at
          )
        `
        )
        .order("date", { ascending: true });

      if (customerError) {
        console.error("Error fetching customer footfall:", customerError);
      } else if (customerFootfall) {
        const processedCustomerData: CustomerFootfall[] = customerFootfall.map(
          (entry) => ({
            ...entry,
            store: entry.store[0], // Assuming store is always an array with one item
          })
        );
        setCustomerData(processedCustomerData);
      }

      // Fetch employee footfall with employee and store information
      const { data: employeeFootfall, error: employeeError } =
        await supabase.from("employee_footfall").select(`
          id,
          store_id,
          employee_id,
          date,
          entries,
          created_at,
          employee:employees (
            id,
            name,
            store_id,
            created_at
          ),
          store:stores (
            id,
            name,
            center_id,
            created_at
          )
        `);

      if (employeeError) {
        console.error("Error fetching employee footfall:", employeeError);
      } else if (employeeFootfall) {
        const processedData = employeeFootfall.reduce((acc, curr) => {
          const existingEntry = acc.find(
            (item) =>
              item.date === curr.date && item.store_name === curr.store[0]?.name
          );

          if (existingEntry && curr.employee[0]?.name) {
            existingEntry.employee_entries[curr.employee[0].name] =
              (existingEntry.employee_entries[curr.employee[0].name] || 0) +
              curr.entries;
          } else if (curr.employee[0]?.name) {
            acc.push({
              date: curr.date,
              store_name: curr.store[0]?.name || "Unknown Store",
              employee_entries: {
                [curr.employee[0].name]: curr.entries,
              },
            });
          }
          return acc;
        }, [] as ProcessedEmployeeData[]);

        setEmployeeData(processedData);
      }

      // Fetch violations
      const { data: violations, error: violationsError } = await supabase
        .from("violations")
        .select("*")
        .order("event_time", { ascending: false });

      if (violationsError) {
        console.error("Error fetching violations:", violationsError);
      } else if (violations) {
        setViolationsData(violations);

        // Calculate violation analysis
        const analysis = violations.reduce(
          (acc, curr) => {
            switch (curr.event_name) {
              case "CASHBOX_OFFENCE_DETECTED":
                acc.cashbox_offence += Number(curr.score);
                break;
              case "DOOR_STATE_DETECTED":
                acc.door_state += Number(curr.score);
                break;
              case "NO_EMPLOYEE_DETECTED":
                acc.no_employee += Number(curr.score);
                break;
            }
            acc.total_score += Number(curr.score);
            return acc;
          },
          {
            cashbox_offence: 0,
            door_state: 0,
            no_employee: 0,
            total_score: 0,
          } as ViolationAnalysis
        );

        setViolationAnalysis(analysis);
      }

      setLoading(false);
    }

    fetchData();
  }, [supabase]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>CustomerFootfall(All Stores)</CardTitle>
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="store.name" />
                  <YAxis domain={[0, 2000]} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="entries"
                    fill="#ff69b4"
                    name="entry"
                    label={
                      showDataLabels
                        ? { position: "center", fill: "#fff" }
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
            <CardTitle>Employee Footfall (All Stores)</CardTitle>
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="store_name" />
                  <YAxis domain={[0, 25]} />
                  <Tooltip />
                  <Legend />
                  {employeeData.length > 0 &&
                    Object.keys(employeeData[0].employee_entries).map(
                      (employee, index) => (
                        <Bar
                          key={employee}
                          dataKey={`employee_entries.${employee}`}
                          stackId="a"
                          fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                          name={employee}
                        />
                      )
                    )}
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
            <CardTitle>Violation Analysis(All Stores)</CardTitle>
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-red-500">
                    {violationAnalysis.total_score.toFixed(2)}
                  </div>
                  <div className="text-xl text-red-500">Event Score</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded">
                  <span className="font-medium text-red-500">
                    CASHBOX_OFFENCE_DETECTED
                  </span>
                  <span className="text-red-500">
                    {violationAnalysis.cashbox_offence.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded">
                  <span className="font-medium text-red-500">
                    DOOR_STATE_DETECTED
                  </span>
                  <span className="text-red-500">
                    {violationAnalysis.door_state.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded">
                  <span className="font-medium text-red-500">
                    NO_EMPLOYEE_DETECTED
                  </span>
                  <span className="text-red-500">
                    {violationAnalysis.no_employee.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>CriticalViolations(All Stores)</CardTitle>
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
}
