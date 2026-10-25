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

  await db
    .insert(schema.adminUsers)
    .values({
      username,
      passwordHash,
    });

  console.log("Admin account created.");

  rl.close();
  process.exit(0);
}

main().catch((error) => {
  console.error("Admin account creation failed.");
  rl.close();
  process.exit(1);
});
