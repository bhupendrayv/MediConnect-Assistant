const testRegister = async () => {
    try {
        console.log("Attempting to register test user...");
        const response = await fetch('http://localhost:5000/api/v1/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "Test User",
                email: "testuser_" + Date.now() + "@example.com",
                password: "password123",
                role: "patient"
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Success:", data);
        } else {
            console.log("Error Status:", response.status);
            console.log("Error Data:", data);
        }
    } catch (error) {
        console.log("Connection Error:", error.message);
    }
};

testRegister();
