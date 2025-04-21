import React from 'react';
import { motion } from 'framer-motion';

export default function HomePage() {
  // Motion variants for left and right reveal
  const leftVariant = {
    initial: { x: -200, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.8, ease: 'easeOut' }
  };
  const rightVariant = {
    initial: { x: 200, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.8, ease: 'easeOut' }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 px-6 text-center overflow-hidden">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={leftVariant}
        >
          Welcome to GeneSweeper
        </motion.h1>
        <motion.p
          className="mt-6 text-lg md:text-xl text-gray-700"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={rightVariant}
        >
          Effortless CSV-based gene sweeps with real-time previews.
        </motion.p>
      </section>

      {/* Features & Tutorial */}
      <section className="py-16 px-6 grid md:grid-cols-2 gap-12">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={leftVariant}
        >
          <h2 className="text-3xl font-bold mb-4">Key Features</h2>
          <ul className="list-disc ml-6 space-y-3 text-gray-700">
            <li>Automatic drag & drop CSV parsing</li>
            <li>Live cart & export preview pane</li>
            <li>Smooth scrolling animations</li>
            <li>Secure JGI credential scraping</li>
          </ul>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={rightVariant}
        >
          <h2 className="text-3xl font-bold mb-4">Quick Tutorial</h2>
          <ol className="list-decimal ml-6 space-y-3 text-gray-700">
            <li>Drag or click the CSV uploader to submit your file.</li>
            <li>Select products from the list to build your sweep cart.</li>
            <li>Watch the live export preview update as you add/remove items.</li>
            <li>Hit the "Export Sweep" button to download filtered results.</li>
            <li>Visit "Past Sweeps" to manage or re-download previous exports.</li>
          </ol>
        </motion.div>
      </section>

      {/* Important Information */}
      <section className="py-16 px-6 bg-white">
        <motion.h2
          className="text-3xl font-bold text-center mb-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={leftVariant}
        >
          Important Information
        </motion.h2>
        <motion.div
          className="max-w-3xl mx-auto space-y-4 text-gray-700"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={rightVariant}
        >
          <p>Data is processed securely within your session; no data is stored on our servers indefinitely.</p>
          <p>Ensure your JGI username and password are correct for scraping external databases.</p>
          <p>For support, contact <a href="mailto:aalajlan6@gatech.edu" className="text-blue-600 underline">support@genesweeper.com</a>.</p>
        </motion.div>
      </section>
    </div>
  );
}
