// const mongoose = require('mongoose')

// if (process.argv.length < 3) {
//   console.log('give password as argument')
//   process.exit(1)
// }

// const password = process.argv[2]

// const url = process.env.MONGODB_URI_TEST

// mongoose.set('strictQuery', false)
// mongoose.connect(url)

// const productSchema = new mongoose.Schema({
//   name: String,
//   price: Number,
//   stock: Number
// })

// const Product = mongoose.model('Product', productSchema)

// Product.find({}).then(result => {
//   result.forEach(product => {
//     console.log(product)
//   })
//   mongoose.connection.close()
// })