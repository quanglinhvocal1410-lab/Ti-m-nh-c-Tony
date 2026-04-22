const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/ai/analyze-song', {
      ten_bai_hat: 'test'
    });
    console.log(res.data);
  } catch(e) {
    if (e.response) {
      console.log('HTTP Error:', e.response.status, e.response.data);
    } else {
      console.log('Error:', e.message);
    }
  }
}
test();
