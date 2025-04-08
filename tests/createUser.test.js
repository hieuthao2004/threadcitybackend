const DatabaseService = require('../services/db.service');

async function testCreateUser() {
    try {
        const userData = {
            username: "testuser2",
            password: "test123",
            role: "user",
            createdAt: new Date()
        };

        console.log("Attempting to create user:", userData);
        const userId = await DatabaseService.createUser(userData);
        console.log("User created successfully with ID:", userId);

        const foundUser = await DatabaseService.findUserByUsername(userData.username);
        console.log("Found user:", foundUser);

    } catch (error) {
        console.error("Test failed:", error);
    }
}

// Run the test
testCreateUser();