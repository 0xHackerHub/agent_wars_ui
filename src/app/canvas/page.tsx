"use client"
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Grid, List } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

export default function CanvasPage() {
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [search, setSearch] = useState('');
  const router = useRouter();

  const createNewCanvas = () => {
    const canvasId = uuidv4();
    router.push(`/canvas/${canvasId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px]"
          />
          <Tabs defaultValue="list" onValueChange={(value) => setView(value as 'grid' | 'list')}>
            <TabsList>
            <TabsTrigger value="list">
                <List className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
              <TabsTrigger value="grid">
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button onClick={createNewCanvas}>
          <Plus className="h-4 w-4 mr-2" />
          New Agent
        </Button>
      </div>

      {/* Table/Grid View Content */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow h-full">
        {view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {/* Grid items will go here */}
          </div>
        ) : (
          <DataTable
            columns={[
              { accessorKey: 'name', header: 'Name' },
              { accessorKey: 'created', header: 'Created' },
              { accessorKey: 'updated', header: 'Last Updated' },
              { accessorKey: 'status', header: 'Status' },
            ]}
            data={[]}
          />
        )}
      </div>
    </div>
  );
}
