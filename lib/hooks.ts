"use client";

import { useState, useEffect, useCallback } from "react";
import {
  subscribeToCollection,
  subscribeToDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocuments,
  where,
  orderBy,
  limit,
} from "./firebase-service";
import type { QueryConstraint } from "firebase/firestore";

// --------------- useRealtimeCollection ---------------

export function useRealtimeCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  enabled = true
) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToCollection<T>(collectionName, constraints, (docs) => {
      setData(docs);
      setLoading(false);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, enabled]);

  return { data, loading, error };
}

// --------------- useRealtimeDocument ---------------

export function useRealtimeDocument<T>(
  collectionName: string,
  id: string | null
) {
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToDocument<T>(collectionName, id, (doc) => {
      setData(doc);
      setLoading(false);
    });
    return () => unsub();
  }, [collectionName, id]);

  return { data, loading };
}

// --------------- Domain-specific hooks ---------------

export function useMatters(filters?: { status?: string; attorneyId?: string; clientId?: string }) {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (filters?.status && filters.status !== "all") constraints.unshift(where("status", "==", filters.status));
  if (filters?.attorneyId) constraints.unshift(where("assignedAttorneyId", "==", filters.attorneyId));
  if (filters?.clientId) constraints.unshift(where("clientId", "==", filters.clientId));

  return useRealtimeCollection("matters", constraints);
}

export function useMatter(id: string | null) {
  return useRealtimeDocument("matters", id);
}

export function useTimeEntries(filters?: { matterId?: string; attorneyId?: string; status?: string }) {
  const constraints: QueryConstraint[] = [orderBy("date", "desc")];
  if (filters?.matterId) constraints.unshift(where("matterId", "==", filters.matterId));
  if (filters?.attorneyId) constraints.unshift(where("attorneyId", "==", filters.attorneyId));
  if (filters?.status && filters.status !== "all") constraints.unshift(where("status", "==", filters.status));

  return useRealtimeCollection("timeEntries", constraints);
}

export function useInvoices(filters?: { clientId?: string; status?: string }) {
  const constraints: QueryConstraint[] = [orderBy("issueDate", "desc")];
  if (filters?.clientId) constraints.unshift(where("clientId", "==", filters.clientId));
  if (filters?.status && filters.status !== "all") constraints.unshift(where("status", "==", filters.status));

  return useRealtimeCollection("invoices", constraints);
}

export function useDocuments(filters?: { matterId?: string; category?: string }) {
  const constraints: QueryConstraint[] = [orderBy("uploadedAt", "desc")];
  if (filters?.matterId) constraints.unshift(where("matterId", "==", filters.matterId));
  if (filters?.category && filters.category !== "all") constraints.unshift(where("category", "==", filters.category));

  return useRealtimeCollection("documents", constraints);
}

export function useClients() {
  return useRealtimeCollection("users", [where("role", "==", "client"), orderBy("displayName", "asc")]);
}

export function useMessages(userId: string | null = null) {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (userId) constraints.unshift(where("participants", "array-contains", userId));

  return useRealtimeCollection("messages", constraints);
}

export function useTasks(filters?: { matterId?: string; assignedTo?: string; status?: string }) {
  const constraints: QueryConstraint[] = [orderBy("dueDate", "asc")];
  if (filters?.matterId) constraints.unshift(where("matterId", "==", filters.matterId));
  if (filters?.assignedTo) constraints.unshift(where("assignedTo", "==", filters.assignedTo));
  if (filters?.status && filters.status !== "all") constraints.unshift(where("status", "==", filters.status));

  return useRealtimeCollection("tasks", constraints);
}

export function useCalendarEvents(filters?: { attorneyId?: string }) {
  const constraints: QueryConstraint[] = [orderBy("date", "asc")];
  if (filters?.attorneyId) constraints.unshift(where("attorneyId", "==", filters.attorneyId));

  return useRealtimeCollection("calendarEvents", constraints);
}

export function useUsers(role?: string) {
  const constraints: QueryConstraint[] = [orderBy("displayName", "asc")];
  if (role && role !== "all") constraints.unshift(where("role", "==", role));

  return useRealtimeCollection("users", constraints);
}

export function useSiteSettings() {
  return useRealtimeDocument("settings", "site");
}

// CMS hooks for public website
export function useCmsAttorneys() {
  return useRealtimeCollection("cmsAttorneys", [where("published", "==", true), orderBy("order", "asc")]);
}
export function useCmsBlogPosts() {
  return useRealtimeCollection("cmsBlogPosts", [where("published", "==", true), orderBy("createdAt", "desc")]);
}
export function useCmsServices() {
  return useRealtimeCollection("cmsServices", [where("published", "==", true), orderBy("order", "asc")]);
}
export function useCmsTestimonials() {
  return useRealtimeCollection("cmsTestimonials", [where("published", "==", true), orderBy("order", "asc")]);
}

// export query helpers for direct usage
export { where, orderBy, limit };
