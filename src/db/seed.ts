import { db } from "./index";
import { posts } from "./schema";

const seed = async () => {
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
  } finally {
    // データベース接続を終了
    process.exit(0);
  }
};

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
