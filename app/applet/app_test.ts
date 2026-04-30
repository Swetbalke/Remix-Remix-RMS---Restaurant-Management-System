import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://0.0.0.0:3000/api/menu');
    console.log(res.data);
  } catch (e) {
    console.error(e.message);
  }
}
test();
