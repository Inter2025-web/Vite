import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PRODUCTS, PRODUCT_LABELS, ROOMS, ROOM_LABELS } from "@shared/schema";
import { type InventoryFormData, validateQuantityInput, getRoomColorClass } from "@/lib/inventory-utils";
import { ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react";

interface ProductEntryTableProps {
  formData: InventoryFormData;
  onFormDataChange: (data: InventoryFormData) => void;
}

export function ProductEntryTable({ formData, onFormDataChange }: ProductEntryTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [entryType, setEntryType] = useState<'issued' | 'returned'>('issued');
  const [quantity, setQuantity] = useState<string>('');

  const handleAddEntry = () => {
    if (!selectedProduct || !selectedRoom || !quantity) return;
    
    const validatedValue = validateQuantityInput(quantity);
    if (validatedValue === 0) return;
    
    const updatedEntries = { ...formData.entries };
    if (!updatedEntries[selectedProduct]) {
      updatedEntries[selectedProduct] = {};
    }
    if (!updatedEntries[selectedProduct][selectedRoom]) {
      updatedEntries[selectedProduct][selectedRoom] = { issued: 0, returned: 0 };
    }

    // Mutual exclusivity: clear the opposite field when entering a value
    if (entryType === 'issued') {
      updatedEntries[selectedProduct][selectedRoom] = { issued: validatedValue, returned: 0 };
    } else {
      updatedEntries[selectedProduct][selectedRoom] = { issued: 0, returned: validatedValue };
    }

    onFormDataChange({
      ...formData,
      entries: updatedEntries
    });

    // Reset form
    setQuantity('');
  };

  const handleDeleteEntry = (product: string, room: string) => {
    const updatedEntries = { ...formData.entries };
    if (updatedEntries[product] && updatedEntries[product][room]) {
      delete updatedEntries[product][room];
      if (Object.keys(updatedEntries[product]).length === 0) {
        delete updatedEntries[product];
      }
    }

    onFormDataChange({
      ...formData,
      entries: updatedEntries
    });
  };

  const getQuantityValue = (product: string, room: string, type: 'issued' | 'returned'): number => {
    return formData.entries[product]?.[room]?.[type] || 0;
  };

  const getNetTotal = (product: string, room: string): number => {
    const issued = getQuantityValue(product, room, 'issued');
    const returned = getQuantityValue(product, room, 'returned');
    return issued - returned;
  };

  // Get all current entries as an array for display
  const getAllEntries = () => {
    const entries = [];
    for (const product in formData.entries) {
      for (const room in formData.entries[product]) {
        const data = formData.entries[product][room];
        if (data.issued > 0 || data.returned > 0) {
          entries.push({
            product,
            room,
            issued: data.issued,
            returned: data.returned,
            netTotal: data.issued - data.returned
          });
        }
      }
    }
    return entries;
  };

  const renderNetTotalBadge = (netTotal: number) => {
    if (netTotal === 0) return null;
    
    const isPositive = netTotal > 0;
    const bgColor = isPositive ? 'bg-green-600' : 'bg-red-600';
    const sign = isPositive ? '+' : '';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} text-white font-mono`}>
        {sign}{netTotal}
      </span>
    );
  };



  const currentEntries = getAllEntries();

  return (
    <div className="space-y-6">
      {/* Mobile-friendly Entry Form */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Product Entry</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map(product => (
                    <SelectItem key={product} value={product}>
                      {PRODUCT_LABELS[product]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Room" />
                </SelectTrigger>
                <SelectContent>
                  {ROOMS.map(room => (
                    <SelectItem key={room} value={room}>
                      {ROOM_LABELS[room]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <Select value={entryType} onValueChange={(value: 'issued' | 'returned') => setEntryType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="issued">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4 text-green-600" />
                      Issued
                    </div>
                  </SelectItem>
                  <SelectItem value="returned">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4 text-red-600" />
                      Returned
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                min="0"
                className="font-mono"
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleAddEntry}
                disabled={!selectedProduct || !selectedRoom || !quantity}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Entries Display */}
      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Current Entries</h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and manage your product entries. Issued and returned are mutually exclusive.
            </p>
          </div>
          
          {currentEntries.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No entries added yet. Use the form above to add product entries.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-green-600 uppercase tracking-wider">
                      Issued
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-red-600 uppercase tracking-wider">
                      Returned
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Total
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEntries.map((entry, index) => (
                    <tr key={`${entry.product}-${entry.room}-${index}`} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        <div className="max-w-xs truncate">
                          {PRODUCT_LABELS[entry.product]}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoomColorClass(entry.room)}`}>
                          {ROOM_LABELS[entry.room]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center font-mono text-green-600 font-semibold">
                        {entry.issued || '-'}
                      </td>
                      <td className="px-4 py-4 text-center font-mono text-red-600 font-semibold">
                        {entry.returned || '-'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {renderNetTotalBadge(entry.netTotal)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Button
                          onClick={() => handleDeleteEntry(entry.product, entry.room)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
