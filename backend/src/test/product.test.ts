const request = require("supertest");
import app from "../index";
import { connectMongo } from "../connectMongo";
import bcrypt from "bcrypt";

let token: string;
let mongoClient: any;

require("dotenv").config();

//authentication before routes testing
beforeAll(async () => {
    mongoClient = await connectMongo();
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



