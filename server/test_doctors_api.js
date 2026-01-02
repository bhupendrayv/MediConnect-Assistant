const axios = require('axios');

async function testAPI() {
    try {
        const response = await axios.get('http://localhost:5000/api/v1/user/getAllDoctors');
        console.log('Success!');
        console.log('Number of doctors:', response.data.data.length);
        console.log('\nDoctors:');
        response.data.data.forEach((doc, i) => {
            console.log(`${i + 1}. ${doc.name} - ${doc.specialization} (${doc.gender})`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAPI();
