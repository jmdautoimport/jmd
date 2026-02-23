# Car Data

This directory contains car data for seeding the database.

## Files

- `10-cars-data.json` - Contains 30 diverse car listings with complete data

## Cars Included (30 Total)

### Original 10 Cars:
1. **BMW 5 Series** - Luxury sedan ($180/day)
2. **Mercedes-Benz GLE** - SUV ($220/day)
3. **Porsche 911 Carrera** - Sports car ($350/day)
4. **Tesla Model 3** - Electric sedan ($200/day)
5. **Audi A4** - Sedan ($150/day)
6. **Range Rover Sport** - SUV ($280/day)
7. **Toyota Camry Hybrid** - Sedan ($120/day)
8. **Lamborghini Huracán** - Sports car ($500/day)
9. **Mercedes-Benz S-Class** - Luxury sedan ($320/day)
10. **Ford Mustang GT** - Sports car ($250/day)

### Additional 20 Cars:
11. **Honda CR-V** - SUV ($110/day)
12. **Mazda CX-5** - SUV ($130/day)
13. **Volkswagen Golf** - Sedan ($100/day)
14. **Nissan Altima** - Sedan ($115/day)
15. **Hyundai Tucson** - SUV ($125/day)
16. **Chevrolet Corvette** - Sports car ($400/day)
17. **Lexus RX 350** - SUV ($240/day)
18. **Audi Q7** - SUV ($260/day)
19. **BMW 3 Series** - Sedan ($160/day)
20. **Jaguar F-Type** - Sports car ($380/day)
21. **Toyota RAV4 Hybrid** - SUV ($140/day)
22. **Volvo XC90** - SUV ($270/day)
23. **McLaren 720S** - Sports car ($600/day)
24. **Genesis G90** - Luxury sedan ($290/day)
25. **Subaru Outback** - SUV ($135/day)
26. **Kia Telluride** - SUV ($190/day)
27. **Aston Martin DB11** - Luxury sports car ($550/day)
28. **Tesla Model Y** - Electric SUV ($230/day)
29. **Ferrari 488 GTB** - Sports car ($650/day)
30. **Cadillac Escalade** - SUV ($300/day)

## Categories Covered

- **Sedan**: 6 cars (Audi A4, Toyota Camry Hybrid, Tesla Model 3, BMW 3 Series, Volkswagen Golf, Nissan Altima)
- **SUV**: 11 cars (Mercedes-Benz GLE, Range Rover Sport, Honda CR-V, Mazda CX-5, Hyundai Tucson, Lexus RX 350, Audi Q7, Toyota RAV4 Hybrid, Volvo XC90, Subaru Outback, Kia Telluride, Cadillac Escalade, Tesla Model Y)
- **Sports**: 7 cars (Porsche 911, Lamborghini Huracán, Ford Mustang GT, Chevrolet Corvette, Jaguar F-Type, McLaren 720S, Ferrari 488 GTB)
- **Luxury**: 4 cars (BMW 5 Series, Mercedes-Benz S-Class, Genesis G90, Aston Martin DB11)
- **Electric**: 2 cars (Tesla Model 3, Tesla Model Y)
- **Hybrid**: 2 cars (Toyota Camry Hybrid, Toyota RAV4 Hybrid, Volvo XC90)

## Price Range

- **Budget**: $100-$150/day (Volkswagen Golf, Honda CR-V, Toyota Camry, Nissan Altima, Audi A4, BMW 3 Series)
- **Mid-range**: $160-$250/day (BMW 5 Series, Tesla Model 3, Ford Mustang, Kia Telluride, Lexus RX 350, Tesla Model Y)
- **Premium**: $260-$400/day (Audi Q7, Range Rover, Volvo XC90, Mercedes S-Class, Genesis G90, Cadillac Escalade, Porsche 911, Chevrolet Corvette, Jaguar F-Type)
- **Ultra-Luxury**: $500-$650/day (Lamborghini Huracán, Aston Martin DB11, McLaren 720S, Ferrari 488 GTB)

## How to Use

To seed these cars into Firebase, run:

```bash
npm run seed:10cars
```

This will read the JSON file and add all 30 cars to your Firestore database.

