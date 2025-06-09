import { PRODUCTS, ROOMS, PRODUCT_LABELS, ROOM_LABELS } from "@shared/schema";

export interface InventoryFormData {
  date: string;
  reporter: string;
  entries: Record<string, Record<string, { issued: number; returned: number }>>;
}

export interface ProductSummary {
  product: string;
  totalIssued: number;
  totalReturned: number;
  netTotal: number;
}

export interface RoomSummary {
  room: string;
  totalIssued: number;
  totalReturned: number;
  netTotal: number;
}

export const initializeEmptyFormData = (): InventoryFormData => ({
  date: new Date().toISOString().split('T')[0],
  reporter: '',
  entries: {}
});

export const calculateProductSummaries = (entries: Record<string, Record<string, { issued: number; returned: number }>>): ProductSummary[] => {
  return PRODUCTS.map(product => {
    const productEntries = entries[product] || {};
    let totalIssued = 0;
    let totalReturned = 0;

    Object.values(productEntries).forEach(quantities => {
      totalIssued += quantities.issued || 0;
      totalReturned += quantities.returned || 0;
    });

    return {
      product: PRODUCT_LABELS[product],
      totalIssued,
      totalReturned,
      netTotal: totalIssued - totalReturned
    };
  }).filter(summary => summary.totalIssued > 0 || summary.totalReturned > 0);
};

export const calculateRoomSummaries = (entries: Record<string, Record<string, { issued: number; returned: number }>>): RoomSummary[] => {
  const roomTotals: Record<string, { totalIssued: number; totalReturned: number }> = {};

  // Calculate totals for each room that has data
  PRODUCTS.forEach(product => {
    const productEntries = entries[product] || {};
    Object.keys(productEntries).forEach(room => {
      if (!roomTotals[room]) {
        roomTotals[room] = { totalIssued: 0, totalReturned: 0 };
      }
      const quantities = productEntries[room];
      roomTotals[room].totalIssued += quantities.issued || 0;
      roomTotals[room].totalReturned += quantities.returned || 0;
    });
  });

  // Convert to array format
  return Object.keys(roomTotals).map(room => ({
    room: ROOM_LABELS[room] || room,
    totalIssued: roomTotals[room].totalIssued,
    totalReturned: roomTotals[room].totalReturned,
    netTotal: roomTotals[room].totalIssued - roomTotals[room].totalReturned
  })).filter(summary => summary.totalIssued > 0 || summary.totalReturned > 0);
};

export const getRoomColorClass = (room: string): string => {
  const colorMap: Record<string, string> = {
    yaupon: "bg-blue-100 text-blue-800",
    sycamore: "bg-green-100 text-green-800",
    riverBirch: "bg-yellow-100 text-yellow-800",
    magnolia: "bg-purple-100 text-purple-800",
    cedar: "bg-red-100 text-red-800",
    wingedElm: "bg-orange-100 text-orange-800",
    redMaple: "bg-pink-100 text-pink-800",
    ballroom: "bg-indigo-100 text-indigo-800"
  };
  return colorMap[room] || "bg-gray-100 text-gray-800";
};

export const validateQuantityInput = (value: string): number => {
  const num = parseInt(value) || 0;
  return Math.max(0, num);
};

export const autoSaveFormData = (data: InventoryFormData) => {
  try {
    localStorage.setItem('inventoryFormData', JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to auto-save form data:', error);
  }
};

export const loadSavedFormData = (): InventoryFormData | null => {
  try {
    const saved = localStorage.getItem('inventoryFormData');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load saved form data:', error);
    return null;
  }
};

export const clearSavedFormData = () => {
  try {
    localStorage.removeItem('inventoryFormData');
  } catch (error) {
    console.warn('Failed to clear saved form data:', error);
  }
};
