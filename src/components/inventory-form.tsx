import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ROOMS, ROOM_LABELS, REPORTERS, REPORTER_LABELS } from "@shared/schema";
import { type InventoryFormData } from "@/lib/inventory-utils";

interface InventoryFormProps {
  formData: InventoryFormData;
  onFormDataChange: (data: InventoryFormData) => void;
}

export function InventoryForm({ formData, onFormDataChange }: InventoryFormProps) {
  const handleDateChange = (value: string) => {
    onFormDataChange({
      ...formData,
      date: value
    });
  };

  const handleReporterChange = (value: string) => {
    onFormDataChange({
      ...formData,
      reporter: value
    });
  };



  return (
    <div className="space-y-8">
      {/* Form Header */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Date</Label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                {new Date(formData.date).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Reported by</Label>
              <Select value={formData.reporter} onValueChange={handleReporterChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Reporter" />
                </SelectTrigger>
                <SelectContent>
                  {REPORTERS.map(reporter => (
                    <SelectItem key={reporter} value={reporter}>
                      {REPORTER_LABELS[reporter]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
