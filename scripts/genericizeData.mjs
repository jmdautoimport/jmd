import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataPath = join(__dirname, "..", "data", "10-cars-data.json");
const cars = JSON.parse(readFileSync(dataPath, "utf-8"));

const REPLACEMENTS = {
    "BMW 5 Series": "Executive Sedan Class 5",
    "Mercedes-Benz GLE": "Premium SUV Class G",
    "Porsche 911 Carrera": "Sports Coupe 911",
    "Tesla Model 3": "Electric Sedan Model T",
    "Audi A4": "Compact Executive Sedan A4",
    "Range Rover Sport": "Luxury Off-Road Sport",
    "Toyota Camry Hybrid": "Reliable Hybrid Sedan",
    "Lamborghini Huracán": "Supercar Huracan",
    "Mercedes-Benz S-Class": "Flagship Luxury Sedan",
    "Ford Mustang GT": "Muscle Car GT",
    "Honda CR-V": "Family Compact SUV",
    "Mazda CX-5": "Crossover SUV CX",
    "Volkswagen Golf": "Premium Hatchback",
    "Nissan Altima": "Midsize Comfort Sedan",
    "Hyundai Tucson": "Modern Compact SUV",
    "Chevrolet Corvette": "American Sports Car C8",
    "Lexus RX 350": "Luxury Crossover RX",
    "Audi Q7": "Premium 7-Seater Q7",
    "BMW 3 Series": "Sport Sedan Class 3",
    "Jaguar F-Type": "British Sports Coupe",
    "Toyota RAV4 Hybrid": "Hybrid Adventure SUV",
    "Volvo XC90": "Safest Luxury SUV",
    "McLaren 720S": "British Supercar 720",
    "Genesis G90": "Korean Luxury Flagship",
    "Subaru Outback": "All-Weather Wagon",
    "Kia Telluride": "Large Family SUV",
    "Aston Martin DB11": "Grand Tourer DB",
    "Tesla Model Y": "Electric Crossover Y",
    "Ferrari 488 GTB": "Italian Supercar 488",
    "Cadillac Escalade": "Full-Size Luxury SUV"
};

const genericCars = cars.map(car => {
    const genericName = REPLACEMENTS[car.name] || car.name;
    let description = car.description;

    // Basic replacement in description to remove brand names
    Object.keys(REPLACEMENTS).forEach(brand => {
        const brandName = brand.split(' ')[0]; // e.g., BMW, Mercedes-Benz
        const regex = new RegExp(brandName, 'gi');
        description = description.replace(regex, "the vehicle");
    });

    return {
        ...car,
        name: genericName,
        description: description
    };
});

writeFileSync(dataPath, JSON.stringify(genericCars, null, 2));
console.log("Successfully genericized car data!");
