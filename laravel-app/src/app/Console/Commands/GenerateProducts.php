<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;

class GenerateProducts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'products:generate {count=50 : Number of products to generate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate sample products with realistic data across 8 categories';

    /**
     * Product categories with their data generators
     */
    private array $categories = [
        'Electronics' => [
            'names' => [
                'Wireless Bluetooth Headphones', 'Smartphone Case', 'USB-C Cable', 'Portable Charger',
                'Bluetooth Speaker', 'Smart Watch', 'Laptop Stand', 'Gaming Mouse',
                'Wireless Keyboard', 'Phone Screen Protector', 'Power Bank', 'Webcam Cover',
                'HDMI Cable', 'Memory Card', 'Phone Holder', 'Earphone Adapter'
            ],
            'cost_range' => [15, 150], // Base cost range in dollars
        ],
        'Clothing' => [
            'names' => [
                'Cotton T-Shirt', 'Denim Jeans', 'Wool Sweater', 'Running Shoes',
                'Leather Jacket', 'Summer Dress', 'Winter Coat', 'Casual Sneakers',
                'Silk Scarf', 'Baseball Cap', 'Yoga Pants', 'Formal Shirt',
                'Cotton Socks', 'Sports Bra', 'Hiking Boots', 'Beanie Hat'
            ],
            'cost_range' => [20, 200],
        ],
        'Home & Garden' => [
            'names' => [
                'Ceramic Plant Pot', 'Kitchen Towel Set', 'Throw Pillow', 'Wall Clock',
                'Picture Frame', 'Laundry Basket', 'Bath Mat', 'Curtain Rod',
                'Storage Box', 'Coasters Set', 'Wall Art', 'Floor Lamp',
                'Candle Holder', 'Decorative Vase', 'Placemat Set', 'Wall Shelf'
            ],
            'cost_range' => [10, 80],
        ],
        'Books' => [
            'names' => [
                'Fiction Novel', 'Cookbook', 'Biography', 'Science Textbook',
                'Children\'s Book', 'Travel Guide', 'Self-Help Book', 'Poetry Collection',
                'Mystery Novel', 'History Book', 'Art Book', 'Business Guide',
                'Fantasy Novel', 'Health & Fitness', 'Photography Guide', 'Language Learning'
            ],
            'cost_range' => [8, 35],
        ],
        'Sports & Outdoors' => [
            'names' => [
                'Yoga Mat', 'Dumbbells Set', 'Water Bottle', 'Camping Tent',
                'Basketball', 'Tennis Racket', 'Cycling Helmet', 'Swimming Goggles',
                'Running Shorts', 'Hiking Backpack', 'Golf Balls', 'Soccer Ball',
                'Resistance Bands', 'Foam Roller', 'Baseball Glove', 'Fishing Rod'
            ],
            'cost_range' => [15, 120],
        ],
        'Beauty & Personal Care' => [
            'names' => [
                'Facial Cleanser', 'Moisturizing Cream', 'Hair Shampoo', 'Body Lotion',
                'Lip Balm', 'Face Mask', 'Sunscreen', 'Perfume', 'Nail Polish',
                'Hair Brush', 'Makeup Remover', 'Body Scrub', 'Hand Soap', 'Deodorant',
                'Hair Conditioner', 'Facial Toner'
            ],
            'cost_range' => [5, 50],
        ],
        'Toys & Games' => [
            'names' => [
                'Building Blocks', 'Board Game', 'Stuffed Animal', 'Puzzle Set',
                'Action Figure', 'Dolls House', 'Card Game', 'Lego Set',
                'Remote Control Car', 'Art Supplies', 'Musical Instrument', 'Science Kit',
                'Toy Kitchen', 'Plush Toy', 'Board Puzzle', 'Craft Kit'
            ],
            'cost_range' => [8, 60],
        ],
        'Automotive' => [
            'names' => [
                'Car Air Freshener', 'Phone Mount', 'Seat Covers', 'Tire Pressure Gauge',
                'Car Wash Kit', 'Dashboard Organizer', 'Window Tint', 'Floor Mats',
                'Car Vacuum', 'Jump Starter', 'Oil Filter', 'Brake Pads',
                'Car Wax', 'Interior Cleaner', 'License Plate Frame', 'Key Chain'
            ],
            'cost_range' => [5, 75],
        ],
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = (int) $this->argument('count');

        $this->info("Generating {$count} products across 8 categories...");

        $progressBar = $this->output->createProgressBar($count);
        $progressBar->start();

        for ($i = 0; $i < $count; $i++) {
            $this->createRandomProduct();
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info('Product generation completed successfully!');
        $this->info("Created {$count} products in total.");
    }

    /**
     * Create a single random product
     */
    private function createRandomProduct(): void
    {
        // Select random category
        $categoryName = array_rand($this->categories);
        $categoryData = $this->categories[$categoryName];

        // Select random name from category
        $name = $categoryData['names'][array_rand($categoryData['names'])];

        // Add some variation to make names unique
        $name = $this->addVariation($name);

        // Generate cost within range
        $cost = $this->generateCost($categoryData['cost_range']);

        // Price is 30% more than cost
        $price = round($cost * 1.30, 2);

        // Generate random quantity (1-100)
        $quantity = rand(1, 100);

        // Generate description
        $description = $this->generateDescription($name, $categoryName);

        // Create the product
        Product::create([
            'name' => $name,
            'description' => $description,
            'category' => $categoryName,
            'price' => $price,
            'cost' => $cost,
            'quantity' => $quantity,
        ]);
    }

    /**
     * Add variation to product names to make them unique
     */
    private function addVariation(string $name): string
    {
        $variations = [
            'Premium', 'Deluxe', 'Basic', 'Professional', 'Compact', 'Large', 'Small',
            'Wireless', 'Smart', 'Eco-Friendly', 'Durable', 'Lightweight', 'Heavy Duty',
            'Classic', 'Modern', 'Vintage', 'New', 'Original', 'Essential', 'Complete'
        ];

        // 30% chance to add a variation
        if (rand(1, 10) <= 3) {
            $variation = $variations[array_rand($variations)];
            return $variation . ' ' . $name;
        }

        return $name;
    }

    /**
     * Generate a random cost within the given range
     */
    private function generateCost(array $range): float
    {
        $min = $range[0];
        $max = $range[1];

        // Generate cost with some cents variation
        $dollars = rand($min, $max);
        $cents = rand(0, 99);

        return (float) ($dollars . '.' . str_pad($cents, 2, '0', STR_PAD_LEFT));
    }

    /**
     * Generate a realistic description for the product
     */
    private function generateDescription(string $name, string $category): string
    {
        $descriptions = [
            'Electronics' => [
                "High-quality {$name} designed for everyday use. Features advanced technology and reliable performance.",
                "Premium {$name} with modern design and excellent functionality. Perfect for tech enthusiasts.",
                "Durable {$name} built to last. Essential accessory for your electronic devices.",
            ],
            'Clothing' => [
                "Comfortable and stylish {$name} made from premium materials. Perfect for everyday wear.",
                "Fashionable {$name} with excellent fit and quality construction. A wardrobe essential.",
                "Versatile {$name} suitable for various occasions. Made with care and attention to detail.",
            ],
            'Home & Garden' => [
                "Beautiful {$name} that adds style to your home. Crafted with quality materials.",
                "Functional {$name} designed for both beauty and practicality in your living space.",
                "Elegant {$name} that enhances your home decor. Made to last and impress.",
            ],
            'Books' => [
                "Engaging {$name} that captivates readers with its compelling content and storytelling.",
                "Informative {$name} packed with valuable knowledge and insights.",
                "Well-written {$name} that provides entertainment and learning in equal measure.",
            ],
            'Sports & Outdoors' => [
                "High-performance {$name} designed for athletes and outdoor enthusiasts.",
                "Durable {$name} built for active lifestyles and demanding conditions.",
                "Reliable {$name} that supports your fitness and recreational activities.",
            ],
            'Beauty & Personal Care' => [
                "Premium {$name} formulated for excellent results and gentle care.",
                "Effective {$name} that enhances your beauty routine with quality ingredients.",
                "Luxurious {$name} designed for optimal skin and personal care.",
            ],
            'Toys & Games' => [
                "Fun and engaging {$name} that sparks imagination and creativity in children.",
                "Educational {$name} that combines entertainment with learning opportunities.",
                "Exciting {$name} perfect for family fun and memorable moments.",
            ],
            'Automotive' => [
                "Reliable {$name} designed to enhance your driving experience and vehicle maintenance.",
                "Quality {$name} built for automotive enthusiasts and everyday drivers.",
                "Essential {$name} that keeps your vehicle looking and performing its best.",
            ],
        ];

        $categoryDescriptions = $descriptions[$category] ?? ["Quality {$name} perfect for your needs."];
        return $categoryDescriptions[array_rand($categoryDescriptions)];
    }
}
