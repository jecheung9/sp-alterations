import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { connectMongo } from "./connectMongo";
import cors from "cors";
import { ObjectId } from "mongodb";

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
}));

const PORT = process.env.PORT;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const mongoClient = connectMongo();
const db = mongoClient.db();
app.use(express.json());
app.use(express.static(STATIC_DIR));
// Create
// POST: Used to add a new resource (e.g., creating a new user or product).

// Read
// GET: Used to retrieve or view a resource or a collection of resources.

// Update
// PUT / PATCH: Used to modify existing data. PUT typically replaces the entire resource, while PATCH performs partial updates.

// Delete
// DELETE: Used to remove a resource

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

app.post("/api/clients", async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const clientsCollection = process.env.CLIENTS_COLLECTION_NAME;
        if (!clientsCollection) {
            res.status(500).json({ error: "CLIENTS_COLLECTION_NAME not configured" });
            return;
        }
        const result = await db.collection(clientsCollection).insertOne({ name: name.trim() });
        const actualClient = await db.collection(clientsCollection).findOne({ _id: result.insertedId });
        res.status(201).json(actualClient);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to add client" });
    }
})

app.delete("/api/clients/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const clientsCollection = process.env.CLIENTS_COLLECTION_NAME;
        if (!clientsCollection) {
            res.status(500).json({ error: "CLIENTS_COLLECTION_NAME not configured" });
            return;
        }
        const result = await db.collection(clientsCollection).deleteOne({ _id: new ObjectId(id) });
        res.status(204).send("Client deleted successfully");
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to delete client" });
    }
})

//meetings
app.post("/api/meetings", async (req: Request, res: Response) => {
    try {
        const { id, due, client, description } = req.body;
        const meetingsCollection = process.env.MEETINGS_COLLECTION_NAME;
        if (!meetingsCollection) {
            res.status(500).json({ error: "MEETINGS_COLLECTION_NAME not configured" });
            return;
        }
        const newMeeting = {
            id,
            type: "meeting",
            due,
            client: {
                _id: client._id,
                name: client.name
            },
            status: "Not Started",
            description: description
        }

        const result = await db.collection(meetingsCollection).insertOne(newMeeting);
        const inserted = await db.collection(meetingsCollection).findOne({ _id: result.insertedId });
        res.status(201).json(inserted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to create meeting" });
    }
});

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
})

app.put("/api/meetings/:id", async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const meetingsCollection = process.env.MEETINGS_COLLECTION_NAME;
        if (!meetingsCollection)
        return res.status(500).json({ error: "MEETINGS_COLLECTION_NAME not configured" });

        const newBody = Object.fromEntries(
            Object.entries(req.body).filter(([_, v]) => v !== undefined)
        );

        const result = await db.collection(meetingsCollection).findOneAndUpdate(
            { id: id },
            { $set: newBody },
            { returnDocument: "after" } as const 
        );
        if (!result) {
            return res.status(404).json({ error: "Meeting not found" });
        }
        res.status(200).json(result);
    } catch (err) {
        console.error("Error updating meeting:", err);
        res.status(500).json({ error: "failed to update meeting" });
    }
});

app.delete("/api/meetings/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const meetingsCollection = process.env.MEETINGS_COLLECTION_NAME;
        if (!meetingsCollection) {
            res.status(500).json({ error: "MEETINGS_COLLECTION_NAME not configured" });
            return;
        }

        const result = await db.collection(meetingsCollection).deleteOne({
            id: Number(id)
        });

        if (result.deletedCount === 0) {
            res.status(404).json({ error: "Meeting not found" });
            return;
        }
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to delete meeting" });
    }
})

//todos
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