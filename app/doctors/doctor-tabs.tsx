"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, Grid } from "lucide-react";
import {ReactNode, Suspense} from "react";

export default function DoctorTabs({
                                       defaultValue,
                                       mapTab,
                                       listTab,
                                   }: {
    defaultValue: string;
    mapTab: ReactNode;
    listTab: ReactNode;
}) {
    return (
        <Tabs defaultValue={defaultValue} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="map" className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    Map View
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                    <Grid className="h-4 w-4" />
                    List View
                </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="space-y-0">
                <Suspense fallback={<div>Loading Map...</div>}>
                    {mapTab}
                </Suspense>
            </TabsContent>

            <TabsContent value="list" className="space-y-0">
                <Suspense fallback={<div>Loading List...</div>}>
                    {listTab}
                </Suspense>
            </TabsContent>
        </Tabs>
    );
}