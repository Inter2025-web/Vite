import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Save, RotateCcw, Download, CheckCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InventoryForm } from "@/components/inventory-form";
import { ProductEntryTable } from "@/components/product-entry-table";
import { SummaryTables } from "@/components/summary-tables";
import { QRShare } from "@/components/qr-share";
import { 
  type InventoryFormData, 
  initializeEmptyFormData, 
  autoSaveFormData, 
  loadSavedFormData, 
  clearSavedFormData 
} from "@/lib/inventory-utils";

export default function InventoryPage() {
  const [formData, setFormData] = useState<InventoryFormData>(initializeEmptyFormData);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('saved');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load saved data on component mount
  useEffect(() => {
    const savedData = loadSavedFormData();
    if (savedData) {
      setFormData(savedData);
      setAutoSaveStatus('loaded');
    }
  }, []);

  // Auto-save form data
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      autoSaveFormData(formData);
      setAutoSaveStatus('saved');
    }, 1000);

    setAutoSaveStatus('saving');
    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Save inventory entry mutation
  const saveEntryMutation = useMutation({
    mutationFn: async (data: InventoryFormData) => {
      const response = await apiRequest("POST", "/api/inventory", {
        date: data.date,
        reporter: data.reporter,
        entries: data.entries
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory entry saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      clearSavedFormData();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save inventory entry",
        variant: "destructive",
      });
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/inventory/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          entryId: null,
          formData: formData 
        }),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Export failed");
      }
      
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Inventory data exported successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export inventory data",
        variant: "destructive",
      });
    },
  });

  const handleFormDataChange = (newFormData: InventoryFormData) => {
    setFormData(newFormData);
  };

  const handleSaveForm = () => {
    if (!formData.date || !formData.reporter) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    saveEntryMutation.mutate(formData);
  };

  const handleClearForm = () => {
    setFormData(initializeEmptyFormData());
    clearSavedFormData();
    toast({
      title: "Form Cleared",
      description: "All form data has been cleared",
    });
  };

  const handleExportToExcel = () => {
    exportMutation.mutate();
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const getAutoSaveStatusDisplay = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return { text: 'Saving...', icon: null };
      case 'saved':
        return { text: 'Auto-saved', icon: CheckCircle };
      case 'loaded':
        return { text: 'Data loaded', icon: CheckCircle };
      default:
        return { text: 'Auto-saved', icon: CheckCircle };
    }
  };

  const statusDisplay = getAutoSaveStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <ClipboardList className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Inventory Management System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {StatusIcon && <StatusIcon className="h-4 w-4 text-green-500" />}
                <span>{statusDisplay.text}</span>
              </div>
              <div className="flex items-center space-x-2">
                <QRShare />
                <Button
                  onClick={handleExportToExcel}
                  disabled={exportMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Excel</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Form and Room Selection */}
          <InventoryForm 
            formData={formData} 
            onFormDataChange={handleFormDataChange} 
          />

          {/* Product Entry Table */}
          <ProductEntryTable 
            formData={formData} 
            onFormDataChange={handleFormDataChange} 
          />

          {/* Summary Tables */}
          <SummaryTables formData={formData} />

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleSaveForm}
              disabled={saveEntryMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2 font-medium"
            >
              <Save className="h-4 w-4" />
              <span>Save Entry</span>
            </Button>
            <Button
              onClick={handleClearForm}
              variant="secondary"
              className="flex items-center space-x-2 font-medium"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Clear Form</span>
            </Button>
            <Button
              onClick={handlePrintSummary}
              variant="outline"
              className="flex items-center space-x-2 font-medium"
            >
              <Printer className="h-4 w-4" />
              <span>Print Summary</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
