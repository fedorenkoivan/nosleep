import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcrypt";
import "dotenv/config";
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const testUsers = [
    { name: "John Doe", email: "john@example.com", password: "password123" },
    { name: "Jane Smith", email: "jane@example.com", password: "password123" },
    { name: "Bob Johnson", email: "bob@example.com", password: "password123" },
];
async function main() {
    console.log("Seeding test users...");
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length > 0) {
        console.log(`Users already exist (${existingUsers.length} users found)`);
        existingUsers.forEach(user => {
            console.log(`  - ${user.name} (ID: ${user.id}, Email: ${user.email})`);
        });
        return;
    }
    for (const userData of testUsers) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        const user = await prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password_hash: hashedPassword,
                password_salt: salt
            }
        });
        console.log(`✓ Created user: ${user.name} (ID: ${user.id})`);
    }
    console.log("\nTest users seeded successfully!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
