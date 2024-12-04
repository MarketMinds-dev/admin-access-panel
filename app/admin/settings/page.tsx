"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClient } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/StoreContext";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const settingsSchema = z.object({
  employeeDetectionUrl: z.string().url({ message: "Please enter a valid URL" }),
  faceDetectionUrl: z.string().url({ message: "Please enter a valid URL" }),
  cashDrawerUrl: z.string().url({ message: "Please enter a valid URL" }),
  customerFootfallUrl: z.string().url({ message: "Please enter a valid URL" }),
  employeeDetectionEnabled: z.boolean().default(false),
  faceDetectionEnabled: z.boolean().default(false),
  cashDrawerEnabled: z.boolean().default(false),
  customerFootfallEnabled: z.boolean().default(false),
});

type SettingsValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { selectedStore } = useStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      employeeDetectionUrl: "",
      faceDetectionUrl: "",
      cashDrawerUrl: "",
      customerFootfallUrl: "",
      employeeDetectionEnabled: false,
      faceDetectionEnabled: false,
      cashDrawerEnabled: false,
      customerFootfallEnabled: false,
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      if (!selectedStore) {
        console.log("No store selected");
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("store_id", selectedStore.store_id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            console.log("No settings found for this store.");
          } else {
            throw error;
          }
        } else if (data && data.settings_data) {
          form.reset(data.settings_data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setError("Failed to fetch settings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [selectedStore, form]);

  async function onSubmit(data: SettingsValues) {
    if (!selectedStore) {
      toast({
        title: "Error",
        description:
          "No store selected. Please select a store before saving settings.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: updatedData, error: upsertError } = await supabase
        .from("settings")
        .upsert({
          store_id: selectedStore.store_id,
          settings_data: data,
        })
        .select()
        .single();

      if (upsertError) throw upsertError;

      toast({
        title: "Settings updated",
        description:
          "Your settings have been successfully saved to the database.",
      });

      form.reset(updatedData.settings_data);
    } catch (error) {
      console.error("Error updating settings:", error);
      setError("Failed to update settings. Please try again.");
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!selectedStore) {
    return (
      <div className="flex justify-center items-center h-screen">
        Please select a store
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="employeeDetectionUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Detection URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://api.example.com/employee-detection"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter the URL for the employee detection API.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="faceDetectionUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Face Detection URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://api.example.com/face-detection"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter the URL for the face detection API.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cashDrawerUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cash Drawer URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://api.example.com/cash-drawer"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter the URL for the cash drawer API.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerFootfallUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Footfall URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://api.example.com/customer-footfall"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter the URL for the customer footfall API.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="employeeDetectionEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable Employee Detection</FormLabel>
                    <FormDescription>
                      Activate the employee detection AI model.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="faceDetectionEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable Face Detection</FormLabel>
                    <FormDescription>
                      Activate the face detection AI model.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cashDrawerEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable Cash Drawer</FormLabel>
                    <FormDescription>
                      Activate the cash drawer AI model.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerFootfallEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable Customer Footfall</FormLabel>
                    <FormDescription>
                      Activate the customer footfall AI model.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
