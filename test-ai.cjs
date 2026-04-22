const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

async function test() {
  try {
    console.log("Testing API with proper endpoint...");
    const res = await axios.post('http://localhost:3000/api/ai/analyze-song', {
      ten_bai_hat: 'Em Của Ngày Hôm Qua'
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    if (e.response) {
      console.log('HTTP Error:', e.response.status, e.response.data);
    } else {
      console.log('Error:', e.message);
    }
  }
}
test();
