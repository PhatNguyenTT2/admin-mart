/**
 * Script to seed sample customers into database
 * This script will create diverse customer profiles with realistic data
 * 
 * Run with: node backend/scripts/seed-customers.js
 */

const mongoose = require('mongoose')
const Customer = require('../models/customer')
const config = require('../utils/config')

// Sample customer data
const SAMPLE_CUSTOMERS = [
  {
    fullName: "Nguyễn Văn An",
    email: "nguyenvanan@gmail.com",
    phone: "0901234567",
    address: {
      street: "123 Nguyễn Huệ",
      city: "Ho Chi Minh City",
      state: "Ho Chi Minh",
      zipCode: "700000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1985-03-15"),
    gender: "male",
    customerType: "retail",
    loyaltyPoints: 150,
    totalPurchases: 12,
    totalSpent: 5250000,
    notes: "Regular customer, prefers organic products",
    isActive: true
  },
  {
    fullName: "Trần Thị Bình",
    email: "tranthibinh@gmail.com",
    phone: "0912345678",
    address: {
      street: "456 Lê Lợi",
      city: "Hanoi",
      state: "Hanoi",
      zipCode: "100000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1990-07-22"),
    gender: "female",
    customerType: "wholesale",
    loyaltyPoints: 850,
    totalPurchases: 45,
    totalSpent: 25000000,
    notes: "Wholesale buyer, runs a small grocery store",
    isActive: true
  },
  {
    fullName: "Lê Minh Cường",
    email: "leminhcuong@yahoo.com",
    phone: "0923456789",
    address: {
      street: "789 Trần Hưng Đạo",
      city: "Da Nang",
      state: "Da Nang",
      zipCode: "550000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1982-11-08"),
    gender: "male",
    customerType: "vip",
    loyaltyPoints: 2500,
    totalPurchases: 120,
    totalSpent: 55000000,
    notes: "VIP customer, restaurant owner, large orders",
    isActive: true
  },
  {
    fullName: "Phạm Thu Hà",
    email: "phamthuha@outlook.com",
    phone: "0934567890",
    address: {
      street: "321 Hai Bà Trưng",
      city: "Ho Chi Minh City",
      state: "Ho Chi Minh",
      zipCode: "700000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1995-05-30"),
    gender: "female",
    customerType: "retail",
    loyaltyPoints: 85,
    totalPurchases: 8,
    totalSpent: 3200000,
    notes: "Young professional, shops weekly",
    isActive: true
  },
  {
    fullName: "Hoàng Đức Anh",
    email: "hoangducanh@gmail.com",
    phone: "0945678901",
    address: {
      street: "654 Lý Thường Kiệt",
      city: "Can Tho",
      state: "Can Tho",
      zipCode: "900000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1988-09-12"),
    gender: "male",
    customerType: "retail",
    loyaltyPoints: 320,
    totalPurchases: 28,
    totalSpent: 8500000,
    notes: "Prefers fresh produce and dairy products",
    isActive: true
  },
  {
    fullName: "Võ Thị Mai",
    email: "vothimai@hotmail.com",
    phone: "0956789012",
    address: {
      street: "147 Điện Biên Phủ",
      city: "Hue",
      state: "Thua Thien Hue",
      zipCode: "530000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1992-02-18"),
    gender: "female",
    customerType: "retail",
    loyaltyPoints: 45,
    totalPurchases: 5,
    totalSpent: 1850000,
    notes: "New customer, health-conscious",
    isActive: true
  },
  {
    fullName: "Đặng Văn Bảo",
    email: "dangvanbao@gmail.com",
    phone: "0967890123",
    address: {
      street: "258 Võ Văn Kiệt",
      city: "Nha Trang",
      state: "Khanh Hoa",
      zipCode: "650000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1978-12-25"),
    gender: "male",
    customerType: "wholesale",
    loyaltyPoints: 1200,
    totalPurchases: 65,
    totalSpent: 32000000,
    notes: "Hotel owner, bulk orders for kitchen",
    isActive: true
  },
  {
    fullName: "Bùi Thanh Lan",
    email: "buithanhlan@gmail.com",
    phone: "0978901234",
    address: {
      street: "369 Quang Trung",
      city: "Vung Tau",
      state: "Ba Ria - Vung Tau",
      zipCode: "790000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1993-06-14"),
    gender: "female",
    customerType: "retail",
    loyaltyPoints: 180,
    totalPurchases: 15,
    totalSpent: 6200000,
    notes: "Family shopper, buys in bulk monthly",
    isActive: true
  },
  {
    fullName: "Đinh Quang Huy",
    email: "dinhquanghuy@yahoo.com",
    phone: "0989012345",
    address: {
      street: "741 Phan Đình Phùng",
      city: "Hai Phong",
      state: "Hai Phong",
      zipCode: "180000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1987-04-03"),
    gender: "male",
    customerType: "retail",
    loyaltyPoints: 95,
    totalPurchases: 10,
    totalSpent: 4100000,
    notes: "Seafood enthusiast, regular buyer",
    isActive: true
  },
  {
    fullName: "Lý Thị Ngọc",
    email: "lythingoc@outlook.com",
    phone: "0990123456",
    address: {
      street: "852 Hùng Vương",
      city: "Quy Nhon",
      state: "Binh Dinh",
      zipCode: "820000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1991-08-20"),
    gender: "female",
    customerType: "retail",
    loyaltyPoints: 210,
    totalPurchases: 18,
    totalSpent: 7500000,
    notes: "Vegetarian, buys organic vegetables",
    isActive: true
  },
  {
    fullName: "Trương Minh Tuấn",
    email: "truongminhtuan@gmail.com",
    phone: "0901122334",
    address: {
      street: "963 Lê Duẩn",
      city: "Buon Ma Thuot",
      state: "Dak Lak",
      zipCode: "630000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1984-10-10"),
    gender: "male",
    customerType: "wholesale",
    loyaltyPoints: 680,
    totalPurchases: 38,
    totalSpent: 22500000,
    notes: "Coffee shop owner, regular orders",
    isActive: true
  },
  {
    fullName: "Phan Thị Kim",
    email: "phanthikim@hotmail.com",
    phone: "0912233445",
    address: {
      street: "159 Nguyễn Thị Minh Khai",
      city: "Ho Chi Minh City",
      state: "Ho Chi Minh",
      zipCode: "700000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1989-01-28"),
    gender: "female",
    customerType: "retail",
    loyaltyPoints: 125,
    totalPurchases: 14,
    totalSpent: 5800000,
    notes: "Works nearby, lunch shopper",
    isActive: true
  },
  {
    fullName: "Ngô Văn Long",
    email: "ngovanlong@gmail.com",
    phone: "0923344556",
    address: {
      street: "357 Cách Mạng Tháng 8",
      city: "Bien Hoa",
      state: "Dong Nai",
      zipCode: "810000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1980-07-05"),
    gender: "male",
    customerType: "vip",
    loyaltyPoints: 3200,
    totalPurchases: 156,
    totalSpent: 72000000,
    notes: "Long-term VIP, catering business",
    isActive: true
  },
  {
    fullName: "Đỗ Thị Hương",
    email: "dothihuong@yahoo.com",
    phone: "0934455667",
    address: {
      street: "486 Nguyễn Văn Linh",
      city: "Da Lat",
      state: "Lam Dong",
      zipCode: "670000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1994-11-16"),
    gender: "female",
    customerType: "retail",
    loyaltyPoints: 68,
    totalPurchases: 7,
    totalSpent: 2900000,
    notes: "Tourist guide, occasional shopper",
    isActive: true
  },
  {
    fullName: "Cao Minh Đức",
    email: "caominhduc@outlook.com",
    phone: "0945566778",
    address: {
      street: "753 Tôn Đức Thắng",
      city: "Rach Gia",
      state: "Kien Giang",
      zipCode: "920000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1986-03-22"),
    gender: "male",
    customerType: "retail",
    loyaltyPoints: 155,
    totalPurchases: 16,
    totalSpent: 6400000,
    notes: "Fisherman, buys supplies weekly",
    isActive: true
  },
  {
    fullName: "Mai Thị Tâm",
    email: "maithitam@gmail.com",
    phone: "0956677889",
    address: {
      street: "246 Bà Triệu",
      city: "Thai Nguyen",
      state: "Thai Nguyen",
      zipCode: "250000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1996-09-07"),
    gender: "female",
    customerType: "retail",
    loyaltyPoints: 30,
    totalPurchases: 3,
    totalSpent: 1250000,
    notes: "University student, budget shopper",
    isActive: true
  },
  {
    fullName: "Huỳnh Văn Phúc",
    email: "huynhvanphuc@hotmail.com",
    phone: "0967788990",
    address: {
      street: "579 Lý Tự Trọng",
      city: "My Tho",
      state: "Tien Giang",
      zipCode: "860000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1983-12-11"),
    gender: "male",
    customerType: "wholesale",
    loyaltyPoints: 920,
    totalPurchases: 52,
    totalSpent: 28500000,
    notes: "Market vendor, weekly bulk purchases",
    isActive: true
  },
  {
    fullName: "Vũ Thị Lan Anh",
    email: "vuthilananh@gmail.com",
    phone: "0978899001",
    address: {
      street: "135 Hoàng Hoa Thám",
      city: "Phan Thiet",
      state: "Binh Thuan",
      zipCode: "800000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1990-05-19"),
    gender: "female",
    customerType: "retail",
    loyaltyPoints: 190,
    totalPurchases: 19,
    totalSpent: 7200000,
    notes: "Resort staff, shops for family",
    isActive: true
  },
  {
    fullName: "Lương Quốc Tuấn",
    email: "luongquoctuan@yahoo.com",
    phone: "0989900112",
    address: {
      street: "864 Trần Phú",
      city: "Vinh",
      state: "Nghe An",
      zipCode: "460000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1981-02-26"),
    gender: "male",
    customerType: "retail",
    loyaltyPoints: 245,
    totalPurchases: 22,
    totalSpent: 8900000,
    notes: "Teacher, weekend shopper",
    isActive: true
  },
  {
    fullName: "Đoàn Thị Thanh",
    email: "doanthithanh@outlook.com",
    phone: "0990011223",
    address: {
      street: "427 Võ Nguyên Giáp",
      city: "Thanh Hoa",
      state: "Thanh Hoa",
      zipCode: "440000",
      country: "Vietnam"
    },
    dateOfBirth: new Date("1997-08-04"),
    gender: "female",
    customerType: "retail",
    loyaltyPoints: 42,
    totalPurchases: 4,
    totalSpent: 1680000,
    notes: "Recently moved to area, new customer",
    isActive: true
  }
]

