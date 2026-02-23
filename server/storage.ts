import { type User, type InsertUser, type Car, type InsertCar } from "@shared/schema";
import { randomUUID } from "crypto";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAllCars(): Promise<Car[]>;
  getCar(id: string): Promise<Car | undefined>;
  getCarBySlug(slug: string): Promise<Car | undefined>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: string, car: InsertCar): Promise<Car | undefined>;
  deleteCar(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cars: Map<string, Car>;

  constructor() {
    this.users = new Map();
    this.cars = new Map();
    if (process.env.SEED_DEMO_CARS === "true") {
      this.seedCars();
    }
  }

  private seedCars() {
    const sampleCars: any[] = [
      {
        name: "Tesla Model 3",
        category: "Electric",
        description: "Experience the future of driving with the Tesla Model 3. This premium electric sedan combines cutting-edge technology, impressive range, and exhilarating performance in a sleek, modern package.",
        image: "/attached_assets/generated_images/Tesla_Model_3_sedan_123f6843.png",
        images: [
          "/attached_assets/generated_images/Tesla_Model_3_sedan_123f6843.png",
          "/attached_assets/generated_images/Tesla_Model_3_sedan_123f6843.png",
          "/attached_assets/generated_images/Tesla_Model_3_sedan_123f6843.png"
        ],
        pricePerDay: 120,
        seats: 5,
        transmission: "Automatic",
        fuelType: "Electric",
        luggage: 2,
        doors: 4,
        year: 2024,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "Audi Q7",
        category: "SUV",
        description: "A premium 7-seater SUV with quattro all-wheel drive, panoramic sunroof, and refined interior perfect for long highway journeys.",
        image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=80",
        images: [
          "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1000&q=80"
        ],
        seats: 7,
        transmission: "Automatic",
        fuelType: "Diesel",
        luggage: 4,
        doors: 5,
        year: 2024,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
        available: true,
        consumption: "8.5L/100Km",
        engine: "3.0L V6 Turbo Diesel",
        power: "282 hp",
        drivetrain: "AWD",
        exteriorColor: "Carrara White",
        interiorColor: "Black Leather",
      },
      {
        name: "Range Rover Evoque",
        category: "Luxury SUV",
        description: "Compact luxury SUV with Terrain Response system, contrasting roof, and premium Meridian audio.",
        image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80",
        images: [
          "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=1200&q=80"
        ],
        pricePerDay: 210,
        seats: 5,
        transmission: "Automatic",
        fuelType: "Petrol",
        luggage: 3,
        doors: 2,
        year: 2023,
        hasGPS: true,
        hasBluetooth: true,
      },
      {
        name: "Ford Mustang GT",
        category: "Muscle",
        description: "Iconic American muscle with a roaring V8, track apps, and selectable drive modes.",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
        images: [
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80"
        ],
        pricePerDay: 190,
        seats: 4,
        transmission: "Automatic",
        fuelType: "Petrol",
        luggage: 2,
        doors: 2,
        year: 2022,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "BMW X5",
        category: "SUV",
        description: "The BMW X5 delivers luxury and versatility in perfect harmony. This premium SUV offers spacious seating, advanced technology, and powerful performance for both city driving and weekend adventures.",
        image: "/attached_assets/generated_images/BMW_X5_SUV_e9085a45.png",
        images: [
          "/attached_assets/generated_images/BMW_X5_SUV_e9085a45.png",
          "/attached_assets/generated_images/BMW_X5_SUV_e9085a45.png",
          "/attached_assets/generated_images/BMW_X5_SUV_e9085a45.png"
        ],
        pricePerDay: 150,
        seats: 7,
        transmission: "Automatic",
        fuelType: "Petrol",
        luggage: 4,
        doors: 5,
        year: 2023,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "Toyota Camry",
        category: "Sedan",
        description: "The Toyota Camry is the perfect blend of reliability, comfort, and efficiency. This midsize sedan offers a smooth ride, excellent fuel economy, and all the features you need for daily driving.",
        image: "/attached_assets/generated_images/Toyota_Camry_sedan_a32cd876.png",
        images: [
          "/attached_assets/generated_images/Toyota_Camry_sedan_a32cd876.png",
          "/attached_assets/generated_images/Toyota_Camry_sedan_a32cd876.png",
          "/attached_assets/generated_images/Toyota_Camry_sedan_a32cd876.png"
        ],
        pricePerDay: 80,
        seats: 5,
        transmission: "Automatic",
        fuelType: "Hybrid",
        luggage: 2,
        doors: 4,
        year: 2023,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: false,
        available: true,
      },
      {
        name: "Mercedes-Benz S-Class",
        category: "Luxury",
        description: "Step into ultimate luxury with the Mercedes-Benz S-Class. This flagship sedan redefines premium driving with its exquisite craftsmanship, cutting-edge technology, and unparalleled comfort.",
        image: "/attached_assets/generated_images/Mercedes_S-Class_luxury_8b2e970a.png",
        images: [
          "/attached_assets/generated_images/Mercedes_S-Class_luxury_8b2e970a.png",
          "/attached_assets/generated_images/Mercedes_S-Class_luxury_8b2e970a.png",
          "/attached_assets/generated_images/Mercedes_S-Class_luxury_8b2e970a.png"
        ],
        pricePerDay: 250,
        seats: 5,
        transmission: "Automatic",
        fuelType: "Petrol",
        luggage: 3,
        doors: 4,
        year: 2024,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
        available: false,
      },
      {
        name: "Porsche 911",
        category: "Sports",
        description: "Unleash your passion for driving with the iconic Porsche 911. This legendary sports car delivers breathtaking performance, precise handling, and timeless design that turns every drive into an unforgettable experience.",
        image: "/attached_assets/generated_images/Porsche_911_sports_c1be3448.png",
        images: [
          "/attached_assets/generated_images/Porsche_911_sports_c1be3448.png",
          "/attached_assets/generated_images/Porsche_911_sports_c1be3448.png",
          "/attached_assets/generated_images/Porsche_911_sports_c1be3448.png"
        ],
        pricePerDay: 300,
        seats: 4,
        transmission: "Manual",
        fuelType: "Petrol",
        luggage: 1,
        doors: 2,
        year: 2024,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "Honda CR-V",
        category: "SUV",
        description: "The Honda CR-V is your ideal companion for family adventures. This versatile compact SUV combines practicality, safety, and comfort with excellent fuel efficiency and spacious interior.",
        image: "/attached_assets/generated_images/Honda_CR-V_compact_SUV_52dc1a4d.png",
        images: [
          "/attached_assets/generated_images/Honda_CR-V_compact_SUV_52dc1a4d.png",
          "/attached_assets/generated_images/Honda_CR-V_compact_SUV_52dc1a4d.png",
          "/attached_assets/generated_images/Honda_CR-V_compact_SUV_52dc1a4d.png"
        ],
        pricePerDay: 95,
        seats: 5,
        transmission: "Automatic",
        fuelType: "Petrol",
        luggage: 3,
        doors: 5,
        year: 2023,
        hasGPS: false,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "Lamborghini Huracán EVO",
        category: "Supercar",
        description: "Track-inspired supercar with 630 hp V10 engine, rear-wheel steering, and magnetic suspension.",
        image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=80&sat=200",
        images: [
          "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=80&sat=200",
          "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80"
        ],
        pricePerDay: 650,
        seats: 2,
        transmission: "Automatic",
        fuelType: "Petrol",
        luggage: 1,
        doors: 2,
        year: 2024,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "Chevrolet Tahoe",
        category: "Full-Size SUV",
        description: "Massive SUV with three rows, rear-seat entertainment, and adaptive cruise for long hauls.",
        image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1350&q=80&hue=20",
        images: [
          "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1350&q=80&hue=20"
        ],
        available: false,
        consumption: "14.7L/100Km",
        engine: "5.3L V8",
        power: "355 hp",
        drivetrain: "4WD",
        exteriorColor: "Black",
        interiorColor: "Tan Leather",
      },
      {
        name: "Jeep Wrangler Rubicon",
        category: "Off-Road",
        description: "Trail-rated 4x4 with removable doors, locking differentials, and mud-terrain tires.",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
        images: [
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
        ],
        pricePerDay: 140,
        seats: 5,
        transmission: "Automatic",
        fuelType: "Petrol",
        luggage: 3,
        doors: 4,
        year: 2022,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "Bentley Continental GT",
        category: "Grand Tourer",
        description: "Handcrafted GT with massaging seats, rotating display, and twin-turbo W12 power.",
        image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1400&q=80",
        images: [
          "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80"
        ],
        pricePerDay: 520,
        seats: 4,
        transmission: "Automatic",
        fuelType: "Petrol",
        luggage: 2,
        doors: 2,
        year: 2024,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "Volvo XC90 Recharge",
        category: "Hybrid SUV",
        description: "Scandinavian luxury plug-in hybrid SUV with Pilot Assist and air suspension.",
        image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1300&q=80&blend=000&sat=-50",
        images: [
          "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1300&q=80&blend=000&sat=-50"
        ],
        pricePerDay: 175,
        seats: 7,
        transmission: "Automatic",
        fuelType: "Hybrid",
        luggage: 4,
        doors: 5,
        year: 2024,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "Ferrari Portofino M",
        category: "Convertible",
        description: "Retractable hardtop Ferrari with 612 hp, launch control, and Italian craftsmanship.",
        image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1350&q=80&sat=150",
        images: [
          "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1350&q=80&sat=150",
          "https://images.unsplash.com/photo-1511910849309-0e1e2419ad66?auto=format&fit=crop&w=1200&q=80"
        ],
        pricePerDay: 700,
        seats: 4,
        transmission: "Automatic",
        fuelType: "Petrol",
        luggage: 1,
        doors: 2,
        year: 2023,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
        available: false,
      },
      {
        name: "Cadillac Escalade",
        category: "Luxury SUV",
        description: "Full-size luxury SUV with OLED curved display, AKG studio sound, and Super Cruise hands-free driving.",
        image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1350&q=80&warm=30",
        images: [
          "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1350&q=80&warm=30"
        ],
        pricePerDay: 230,
        seats: 7,
        transmission: "Automatic",
        fuelType: "Petrol",
        luggage: 5,
        doors: 5,
        year: 2024,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "Nissan GT-R",
        category: "Performance",
        description: "All-wheel-drive performance icon with launch control and handcrafted twin-turbo V6.",
        image: "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1400&q=80",
        images: [
          "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1400&q=80"
        ],
        pricePerDay: 320,
        seats: 4,
        transmission: "Automatic",
        fuelType: "Petrol",
        luggage: 1,
        doors: 2,
        year: 2022,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "BMW i8 Roadster",
        category: "Hybrid Sports",
        description: "Plug-in hybrid sports car with futuristic design, butterfly doors, and carbon fiber tub.",
        image: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=1400&q=80",
        images: [
          "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=1400&q=80"
        ],
        pricePerDay: 280,
        seats: 2,
        transmission: "Automatic",
        fuelType: "Hybrid",
        luggage: 1,
        doors: 2,
        year: 2021,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "Lexus RX 350",
        category: "Crossover",
        description: "Quiet crossover with Mark Levinson audio, heated/cooled seats, and Lexus Safety System+ 3.0.",
        image: "https://images.unsplash.com/photo-1511910849309-0e1e2419ad66?auto=format&fit=crop&w=1400&q=80",
        images: [
          "https://images.unsplash.com/photo-1511910849309-0e1e2419ad66?auto=format&fit=crop&w=1400&q=80"
        ],
        pricePerDay: 155,
        seats: 5,
        transmission: "Automatic",
        fuelType: "Hybrid",
        luggage: 3,
        doors: 5,
        year: 2024,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
        available: false,
      },
      {
        name: "Kia Carnival SX Prestige",
        category: "MPV",
        description: "Luxury MPV with VIP lounge seats, dual sunroofs, and rear entertainment screens ideal for group travel.",
        image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
        images: [
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80"
        ],
        pricePerDay: 130,
        seats: 7,
        transmission: "Automatic",
        fuelType: "Petrol",
        luggage: 5,
        doors: 5,
        year: 2023,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "Jeep Grand Cherokee 4xe",
        category: "Plug-in Hybrid",
        description: "Luxury off-roader with Quadra-Lift air suspension, 4xe plug-in hybrid power, and digital rear entertainment.",
        image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80&contrast=120",
        images: [
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80&contrast=120"
        ],
        pricePerDay: 185,
        seats: 5,
        transmission: "Automatic",
        fuelType: "Hybrid",
        luggage: 4,
        doors: 5,
        year: 2024,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "Rolls-Royce Cullinan",
        category: "Ultra Luxury",
        description: "The pinnacle of SUV luxury with starlight headliner, bespoke interior, and magic carpet ride.",
        image: "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1400&q=80",
        images: [
          "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1400&q=80"
        ],
        pricePerDay: 950,
        seats: 5,
        transmission: "Automatic",
        fuelType: "Petrol",
        luggage: 4,
        doors: 5,
        year: 2024,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
        available: false,
      },
      {
        name: "Maserati Levante Trofeo",
        category: "Performance SUV",
        description: "Italian performance SUV with Ferrari-built V8, Skyhook suspension, and Zegna interior.",
        image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&q=80",
        images: [
          "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&q=80"
        ],
        pricePerDay: 260,
        seats: 5,
        transmission: "Automatic",
        fuelType: "Petrol",
        luggage: 3,
        doors: 5,
        year: 2023,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
      {
        name: "Toyota Land Cruiser GR Sport",
        category: "Adventure SUV",
        description: "Body-on-frame legend with KDSS suspension, crawl control, and 7-passenger comfort.",
        image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1350&q=80&sharp=80",
        images: [
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1350&q=80&sharp=80"
        ],
        pricePerDay: 200,
        seats: 7,
        transmission: "Automatic",
        fuelType: "Diesel",
        luggage: 5,
        doors: 5,
        year: 2024,
        hasGPS: true,
        hasBluetooth: true,
        hasAC: true,
        hasUSB: true,
      },
    ];

    sampleCars.forEach((carData) => {
      const id = randomUUID();
      const slug = generateSlug(carData.name);
      const car: Car = {
        ...carData,
        id,
        slug,
        images: carData.images || []
      };
      this.cars.set(id, car);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllCars(): Promise<Car[]> {
    return Array.from(this.cars.values());
  }

  async getCar(id: string): Promise<Car | undefined> {
    return this.cars.get(id);
  }

  async getCarBySlug(slug: string): Promise<Car | undefined> {
    return Array.from(this.cars.values()).find(
      (car) => car.slug === slug,
    );
  }

  async createCar(insertCar: InsertCar): Promise<Car> {
    const id = randomUUID();
    const slug = generateSlug(insertCar.name);
    // Ensure images array exists
    const carData: any = {
      ...insertCar,
      images: insertCar.images || []
    };
    const car: Car = {
      ...carData,
      id,
      slug,
      images: carData.images || []
    };
    this.cars.set(id, car);
    return car;
  }

  async updateCar(id: string, insertCar: InsertCar): Promise<Car | undefined> {
    const existing = this.cars.get(id);
    if (!existing) {
      return undefined;
    }
    const slug = generateSlug(insertCar.name);
    // Ensure images array exists
    const carData: any = {
      ...insertCar,
      images: insertCar.images || []
    };
    const updatedCar: Car = {
      ...carData,
      id,
      slug,
      images: carData.images || []
    };
    this.cars.set(id, updatedCar);
    return updatedCar;
  }

  async deleteCar(id: string): Promise<boolean> {
    return this.cars.delete(id);
  }
}

export const storage = new MemStorage();