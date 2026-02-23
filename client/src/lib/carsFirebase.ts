import { db, isFirebaseInitialized } from "./firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import type { Car, InsertCar } from "@shared/schema";

const CARS_COLLECTION = "cars";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function sanitizeForFirestore<T extends Record<string, any>>(value: T): T {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(value)) {
    if (val === undefined) continue;
    result[key] = val;
  }
  return result as T;
}

export async function getAllCarsFirebase(): Promise<Car[]> {
  try {
    if (!isFirebaseInitialized) return [];
    const snap = await getDocs(collection(db, CARS_COLLECTION));
    const cars: Car[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as Car;
      // Ensure images is always an array and id is set
      cars.push({
        ...data,
        id: data.id || docSnap.id, // Use document ID if id field is missing
        images: ensureArray(data.images as any),
        features: ensureArray((data as any).features),
        enhancements: ensureArray((data as any).enhancements),
        badges: ensureArray((data as any).badges),
        timelineTitles: ensureArray((data as any).timelineTitles),
        timelineDescs: ensureArray((data as any).timelineDescs),
      });
    });

    console.log(`Fetched ${cars.length} cars from Firestore.`);
    return cars;
  } catch (error: any) {
    const isOffline = error?.code === 'unavailable' ||
      error?.message?.toLowerCase().includes('offline') ||
      !navigator.onLine;

    if (!isOffline) {
      console.error("Error fetching all cars:", error);
    }
    return [];
  }
}

export async function getCarBySlugFirebase(slug: string): Promise<Car | undefined> {
  try {
    if (!isFirebaseInitialized) return undefined;
    const q = query(
      collection(db, CARS_COLLECTION),
      where("slug", "==", slug),
    );
    const snap = await getDocs(q);
    if (snap.empty) return undefined;

    const data = snap.docs[0].data() as Car;
    return {
      ...data,
      id: data.id || snap.docs[0].id, // Ensure id is set using document ID if missing
      images: ensureArray(data.images as any),
      features: ensureArray((data as any).features),
      enhancements: ensureArray((data as any).enhancements),
      badges: ensureArray((data as any).badges),
      timelineTitles: ensureArray((data as any).timelineTitles),
      timelineDescs: ensureArray((data as any).timelineDescs),
    };
  } catch (error: any) {
    const isOffline = error?.code === 'unavailable' ||
      error?.message?.toLowerCase().includes('offline') ||
      !navigator.onLine;

    if (!isOffline) {
      console.error("Error fetching car by slug:", error);
    }
    return undefined;
  }
}

export async function getCarByIdFirebase(id: string): Promise<Car | undefined> {
  try {
    if (!isFirebaseInitialized) return undefined;
    if (!id) {
      console.error("getCarByIdFirebase: id is required");
      return undefined;
    }

    console.log("getCarByIdFirebase: Searching for car with id:", id);

    const q = query(
      collection(db, CARS_COLLECTION),
      where("id", "==", id),
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      console.warn("getCarByIdFirebase: No car found with id:", id);
      // Try using the id as document ID as fallback
      try {
        const docRef = doc(collection(db, CARS_COLLECTION), id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Car;
          console.log("getCarByIdFirebase: Found car using document ID");
          return {
            ...data,
            id: data.id || docSnap.id,
            images: ensureArray(data.images as any),
            features: ensureArray((data as any).features),
            enhancements: ensureArray((data as any).enhancements),
            badges: ensureArray((data as any).badges),
            timelineTitles: ensureArray((data as any).timelineTitles),
            timelineDescs: ensureArray((data as any).timelineDescs),
          };
        }
      } catch (err) {
        console.error("getCarByIdFirebase: Error trying document ID lookup:", err);
      }
      return undefined;
    }

    const data = snap.docs[0].data() as Car;
    console.log("getCarByIdFirebase: Found car:", data.name);
    return {
      ...data,
      id: data.id || snap.docs[0].id, // Ensure id is set
      images: ensureArray(data.images as any),
      features: ensureArray((data as any).features),
      enhancements: ensureArray((data as any).enhancements),
      badges: ensureArray((data as any).badges),
      timelineTitles: ensureArray((data as any).timelineTitles),
      timelineDescs: ensureArray((data as any).timelineDescs),
    };
  } catch (error: any) {
    const isOffline = error?.code === 'unavailable' ||
      error?.message?.toLowerCase().includes('offline') ||
      !navigator.onLine;

    if (!isOffline) {
      console.error("Error fetching car by id:", error);
    }
    return undefined;
  }
}