const seedCustomers = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(config.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if customers already exist
    const existingCustomers = await Customer.find()
    if (existingCustomers.length > 0) {
      console.log(`\n⚠️  Database already has ${existingCustomers.length} customers.`)
      console.log('Do you want to continue? This will clear existing customers.')
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...')
      await new Promise(resolve => setTimeout(resolve, 5000))

      console.log('\nClearing existing customers...')
      await Customer.deleteMany({})
      console.log('✓ Cleared existing customer data')
    }

    console.log('\n👥 Creating customers...')

    // Create customers one by one to trigger pre-save hooks
    const createdCustomers = []
    for (const customerData of SAMPLE_CUSTOMERS) {
      const customer = new Customer(customerData)
      await customer.save()
      createdCustomers.push(customer)
      console.log(`  ✓ Created: ${customer.customerCode} - ${customer.fullName}`)
    }

    console.log(`\n✓ Total created: ${createdCustomers.length} customers`)    // Display summary
    const allCustomers = await Customer.find().sort({ totalSpent: -1 })
    const retailCustomers = allCustomers.filter(c => c.customerType === 'retail')
    const wholesaleCustomers = allCustomers.filter(c => c.customerType === 'wholesale')
    const vipCustomers = allCustomers.filter(c => c.customerType === 'vip')

    console.log('\n' + '='.repeat(70))
    console.log('✅ SEED COMPLETED SUCCESSFULLY')
    console.log('='.repeat(70))
    console.log(`\n👥 Total Customers: ${allCustomers.length}`)
    console.log(`\n📊 Customer Types:`)
    console.log(`   🛒 Retail:     ${retailCustomers.length} (${((retailCustomers.length / allCustomers.length) * 100).toFixed(1)}%)`)
    console.log(`   📦 Wholesale:  ${wholesaleCustomers.length} (${((wholesaleCustomers.length / allCustomers.length) * 100).toFixed(1)}%)`)
    console.log(`   ⭐ VIP:        ${vipCustomers.length} (${((vipCustomers.length / allCustomers.length) * 100).toFixed(1)}%)`)

    // Calculate statistics
    const totalSpent = allCustomers.reduce((sum, c) => sum + c.totalSpent, 0)
    const totalPurchases = allCustomers.reduce((sum, c) => sum + c.totalPurchases, 0)
    const totalLoyaltyPoints = allCustomers.reduce((sum, c) => sum + c.loyaltyPoints, 0)
    const avgSpent = totalSpent / allCustomers.length
    const avgPurchases = totalPurchases / allCustomers.length

    console.log(`\n💰 Financial Summary:`)
    console.log(`   Total Spent:          ${totalSpent.toLocaleString('vi-VN')} VND`)
    console.log(`   Average per Customer: ${avgSpent.toLocaleString('vi-VN')} VND`)
    console.log(`   Total Purchases:      ${totalPurchases}`)
    console.log(`   Average Purchases:    ${avgPurchases.toFixed(1)} orders/customer`)
    console.log(`   Total Loyalty Points: ${totalLoyaltyPoints.toLocaleString('vi-VN')}`)

    // Gender distribution
    const maleCustomers = allCustomers.filter(c => c.gender === 'male')
    const femaleCustomers = allCustomers.filter(c => c.gender === 'female')

    console.log(`\n👫 Gender Distribution:`)
    console.log(`   Male:   ${maleCustomers.length} (${((maleCustomers.length / allCustomers.length) * 100).toFixed(1)}%)`)
    console.log(`   Female: ${femaleCustomers.length} (${((femaleCustomers.length / allCustomers.length) * 100).toFixed(1)}%)`)

    // Top customers
    console.log('\n' + '='.repeat(70))
    console.log('🏆 TOP 5 CUSTOMERS BY TOTAL SPENT')
    console.log('='.repeat(70))

    const topCustomers = allCustomers.slice(0, 5)
    topCustomers.forEach((customer, index) => {
      const typeIcon = customer.customerType === 'vip' ? '⭐' :
        customer.customerType === 'wholesale' ? '📦' : '🛒'
      console.log(`\n${index + 1}. ${typeIcon} ${customer.fullName}`)
      console.log(`   Code: ${customer.customerCode}`)
      console.log(`   Type: ${customer.customerType.toUpperCase()}`)
      console.log(`   Email: ${customer.email}`)
      console.log(`   Phone: ${customer.phone}`)
      console.log(`   City: ${customer.address.city}`)
      console.log(`   Total Spent: ${customer.totalSpent.toLocaleString('vi-VN')} VND`)
      console.log(`   Total Purchases: ${customer.totalPurchases}`)
      console.log(`   Loyalty Points: ${customer.loyaltyPoints}`)
      if (customer.notes) {
        console.log(`   Notes: ${customer.notes}`)
      }
    })

    // City distribution
    console.log('\n' + '='.repeat(70))
    console.log('🌍 CUSTOMER DISTRIBUTION BY CITY')
    console.log('='.repeat(70))

    const cityMap = {}
    allCustomers.forEach(customer => {
      const city = customer.address.city
      cityMap[city] = (cityMap[city] || 0) + 1
    })

    Object.entries(cityMap)
      .sort((a, b) => b[1] - a[1])
      .forEach(([city, count]) => {
        console.log(`   ${city}: ${count} customer${count > 1 ? 's' : ''}`)
      })

    console.log('\n' + '='.repeat(70))
    console.log('📋 ALL CUSTOMERS')
    console.log('='.repeat(70))

    allCustomers.forEach((customer, index) => {
      const typeIcon = customer.customerType === 'vip' ? '⭐' :
        customer.customerType === 'wholesale' ? '📦' : '🛒'
      console.log(`\n${index + 1}. ${typeIcon} ${customer.customerCode} - ${customer.fullName}`)
      console.log(`   ${customer.email} | ${customer.phone}`)
      console.log(`   ${customer.address.city}, ${customer.address.country}`)
      console.log(`   Type: ${customer.customerType} | Spent: ${customer.totalSpent.toLocaleString('vi-VN')} VND | Orders: ${customer.totalPurchases} | Points: ${customer.loyaltyPoints}`)
    })

    console.log('\n' + '='.repeat(70))
    console.log('🎉 All done! Your database is ready with sample customers.')
    console.log('='.repeat(70))

    await mongoose.connection.close()
    console.log('\n✓ Database connection closed.')
    process.exit(0)

  } catch (error) {
    console.error('\n❌ Error seeding customers:', error)
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close()
    }
    process.exit(1)
  }
}

// Run seed
seedCustomers()
