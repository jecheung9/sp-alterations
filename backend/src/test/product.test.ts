import request, { type Response } from "supertest";
import type { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";
import app, { closeMongoClient } from "../index";
import { createMongoClient } from "../connectMongo";
import bcrypt from "bcrypt";
import "dotenv/config";

type ApiClient = {
    _id: string;
    name: string;
};

type ApiMeeting = {
    _id: string;
    id: number;
    client: ApiClient;
    meetingType: "pickup" | "dropoff";
    description?: string;
    alterationIds?: number[];
    status: string;
};

type ApiTodo = {
    _id: string;
    id: number;
    due: string;
    price: number;
    client: ApiClient;
    description: string;
    status: string;
};

let token: string;
let mongoClient: MongoClient;

const createdMeetingIds: string[] = [];
const createdMeetingClientIds: string[] = [];
const createdTodoIds: string[] = [];


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
        });
    token = res.body.token;
})

describe("GET /api/clients", () => {
    it("should return all clients", async () => {
        return request(app)
            .get("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res: Response) => {
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
            .then((res: Response) => {
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

describe("GET /api/meetings", () => {
    test("should return all meetings", async () => {
        const clientRes = await request(app)
            .post("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "client for meetings" })
            .expect(201);
        const client = clientRes.body;
        createdMeetingClientIds.push(client._id);
        const meetingRes = await request(app)
            .post("/api/meetings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: 7233,
                due: "2026-12-30T17:30",
                meetingType: "pickup",
                client: {
                    _id: client._id,
                    name: client.name
                },
            })
            .expect(201);
        createdMeetingIds.push(meetingRes.body._id);
        const createdMeeting = meetingRes.body;
        const res = await request(app)
            .get("/api/meetings")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        const meetings = res.body as ApiMeeting[];
        expect(meetings.some(m => m._id === createdMeeting._id)).toBe(true);
    })
})

describe("PUT /api/meetings/:id", () => {
    test("should update a meeting", async () => {
        const clientRes = await request(app)
            .post("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "client for meetings" })
            .expect(201);
        const client = clientRes.body;
        createdMeetingClientIds.push(client._id);
        const meetingRes = await request(app)
            .post("/api/meetings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: 7234,
                due: "2026-12-30T18:30",
                meetingType: "pickup",
                client: {
                    _id: client._id,
                    name: client.name
                },
            })
            .expect(201);
        createdMeetingIds.push(meetingRes.body._id);
        const createdMeeting = meetingRes.body;

        const res = await request(app)
            .put(`/api/meetings/${createdMeeting.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                status: "Completed",
                description: "updated meeting description"
            })
            .expect(200);
        
        expect(res.body).toHaveProperty("status", "Completed");
        expect(res.body).toHaveProperty("description", "updated meeting description")
    })
})

describe("PUT /api/meetings/:id - pickup to dropoff", () => {
    test("should update a meeting's type", async () => {
        const clientRes = await request(app)
            .post("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "client for meetings" })
            .expect(201);
        const client = clientRes.body;
        createdMeetingClientIds.push(client._id);
        const meetingRes = await request(app)
            .post("/api/meetings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: 7235,
                due: "2026-12-30T18:30",
                meetingType: "pickup",
                client: {
                    _id: client._id,
                    name: client.name
                },
            })
            .expect(201);
        createdMeetingIds.push(meetingRes.body._id);
        const createdMeeting = meetingRes.body;

        const res = await request(app)
            .put(`/api/meetings/${createdMeeting.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                meetingType: "dropoff",
                alterationIds: [5555]
            })
            .expect(200);
        
        expect(res.body.meetingType).toBe("dropoff");
        expect(res.body.alterationIds).toEqual([5555]);
    })
})

//TODO: if PUT meeting complete, marks todo complete too. 

describe("DELETE /api/meetings/:id", () => {
    test("should delete a meeting", async () => {
        const clientRes = await request(app)
            .post("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "client for meetings" })
            .expect(201);
        const client = clientRes.body;
        createdMeetingClientIds.push(client._id);
        const meetingRes = await request(app)
            .post("/api/meetings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: 7236,
                due: "2026-12-30T18:30",
                meetingType: "pickup",
                client: {
                    _id: client._id,
                    name: client.name
                },
            })
            .expect(201);
        createdMeetingIds.push(meetingRes.body._id);
        const createdMeeting = meetingRes.body;

        await request(app)
            .delete(`/api/meetings/${createdMeeting.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(204);
        
        const check = await request(app)
            .get("/api/meetings")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        const meetings = check.body as ApiMeeting[];
        expect(meetings.find(m => m.id === createdMeeting.id)).toBeUndefined(); //just to make sure id doesnt match and is gone
    })
})

describe("POST /api/todo", () => {
    test("should create a todo item", async () => {
        const clientRes = await request(app)
            .post("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "client for meetings" })
            .expect(201);
        const client = clientRes.body;
        createdMeetingClientIds.push(client._id);
        const res = await request(app)
            .post("/api/todo")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: 9000,
                due: "2027-01-15",
                price: 100,
                client: {
                    _id: client._id,
                    name: client.name
                },
                description: "supertest testing description"
            })
            .expect(201);
        createdTodoIds.push(res.body._id);
        expect(res.body).toHaveProperty("type", "alteration");
        expect(res.body).toHaveProperty("price", 100);
    })
})

describe("GET /api/todo", () => {
    test("should return all todo items", async () => {
        const clientRes = await request(app)
            .post("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "client for meetings" })
            .expect(201);
        const client = clientRes.body;
        createdMeetingClientIds.push(client._id);
        const todoRes = await request(app)
            .post("/api/todo")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: 9001,
                due: "2027-01-16",
                price: 101,
                client: {
                    _id: client._id,
                    name: client.name
                },
                description: "supertest testing description"
            })
            .expect(201);
        const createdTodo = todoRes.body;
        const res = await request(app)
            .get("/api/todo")
            .set("Authorization", `Bearer ${token}`)
            .expect("Content-Type", /json/)
            .expect(200);
        createdTodoIds.push(todoRes.body._id);
        const todos = res.body as ApiTodo[];
        expect(todos.some(t => t._id === createdTodo._id)).toBe(true);
    })
})

describe("DELETE /api/todo/:id - and remove meeting", () => {
    test("should delete a todo and remove from dropoff meetings", async () => {
        const clientRes = await request(app)
            .post("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "client for meetings" })
            .expect(201);
        const client = clientRes.body;
        createdMeetingClientIds.push(client._id);
        const todoRes = await request(app)
            .post("/api/todo")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: 9002,
                due: "2027-01-17",
                price: 102,
                client: {
                    _id: client._id,
                    name: client.name
                },
                description: "supertest testing description"
            })
            .expect(201);
        const createdTodo = todoRes.body;
        const meetingRes = await request(app)
            .post("/api/meetings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: 9003,
                due: "2026-12-31T21:00",
                meetingType: "dropoff",
                client: {
                    _id: client._id,
                    name: client.name
                },
                alterationIds: [9002]
            })
            .expect(201);
        createdTodoIds.push(todoRes.body._id);
        createdMeetingIds.push(meetingRes.body._id);
        const meeting = meetingRes.body;
        //delete todo
        await request(app)
            .delete(`/api/todo/${createdTodo.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(204);
        //and then if a dropoff meeting uses this todo, delete that as well.
        const meetingRes2 = await request(app)
            .get("/api/meetings")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        const meetings = meetingRes2.body as ApiMeeting[];
        expect(meetings.some(m => m.id === meeting.id)).toBe(false);
    })
})

describe("DELETE /api/todo/:id - and only remove one id", () => {
    test("should delete a todo and remove its id from a dropoff meeting", async () => {
        const clientRes = await request(app)
            .post("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "client for meetings" })
            .expect(201);
        const client = clientRes.body;
        createdMeetingClientIds.push(client._id);
        const todoRes = await request(app)
            .post("/api/todo")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: 9004,
                due: "2027-01-18",
                price: 103,
                client: {
                    _id: client._id,
                    name: client.name
                },
                description: "supertest testing description"
            })
            .expect(201);
        const createdTodo = todoRes.body;
        const meetingRes = await request(app)
            .post("/api/meetings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: 9005,
                due: "2026-12-31T21:00",
                meetingType: "dropoff",
                client: {
                    _id: client._id,
                    name: client.name
                },
                alterationIds: [9004, 9992]
            })
            .expect(201);
        createdTodoIds.push(todoRes.body._id);
        createdMeetingIds.push(meetingRes.body._id);
        const meeting = meetingRes.body;
        //delete todo
        await request(app)
            .delete(`/api/todo/${createdTodo.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(204);
        //and then check the meeting.
        const meetingRes2 = await request(app)
            .get("/api/meetings")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        const meetingList = meetingRes2.body as ApiMeeting[];
        const matchingMeeting = meetingList.find(m => m.id === meeting.id);
        expect(matchingMeeting).toBeDefined();
        expect(matchingMeeting?.alterationIds).toEqual([9992]);
        expect(matchingMeeting?.alterationIds).not.toContain(9004);
    })
})

describe("PUT /api/todo/:id", () => {
    test("should update a todo item", async () => {
        const clientRes = await request(app)
            .post("/api/clients")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "client for meetings" })
            .expect(201);
        const client = clientRes.body;
        createdMeetingClientIds.push(client._id);
        const todoRes = await request(app)
            .post("/api/todo")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: 9006,
                due: "2027-01-20",
                price: 110,
                client: {
                    _id: client._id,
                    name: client.name
                },
                description: "supertest testing description"
            })
            .expect(201);
        const createdTodo = todoRes.body;
        const updatedRes = await request(app)
            .put(`/api/todo/${createdTodo.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                status: "Completed",
                price: 440,
                description: "updated todo description"
            })
            .expect(200);
        createdTodoIds.push(todoRes.body._id);
        expect(updatedRes.body).toHaveProperty("price", 440);
    })
})

describe("POST /api/login - successful login", () => {
    test("should successfully login and return token", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({
                username: "testing",
                password: "testing"
            })
            .expect(200);
        expect(res.body).toHaveProperty("token");
    });
});

describe("POST /api/login - invalid login credentials", () => {
    test("should reject with invalid credentials", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({
                username: "woweeeeee",
                password: "123abc"
            })
            .expect(400);
        expect(res.body).toHaveProperty("error", "invalid login");
    });
});

describe("POST /api/register", () => {
    test("should register a new user", async () => {
        await request(app)
            .post("/api/register")
            .send({
                username: "testing123",
                password: "testing123"
            })
            .expect(201);
    });
});

afterAll(async () => {
    const db = mongoClient.db();
    const clientsCollection = process.env.CLIENTS_COLLECTION_NAME;
    const meetingsCollection = process.env.MEETINGS_COLLECTION_NAME;
    const todoCollection = process.env.TODO_COLLECTION_NAME;
    const usersCollection = process.env.USERS_COLLECTION_NAME;

    //cleanup create client
    await db.collection(clientsCollection!).deleteMany({
        name: "Supertest client"
    });

    //cleanup created meetings
    if (createdMeetingIds.length > 0) {
        await db.collection(meetingsCollection!).deleteMany({
            _id: { $in: createdMeetingIds.map(id => new ObjectId(id)) }
        });
    }

    //cleanup created todos
    if (createdTodoIds.length > 0) {
        await db.collection(todoCollection!).deleteMany({
            _id: { $in: createdTodoIds.map(id => new ObjectId(id)) }
        });
    }

    //cleanup create client within the created entries
    if (createdMeetingClientIds.length > 0) {
        await db.collection(clientsCollection!).deleteMany({
            _id: { $in: createdMeetingClientIds.map(id => new ObjectId(id)) }
        });
    }

    //cleanup logins
    await db.collection(usersCollection!).deleteMany({
        username: { $in: ["testing", "testing123"] }
    });

    await mongoClient.close();
    await closeMongoClient();
});
