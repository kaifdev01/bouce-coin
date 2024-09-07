const express = require('express')
const dbConnect = require('./database/index')
const { PORT } = require('./config/index')
const router = require('./routes/index')
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/errorHandler')
const app = express()
const port = PORT


//  const corsOptions = {
//    credentials: true,
//    origin: ["http://localhost:3000"],
// };
app.use(cookieParser());
// app.use(cors(corsOptions));
app.use(
  cors({
    origin: function (origin, callback) {
      return callback(null, true);
    },
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.use(cookieParser())
app.use(express.json({limit:'5mb'}))
app.use('/storage', express.static('storage'))
app.use(router);
dbConnect()
app.use(errorHandler)
app.listen(port, () => {
    console.log(`App listening on port ${PORT}`)
})
