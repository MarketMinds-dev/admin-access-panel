"use client";

import * as React from "react";
import {
  Calendar,
  RefreshCw,
  Printer,
  Edit,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState, useCallback } from "react";
import { AddStoreModal } from "./add-store-modal";
import { Store, Center } from "@/types";
import { useStore } from "@/lib/StoreContext";

export default function NavigationBar() {
  const [timeRange, setTimeRange] = React.useState("Last 7 Days");
  const [commonTimeline, setCommonTimeline] = React.useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { selectedStore, setSelectedStore } = useStore();

  const supabase = createClientComponentClient();

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    const { data: storesData, error: storesError } = await supabase
      .from("store_center_view")
      .select("*");

    const { data: centersData, error: centersError } = await supabase
      .from("centers")
      .select("*");

    if (storesError) {
      console.error("Error fetching stores:", storesError);
    } else if (storesData) {
      setStores(storesData as Store[]);
      if (storesData.length > 0 && !selectedStore) {
        setSelectedStore(storesData[0] as Store);
      }
    }

    if (centersError) {
      console.error("Error fetching centers:", centersError);
    } else if (centersData) {
      setCenters(centersData as Center[]);
    }

    setLoading(false);
    setIsRefreshing(false);
  }, [supabase, selectedStore, setSelectedStore]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStoreAdded = useCallback(
    (newStore: Store) => {
      setStores((prevStores) => [...prevStores, newStore]);
      setSelectedStore(newStore);
    },
    [setSelectedStore]
  );

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="flex flex-1 items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-[280px] justify-start text-sm"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : selectedStore ? (
                <>
                  {selectedStore.store_name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    <span className="inline-block max-w-[120px] truncate">
                      {selectedStore.center_name}
                    </span>
                    {" - "}
                    <span className="inline-block max-w-[60px] truncate">
                      {selectedStore.center_location}
                    </span>
                  </span>
                </>
              ) : (
                "Select a store"
              )}
              <span className="sr-only">Select store</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[280px]">
            {stores.map((store) => (
              <DropdownMenuItem
                key={store.store_id}
                onSelect={() => setSelectedStore(store)}
              >
                <span>{store.store_name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {store.center_name} - {store.center_location}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <AddStoreModal centers={centers} onStoreAdded={handleStoreAdded} />
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              {timeRange}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setTimeRange("Last 24 Hours")}>
              Last 24 Hours
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTimeRange("Last 7 Days")}>
              Last 7 Days
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTimeRange("Last 30 Days")}>
              Last 30 Days
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTimeRange("Custom Range")}>
              Custom Range
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <Switch
            id="timeline-mode"
            checked={commonTimeline}
            onCheckedChange={setCommonTimeline}
          />
          <label
            htmlFor="timeline-mode"
            className="text-sm text-muted-foreground"
          >
            common timeline
          </label>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchData}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="sr-only">Refresh data</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Printer className="h-4 w-4" />
            <span className="sr-only">Print view</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit view</span>
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </div>
      </div>
    </header>
  );
}