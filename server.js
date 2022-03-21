// ===== imports from node moduls ===== //
const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/mongoDB')
const cookieParser = require("cookie-parser")
const morgan = require("morgan")
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")
const xss = require("xss-clean")
const cors = require("cors")
const hpp = require("hpp")
const path = require("path")
const chalk = require("chalk")
const errorHanlder = require("./middlewares/error_handler")

// ===== load ENV vars ===== //
dotenv.config({path: './config/config.env'})

// ===== connect to mogno databse ===== //
connectDB()

const application = express()

// ===== Body Parser ===== //
application.use(express.json({ limit: "50mb" }))
application.use(express.urlencoded({ extended: true, limit: "50mb" }))

// ===== Cookie Parser ===== //
application.use(cookieParser())


// ===== Morgan Logger Middleware ===== //
if (process.env.NODE_ENV === "development") {
    application.use(morgan("dev"))
}

// ===== Sanitize Middleware ===== //
application.use(mongoSanitize())

// ===== Set Security Headers  ===== //
application.use(helmet())

// ===== Prevent XSS Attaks ===== //
application.use(xss())

// ===== Enable Cors ===== //
application.use(cors({ origin: "*" }))

// ===== Prevent HTTP Param Pollution ===== //
application.use(hpp())

// ===== Set Static Folder ===== //
application.use(express.static(path.join(__dirname, "public")))


// ===== Route Files ===== //
const authentication_routes = require("./routers/authentication_routes")
const users_routes = require("./routers/users_routes")
const products_routes = require("./routers/products_routes")
const brands_routes = require("./routers/brands_routes")

// ===== Mount Routers =====//
application.use("/api/v1/authentication", authentication_routes)
application.use("/api/v1/users", users_routes)
application.use("/api/v1/products", products_routes)
application.use("/api/v1/brands", brands_routes)


// ===== Application Error Hanlder ===== //
application.use(errorHanlder)

const PORT = process.env.PORT || 5000

application.listen(PORT, (request, response) => {
    console.log((
        chalk.underline.bold.blue
        `Server running in ${process.env.NODE_ENV} mode on ${PORT}`
    )      
    )
})

// ===== Handle Unhandled Promise Rejections ===== //
process.on("unhandledRejection", (error, promise) => {
    console.log(`Error: ${error.message}`)
    
    // ===== Close Server & Exit Process ===== //
    // server.close(() => process.exit(1))
})