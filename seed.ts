import { db } from "./src/db/index";
import { posts } from "./src/db/schema";

async function seed() {
  console.log("Seeding database...");

  try {
    // サンプルデータの挿入
    await db.insert(posts).values([
      {
        title: "First Post",
        description: "This is the first post about Next.js and Hono",
      },
      {
        title: "Second Post",
        description: "This is the second post about dynamic OGP generation",
      },
      {
        title: "Third Post",
        description: "This is the third post about Imgix integration",
      },
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed().catch(console.error);
