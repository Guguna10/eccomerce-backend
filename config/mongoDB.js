const mongoose = require('mongoose')
const chalk = require('chalk')

const connectDB = async () => {
    const connect = await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    }) 

    console.log(chalk.underline.bold.cyan(`Mongo Connected: ${connect.connection.host}`))
}

module.exports = connectDB