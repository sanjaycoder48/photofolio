/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Mail, MapPin, Camera, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import fallbackData from '../data.json';

const PhotoCard = ({ src, title, description, category }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="relative group overflow-hidden rounded-2xl bg-zinc-200 aspect-4/5 cursor-pointer shadow-lg"
    >
      <img
        src={src.startsWith('http') || src.startsWith('/uploads/') ? src : `/${src}`}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Overlay details */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
        <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
          <p className="text-zinc-300 text-sm font-medium tracking-widest uppercase mb-2">{category}</p>
          <h3 className="text-white text-2xl font-semibold mb-2">{title}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function Portfolio() {
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  const [data, setData] = useState({ about: fallbackData.about, images: fallbackData.images });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then(res => {
        if (!res.ok) throw new Error('API down');
        return res.json();
      })
      .then(json => {
        if (json && json.about) setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Using fallback CMS data.", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-900">Loading Portfolio...</div>;
  }

  const about = data.about || {};
  const images = data.images || [];

  return (
    <div className="bg-zinc-50 text-zinc-900 min-h-screen selection:bg-zinc-900 selection:text-zinc-50 font-sans">
      
      {/* Minimal Navbar */}
      <motion.nav
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-50 mix-blend-difference text-white"
      >
        <div className="text-xl font-bold tracking-tighter">{about.name}</div>
        <div className="flex gap-8 text-sm font-medium tracking-wide items-center">
          <a href="#about" className="hover:opacity-70 transition-opacity">ABOUT</a>
          <a href="#work" className="hover:opacity-70 transition-opacity">WORK</a>
          <a href="#contact" className="hover:opacity-70 transition-opacity">CONTACT</a>
        </div>
      </motion.nav>

      {/* Hero / Details Section */}
      <section id="about" className="min-h-screen relative flex items-center justify-center p-8 lg:p-24 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-8 z-10"
          >
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-6"
              >
                {about.title1} <br /> {about.title2}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="w-24 h-1 bg-zinc-900 mb-8"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xl text-zinc-600 max-w-md leading-relaxed whitespace-pre-wrap"
              >
                {about.description}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <a href="#work" className="inline-flex items-center gap-2 border-b-2 border-zinc-900 pb-1 text-sm font-semibold tracking-widest uppercase hover:text-zinc-500 hover:border-zinc-500 transition-colors">
                Explore Work
              </a>
            </motion.div>
          </motion.div>

          {/* Owner Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative lg:h-[80vh] w-full flex items-center justify-center"
          >
            <div className="w-[80%] h-[80%] max-h-full rounded-3xl overflow-hidden shadow-2xl bg-zinc-200">
              {about.ownerPhoto && (
                <img
                  src={about.ownerPhoto.startsWith('http') ? about.ownerPhoto : about.ownerPhoto.startsWith('/uploads/') ? about.ownerPhoto : `/${about.ownerPhoto}`}
                  alt={about.name}
                  className="w-full h-full object-cover shadow-2xl"
                  onError={(e) => { e.target.src = "/owner_photo.png"; }}
                />
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="work" className="min-h-screen py-32 px-8 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">Selected Works</h2>
              <p className="text-zinc-500 max-w-sm">A curation of my favorite moments captured in time.</p>
            </div>
            <div className="text-sm font-semibold tracking-widest uppercase text-zinc-400">
              {images.length < 10 ? `01 — 0${images.length}` : `01 — ${images.length}`}
            </div>
          </motion.div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {images.map((img) => {
              const imgSrc = img.src.startsWith('/uploads/') ? img.src : `/${img.src.replace(/^\/+/, "")}`;
              return (
                <PhotoCard
                  key={img.id}
                  src={imgSrc}
                  title={img.title}
                  description={img.description}
                  category={img.category}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-8 lg:px-24 bg-zinc-900 text-zinc-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16">

          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">Let's <br /> Create.</h2>
              <p className="text-zinc-400 text-xl max-w-md mb-12">Available for freelance opportunities. Reach out if you want to collaborate on something amazing.</p>

              <div className="flex flex-col gap-6 text-zinc-400">
                <a href={`mailto:${about.email}`} className="flex items-center gap-4 hover:text-white transition-colors group">
                  <div className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center group-hover:bg-white group-hover:text-zinc-900 transition-colors">
                    <Mail size={18} />
                  </div>
                  <span className="text-lg">{about.email}</span>
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <span className="text-lg">{about.location}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 max-w-md"
          >
            <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  placeholder="Your Name"
                  className="w-full bg-transparent border-b border-zinc-700 py-4 px-2 outline-none focus:border-white transition-colors peer placeholder-transparent"
                />
                <label htmlFor="name" className="absolute left-2 -top-4 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-4 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-white">Your Name</label>
              </div>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder="Your Email"
                  className="w-full bg-transparent border-b border-zinc-700 py-4 px-2 outline-none focus:border-white transition-colors peer placeholder-transparent"
                />
                <label htmlFor="email" className="absolute left-2 -top-4 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-4 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-white">Your Email</label>
              </div>
              <div className="relative">
                <textarea
                  id="message"
                  placeholder="Your Message"
                  rows="4"
                  className="w-full bg-transparent border-b border-zinc-700 py-4 px-2 outline-none focus:border-white transition-colors peer placeholder-transparent resize-none"
                ></textarea>
                <label htmlFor="message" className="absolute left-2 -top-4 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-4 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-white">Your Message</label>
              </div>

              <button
                type="submit"
                className="mt-4 py-4 px-8 bg-white text-zinc-900 font-semibold rounded-full hover:bg-zinc-200 transition-colors w-full md:w-auto self-start"
              >
                Send Message
              </button>
            </form>
          </motion.div>

        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto mt-32 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-500 text-sm">
          <p>{about.copyright}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors"><Camera size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Heart size={20} /></a>
          </div>
        </div>
      </section>

    </div>
  );
}
