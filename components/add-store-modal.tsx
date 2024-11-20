"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Center = {
  id: number;
  name: string;
  location: string;
};

type AddStoreModalProps = {
  centers: Center[];
  onStoreAdded: (newStore: any) => void;
};

export function AddStoreModal({ centers, onStoreAdded }: AddStoreModalProps) {
  const [storeName, setStoreName] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !selectedCenter) return;

    setIsLoading(true);

    const { data, error } = await supabase
      .from("stores")
      .insert({ name: storeName, center_id: selectedCenter })
      .select("*, centers(*)")
      .single();

    setIsLoading(false);

    if (error) {
      console.error("Error adding store:", error);
      // Handle error (e.g., show error message to user)
    } else if (data) {
      onStoreAdded(data);
      setIsOpen(false);
      setStoreName("");
      setSelectedCenter(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          <span className="sr-only">Add new store</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Store</DialogTitle>
          <DialogDescription>
            Enter the details for the new store. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="store-name" className="text-right">
                Store Name
              </Label>
              <Input
                id="store-name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="center" className="text-right">
                Center
              </Label>
              <select
                id="center"
                value={selectedCenter || ""}
                onChange={(e) => setSelectedCenter(Number(e.target.value))}
                className="col-span-3"
              >
                <option value="">Select a center</option>
                {centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name} - {center.location}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Store"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
