// src/components/UploadCSV.js
import React, { useState, useMemo } from 'react';
import { useDropzone }         from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import Papa                    from 'papaparse';
import axios                   from 'axios';
import 'react-toastify/dist/ReactToastify.css';

export default function UploadCSV() {
  const [file, setFile]               = useState(null);
  const [csvData, setCsvData]         = useState([]);
  const [products, setProducts]       = useState([]);
  const [filteredProducts, setFiltered]= useState([]);
  const [cart, setCart]               = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]         = useState(false);
  const [exporting, setExporting]     = useState(false);

  const notifySuccess = msg => toast.success(msg);
  const notifyError   = msg => toast.error(msg);

  // Handle file drop/select
  const handleFile = async f => {
    setFile(f);

    // parse client‑side
    Papa.parse(f, {
      header: true, skipEmptyLines: true,
      complete: r => setCsvData(r.data),
      error: err => {
        console.error(err);
        notifyError('CSV parse failed');
      },
    });

    // upload to backend
    setLoading(true);
    const form = new FormData();
    form.append('csv_file', f);
    try {
      const { data } = await axios.post(
        'http://127.0.0.1:8000/api/upload-csv/',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setProducts(data.products);
      setFiltered(data.products);
      notifySuccess('CSV uploaded!');
    } catch (err) {
      console.error(err);
      notifyError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  // find which CSV column matches your product IDs
  const productKey = useMemo(() => {
    if (!csvData.length || !cart.length) return null;
    const headers = Object.keys(csvData[0]);
    for (let h of headers) {
      if (cart.some(item => csvData.some(row => row[h] === item))) {
        return h;
      }
    }
    return null;
  }, [csvData, cart]);

  // rows for export preview
  const exportPreview = useMemo(() => {
    if (!productKey) return [];
    return csvData.filter(row => cart.includes(row[productKey]));
  }, [csvData, cart, productKey]);

  // apply search filter on that preview
  const filteredExport = useMemo(() => {
    if (!searchQuery) return exportPreview;
    return exportPreview.filter(row =>
      Object.values(row).some(v =>
        String(v).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [exportPreview, searchQuery]);

  // export + download + save
  const handleExport = async () => {
    setExporting(true);
    try {
      const form = new FormData();
      cart.forEach(p => form.append('products[]', p));
      const resp = await axios.post(
        'http://127.0.0.1:8000/api/export-csv/',
        form,
        { responseType: 'blob' }
      );

      // trigger download
      const blobUrl = window.URL.createObjectURL(new Blob([resp.data]));
      const a = document.createElement('a');
      const filename = `${cart.join('_').substring(0,20)}.csv`;
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // record sweep
      await axios.post(
        'http://127.0.0.1:8000/api/save-sweep/',
        { products: cart, name: filename },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );
      notifySuccess('Sweep exported & saved!');
    } catch (err) {
      console.error(err);
      notifyError('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 1) Uploader */}
      <div style={{ width: '80%', maxWidth: 600, marginTop: 20 }}>
        <FileUploader onFile={handleFile} disabled={loading} />
      </div>

      {/* 2) Product Selector & Cart */}
      {products.length > 0 && (
        <div style={{ display: 'flex', gap: 40, marginTop: 30 }}>
          <ProductSelector
            items={filteredProducts}
            cart={cart}
            onAdd={p => setCart(c => [...c, p])}
          />
          <CartSummary
            cart={cart}
            onRemove={i => setCart(c => c.filter(x => x !== i))}
            onExport={handleExport}
            exporting={exporting}
          />
        </div>
      )}

      {/* 3) Export Preview with its own scrollable window */}
      {exportPreview.length > 0 && (
        <div style={{ marginTop: 30, width: '80%', maxWidth: 800 }}>
          <input
            type="text"
            placeholder="Search export preview…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: 8,
              marginBottom: 10,
              borderRadius: 5,
              border: '1px solid #ccc'
            }}
          />
          <h3 style={{ textAlign: 'center' }}>Export Preview</h3>

          {/* scrollable container */}
          <div
            style={{
              maxHeight: 300,         // limit its height
              overflowY: 'auto',      // vertical scroll
              overflowX: 'auto',      // horizontal scroll if needed
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: 10,
              backgroundColor: '#f9f9f9'
            }}
          >
            <CSVPreviewTable data={filteredExport} />
          </div>

          {filteredExport.length === 0 && searchQuery && (
            <p style={{ color: 'red' }}>No results for “{searchQuery}”.</p>
          )}
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}


// ─── INLINE SUBCOMPONENTS ───────────────────────────

function FileUploader({ onFile, disabled }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: '.csv',
    onDrop: disabled ? () => {} : files => onFile(files[0]),
  });
  return (
    <div
      {...getRootProps()}
      style={{
        border: '2px dashed #bbb',
        padding: 40,
        textAlign: 'center',
        borderRadius: 8,
        background: isDragActive ? '#eef' : '#fafafa',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1
      }}
    >
      <input {...getInputProps()} disabled={disabled}/>
      {disabled
        ? 'Uploading…'
        : isDragActive
          ? 'Drop CSV here…'
          : 'Drag & drop a CSV file here, or click to select'}
    </div>
  );
}

function CSVPreviewTable({ data }) {
  if (!data.length) return null;
  const headers = Object.keys(data[0]);
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {headers.map((h,i)=>(
            <th
              key={i}
              style={{
                padding: 8,
                border: '1px solid #ddd',
                background: '#f2f2f2'
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row,r)=>(
          <tr key={r}>
            {headers.map((h,c)=>(
              <td key={c} style={{ padding: 8, border: '1px solid #ddd' }}>
                {row[h]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProductSelector({ items, cart, onAdd }) {
  const [sel, setSel] = useState('');
  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Available Products</h3>
      <select
        size={10}
        style={{ width: 250, height: 200 }}
        value={sel}
        onChange={e => setSel(e.target.value)}
      >
        {items.map((it,i)=>(
          <option key={i} value={it} disabled={cart.includes(it)}>
            {it}
          </option>
        ))}
      </select>
      <br/>
      <button
        disabled={!sel}
        onClick={()=>{ onAdd(sel); setSel(''); }}
        style={{ marginTop: 10 }}
      >
        Add to Cart
      </button>
    </div>
  );
}

function CartSummary({ cart, onRemove, onExport, exporting }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Cart</h3>
      <ul
        style={{
          width: 300,
          height: 200,
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: 5,
          listStyle: 'none'
        }}
      >
        {cart.map((item,i)=>(
          <li
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4
            }}
          >
            {item}
            <button onClick={()=>onRemove(item)} style={{ color: 'red' }}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <button
        disabled={!cart.length || exporting}
        onClick={onExport}
        style={{ marginTop: 10 }}
      >
        {exporting ? 'Exporting…' : 'Export Sweep'}
      </button>
    </div>
  );
}
