async function fetchData() {
    const url = 'http://localhost:8080/Parametrizacao/home'; // Replace with your API endpoint
    try {

        const response = await fetch(url);
        const data = await response.json(); // Parse the response body as JSON
        console.log(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}