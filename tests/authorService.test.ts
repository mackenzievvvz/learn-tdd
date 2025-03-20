import mongoose, { FilterQuery } from "mongoose";
import Author, { IAuthor } from "../models/author";
import app from "../server";
import request from "supertest";
import Book from "../models/book";

describe("Verify GET /authors", () => {
    const mockBookId = new mongoose.Types.ObjectId().toHexString();

    let consoleSpy: jest.SpyInstance;

    beforeAll(() => {
        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterAll(() => {
        consoleSpy.mockRestore();
    });
    
    it("should respond with author first name, last name, date of birth, and date of death", async () => {
        const mockAuthor1 = {
            first_name: "Auth First Name",
            last_name: "Auth Last Name",
            date_of_birth: Date.UTC(2000, 10, 10),
        };
        const mockAuthor2 = {
            first_name: "Auth2 First Name",
            last_name: "Auth2 Last Name",
            date_of_birth: Date.UTC(2000, 5, 10),
            date_of_death: Date.UTC(2020, 12, 10)
        };

        const expectedResponse = [mockAuthor1, mockAuthor2];

        Author.getAllAuthors = jest.fn().mockImplementation((sortOpts) => {
            if (sortOpts.family_name === 1) {
                return Promise.resolve([
                {
                    first_name: "Auth First Name",
                    last_name: "Auth Last Name",
                    date_of_birth: Date.UTC(2000, 10, 10)
                }, 
                {
                    first_name: "Auth2 First Name",
                    last_name: "Auth2 Last Name",
                    date_of_birth: Date.UTC(2000, 5, 10),
                    date_of_death: Date.UTC(2020, 12, 10)
                }
            ]);}
            return Promise.resolve(null);
        });

        const response = await request(app).get(`/authors`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual(expectedResponse);
    });

    it("should respond with 200 and a No authors found message if there are not authors found", async () => {  
        Author.getAllAuthors = jest.fn().mockImplementation((sortOpts) => {
            if (sortOpts.family_name === 1) {
                return Promise.resolve([]);}
            return Promise.resolve(null);
        });
        
        const response = await request(app).get(`/authors`);
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe(`No authors found`);
    });

    it("should respond with 500 if there is an error fetching the authors", async () => {  
        Author.getAllAuthors = jest.fn().mockRejectedValue(new Error("Database error"));

        const response = await request(app).get(`/authors`);
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe(`No authors found`);
        expect(consoleSpy).toHaveBeenCalled();
    });
});