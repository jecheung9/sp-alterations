import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { connectMongo } from "./connectMongo";
import { todo } from "node:test";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const mongoClient = connectMongo();
const db = mongoClient.db();
app.use(express.static(STATIC_DIR));

//simple test
app.get('/', (req, res) => {
    res.send("Hello World!");
})

//clients
app.get("/api/clients", async (req: Request, res: Response) => {
    try {
        const clientsCollection = process.env.CLIENTS_COLLECTION_NAME;
        if (!clientsCollection) {
            res.status(500).json({ error: "CLIENTS_COLLECTION_NAME not configured" });
            return;
        }
        const clients = await db.collection(clientsCollection).find({}).toArray();
        res.json(clients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to fetch clients" });
    }
});

//meetings
app.get("/api/meetings", async (req: Request, res: Response) => {
    try {
        const meetingsCollection = process.env.MEETINGS_COLLECTION_NAME;
        if (!meetingsCollection) {
            res.status(500).json({ error: "MEETINGS_COLLECTION_NAME not configured" });
            return;
        }
        const meetings = await db.collection(meetingsCollection).find({}).toArray();
        res.json(meetings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to fetch meetings" });
    }
});

//meetings
app.get("/api/todo", async (req: Request, res: Response) => {
    try {
        const todoCollection = process.env.TODO_COLLECTION_NAME;
        if (!todoCollection) {
            res.status(500).json({ error: "TODO_COLLECTION_NAME not configured" });
            return;
        }
        const todo = await db.collection(todoCollection).find({}).toArray();
        res.json(todo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to fetch todos" });
    }
});

// startup
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})