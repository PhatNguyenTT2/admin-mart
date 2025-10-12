/**
 * Script to seed sample products into database
 * This script will:
 * 1. Create categories if they don't exist
 * 2. Create 15 sample products with all details
 * 3. Create corresponding inventory records
 * 4. Sync product stock with inventory availableStock
 * 
 * Run with: node backend/scripts/seed-products.js
 */

const mongoose = require('mongoose')
const Product = require('../models/product')
const Category = require('../models/category')
const Inventory = require('../models/inventory')
const config = require('../utils/config')

// Product data from admin/src/data/products.js
const PRODUCT_IMAGES = {
  1: "https://www.figma.com/api/mcp/asset/0c995e0e-5422-4f78-8811-4bedf5e98433",
  2: "https://www.figma.com/api/mcp/asset/cf8b1c79-f3fa-4d54-b8d5-09c91ad96992",
  3: "https://www.figma.com/api/mcp/asset/5d070664-bc86-4eb3-8f00-39e11d83bdba",
  4: "https://www.figma.com/api/mcp/asset/38f1291e-0655-4669-92a7-f26025c7b0a4",
  5: "https://www.figma.com/api/mcp/asset/1784331e-c6f3-477d-84ed-9af4dcdafed6",
  6: "https://www.figma.com/api/mcp/asset/392f63cb-d79e-4d4f-9bbb-553671bf7c84",
  7: "https://www.figma.com/api/mcp/asset/c0cd52fc-afbd-4fec-92f5-f4fc4be35096",
  8: "https://www.figma.com/api/mcp/asset/81dd1fd3-63d5-4bbc-8ea6-876ac442bb34",
  9: "https://www.figma.com/api/mcp/asset/27ef38eb-c8bf-416e-b46c-b09eb0b56080",
  10: "https://www.figma.com/api/mcp/asset/1136d3d6-8327-47f2-b8fa-2da8f9afa825",
  11: "https://www.figma.com/api/mcp/asset/dfee1f73-b070-4898-bd8d-e2fa454c3b5d",
  12: "https://www.figma.com/api/mcp/asset/ba0cd317-3129-4ad2-ac6f-49a67075b92d",
  13: "https://www.figma.com/api/mcp/asset/d3059143-78ad-4b03-9746-d4f6a84817fa",
  14: "https://www.figma.com/api/mcp/asset/6605c5f3-6bbc-4cc2-bd33-9b7d969a480a",
  15: "https://www.figma.com/api/mcp/asset/1c1c7616-72a4-4bc5-97ce-113b44013604",
}

