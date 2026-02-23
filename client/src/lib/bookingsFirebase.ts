import { db, isFirebaseInitialized } from "./firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  where,
} from "firebase/firestore";
import type { Booking, InsertBooking } from "@shared/schema";

const BOOKINGS_COLLECTION = "bookings";

export async function getAllBookingsFirebase(): Promise<Booking[]> {
  try {
    if (!isFirebaseInitialized) return [];
    const q = query(collection(db, BOOKINGS_COLLECTION), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const bookings: Booking[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as Booking;
      bookings.push({
        ...data,
        id: docSnap.id,
      });
    });

    return bookings;
  } catch (error: any) {
    const isOffline = error?.code === 'unavailable' ||
      error?.message?.toLowerCase().includes('offline') ||
      !navigator.onLine;

    if (!isOffline) {
      console.error("Error fetching all bookings:", error);
    }
    return [];
  }
}

export async function createBookingFirebase(input: InsertBooking): Promise<Booking> {
  try {
    const bookingData = {
      ...input,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), bookingData);
    return {
      ...bookingData,
      id: docRef.id,
    } as Booking;
  } catch (error: any) {
    const isOffline = error?.code === 'unavailable' ||
      error?.message?.toLowerCase().includes('offline') ||
      !navigator.onLine;

    if (isOffline) {
      throw new Error("You appear to be offline. Please check your connection and try again.");
    }

    console.error("Error creating booking in Firestore:", error);
    throw new Error(`Failed to create booking: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateBookingStatusFirebase(id: string, status: string): Promise<void> {
  const docRef = doc(db, BOOKINGS_COLLECTION, id);
  await updateDoc(docRef, { status });
}

export async function deleteBookingFirebase(id: string): Promise<void> {
  const docRef = doc(db, BOOKINGS_COLLECTION, id);
  await deleteDoc(docRef);
}
