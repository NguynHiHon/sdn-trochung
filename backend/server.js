const databaseconfig = require('./src/config/databaseConfig')
const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors');
const router = require('./src/routers/index');
const cookieparser = require('cookie-parser');

dotenv.config();




const app = express();
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(cookieparser());

app.use(express.json());

app.use('/api', router);

databaseconfig();

app.listen(process.env.PORT, () => {
    try {
        console.log(`server đã được khởi tạo và chạy ở cổng ${process.env.PORT}`)

    } catch (error) {

        console.error('Lỗi khi khởi tạo server:', error);
    }
}
);
