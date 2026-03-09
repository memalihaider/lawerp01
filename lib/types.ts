export type UserRole = "admin" | "partner" | "attorney" | "paralegal" | "staff" | "client";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Attorney {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  photo: string;
  bio: string;
  specialties: string[];
  barAdmissions: string[];
  education: string[];
  awards: string[];
}

export interface PracticeArea {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  icon: string;
  features: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  readTime: string;
}

export type MatterStatus = "open" | "active" | "pending" | "closed" | "archived";
export type MatterPriority = "low" | "medium" | "high" | "urgent";

export interface Matter {
  id: string;
  caseNumber: string;
  title: string;
  clientId: string;
  clientName: string;
  assignedAttorneyId: string;
  assignedAttorneyName: string;
  practiceArea: string;
  status: MatterStatus;
  priority: MatterPriority;
  openDate: string;
  closeDate?: string;
  description: string;
  courtName?: string;
  opposingCounsel?: string;
  tasks: Task[];
  notes: Note[];
}

export interface Task {
  id: string;
  matterId: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  priority: MatterPriority;
}

export interface Note {
  id: string;
  matterId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  matterId: string;
  matterTitle: string;
  attorneyId: string;
  attorneyName: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  rate: number;
  status: "draft" | "approved" | "billed";
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  matterId: string;
  matterTitle: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  paidDate?: string;
}

export interface InvoiceItem {
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  matterId?: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  category: "pleading" | "contract" | "correspondence" | "evidence" | "internal" | "other";
}

export interface Message {
  id: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  subject: string;
  content: string;
  createdAt: string;
  read: boolean;
  matterId?: string;
}

export interface DashboardMetrics {
  totalMatters: number;
  activeMatters: number;
  billableHoursThisMonth: number;
  revenueThisMonth: number;
  outstandingInvoices: number;
  upcomingDeadlines: number;
  newClientsThisMonth: number;
  collectionRate: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}
