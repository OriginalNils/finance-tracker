import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("financedev", 10);
  
  await db.insert(users).values({
    email: "dev@dev.com",
    password: hashedPassword,
    name: "Developer",
  });

  console.log("User wurde erfolgreich angelegt!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fehler beim Seeden:", err);
  process.exit(1);
});
