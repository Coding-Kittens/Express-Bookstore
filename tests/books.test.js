process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

beforeEach(async () => {
  await db.query(
    `INSERT INTO books (
          isbn,
          amazon_url,
          author,
          language,
          pages,
          publisher,
          title,
          year)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      "1111111",
      "http://a.co/eobPtX2",
      "test author",
      "test",
      394,
      "test publisher",
      "this is a test",
      2022,
    ]
  );
});

afterEach(async () => {
  await db.query(`DELETE FROM books`);
});

afterAll(async () => {
  await db.end();
});

describe("Test Get", () => {
  test("Get all", async () => {
    const res = await request(app).get("/books");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      books: [
        {
          isbn: "1111111",
          amazon_url: "http://a.co/eobPtX2",
          author: "test author",
          language: "test",
          pages: 394,
          publisher: "test publisher",
          title: "this is a test",
          year: 2022,
        },
      ],
    });
  });

  test("Get by id", async () => {
    const res = await request(app).get("/books/1111111");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      book: {
        isbn: "1111111",
        amazon_url: "http://a.co/eobPtX2",
        author: "test author",
        language: "test",
        pages: 394,
        publisher: "test publisher",
        title: "this is a test",
        year: 2022,
      },
    });
  });

  test("Get by id should return 404 if id not found", async () => {
    const res = await request(app).delete("/books/notAnId");
    expect(res.statusCode).toBe(404);
  });
});

describe("Test Post", () => {
  test("Create new", async () => {
    const res = await request(app).post("/books").send({
      isbn: "222222222",
      amazon_url: "http://a.co/eobPtX2",
      author: "test author2",
      language: "test2",
      pages: 394,
      publisher: "test publisher 2",
      title: "this is a test2",
      year: 2022,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      book: {
        isbn: "222222222",
        amazon_url: "http://a.co/eobPtX2",
        author: "test author2",
        language: "test2",
        pages: 394,
        publisher: "test publisher 2",
        title: "this is a test2",
        year: 2022,
      },
    });
  });

  test("Create new invalid info", async () => {
    const res = await request(app).post("/books").send({
      isbn: 222222222,
      amazon_url: true,
      author: "test author2",
      language: "test2",
      pages: "394",
      publisher: "test publisher 2",
      title: "this is a test2",
      year: "2022",
    });
    expect(res.statusCode).toBe(400);
  });

  test("Create new missing info", async () => {
    const res = await request(app).post("/books").send({
      isbn: null,
      amazon_url: "http://a.co/eobPtX2",
      author: null,
      pages: 394,
      publisher: "test publisher 2",
      title: "this is a test2",
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("Test Put", () => {
  test("Update by isbn", async () => {
    const res = await request(app).put("/books/1111111").send({
      amazon_url: "http://a.co/eobPtX2",
      author: "test author2",
      language: "test2",
      pages: 394,
      publisher: "test publisher",
      title: "this is a test",
      year: 2022,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      book: {
        isbn: "1111111",
        amazon_url: "http://a.co/eobPtX2",
        author: "test author2",
        language: "test2",
        pages: 394,
        publisher: "test publisher",
        title: "this is a test",
        year: 2022,
      },
    });
  });

  test("Update by isbn should return 404 if isbn not found", async () => {
    const res = await request(app).put("/books/notAIsbn").send({
      amazon_url: "http://a.co/eobPtX2",
      author: "test author2",
      language: "test2",
      pages: 394,
      publisher: "test publisher",
      title: "this is a test",
      year: 2022,
    });
    expect(res.statusCode).toBe(404);
  });

  test("Update by isbn invalid info", async () => {
    const res = await request(app).put("/books/1111111").send({
      amazon_url: false,
      author: "test author2",
      language: "test2",
      pages: "394",
      publisher: "test publisher",
      title: "this is a test",
      year: "2022",
    });
    expect(res.statusCode).toBe(400);
  });

  test("Update by isbn missing info", async () => {
    const res = await request(app).put("/books/1111111").send({
      pages: 394,
      publisher: "test publisher",
      title: "this is a test",
      year: 2022,
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("Test Delete", () => {
  test("Delete by isbn", async () => {
    const res = await request(app).delete("/books/1111111");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Book deleted" });
  });

  test("Delete by isbn should return 404 if isbn not found", async () => {
    const res = await request(app).delete("/books/notAIsbn");
    expect(res.statusCode).toBe(404);
  });
});
