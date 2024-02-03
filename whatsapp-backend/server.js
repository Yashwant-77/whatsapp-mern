// importing 
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import cors from 'cors'


// app config
const app = express()
const port = process.env.PORT || 9000


const pusher = new Pusher({
    appId: "1750873",
    key: "d710fe4cd9252f751f59",
    secret: "231f74560e9b8bf5dbf8",
    cluster: "ap2",
    useTLS: true
});

// middleware
app.use(express.json())
app.use(cors())

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', "*")
//     res.setHeader('Access-Control-Allow-Headers', "*")
//     next();
// })


// DB config
const connection_url = "mongodb+srv://admin:Mukesh77@cluster0.pobkpvs.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(connection_url, {
}).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error.message);
});



const db = mongoose.connection

db.once('open', () => {
    console.log('db is connected ')

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log(change);

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', {
                name: messageDetails.name,
                message: messageDetails.message,
                received: messageDetails.received
            })
        } else {
            console.log(' Error triggering Pusher')
        }
    }
    )

})


// api routers
app.get('/', (req, res) => res.status(200).send('hello world'))

app.get('/messages/sync', async (req, res) => {
    try {
        console.log('I am trying to get  messages');
        const findMessage = await Messages.find();
        res.status(200).send(findMessage);

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
})

app.post('/messages/new', async (req, res) => {
    try {
        const dbMessage = req.body;
        console.log("I am in post method ");
        const createdMessage = await Messages.create(dbMessage);
        res.status(201).send(createdMessage); // 201 status code indicates successful creation
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});


// listen 
app.listen(port, () => console.log(`listening on localhost:${port}`))