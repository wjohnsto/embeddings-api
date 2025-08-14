import { describe, expect, test } from "bun:test";
import request from "supertest";
import app from "../server/app.js";

describe("Embeddings", () => {
  test("single embedding exact match", async () => {
    const { body: result } = await request(app)
      .post("/api/embeddings")
      .send({ values: "hello world", match: "hello world" })
      .expect(200);

    const data = result.data;

    expect(parseInt(data[0].similarity, 10)).toBe(1);
  });

  test("single embedding partial match", async () => {
    const { body: result } = await request(app)
      .post("/api/embeddings")
      .send({ values: "Hello World!", match: "hello world" })
      .expect(200);

    const data = result.data;

    expect(parseInt(data[0].similarity, 10)).toBeLessThan(1);
  });

  test("multiple embeddings exact and partial match", async () => {
    const { body: result } = await request(app)
      .post("/api/embeddings")
      .send({
        values: ["hello world", "Hello World!"],
        match: ["hello world", "hello world"],
      })
      .expect(200);

    const data = result.data;

    expect(data.length).toBe(2);
    expect(data[0].text).toBe("hello world");
    expect(data[1].text).toBe("Hello World!");
    expect(parseInt(data[0].similarity, 10)).toBe(1);
    expect(parseInt(data[1].similarity, 10)).toBeLessThan(1);
  });
});