const SAMPLE_PRODUCTS = [
  {
    name: "Seeds of Change Organic Quinoa, Brown",
    categoryName: "Baking material",
    image: PRODUCT_IMAGES[1],
    price: 28.85,
    originalPrice: 32.8,
    rating: 4.0,
    reviewCount: 32,
    vendor: "NestFood",
    description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aliquam rem officia, corrupti reiciendis minima nisi modi, quasi, odio minus dolore impedit fuga eum eligendi.",
    sku: "FWM15VKT",
    tags: ["Snack", "Organic", "Brown"],
    type: "Organic",
    inventoryData: { quantityOnHand: 85, quantityReserved: 12, reorderPoint: 20, location: 'Shelf-A-1' },
    detailDescription: {
      intro: [
        "Uninhibited carnally hired played in whimpered dear gorilla koala depending and much yikes off far quetzal goodness and from for grimaced goodness unaccountably and meadowlark near unblushingly crucial scallop tightly neurotic hungrily some and dear furiously this apart.",
        "Spluttered narrowly yikes left moth in yikes bowed this that grizzly much hello on spoon-fed that alas rethought much decently richly and wow against the frequent fluidly at formidable acceptably flapped besides and much circa far over the bucolically hey precarious goldfinch mastodon goodness gnashed a jellyfish and one however because."
      ],
      specifications: [
        { label: 'Type Of Packing', value: 'Bottle' },
        { label: 'Color', value: 'Green, Pink, Powder Blue, Purple' },
        { label: 'Quantity Per Case', value: '100ml' },
        { label: 'Ethyl Alcohol', value: '70%' },
        { label: 'Piece In One', value: 'Carton' },
      ],
      additionalDesc: "Laconic overheard dear woodchuck wow this outrageously taut beaver hey hello far meadowlark imitatively egregiously hugged that yikes minimally unanimous pouted flirtatiously as beaver beheld above forward energetic across this jeepers beneficently cockily less a the raucously that magic upheld far so the this where crud then below after jeez enchanting drunkenly more much wow callously irrespective limpet.",
      packaging: [
        "Less lion goodness that euphemistically robin expeditiously bluebird smugly scratched far while thus cackled sheepishly rigid after due one assenting regarding censorious while occasional or this more crane went more as this less much amid overhung anathematic because much held one exuberantly sheep goodness so where rat wry well concomitantly.",
        "Scallop or far crud plain remarkably far by thus far iguana lewd precociously and and less rattlesnake contrary caustic wow this near alas and next and pled the yikes articulate about as less cackled dalmatian in much less well jeering for the thanks blindly sentimental whimpered less across objectively fanciful grimaced wildly some wow and rose jeepers outgrew lugubrious luridly irrationally attractively dachshund."
      ],
      suggestedUse: ['Refrigeration not necessary.', 'Stir before serving'],
      otherIngredients: [
        'Organic raw pecans, organic raw cashews.',
        'This butter was produced using a LTG (Low Temperature Grinding) process',
        'Made in machinery that processes tree nuts but does not process peanuts, gluten, dairy or soy',
      ],
      warnings: ['Oil separation occurs naturally. May contain pieces of shell.']
    }
  },
  {
    name: "All Natural Italian-Style Chicken Meatballs",
    categoryName: "Meats",
    image: PRODUCT_IMAGES[2],
    price: 52.85,
    originalPrice: 55.8,
    rating: 4.0,
    reviewCount: 28,
    vendor: "Stouffer",
    description: "High-quality chicken meatballs made with all natural ingredients and Italian herbs.",
    sku: "STF298KL",
    tags: ["Meat", "Italian", "Natural"],
    type: "Natural",
    inventoryData: { quantityOnHand: 55, quantityReserved: 7, reorderPoint: 20, location: 'Freezer-B-2' },
    detailDescription: {
      intro: [
        "Crafted with premium all-natural ingredients, these Italian-style chicken meatballs deliver authentic Mediterranean flavors in every bite.",
        "Each meatball is carefully seasoned with aromatic herbs including basil, oregano, and garlic, then slow-cooked to perfection."
      ],
      specifications: [
        { label: 'Type Of Packing', value: 'Frozen Package' },
        { label: 'Weight', value: '2 lbs (32 oz)' },
        { label: 'Serving Size', value: '4 meatballs (85g)' },
        { label: 'Protein Content', value: '18g per serving' },
        { label: 'Storage', value: 'Keep Frozen' },
      ],
      additionalDesc: "These meatballs are perfect for pasta dishes, sandwiches, or served as appetizers.",
      packaging: [
        "Each package is vacuum-sealed to preserve freshness and flavor.",
        "Resealable packaging allows for convenient storage and portion control."
      ],
      suggestedUse: ['Cook from frozen - do not thaw', 'Heat in oven at 350°F for 15-20 minutes'],
      otherIngredients: ['Ground chicken, breadcrumbs, eggs, Italian herbs', 'Natural seasonings: garlic, onion, basil, oregano'],
      warnings: ['Keep frozen until ready to cook', 'Cook thoroughly to internal temperature of 165°F']
    }
  },
  {
    name: "Angie's Boomchickapop Sweet & Salty",
    categoryName: "Baking material",
    image: PRODUCT_IMAGES[3],
    price: 48.85,
    originalPrice: 52.8,
    rating: 4.0,
    reviewCount: 45,
    vendor: "StarKist",
    description: "Delicious sweet and salty popcorn perfect for snacking anytime.",
    sku: "ANG487PQ",
    tags: ["Snack", "Sweet", "Salty"],
    type: "Snack",
    inventoryData: { quantityOnHand: 85, quantityReserved: 12, reorderPoint: 20, location: 'Shelf-A-1' },
    detailDescription: {
      intro: [
        "Experience the perfect balance of sweet and salty in every kernel with Angie's Boomchickapop.",
        "Made with simple, wholesome ingredients and popped to perfection."
      ],
      specifications: [
        { label: 'Type Of Packing', value: 'Resealable Bag' },
        { label: 'Net Weight', value: '6 oz (170g)' },
        { label: 'Calories', value: '150 per serving' },
        { label: 'Gluten Free', value: 'Yes' },
      ],
      additionalDesc: "This artisanal popcorn is made in small batches to ensure maximum freshness.",
      packaging: ["The resealable bag design keeps the popcorn fresh and crunchy."],
      suggestedUse: ['Store in a cool, dry place', 'Reseal bag after opening'],
      otherIngredients: ['Non-GMO popcorn, cane sugar, sea salt', 'Natural vanilla flavor, coconut oil'],
      warnings: ['May contain traces of nuts']
    }
  },
  {
    name: "Foster Farms Takeout Crispy Classic",
    categoryName: "Meats",
    image: PRODUCT_IMAGES[4],
    price: 17.85,
    originalPrice: 19.8,
    rating: 4.0,
    reviewCount: 23,
    vendor: "NestFood",
    description: "Crispy and delicious chicken perfect for quick meals.",
    sku: "FF789XY",
    tags: ["Chicken", "Crispy", "Quick"],
    type: "Frozen",
    inventoryData: { quantityOnHand: 0, quantityReserved: 0, reorderPoint: 20, location: 'Freezer-A-2' },
    detailDescription: {
      intro: ["Foster Farms Takeout Crispy Classic brings restaurant-quality fried chicken to your home."],
      specifications: [
        { label: 'Type Of Packing', value: 'Frozen Box' },
        { label: 'Weight', value: '24 oz (680g)' },
        { label: 'Cook Time', value: '25-30 minutes' },
      ],
      additionalDesc: "Perfect for busy weeknights or weekend gatherings.",
      packaging: ["Individually quick-frozen pieces ensure optimal freshness."],
      suggestedUse: ['Cook from frozen', 'Preheat oven to 375°F'],
      otherIngredients: ['Fresh chicken, wheat flour, seasoning blend'],
      warnings: ['Keep frozen until ready to cook']
    }
  },
  {
    name: "Blue Diamond Almonds Lightly Salted",
    categoryName: "Baking material",
    image: PRODUCT_IMAGES[5],
    price: 23.85,
    originalPrice: 25.8,
    rating: 4.0,
    reviewCount: 67,
    vendor: "NestFood",
    description: "Premium lightly salted almonds, perfect for healthy snacking.",
    sku: "BD456MN",
    tags: ["Nuts", "Healthy", "Salted"],
    type: "Natural",
    inventoryData: { quantityOnHand: 45, quantityReserved: 5, reorderPoint: 15, location: 'Shelf-A-2' },
    detailDescription: {
      intro: ["Blue Diamond Almonds Lightly Salted offers the perfect balance of natural almond flavor."],
      specifications: [
        { label: 'Type Of Packing', value: 'Resealable Can' },
        { label: 'Net Weight', value: '16 oz (454g)' },
        { label: 'Protein', value: '6g per serving' },
      ],
      additionalDesc: "Packed with protein and healthy fats.",
      packaging: ["Convenient resealable can keeps almonds fresh."],
      suggestedUse: ['Great for snacking', 'Perfect addition to salads'],
      otherIngredients: ['Dry roasted almonds, sea salt'],
      warnings: ['Contains tree nuts (almonds)']
    }
  },
  {
    name: "Chobani Complete Vanilla Greek Yogurt",
    categoryName: "Milks & Dairies",
    image: PRODUCT_IMAGES[6],
    price: 54.85,
    originalPrice: 59.8,
    rating: 4.0,
    reviewCount: 89,
    vendor: "NestFood",
    description: "Rich and creamy Greek yogurt with natural vanilla flavor.",
    sku: "CHO123VG",
    tags: ["Yogurt", "Greek", "Vanilla"],
    type: "Dairy",
    inventoryData: { quantityOnHand: 120, quantityReserved: 15, reorderPoint: 30, location: 'Cooler-A-1' },
    detailDescription: {
      intro: ["Chobani Complete Vanilla Greek Yogurt delivers rich, creamy texture."],
      specifications: [
        { label: 'Type Of Packing', value: 'Plastic Container' },
        { label: 'Weight', value: '32 oz (907g)' },
        { label: 'Protein', value: '15g per serving' },
      ],
      additionalDesc: "Packed with protein and probiotics.",
      packaging: ["Recyclable plastic container with secure lid."],
      suggestedUse: ['Refrigerate at 40°F or below', 'Consume within 7 days of opening'],
      otherIngredients: ['Cultured pasteurized skim milk, natural vanilla flavor'],
      warnings: ['Contains milk']
    }
  },
  {
    name: "Canada Dry Ginger Ale – 2 L Bottle",
    categoryName: "Baking material",
    image: PRODUCT_IMAGES[7],
    price: 32.85,
    originalPrice: 33.8,
    rating: 4.0,
    reviewCount: 156,
    vendor: "NestFood",
    description: "Refreshing ginger ale with natural ginger flavor.",
    sku: "CD789GA",
    tags: ["Beverage", "Ginger", "Refreshing"],
    type: "Beverage",
    inventoryData: { quantityOnHand: 12, quantityReserved: 2, reorderPoint: 25, location: 'Shelf-B-1' },
    detailDescription: {
      intro: ["Canada Dry Ginger Ale has been America's favorite ginger ale since 1904."],
      specifications: [
        { label: 'Type Of Packing', value: 'Plastic Bottle' },
        { label: 'Volume', value: '2 Liters (67.6 fl oz)' },
        { label: 'Caffeine', value: 'Caffeine-free' },
      ],
      additionalDesc: "Made with real ginger extract.",
      packaging: ["2-liter bottle perfect for families."],
      suggestedUse: ['Serve chilled over ice', 'Great mixer for cocktails'],
      otherIngredients: ['Carbonated water, natural ginger flavor'],
      warnings: ['Contains sugar']
    }
  },
  {
    name: "Encore Seafoods Stuffed Alaskan Salmon",
    categoryName: "Meats",
    image: PRODUCT_IMAGES[8],
    price: 35.85,
    originalPrice: 37.8,
    rating: 4.0,
    reviewCount: 34,
    vendor: "NestFood",
    description: "Premium Alaskan salmon stuffed with delicious seafood mixture.",
    sku: "ENC567AS",
    tags: ["Seafood", "Salmon", "Premium"],
    type: "Fresh",
    inventoryData: { quantityOnHand: 8, quantityReserved: 0, reorderPoint: 10, location: 'Freezer-A-1' },
    detailDescription: {
      intro: ["Wild-caught from the pristine waters of Alaska."],
      specifications: [
        { label: 'Type Of Packing', value: 'Vacuum Sealed' },
        { label: 'Weight', value: '8 oz (227g) per fillet' },
        { label: 'Wild Caught', value: 'Alaska' },
      ],
      additionalDesc: "Stuffed with premium crab meat and herbs.",
      packaging: ["Vacuum-sealed for freshness."],
      suggestedUse: ['Thaw in refrigerator', 'Bake at 400°F for 20-25 minutes'],
      otherIngredients: ['Wild Alaskan salmon, crab meat, breadcrumbs'],
      warnings: ['Contains shellfish and fish']
    }
  },
  {
    name: "Gorton's Beer Battered Fish Fillets",
    categoryName: "Meats",
    image: PRODUCT_IMAGES[9],
    price: 23.85,
    originalPrice: 25.8,
    rating: 4.0,
    reviewCount: 78,
    vendor: "Old El Paso",
    description: "Crispy beer battered fish fillets, easy to prepare.",
    sku: "GOR890BF",
    tags: ["Fish", "Battered", "Frozen"],
    type: "Frozen",
    inventoryData: { quantityOnHand: 35, quantityReserved: 5, reorderPoint: 15, location: 'Freezer-B-1' },
    detailDescription: {
      intro: ["Pub-style fish and chips at home."],
      specifications: [
        { label: 'Type Of Packing', value: 'Frozen Box' },
        { label: 'Weight', value: '18.3 oz (519g)' },
        { label: 'Fish Type', value: 'Alaska Pollock' },
      ],
      additionalDesc: "Light, crispy beer batter coating.",
      packaging: ["Resealable box for freshness."],
      suggestedUse: ['Cook from frozen', 'Preheat oven to 425°F'],
      otherIngredients: ['Alaska Pollock, wheat flour, beer'],
      warnings: ['Contains fish and wheat']
    }
  },
  {
    name: "Haagen-Dazs Caramel Cone Ice Cream",
    categoryName: "Milks & Dairies",
    image: PRODUCT_IMAGES[10],
    price: 22.85,
    originalPrice: 24.8,
    rating: 4.0,
    reviewCount: 123,
    vendor: "Tyson",
    description: "Premium ice cream with caramel swirls and cone pieces.",
    sku: "HD234CC",
    tags: ["Ice Cream", "Caramel", "Premium"],
    type: "Frozen",
    inventoryData: { quantityOnHand: 14, quantityReserved: 2, reorderPoint: 20, location: 'Freezer-C-1' },
    detailDescription: {
      intro: ["Premium ice cream with rich caramel flavor."],
      specifications: [
        { label: 'Type Of Packing', value: 'Pint Container' },
        { label: 'Volume', value: '14 oz (414ml)' },
      ],
      additionalDesc: "Made with finest ingredients.",
      packaging: ["Secure lid maintains freshness."],
      suggestedUse: ['Keep frozen', 'Let soften for 5 minutes before serving'],
      otherIngredients: ['Cream, milk, sugar, caramel'],
      warnings: ['Contains dairy']
    }
  },
  {
    name: "Fresh Organic Broccoli Crowns",
    categoryName: "Vegetables",
    image: PRODUCT_IMAGES[11],
    price: 15.85,
    originalPrice: 17.8,
    rating: 4.0,
    reviewCount: 45,
    vendor: "NestFood",
    description: "Fresh organic broccoli crowns, rich in vitamins and minerals.",
    sku: "FOB345BC",
    tags: ["Vegetable", "Organic", "Fresh"],
    type: "Organic",
    inventoryData: { quantityOnHand: 65, quantityReserved: 8, reorderPoint: 20, location: 'Produce-A-1' },
    detailDescription: {
      intro: ["Fresh organic broccoli packed with nutrients."],
      specifications: [
        { label: 'Type Of Packing', value: 'Fresh Bundle' },
        { label: 'Weight', value: '1 lb (454g)' },
      ],
      additionalDesc: "Rich in vitamins C and K.",
      packaging: ["Bundled for freshness."],
      suggestedUse: ['Refrigerate immediately', 'Use within 5 days'],
      otherIngredients: ['100% organic broccoli'],
      warnings: ['Wash before consuming']
    }
  },
  {
    name: "Fresh Organic Strawberries",
    categoryName: "Fresh Fruits",
    image: PRODUCT_IMAGES[12],
    price: 28.85,
    originalPrice: 32.8,
    rating: 4.0,
    reviewCount: 67,
    vendor: "NestFood",
    description: "Sweet and juicy organic strawberries, perfect for desserts.",
    sku: "FOS678ST",
    tags: ["Fruit", "Organic", "Sweet"],
    type: "Organic",
    inventoryData: { quantityOnHand: 18, quantityReserved: 3, reorderPoint: 25, location: 'Produce-B-1' },
    detailDescription: {
      intro: ["Sweet, juicy organic strawberries."],
      specifications: [
        { label: 'Type Of Packing', value: 'Clamshell Container' },
        { label: 'Weight', value: '1 lb (454g)' },
      ],
      additionalDesc: "Perfect for desserts and snacking.",
      packaging: ["Clear clamshell for visibility."],
      suggestedUse: ['Refrigerate', 'Use within 3-5 days'],
      otherIngredients: ['100% organic strawberries'],
      warnings: ['Wash before eating']
    }
  },
  {
    name: "Fresh Organic Bananas",
    categoryName: "Fresh Fruits",
    image: PRODUCT_IMAGES[13],
    price: 12.85,
    originalPrice: 15.8,
    rating: 4.0,
    reviewCount: 89,
    vendor: "NestFood",
    description: "Fresh organic bananas, great source of potassium and energy.",
    sku: "FOB901BN",
    tags: ["Fruit", "Organic", "Potassium"],
    type: "Organic",
    inventoryData: { quantityOnHand: 150, quantityReserved: 25, reorderPoint: 40, location: 'Produce-A-2' },
    detailDescription: {
      intro: ["Fresh organic bananas rich in potassium."],
      specifications: [
        { label: 'Type Of Packing', value: 'Bunch' },
        { label: 'Weight', value: '2-3 lbs per bunch' },
      ],
      additionalDesc: "Great for smoothies and baking.",
      packaging: ["Sold by bunch."],
      suggestedUse: ['Store at room temperature', 'Refrigerate when ripe'],
      otherIngredients: ['100% organic bananas'],
      warnings: ['Natural product - size may vary']
    }
  },
  {
    name: "Fresh Organic Carrots",
    categoryName: "Vegetables",
    image: PRODUCT_IMAGES[14],
    price: 8.85,
    originalPrice: 10.8,
    rating: 4.0,
    reviewCount: 56,
    vendor: "NestFood",
    description: "Crisp and sweet organic carrots, perfect for cooking or snacking.",
    sku: "FOC234CR",
    tags: ["Vegetable", "Organic", "Sweet"],
    type: "Organic",
    inventoryData: { quantityOnHand: 50, quantityReserved: 10, reorderPoint: 15, location: 'Produce-A-3' },
    detailDescription: {
      intro: ["Crisp, sweet organic carrots."],
      specifications: [
        { label: 'Type Of Packing', value: 'Bag' },
        { label: 'Weight', value: '2 lbs (907g)' },
      ],
      additionalDesc: "Perfect for cooking or snacking.",
      packaging: ["Plastic bag packaging."],
      suggestedUse: ['Refrigerate', 'Use within 2 weeks'],
      otherIngredients: ['100% organic carrots'],
      warnings: ['Wash and peel before use']
    }
  },
  {
    name: "Organic Whole Milk",
    categoryName: "Milks & Dairies",
    image: PRODUCT_IMAGES[15],
    price: 18.85,
    originalPrice: 22.8,
    rating: 4.0,
    reviewCount: 234,
    vendor: "NestFood",
    description: "Fresh organic whole milk from grass-fed cows.",
    sku: "OWM567ML",
    tags: ["Milk", "Organic", "Whole"],
    type: "Organic",
    inventoryData: { quantityOnHand: 95, quantityReserved: 18, reorderPoint: 30, location: 'Cooler-B-1' },
    detailDescription: {
      intro: ["Fresh organic whole milk from grass-fed cows."],
      specifications: [
        { label: 'Type Of Packing', value: 'Carton' },
        { label: 'Volume', value: 'Half Gallon (64 oz)' },
        { label: 'Fat Content', value: 'Whole (3.25%)' },
      ],
      additionalDesc: "From pasture-raised, grass-fed cows.",
      packaging: ["Resealable carton for freshness."],
      suggestedUse: ['Keep refrigerated', 'Shake well before use'],
      otherIngredients: ['Organic Grade A milk, Vitamin D3'],
      warnings: ['Contains milk', 'Keep refrigerated']
    }
  }
]

