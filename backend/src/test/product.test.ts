const request = require("supertest");
import app, { closeMongoClient } from "../index";
import { createMongoClient } from "../connectMongo";
import bcrypt from "bcrypt";

let token: string;
let mongoClient: any;

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

afterAll(async () => {
    const db = mongoClient.db();
    const clientsCollection = process.env.CLIENTS_COLLECTION_NAME;

    await db.collection(clientsCollection!).deleteMany({
        name: "Supertest client"
    });

    await mongoClient.close();
    await closeMongoClient();
});



