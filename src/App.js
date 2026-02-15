import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    // Pastikan port 5179 sesuai dengan port Backend kamu
    axios.get('http://localhost:5179/api/Customers')
      .then(res => setCustomers(res.data))
      .catch(err => console.log("Gagal ambil data:", err));
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2c3e50' }}>Data Nasabah Peminjaman</h1>
      <table border="1" cellPadding="12" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead style={{ backgroundColor: '#3498db', color: 'white' }}>
          <tr>
            <th>ID</th>
            <th>Nama Lengkap</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td style={{ textAlign: 'center' }}>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;