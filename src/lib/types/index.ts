// ============================================================
// Firestore Koleksiyon Yapısı — C_Studio Platformu
// ============================================================

// /users/{userId}
export interface User {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  company?: string;
  taxId?: string;               // Vergi numarası (fatura için)
  taxOffice?: string;
  address?: string;
  role: "admin" | "member";
  status: "active" | "pending" | "suspended";
  groupIds: string[];           // Ait olduğu müşteri grupları
  invitedBy?: string;           // Davet eden admin UID
  inviteToken?: string;         // Henüz kabul edilmemiş davet tokeni
  createdAt: string;            // ISO date
  updatedAt: string;
}

// /groups/{groupId}
export interface Group {
  id: string;
  name: string;
  description?: string;
  bannerUrl?: string;           // Firebase Storage URL
  memberIds: string[];
  discountPercent?: number;     // Gruba özel indirim
  createdAt: string;
}

// /products/{productId}
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;                // TL, tam sayı (kuruş bazında tutmak daha sağlıklı)
  priceUnit: "month" | "year" | "once"; // Abonelik mi, tek seferlik mi?
  category: string;
  imageUrl?: string;
  isActive: boolean;
  visibleToGroups: string[];    // Boşsa herkese görünür
  isCustomizable: boolean;      // Kullanıcı özelleştirebilir mi?
  createdAt: string;
}

// /orders/{orderId}
export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  status: "pending" | "paid" | "cancelled" | "refunded";
  paymentMethod: "iyzico";
  paymentId?: string;           // İyzico payment reference
  invoiceId?: string;           // Bağlı fatura ID
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  customizations?: Record<string, string>; // Paket özelleştirmeleri
}

// /invoices/{invoiceId}
export interface Invoice {
  id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  invoiceNumber: string;        // INV-2024-001 formatı
  billingInfo: BillingInfo;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;            // KDV
  total: number;
  pdfUrl?: string;              // Firebase Storage'daki PDF URL
  sentAt?: string;
  createdAt: string;
}

export interface BillingInfo {
  name: string;
  company?: string;
  taxId?: string;
  taxOffice?: string;
  address: string;
  email: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// /subscriptions/{subscriptionId}
export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  amount: number;
  interval: "monthly" | "yearly";
  status: "active" | "cancelled" | "expired";
  nextBillingDate: string;
  startDate: string;
  endDate?: string;
  contractId?: string;          // Bağlı sözleşme
}

// /contracts/{contractId}
export interface Contract {
  id: string;
  userId: string;
  title: string;
  content: string;              // HTML veya Markdown
  status: "sent" | "viewed" | "signed" | "expired";
  signedAt?: string;
  sentAt: string;
  expiresAt: string;
  signatureToken: string;       // Tek kullanımlık imza tokeni
  subscriptionId?: string;
}

// /campaigns/{campaignId}
export interface Campaign {
  id: string;
  title: string;
  description?: string;
  bannerUrl: string;
  targetGroups: string[];       // Boşsa herkese göster
  startDate: string;
  endDate: string;
  isActive: boolean;
  link?: string;                // Tıklanınca gidilecek URL
  createdAt: string;
}

// /invites/{token}
export interface Invite {
  token: string;
  email: string;
  groupIds: string[];
  createdBy: string;            // Admin UID
  status: "pending" | "accepted" | "expired";
  expiresAt: string;
  createdAt: string;
}
