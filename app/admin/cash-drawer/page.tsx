"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function CashDrawerControl() {
  const [isOpen, setIsOpen] = useState(false);
  const [employeePresent] = useState(false); // Updated line

  const handleOpenDrawer = () => {
    setIsOpen(true);
    // In a real application, you would call an API to open the cash drawer here
    setTimeout(() => setIsOpen(false), 5000); // Auto close after 5 seconds
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cash Drawer Control</h1>
      <Card>
        <CardHeader>
          <CardTitle>Cash Drawer Status</CardTitle>
          <CardDescription>Control and monitor the cash drawer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div
              className={`w-4 h-4 rounded-full ${
                isOpen ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span>{isOpen ? "Open" : "Closed"}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleOpenDrawer} disabled={isOpen}>
            {isOpen ? "Opening..." : "Open Cash Drawer"}
          </Button>
        </CardFooter>
      </Card>
      {isOpen && !employeePresent && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Cash drawer opened without employee present!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
