import request from 'supertest'
import { dbUser } from "../../../src/database/models/db_users";
import { User } from "../../../src/models/user";
import { populateDatabase } from "../databasePopulater";
let server;

describe('/user', () => {
    let email;
    let password;

    beforeAll(async () => {
        server = require('../../../src/index')
    })

    afterAll(async () => {
        server.close();
        await dbUser.remove();
    })

    describe('GET', () => {

        beforeEach(async () => {
            await populateDatabase();
            email = "test@example.com";
            password = "12345678";
        });

        const exec = async () => {
            const token = new User("test", email, password, 1).generateAuthToken();
            return await request(server)
                .get('/user')
                .set('x-auth-header', token)
                .send()
        };

        it('should return a 401 if client is not logged in.', async function () {
            const res = await request(server)
                .get('/user')
                .set('x-auth-header', '')
                .send()
            expect(res.status).toBe(401);
        });

        it('should return 404 if no email is found', async function () {
            email = 'a';
            const res = await exec();
            expect(res.status).toBe(404)
        });

        it('should return 200 if email is found', async function () {
            const res = await exec();
            expect(res.status).toBe(200)
        });

        it('should return a public user object if all is well', async function () {
            const res = await exec();
            expect(res.body).not.toHaveProperty('password');
        });

    });

    describe('POST', () => {
        let name;
        let email;
        let password;
        let year;

        beforeEach(async () => {
            await populateDatabase();
            name = "post test";
            email = "postTest@example.com";
            password = "12345678";
            year = 2;
        })

        const exec = async () => {
            return await request(server)
                .post('/user')
                .send({
                    name,
                    email,
                    password,
                    year
                })
        };

        it('should return 400 if name less than 2 chars', async function () {
            name = "a";
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('name')
        });

        it('should return 400 if name more than 50 chars', async function () {
            name = new Array(52).join('a');
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('name')
        });

        it('should return 400 if email is less than 5 chars', async function () {
            email = '1234';
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('email')
        });

        it('should return 400 if email is more than 255 chars', async function () {
            email = new Array(260).join('a');
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('email')
        });

        it('should return 400 if email is not in correct form', async function () {
            email = '12345678';
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('email')
        });

        it('should return 400 if password is less than 8 chars', async function () {
            password = '1234567';
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('password')
        });

        it('should return 400 if password is more than 50 chars', async function () {
            password = new Array(52).join('a');
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('password')
        });

        it('should return 400 if year is more than 3', async function () {
            year = 4;
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('year')

        });

        it('should return 400 if year is less than 1', async function () {
            year = 0;
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('year')
        });

        it('should return 400 if year is not a number', async function () {
            year = 'a';
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('year');
        });

        it('should return 400 if email is already in user', async function () {
            email = "test@example.com" // email used to populate the test db.
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('already in use')
        });

        it('should return 200 when all the fields are correct', async function () {
            const res = await exec();

            expect(res.status).toBe(200);
        });

        it('should return user object with correct fields', async function () {
            await dbUser.remove();
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.header).toHaveProperty('x-auth-header');
            expect(res.body).not.toHaveProperty('password');
            expect(res.body.currentPuzzleId).toMatch('firstTestPuzzle');
        });
    });

    describe('DELETE', () => {

        beforeEach(async () => {
            await populateDatabase();
            email = "test@example.com";
            password = "12345678";
        });

        afterEach(async () => {
            await dbUser.remove();
        })

        const exec = async () => {
            const token = new User("test", email, password, 1).generateAuthToken();
            return await request(server)
                .delete('/user')
                .set('x-auth-header', token)
                .send()
        };


        it('should return 401 if no token is provided', async function () {
            const res = await request(server)
                .delete('/user')
                .set('x-auth-header', '')
                .send()

            expect(res.status).toBe(401);
        });

        it('should return 400 if invalid token is provided', async function () {
            const res = await request(server)
                .delete('/user')
                .set('x-auth-header', 'a')
                .send()

            expect(res.status).toBe(400);
        });

        it('should return 400 if email not found', async function () {
            email = 'invalid@example.com';
            const res = await exec();

            expect(res.status).toBe(404);
            expect(res.body.error).toMatch('not found')
        });

        it('should delete user if valid email is provided', async function () {
            await exec();
            const userInDb = await dbUser.findOne({email});

            expect(userInDb).toBeNull();
        });

        it('should return deleted user', async function () {
            const res = await exec();

            expect(res.body).toHaveProperty('name', 'test');
            expect(res.body).toHaveProperty('email', email);
            expect(res.body).toHaveProperty('year', 1);
        });
    });

    describe('PUT', () => {
        let name;
        let year;
        beforeEach(async () => {
            await populateDatabase();
            email = "test@example.com";
            password = "12345678";
            name = "replaced name";
            year = 3;
        });

        afterEach(async () => {
            await dbUser.remove();
        });

        const exec = async () => {
            const token = new User("test", email, password, 1).generateAuthToken();
            return await request(server)
                .put('/user')
                .set('x-auth-header', token)
                .send({
                    name,
                    year
                })
        };

        it('should return 401 if no token is provided', async () => {
            const res = await request(server)
                .put('/user')
                .set('x-auth-header', '')
                .send()
            expect(res.status).toBe(401);
        });

        it('should return 400 if invalid token is provided', async () => {
            const res = await request(server)
                .put('/user')
                .set('x-auth-header', 'a')
                .send()
            expect(res.status).toBe(400);
        });

        it('should return 400 with name less than 2 chars', async function () {
            name = 'a';
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('name');
        });

        it('should return 400 with name more than 50 chars', async function () {
            name = new Array(52).join('a');
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('name');
        });

        it('should return 400 with year greater than 3', async function () {
            year = 4;
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('year');
        });

        it('should return 400 with year less than 1', async function () {
            year = 0;
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch('year');
        });

        it('should return 400 if email not found', async function () {
            email = 'invalid@example.com';
            const res = await exec();

            expect(res.status).toBe(404);
            expect(res.body.error).toMatch('not found')
        });

        it('should update the user if input is valid', async function () {
            let user = await dbUser.findOne({ email });

            expect(user).not.toHaveProperty('name', name);
            expect(user).not.toHaveProperty('year', year);

            const res = await exec();
            expect(res.status).toBe(200);

            user = await dbUser.findOne({ email });

            expect(user).toHaveProperty('name', name);
            expect(user).toHaveProperty('year', year);
        });

        it('should return updated user if successful', async function () {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', name);
            expect(res.body).toHaveProperty('year', year);
        });
    });

    // describe('GET /:puzzleId', () => {
    //     let id;
    //     beforeEach(async () => {
    //         await populateDatabase();
    //         email = "test@example.com";
    //         password = "12345678";
    //         id = "firstTestPuzzle"
    //     });
    //
    //     afterEach(async () => {
    //         await dbUser.remove();
    //     });
    //
    //     const exec = async () => {
    //         const token = new User("test", email, password, 1).generateAuthToken();
    //         return await request(server)
    //             .put('/user/ + id')
    //             .set('x-auth-header', token)
    //             .send()
    //     };
    // });
});