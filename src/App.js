import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  // --- DATA MASTER RUANGAN --- //
  const initialRooms = [
    { id: 1, nama: 'Lab Komputer A', status: 'Tersedia', kapasitas: '40 Kursi', type: 'Lab', image: 'https://images.unsplash.com/photo-1593642532744-d377ab507dc8?q=80&w=400&auto=format&fit=crop' },
    { id: 2, nama: 'Lab Jaringan', status: 'Renovasi', kapasitas: '30 Kursi', type: 'Lab', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=400&auto=format&fit=crop' },
    { id: 3, nama: 'Auditorium Utama', status: 'Penuh', kapasitas: '150 Kursi', type: 'Hall', image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=400&auto=format&fit=crop' },
    { id: 4, nama: 'Smart Classroom 101', status: 'Tersedia', kapasitas: '60 Kursi', type: 'Class', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400&auto=format&fit=crop' },
  ];

  // --- DATA AWAL RIWAYAT --- //
  const initialRequests = [
    { id: 101, namaMahasiswa: 'Sarah Putri', ruangan: 'Lab Komputer A', tanggal: '2026-02-18', keperluan: 'Mengerjakan Skripsi', status: 'Menunggu Persetujuan' },
    { id: 102, namaMahasiswa: 'Budi Santoso', ruangan: 'Auditorium Utama', tanggal: '2026-02-20', keperluan: 'Seminar Nasional', status: 'Disetujui' },
    { id: 103, namaMahasiswa: 'Ahmad Zaky', ruangan: 'Lab Jaringan', tanggal: '2026-02-22', keperluan: 'Praktikum Mandiri', status: 'Ditolak' },
  ];

  // --- FUNGSI LOCAL STORAGE --- //
  const getStoredData = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  // --- STATE MANAGEMENT --- //
  const [rooms, setRooms] = useState(() => getStoredData('saved_rooms', initialRooms));
  const [requests, setRequests] = useState(() => getStoredData('saved_requests', initialRequests));
  const [role, setRole] = useState('mahasiswa'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('katalog');
  const [form, setForm] = useState({ id: 0, namaMahasiswa: '', ruangan: '', tanggal: '', keperluan: '', status: 'Menunggu Persetujuan' });
  const [search, setSearch] = useState('');
  
  // --- STATE MODAL & FORM --- //
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({ id: 0, nama: '', kapasitas: '', status: 'Tersedia', type: 'Class', image: '' });
  const [isEditingRoom, setIsEditingRoom] = useState(false);

  // --- AUTO SAVE KE STORAGE --- //
  useEffect(() => {
    localStorage.setItem('saved_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('saved_requests', JSON.stringify(requests));
  }, [requests]);

  // --- HANDLE UPLOAD GAMBAR --- //
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRoomForm({ ...roomForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- LOGIC CRUD RUANGAN (ADMIN) --- //
  const handleSaveRoom = (e) => {
    e.preventDefault();
    const finalRoomData = {
      ...roomForm,
      image: roomForm.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop'
    };

    if (isEditingRoom) {
      setRooms(rooms.map(r => r.id === roomForm.id ? finalRoomData : r));
    } else {
      setRooms([{ ...finalRoomData, id: Date.now() }, ...rooms]);
    }
    setShowRoomModal(false);
    alert("Data ruangan berhasil disimpan!");
  };

  const handleDeleteRoom = (id) => {
    if(window.confirm("Hapus ruangan ini permanen?")) setRooms(rooms.filter(r => r.id !== id));
  };

  const openAddRoom = () => {
    setRoomForm({ id: 0, nama: '', kapasitas: '', status: 'Tersedia', type: 'Class', image: '' });
    setIsEditingRoom(false);
    setShowRoomModal(true);
  };

  const openEditRoom = (room) => {
    setRoomForm(room);
    setIsEditingRoom(true);
    setShowRoomModal(true);
  };

  // --- LOGIC TRANSAKSI PEMINJAMAN --- //
  const handleBooking = (roomName) => {
    setForm({ ...form, ruangan: roomName, namaMahasiswa: '', tanggal: '', keperluan: '' });
    setActiveTab('form'); 
  };

  const handleSaveRequest = (e) => {
    e.preventDefault();
    if (!form.namaMahasiswa) return alert("Nama wajib diisi!");
    setRequests([{ ...form, id: Date.now(), status: 'Menunggu Persetujuan' }, ...requests]);
    setForm({ id: 0, namaMahasiswa: '', ruangan: '', tanggal: '', keperluan: '', status: 'Menunggu Persetujuan' });
    setActiveTab('riwayat');
    alert("Pengajuan berhasil dikirim!");
  };

  const handleStatusRequest = (id, newStatus) => {
    setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
  };

  const handleDeleteRequest = (id) => {
    if(window.confirm("Hapus data ini?")) setRequests(requests.filter(req => req.id !== id));
  };

  // --- FILTER & STATISTIK --- //
  const filteredRequests = requests.filter(r => 
    (r.namaMahasiswa || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.ruangan || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    pending: requests.filter(r => r.status === 'Menunggu Persetujuan').length,
    approved: requests.filter(r => r.status === 'Disetujui').length,
    rejected: requests.filter(r => r.status === 'Ditolak').length
  };

  // --- RENDER VIEW: LOGIN --- //
  if (!isLoggedIn) {
    return (
      <div className="login-wrapper">
        <div className="login-overlay"></div>
        <div className="login-card glass animate-pop">
          <h1 className="login-title">Kampus<span className="highlight">Connect</span></h1>
          <p className="login-subtitle">Sistem Peminjaman Ruangan Kampus</p>
          <div className="btn-group-vertical">
            <button className="btn-login admin" onClick={() => { setRole('admin'); setIsLoggedIn(true); setActiveTab('katalog'); }}>
              🛡️ Akses Administrator
            </button>
            <button className="btn-login mhs" onClick={() => { setRole('mahasiswa'); setIsLoggedIn(true); setActiveTab('katalog'); }}>
              🎓 Akses Mahasiswa
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER VIEW: MAIN APP --- //
  return (
    <div className="app-layout">
      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">Kampus<span className="highlight">Connect</span></div>
          <div className="role-badge">{role === 'admin' ? 'Admin Mode' : 'Student Mode'}</div>
        </div>
        
        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'katalog' ? 'active' : ''}`} onClick={() => setActiveTab('katalog')}>
            <span className="icon">🏢</span> Katalog Ruangan
          </button>
          <button className={`nav-item ${activeTab === 'form' ? 'active' : ''}`} onClick={() => { setForm({...form, ruangan: ''}); setActiveTab('form'); }}>
            <span className="icon">📝</span> Buat Pengajuan
          </button>
          <button className={`nav-item ${activeTab === 'riwayat' ? 'active' : ''}`} onClick={() => setActiveTab('riwayat')}>
            <span className="icon">📊</span> Riwayat Data
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => setIsLoggedIn(false)}>
            <span className="icon">🚪</span> Keluar
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="main-content">
        
        {/* TAB 1: KATALOG */}
        {activeTab === 'katalog' && (
          <div className="animate-fade">
            <div className="page-header">
              <div>
                <h2>Katalog Ruangan</h2>
                <p>Lihat fasilitas dan ketersediaan ruangan secara visual.</p>
              </div>
              {role === 'admin' && <button className="btn-primary glow" onClick={openAddRoom}>+ Ruangan Baru</button>}
            </div>

            <div className="grid-rooms">
              {rooms.map(room => (
                <div key={room.id} className="card room-card-photo">
                  <div className="room-image-container">
                    <img src={room.image} alt={room.nama} className="room-image" />
                    <div className={`status-badge-overlay ${room.status.toLowerCase().replace(' ', '-')}`}>
                      {room.status === 'Tersedia' ? '✅ Tersedia' : room.status === 'Renovasi' ? '🚧 Renovasi' : '⛔ Penuh'}
                    </div>
                  </div>
                  <div className="room-details-padding">
                    <h3>{room.nama}</h3>
                    <p className="capacity">Kapasitas: <strong>{room.kapasitas}</strong></p>
                    <div className="card-actions">
                      {role === 'mahasiswa' && (
                        <button className="btn-book w-full" disabled={room.status !== 'Tersedia'} onClick={() => handleBooking(room.nama)}>
                          {room.status === 'Tersedia' ? 'Pinjam Ruangan Ini' : 'Tidak Tersedia'}
                        </button>
                      )}
                      {role === 'admin' && (
                        <div className="admin-tools">
                          <button onClick={() => openEditRoom(room)}>Edit Info</button>
                          <button className="danger" onClick={() => handleDeleteRoom(room.id)}>Hapus</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FORM PENGAJUAN */}
        {activeTab === 'form' && (
          <div className="animate-fade">
            <div className="card form-card center-box">
              <h2>Formulir Peminjaman</h2>
              <p style={{marginBottom:30, color:'#64748b'}}>Isi detail peminjaman Anda di bawah ini.</p>
              <form onSubmit={handleSaveRequest}>
                <div className="input-group">
                  <label>Ruangan Tujuan</label>
                  <select value={form.ruangan} onChange={e => setForm({...form, ruangan: e.target.value})} required>
                     <option value="">-- Pilih Ruangan --</option>
                     {rooms.map(r => <option key={r.id} value={r.nama} disabled={r.status !== 'Tersedia'}>{r.nama} {r.status !== 'Tersedia' ? '(X)' : ''}</option>)}
                  </select>
                </div>
                <div className="input-group"><label>Nama Lengkap</label><input value={form.namaMahasiswa} onChange={e => setForm({...form, namaMahasiswa: e.target.value})} required /></div>
                <div className="input-group"><label>Tanggal</label><input type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} required /></div>
                <div className="input-group"><label>Keperluan</label><textarea rows="3" value={form.keperluan} onChange={e => setForm({...form, keperluan: e.target.value})} required /></div>
                <button type="submit" className="btn-primary glow w-full">🚀 Kirim Pengajuan</button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: DASHBOARD RIWAYAT */}
        {activeTab === 'riwayat' && (
          <div className="animate-fade">
            <div className="page-header">
              <h2>{role === 'admin' ? 'Dashboard Verifikasi' : 'Riwayat Pengajuan'}</h2>
            </div>

            <div className="stats-deck">
              <div className="card stat-card pending"><div className="icon-box">⏳</div><div><h3>{stats.pending}</h3><p>Menunggu</p></div></div>
              <div className="card stat-card approved"><div className="icon-box">✅</div><div><h3>{stats.approved}</h3><p>Disetujui</p></div></div>
              <div className="card stat-card rejected"><div className="icon-box">❌</div><div><h3>{stats.rejected}</h3><p>Ditolak</p></div></div>
            </div>

            <div className="card no-padding">
              <div className="table-toolbar">
                <input placeholder="🔍 Cari data..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
              </div>
              <table className="modern-table">
                <thead>
                  <tr><th>User</th><th>Ruangan & Tanggal</th><th>Status</th><th style={{textAlign:'center'}}>Aksi</th></tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => (
                    <tr key={req.id}>
                      <td>
                        <div className="user-info">
                          <div className="avatar">{(req.namaMahasiswa || "A").charAt(0)}</div>
                          <strong>{req.namaMahasiswa}</strong>
                        </div>
                      </td>
                      <td><div>{req.ruangan}</div><small className="text-muted">{req.tanggal}</small></td>
                      <td><span className={`pill ${req.status.toLowerCase().split(' ')[0]}`}>{req.status}</span></td>
                      <td style={{textAlign:'center'}}>
                        <div className="action-buttons">
                          <button className="btn-icon detail" onClick={() => {setSelectedItem(req); setShowDetail(true);}}>👁️</button>
                          {role === 'admin' && req.status === 'Menunggu Persetujuan' && (
                            <>
                              <button className="btn-icon approve" onClick={() => handleStatusRequest(req.id, 'Disetujui')}>✓</button>
                              <button className="btn-icon reject" onClick={() => handleStatusRequest(req.id, 'Ditolak')}>✕</button>
                            </>
                          )}
                          {role === 'admin' && <button className="btn-icon delete" onClick={() => handleDeleteRequest(req.id)}>🗑️</button>}
                          {role === 'mahasiswa' && req.status === 'Menunggu Persetujuan' && (
                            <button className="btn-icon delete" onClick={() => handleDeleteRequest(req.id)}>🗑️</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL DETAIL --- */}
      {showDetail && selectedItem && (
        <div className="modal-backdrop" onClick={() => setShowDetail(false)}>
          <div className="modal-card animate-pop" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Detail Peminjaman</h3><button onClick={() => setShowDetail(false)}>✕</button></div>
            <div className="modal-body detail-view">
              <div className="detail-group"><label>Nama:</label> <span>{selectedItem.namaMahasiswa}</span></div>
              <div className="detail-group"><label>Ruangan:</label> <span>{selectedItem.ruangan}</span></div>
              <div className="detail-group"><label>Status:</label> <span className={`pill ${selectedItem.status.toLowerCase().split(' ')[0]}`}>{selectedItem.status}</span></div>
              <div className="detail-group block"><label>Keperluan:</label> <p>{selectedItem.keperluan}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL KELOLA RUANGAN --- */}
      {showRoomModal && (
        <div className="modal-backdrop">
          <div className="modal-card animate-pop">
            <div className="modal-header"><h3>{isEditingRoom ? 'Edit Ruangan' : 'Tambah Ruangan'}</h3></div>
            <form onSubmit={handleSaveRoom}>
              <div className="input-group">
                <label>Foto Ruangan</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {roomForm.image && <img src={roomForm.image} alt="Preview" style={{width: '100%', height: '100px', objectFit: 'cover', marginTop: '10px', borderRadius: '8px'}} />}
              </div>
              <div className="input-group"><label>Nama Ruangan</label><input value={roomForm.nama} onChange={e => setRoomForm({...roomForm, nama: e.target.value})} required /></div>
              <div className="input-group"><label>Kapasitas</label><input value={roomForm.kapasitas} onChange={e => setRoomForm({...roomForm, kapasitas: e.target.value})} required /></div>
              <div className="input-group"><label>Status</label>
                <select value={roomForm.status} onChange={e => setRoomForm({...roomForm, status: e.target.value})}>
                  <option>Tersedia</option><option>Penuh</option><option>Renovasi</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowRoomModal(false)}>Batal</button>
                <button type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;