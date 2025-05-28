// frontend/src/App.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    axios.get('/api/donors')
      .then(res => setDonors(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Danh sách người hiến máu</h1>
      <ul>
        {donors.map(d => (
          <li key={d.id}>{d.name} - Nhóm máu: {d.bloodType}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
