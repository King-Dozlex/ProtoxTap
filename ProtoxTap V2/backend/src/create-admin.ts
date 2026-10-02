import readline from "node:readline";
import { db } from "../db";
import * as schema from "../db/schema";
import { hashPassword } from "./auth/password";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  const username = await question("Admin username: ");
  const password = await question("Admin password: ");

  if (!username || !password) {
    console.log("Username and password are required.");
    rl.close();
    process.exit(1);
  }

  const passwordHash = hashPassword(password);

  const result = await db
    .insert(schema.adminUsers)
    .values({
      username,
      passwordHash,
    })
    .returning();

  console.log(`Admin created: ${result[0].username}`);

  rl.close();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  rl.close();
  process.exit(1);
});
