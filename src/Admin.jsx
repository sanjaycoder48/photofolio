import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [password, setPassword] = useState('');
  
  const [about, setAbout] = useState(null);
  const [images, setImages] = useState([]);
  
  // New Image Form
  const [newImage, setNewImage] = useState({ title: '', description: '', category: '', file: null });

  const fetchCMSData = () => {
    fetch('/api/data')
      .then(res => res.json())
      .then(json => {
        setAbout(json.about);
        setImages(json.images);
      });
  };

  useEffect(() => {
    if (token) {
      fetchCMSData();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const json = await res.json();
    if (json.success) {
      setToken(json.token);
      localStorage.setItem('adminToken', json.token);
    } else {
      alert("Incorrect admin password.");
    }
  };

  const saveAbout = () => {
    fetch('/api/about', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(about)
    })
    .then(res => res.json())
    .then(() => alert("Saved settings successfully!"));
  };
  
  const uploadOwnerPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/upload', { 
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData 
    });
    if (!res.ok) return alert("Upload failed or not authorized");
    const json = await res.json();
    setAbout({ ...about, ownerPhoto: json.url });
  };

  const deletePhoto = (id) => {
    if(!confirm("Delete this photo?")) return;
    fetch(`/api/images/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => fetchCMSData());
  };

  const uploadGalleryPhoto = async (e) => {
    e.preventDefault();
    if (!newImage.file || !newImage.title || !newImage.category) {
      return alert("Please fill all required fields and select an image.");
    }
    
    // First upload file
    const formData = new FormData();
    formData.append('image', newImage.file);
    const uploadRes = await fetch('/api/upload', { 
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData 
    });
    if (!uploadRes.ok) return alert("Upload failed or not authorized");
    const uploadJson = await uploadRes.json();
    
    // Create new gallery
    const imgData = {
      src: uploadJson.url,
      title: newImage.title,
      description: newImage.description,
      category: newImage.category
    };
    
    await fetch('/api/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(imgData)
    });
    
    setNewImage({ title: '', description: '', category: '', file: null });
    document.getElementById('galleryImageInput').value = "";
    fetchCMSData();
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 font-sans">
        <form onSubmit={handleLogin} className="bg-white p-12 rounded-2xl shadow-xl flex flex-col gap-6 w-96">
          <h2 className="text-2xl font-bold flex flex-col gap-2">Admin Panel <span className="text-xs text-zinc-500 font-normal">Pass: admin123</span></h2>
          <input 
            type="password" 
            placeholder="Enter Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-4 rounded outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50"
          />
          <button type="submit" className="bg-zinc-900 text-white font-semibold py-4 rounded hover:bg-zinc-800 transition-colors">Log In</button>
        </form>
      </div>
    );
  }

  if (!about) return <div className="p-12">Loading Admin panel...</div>;

  return (
    <div className="min-h-screen bg-zinc-100 font-sans p-8 lg:p-16">
      <div className="flex justify-between items-center max-w-5xl mx-auto mb-12">
        <h1 className="text-4xl font-bold">CMS Admin Panel</h1>
        <div className="flex gap-4">
          <button onClick={handleLogout} className="text-red-500 font-medium hover:underline">Log Out</button>
          <a href="/" className="text-blue-600 font-medium hover:underline">← Back to Site</a>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* About Section Form */}
        <div className="bg-white p-8 shadow-sm rounded-2xl">
          <h2 className="text-2xl font-bold mb-6">Website Details</h2>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col text-sm text-zinc-500">
              Site / Brand Name
              <input value={about.name} onChange={e => setAbout({...about, name: e.target.value})} className="border p-3 text-zinc-900 rounded outline-none" />
            </label>
            <label className="flex flex-col text-sm text-zinc-500">
              Hero Title Line 1
              <input value={about.title1} onChange={e => setAbout({...about, title1: e.target.value})} className="border p-3 text-zinc-900 rounded outline-none" />
            </label>
            <label className="flex flex-col text-sm text-zinc-500">
              Hero Title Line 2
              <input value={about.title2} onChange={e => setAbout({...about, title2: e.target.value})} className="border p-3 text-zinc-900 rounded outline-none" />
            </label>
            <label className="flex flex-col text-sm text-zinc-500">
              Description / Bio
              <textarea value={about.description} onChange={e => setAbout({...about, description: e.target.value})} className="border p-3 text-zinc-900 rounded outline-none" rows="4"></textarea>
            </label>
            <label className="flex flex-col text-sm text-zinc-500">
              Email Address
              <input value={about.email} onChange={e => setAbout({...about, email: e.target.value})} className="border p-3 text-zinc-900 rounded outline-none" />
            </label>
            <label className="flex flex-col text-sm text-zinc-500">
              Location
              <input value={about.location} onChange={e => setAbout({...about, location: e.target.value})} className="border p-3 text-zinc-900 rounded outline-none" />
            </label>
            
            <label className="flex flex-col text-sm text-zinc-500 pt-4 border-t">
              Update Owner Photo
              <input type="file" onChange={uploadOwnerPhoto} className="mt-2 text-base text-zinc-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200" />
            </label>
            
            <button onClick={saveAbout} className="bg-zinc-900 text-white font-medium py-3 rounded mt-4">Save Site Details</button>
          </div>
        </div>

        {/* Gallery Form */}
        <div className="flex flex-col gap-12">
          {/* Add form */}
          <div className="bg-white p-8 shadow-sm rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">Add New Gallery Photo</h2>
            <form className="flex flex-col gap-4" onSubmit={uploadGalleryPhoto}>
              <input type="text" placeholder="Title" value={newImage.title} onChange={e => setNewImage({...newImage, title: e.target.value})} className="border p-3 rounded outline-none" required />
              <input type="text" placeholder="Category (e.g. Portrait, Event)" value={newImage.category} onChange={e => setNewImage({...newImage, category: e.target.value})} className="border p-3 rounded outline-none" required />
              <textarea placeholder="Description" value={newImage.description} onChange={e => setNewImage({...newImage, description: e.target.value})} className="border p-3 rounded outline-none" rows="2"></textarea>
              <input type="file" id="galleryImageInput" accept="image/*" onChange={e => setNewImage({...newImage, file: e.target.files[0]})} className="mt-2 text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 hover:file:bg-zinc-200" required />
              <button type="submit" className="bg-blue-600 text-white font-medium py-3 rounded mt-4 hover:bg-blue-700">Upload Photo</button>
            </form>
          </div>
          
          {/* List items */}
          <div className="bg-white p-8 shadow-sm rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">Manage Photos ({images.length})</h2>
            <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-2">
              {images.map(img => (
                <div key={img.id} className="flex gap-4 items-center bg-zinc-50 p-2 rounded border">
                  <img src={img.src.startsWith('http') ? img.src : img.src.startsWith('/uploads') ? img.src : `/${img.src.replace(/^\/+/, "")}`} alt={img.title} className="w-16 h-16 object-cover rounded shadow" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{img.title}</h4>
                    <p className="text-xs text-zinc-500">{img.category}</p>
                  </div>
                  <button onClick={() => deletePhoto(img.id)} className="text-red-600 hover:bg-red-50 p-2 rounded text-sm font-medium mr-2">Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
