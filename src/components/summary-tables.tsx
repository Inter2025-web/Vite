import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Building } from "lucide-react";
import { type InventoryFormData, calculateProductSummaries, calculateRoomSummaries, getRoomColorClass } from "@/lib/inventory-utils";

interface SummaryTablesProps {
  formData: InventoryFormData;
}

export function SummaryTables({ formData }: SummaryTablesProps) {
  const productSummaries = calculateProductSummaries(formData.entries);
  const roomSummaries = calculateRoomSummaries(formData.entries);

  const renderNetTotalBadge = (netTotal: number, size: 'sm' | 'lg' = 'sm') => {
    if (netTotal === 0) return <span className="text-gray-400 font-mono">0</span>;
    
    const isPositive = netTotal > 0;
    const bgColor = isPositive ? 'bg-green-600' : 'bg-red-600';
    const sign = isPositive ? '+' : '';
    const padding = size === 'lg' ? 'px-3 py-1' : 'px-2.5 py-0.5';
    const textSize = size === 'lg' ? 'text-sm' : 'text-xs';
    
    return (
      <span className={`inline-flex items-center ${padding} rounded-full ${textSize} font-medium ${bgColor} text-white font-mono`}>
        {sign}{netTotal}
      </span>
    );
  };

  const totalIssued = productSummaries.reduce((sum, p) => sum + p.totalIssued, 0);
  const totalReturned = productSummaries.reduce((sum, p) => sum + p.totalReturned, 0);
  const grandTotal = totalIssued - totalReturned;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Summary by Product */}
      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
              Summary by Product
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-green-600 uppercase tracking-wider">
                    Total Issued
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-red-600 uppercase tracking-wider">
                    Total Returned
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No data entered yet
                    </td>
                  </tr>
                ) : (
                  productSummaries.map((summary, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {summary.product}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-mono text-green-600 font-semibold">
                        {summary.totalIssued}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-mono text-red-600 font-semibold">
                        {summary.totalReturned}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {renderNetTotalBadge(summary.netTotal)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {productSummaries.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr className="font-semibold">
                    <td className="px-6 py-4 text-sm text-gray-900">Total</td>
                    <td className="px-6 py-4 text-center font-mono text-green-600 text-lg">
                      {totalIssued}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-red-600 text-lg">
                      {totalReturned}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderNetTotalBadge(grandTotal, 'lg')}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary by Room */}
      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building className="h-5 w-5 text-blue-600 mr-2" />
              Summary by Room
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-green-600 uppercase tracking-wider">
                    Total Issued
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-red-600 uppercase tracking-wider">
                    Total Returned
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roomSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No data entered yet
                    </td>
                  </tr>
                ) : (
                  roomSummaries.map((summary, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoomColorClass(
                          Object.keys(formData.selectedRooms).find(key => 
                            formData.selectedRooms[formData.selectedRooms.indexOf(key)] === summary.room.toLowerCase().replace(' ', '')
                          ) || 'gray'
                        )}`}>
                          {summary.room}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-mono text-green-600 font-semibold">
                        {summary.totalIssued}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-mono text-red-600 font-semibold">
                        {summary.totalReturned}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {renderNetTotalBadge(summary.netTotal)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
