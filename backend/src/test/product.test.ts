const request = require("supertest");
import { ObjectId } from "mongodb";
import app, { closeMongoClient } from "../index";
import { createMongoClient } from "../connectMongo";
import bcrypt from "bcrypt";

let token: string;
let mongoClient: any;

let createdMeetingIds: string[] = [];
let createdMeetingClientIds: string[] = [];

require("dotenv").config();

//authentication before routes testing
beforeAll(async () => {
    mongoClient = createMongoClient();
    await mongoClient.connect();
    const db = mongoClient.db();
    const usersCollection = process.env.USERS_COLLECTION_NAME;
    await db.collection(usersCollection!).deleteMany({
        username: "testing"
    });
    await db.collection(usersCollection!).insertOne({
        username: "testing",
        password: await bcrypt.hash("testing", 10)
    });
    const res = await request(app)
        .post("/api/login")
        .send({
            username: "testing",
            password: "testing"
        })
    token = res.body.token
})

describe("GET /api/clients", () => {
    it("should return all clients", async () => {
        return request(app)
            .get("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res: any) => {
                expect(Array.isArray(res.body)).toBe(true);
            });
    })
});


describe("POST /api/clients", () => {
    test("should create a new client", async () => {
        return request(app)
            .post("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Supertest client" })
            .expect(201)
            .then((res: any) => {
                expect(res.body).toHaveProperty("name", "Supertest client");
            });
    })
})

describe("DELETE /api/clients/:id", () => {
    test("should delete a client", async () => {
        const createRes = await request(app)
            .post("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "client for deletion" })
            .expect(201);
        
        const clientId = createRes.body._id;

        await request(app)
            .delete(`/api/clients/${clientId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(204);
    })
})

describe("POST /api/meetings - pickup (with description)", () => {
    test("should create a pickup meeting w/ description", async () => {
        const clientRes = await request(app)
            .post("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "client for meetings" })
            .expect(201);
        const client = clientRes.body;
        createdMeetingClientIds.push(client._id);
        const res = await request(app)
            .post("/api/meetings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: 7320,
                due: "2026-12-31T14:30",
                meetingType: "pickup",
                client: {
                    _id: client._id,
                    name: client.name
                },
                description: "Test meeting pickups"
            })
            .expect(201);
        
        expect(res.body).toHaveProperty("meetingType", "pickup");
        expect(res.body.client).toHaveProperty("_id", client._id);
        expect(res.body).toHaveProperty("description", "Test meeting pickups");

        createdMeetingIds.push(res.body._id);
    })
})

describe("POST /api/meetings - pickup (without description)", () => {
    test("should create a pickup meeting w/o description", async () => {
        const clientRes = await request(app)
            .post("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "client for meetings" })
            .expect(201);
        const client = clientRes.body;
        createdMeetingClientIds.push(client._id);
        const res = await request(app)
            .post("/api/meetings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: 7321,
                due: "2026-12-31T15:30",
                meetingType: "pickup",
                client: {
                    _id: client._id,
                    name: client.name
                },
            })
            .expect(201);
        
        expect(res.body).toHaveProperty("meetingType", "pickup");
        expect(res.body.client).toHaveProperty("_id", client._id);
        expect(res.body.description).toBeNull();

        createdMeetingIds.push(res.body._id);
    })
})

describe("POST /api/meetings - dropoff", () => {
    test("should create a dropoff meeting", async () => {
        const clientRes = await request(app)
            .post("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "client for meetings" })
            .expect(201);
        const client = clientRes.body;
        createdMeetingClientIds.push(client._id);
        const res = await request(app)
            .post("/api/meetings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: 7232,
                due: "2026-12-30T16:30",
                meetingType: "dropoff",
                client: {
                    _id: client._id,
                    name: client.name
                },
                alterationIds: [1234, 1235, 1236]
            })
            .expect(201);

        expect(res.body.meetingType).toBe("dropoff");
        expect(res.body.alterationIds).toEqual([1234, 1235, 1236]);
        createdMeetingIds.push(res.body._id);
    });
});

afterAll(async () => {
    const db = mongoClient.db();
    const clientsCollection = process.env.CLIENTS_COLLECTION_NAME;
    const meetingsCollection = process.env.MEETINGS_COLLECTION_NAME;

    //cleanup create client
    await db.collection(clientsCollection!).deleteMany({
        name: "Supertest client"
    });

    //cleanup create meeting
    if (createdMeetingIds.length > 0) {
        await db.collection(meetingsCollection!).deleteMany({
            _id: { $in: createdMeetingIds.map(id => new ObjectId(id)) }
        });
    }

    //cleanup create client within the created meeting
    if (createdMeetingClientIds.length > 0) {
        await db.collection(clientsCollection!).deleteMany({
            _id: { $in: createdMeetingClientIds.map(id => new ObjectId(id)) }
        });
    }

    await mongoClient.close();
    await closeMongoClient();
});
