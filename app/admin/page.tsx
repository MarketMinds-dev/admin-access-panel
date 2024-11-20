"use client";

import { useEffect, useState } from "react";
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

type CustomerFootfall = {
  date: string;
  entries: number;
};

type EmployeeFootfall = {
  date: string;
  [key: string]: number | string;
};

type EmployeeFootfallRaw = {
  date: string;
  employees: { name: string }[];
  entries: number;
};

type CriticalViolation = {
  id: number;
  event_name: string;
  resource_name: string;
  event_time: string;
};

type ViolationAnalysis = {
  cashbox_offence: number;
  door_state: number;
  no_employee: number;
  total_score: number;
};

export default function AdminDashboard() {
  const [customerData, setCustomerData] = useState<CustomerFootfall[]>([]);
  const [employeeData, setEmployeeData] = useState<EmployeeFootfall[]>([]);
  const [violationsData, setViolationsData] = useState<CriticalViolation[]>([]);
  const [violationAnalysis, setViolationAnalysis] = useState<ViolationAnalysis>(
    {
      cashbox_offence: 3,
      door_state: 1,
      no_employee: 71,
      total_score: 75,
    }
  );
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchData() {
      const { data: customerFootfall, error: customerError } = await supabase
        .from("customer_footfall")
        .select("date, entries");

      if (customerError) {
        console.error("Error fetching customer footfall:", customerError);
      } else if (customerFootfall) {
        setCustomerData(customerFootfall);
      }

      const { data: employeeFootfall, error: employeeError } =
        await supabase.from("employee_footfall").select(`
          date,
          employees (name),
          entries
        `);

      if (employeeError) {
        console.error("Error fetching employee footfall:", employeeError);
      } else if (employeeFootfall) {
        const processedEmployeeData = (
          employeeFootfall as unknown as EmployeeFootfallRaw[]
        ).reduce((acc, curr) => {
          const existingEntry = acc.find((item) => item.date === curr.date);
          if (existingEntry) {
            curr.employees.forEach((emp) => {
              existingEntry[emp.name] = curr.entries;
            });
          } else {
            const newEntry: EmployeeFootfall = { date: curr.date };
            curr.employees.forEach((emp) => {
              newEntry[emp.name] = curr.entries;
            });
            acc.push(newEntry);
          }
          return acc;
        }, [] as EmployeeFootfall[]);
        setEmployeeData(processedEmployeeData);
      }

      const { data: violations, error: violationsError } = await supabase
        .from("critical_violations")
        .select("*");

      if (violationsError) {
        console.error("Error fetching critical violations:", violationsError);
      } else if (violations) {
        setViolationsData(violations);
      }

      setLoading(false);
    }

    fetchData();
  }, [supabase]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>CustomerFootfall(All Stores)</CardTitle>
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
                    <Bar dataKey="entries" fill="#ff69b4" name="Entry" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>EmployeeFootfall(All Stores)</CardTitle>
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
                    <Bar dataKey="Alex" stackId="a" fill="#ff69b4" />
                    <Bar dataKey="Sami" stackId="a" fill="#ffd700" />
                    <Bar dataKey="Yuilia" stackId="a" fill="#90ee90" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>CriticalViolations(All Stores)</CardTitle>
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
                    <TableRow key={violation.id}>
                      <TableCell>{violation.id}</TableCell>
                      <TableCell>{violation.event_name}</TableCell>
                      <TableCell>{violation.resource_name}</TableCell>
                      <TableCell>{violation.event_time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Violation Analysis(All Stores)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-center text-red-500">
                    {violationAnalysis.total_score.toFixed(2)}
                  </div>
                  <div className="text-sm text-center text-muted-foreground">
                    Event Score
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      CASHBOX_OFFENCE_DETECTED
                    </span>
                    <span className="text-sm text-red-500">
                      {violationAnalysis.cashbox_offence.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      DOOR_STATE_DETECTED
                    </span>
                    <span className="text-sm text-red-500">
                      {violationAnalysis.door_state.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      NO_EMPLOYEE_DETECTED
                    </span>
                    <span className="text-sm text-red-500">
                      {violationAnalysis.no_employee.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