export async function createCarFirebase(input: InsertCar): Promise<Car> {
  if (!isFirebaseInitialized) {
    throw new Error("Firebase is not configured. Please complete the setup guide first.");
  }

  const id = crypto.randomUUID();
  const slug = generateSlug(input.name);

  const raw: any = {
    ...(input as any),
    id,
    slug,
    images: ensureArray(input.images as any),
  };

  const car = sanitizeForFirestore(raw) as Car;

  await addDoc(collection(db, CARS_COLLECTION), car);
  return car;
}

export async function updateCarFirebase(id: string, input: InsertCar): Promise<Car | undefined> {
  // Try to find by "id" field first
  const q = query(
    collection(db, CARS_COLLECTION),
    where("id", "==", id),
  );
  const snap = await getDocs(q);

  let docRef;

  if (!snap.empty) {
    docRef = snap.docs[0].ref;
  } else {
    // Fallback: Try to use id as document ID
    const docRefById = doc(collection(db, CARS_COLLECTION), id);
    const docSnap = await getDoc(docRefById);

    if (docSnap.exists()) {
      docRef = docRefById;
    } else {
      console.error(`updateCarFirebase: Car not found with id ${id}`);
      throw new Error("Car not found");
    }
  }

  const slug = generateSlug(input.name);

  const rawUpdated: any = {
    ...(input as any),
    id,
    slug,
    images: ensureArray(input.images as any),
  };

  const updated = sanitizeForFirestore(rawUpdated) as Car;

  await updateDoc(docRef, updated as any);
  return updated;
}

export async function duplicateCarFirebase(id: string): Promise<Car | undefined> {
  const originalCar = await getCarByIdFirebase(id);
  if (!originalCar) return undefined;

  const newId = crypto.randomUUID();
  const newName = `${originalCar.name} (Copy)`;
  const newSlug = `${originalCar.slug}-copy-${Math.floor(Math.random() * 1000)}`;

  const rawDuplicated: any = {
    ...originalCar,
    id: newId,
    name: newName,
    slug: newSlug,
  };

  const duplicatedCar = sanitizeForFirestore(rawDuplicated) as Car;

  await addDoc(collection(db, CARS_COLLECTION), duplicatedCar);
  return duplicatedCar;
}

export async function deleteCarFirebase(id: string): Promise<boolean> {
  if (!id) {
    console.error("deleteCarFirebase: id is required");
    throw new Error("Car ID is required for deletion");
  }

  console.log("deleteCarFirebase: Attempting to delete car with id:", id);

  try {
    // First, try to find by the id field
    const q = query(
      collection(db, CARS_COLLECTION),
      where("id", "==", id),
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docRef = snap.docs[0].ref;
      console.log("deleteCarFirebase: Found car by id field, deleting document:", docRef.id);
      await deleteDoc(docRef);
      console.log("deleteCarFirebase: Car deleted successfully");
      return true;
    }

    // If not found by id field, try using the id as document ID
    console.log("deleteCarFirebase: Car not found by id field, trying document ID");
    try {
      const docRef = doc(collection(db, CARS_COLLECTION), id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("deleteCarFirebase: Found car by document ID, deleting");
        await deleteDoc(docRef);
        console.log("deleteCarFirebase: Car deleted successfully");
        return true;
      }
    } catch (docIdError) {
      console.error("deleteCarFirebase: Error trying document ID lookup:", docIdError);
    }

    console.warn("deleteCarFirebase: Car not found with id:", id);
    throw new Error(`Car with ID "${id}" not found`);
  } catch (error) {
    console.error("deleteCarFirebase: Error deleting car:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete car");
  }
}