const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const seedProducts = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(config.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if products already exist
    const existingProducts = await Product.find()
    if (existingProducts.length > 0) {
      console.log(`\n⚠️  Database already has ${existingProducts.length} products.`)
      console.log('Do you want to continue? This will clear existing products.')
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...')
      await new Promise(resolve => setTimeout(resolve, 5000))

      console.log('\nClearing existing products and inventory...')
      await Product.deleteMany({})
      await Inventory.deleteMany({})
      console.log('✓ Cleared existing data')
    }

    // Step 1: Create categories
    console.log('\n📁 Creating categories...')
    const categoryMap = {}
    const uniqueCategories = [...new Set(SAMPLE_PRODUCTS.map(p => p.categoryName))]

    for (const catName of uniqueCategories) {
      let category = await Category.findOne({ name: catName })

      if (!category) {
        category = new Category({
          name: catName,
          slug: createSlug(catName),
          description: `${catName} category`,
          isActive: true
        })
        await category.save()
        console.log(`  ✓ Created category: ${catName}`)
      } else {
        console.log(`  ℹ Category already exists: ${catName}`)
      }

      categoryMap[catName] = category._id
    }

    // Step 2: Create products
    console.log('\n📦 Creating products...')
    const createdProducts = []

    for (const productData of SAMPLE_PRODUCTS) {
      const { inventoryData, categoryName, ...productFields } = productData

      // Calculate initial stock from inventory
      const initialStock = inventoryData.quantityOnHand - inventoryData.quantityReserved

      const product = new Product({
        ...productFields,
        category: categoryMap[categoryName],
        slug: createSlug(productData.name),
        stock: initialStock,
        isInStock: initialStock > 0,
        isActive: true,
        isFeatured: Math.random() > 0.7, // 30% chance to be featured
      })

      await product.save()
      createdProducts.push({ product, inventoryData })
      console.log(`  ✓ Created: ${product.sku} - ${product.name} (Stock: ${initialStock})`)
    }

    // Step 3: Create inventory records
    console.log('\n📊 Creating inventory records...')

    for (const { product, inventoryData } of createdProducts) {
      const quantityAvailable = inventoryData.quantityOnHand - inventoryData.quantityReserved
      const isOutOfStock = inventoryData.quantityOnHand === 0

      // Calculate reorder quantity as 2x reorder point
      const reorderQuantity = inventoryData.reorderPoint * 2

      // Last restocked: random date in past 1-30 days (or null if out of stock)
      const daysAgo = isOutOfStock ? null : Math.floor(Math.random() * 30) + 1
      const lastRestocked = isOutOfStock ? null : new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

      const inventory = new Inventory({
        product: product._id,
        quantityOnHand: inventoryData.quantityOnHand,
        quantityReserved: inventoryData.quantityReserved,
        quantityAvailable: quantityAvailable,
        reorderPoint: inventoryData.reorderPoint,
        reorderQuantity: reorderQuantity,
        warehouseLocation: inventoryData.location,
        lastRestocked: lastRestocked
      })

      await inventory.save()
      console.log(`  ✓ Inventory: ${product.sku} - Available: ${quantityAvailable}`)
    }

    // Step 4: Display summary
    const allProducts = await Product.find().populate('category', 'name')
    const allInventory = await Inventory.find().populate('product', 'name sku')
    const lowStock = allInventory.filter(inv => inv.quantityAvailable > 0 && inv.quantityAvailable <= inv.reorderPoint)
    const outOfStock = allInventory.filter(inv => inv.quantityAvailable === 0)
    const inStock = allInventory.filter(inv => inv.quantityAvailable > inv.reorderPoint)

    console.log('\n' + '='.repeat(70))
    console.log('✅ SEED COMPLETED SUCCESSFULLY')
    console.log('='.repeat(70))
    console.log(`\n📦 Products Created: ${allProducts.length}`)
    console.log(`📁 Categories Used: ${Object.keys(categoryMap).length}`)
    console.log(`\n📊 Inventory Status:`)
    console.log(`   ✅ In Stock:     ${inStock.length} (above reorder point)`)
    console.log(`   ⚠️  Low Stock:    ${lowStock.length} (at or below reorder point)`)
    console.log(`   ❌ Out of Stock: ${outOfStock.length} (needs reorder)`)

    console.log('\n' + '='.repeat(70))
    console.log('📋 PRODUCT LIST')
    console.log('='.repeat(70))

    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i]
      const inventory = allInventory.find(inv => inv.product._id.toString() === product._id.toString())
      const statusIcon = inventory.quantityAvailable === 0 ? '❌' :
        inventory.quantityAvailable <= inventory.reorderPoint ? '⚠️ ' : '✅'

      console.log(`\n${i + 1}. ${statusIcon} ${product.sku} - ${product.name}`)
      console.log(`   Category: ${product.category.name}`)
      console.log(`   Price: $${product.price} (Original: $${product.originalPrice})`)
      console.log(`   Stock: ${product.stock} | Location: ${inventory.warehouseLocation}`)
      console.log(`   Rating: ${product.rating}⭐ (${product.reviewCount} reviews)`)
    }

    console.log('\n' + '='.repeat(70))
    console.log('🎉 All done! Your database is ready with sample products.')
    console.log('='.repeat(70))

    await mongoose.connection.close()
    console.log('\n✓ Database connection closed.')
    process.exit(0)

  } catch (error) {
    console.error('\n❌ Error seeding products:', error)
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close()
    }
    process.exit(1)
  }
}

// Run seed
seedProducts()
