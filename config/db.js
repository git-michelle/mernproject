const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI"); //getting mongoURI from the default.js file

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log("MongoDB connected...");
    } catch (err) {
        console.error(err.message);
        //set it to exit process if failure occurs https://nodejs.org/api/process.html#process_process_exit_code
        process.exit(1);

    }
}

module.exports = connectDB; //importing this in server.js