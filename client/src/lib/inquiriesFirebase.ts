import { db } from "./firebase";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import type { Inquiry, InsertInquiry } from "@shared/schema";

const INQUIRIES_COLLECTION = "inquiries";

// Helper to generate a robust ID
function generateId(): string {
    try {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }
    } catch (e) {
        // Fallback
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export async function createInquiryFirebase(
    input: InsertInquiry,
): Promise<Inquiry> {
    try {
        // Use the robust ID generator
        const id = generateId();

        const inquiry: Inquiry = {
            carId: input.carId || "",
            carName: input.carName || "",
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            address: input.address || "",
            notes: input.notes || "",
            budget: input.budget || "",
            modelPreference: input.modelPreference || "",
            yearRange: input.yearRange || "",
            id,
            status: "pending",
            createdAt: new Date().toISOString(),
        };

        await addDoc(collection(db, INQUIRIES_COLLECTION), inquiry);

        return inquiry;
    } catch (error: any) {
        const isOffline = error?.code === 'unavailable' ||
            error?.message?.toLowerCase().includes('offline') ||
            !navigator.onLine;

        if (isOffline) {
            throw new Error("You appear to be offline. Please check your connection and try again.");
        }

        console.error("Error creating inquiry in Firestore:", error);
        throw new Error(`Failed to create inquiry: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function getAllInquiriesFirebase(): Promise<Inquiry[]> {
    try {
        const q = query(
            collection(db, INQUIRIES_COLLECTION),
            orderBy("createdAt", "desc"),
        );
        const snap = await getDocs(q);
        const inquiries: Inquiry[] = [];

        snap.forEach((docSnap) => {
            inquiries.push(docSnap.data() as Inquiry);
        });

        return inquiries;
    } catch (error: any) {
        const isOffline = error?.code === 'unavailable' ||
            error?.message?.toLowerCase().includes('offline') ||
            !navigator.onLine;

        if (!isOffline) {
            console.error("Error fetching all inquiries:", error);
        }
        return [];
    }
}

export async function updateInquiryStatusFirebase(
    id: string,
    status: Inquiry["status"],
): Promise<void> {
    const q = query(
        collection(db, INQUIRIES_COLLECTION),
        where("id", "==", id),
    );
    const snap = await getDocs(q);
    if (snap.empty) return;

    const docRef = snap.docs[0].ref;
    await updateDoc(docRef, { status });
}

export async function deleteInquiryFirebase(id: string): Promise<void> {
    const q = query(
        collection(db, INQUIRIES_COLLECTION),
        where("id", "==", id),
    );
    const snap = await getDocs(q);
    if (snap.empty) return;

    const docRef = snap.docs[0].ref;
    await deleteDoc(docRef);
}

export async function getInquiriesByCarFirebase(carId: string): Promise<Inquiry[]> {
    try {
        const q = query(
            collection(db, INQUIRIES_COLLECTION),
            where("carId", "==", carId),
            orderBy("createdAt", "desc"),
        );
        const snap = await getDocs(q);
        const inquiries: Inquiry[] = [];

        snap.forEach((docSnap) => {
            inquiries.push(docSnap.data() as Inquiry);
        });

        return inquiries;
    } catch (error: any) {
        const isOffline = error?.code === 'unavailable' ||
            error?.message?.toLowerCase().includes('offline') ||
            !navigator.onLine;

        if (!isOffline) {
            console.error("Error fetching inquiries by car:", error);
        }
        return [];
    }
}
