import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("financepassword123", 10);
  
  await db.insert(users).values({
    email: "nils@example.com",
    password: hashedPassword,
    name: "Nils",
  });

  console.log("User wurde erfolgreich angelegt!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fehler beim Seeden:", err);
  process.exit(1);
});
