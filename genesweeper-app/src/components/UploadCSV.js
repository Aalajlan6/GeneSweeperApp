import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

function UploadCSV() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [file, setFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [csvData, setCsvData] = useState([]); // Full CSV data
    const [csvPreview, setCsvPreview] = useState([]); // Filtered CSV preview
    const [selectedProduct, setSelectedProduct] = useState(''); // State for the selected product

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        setFile(uploadedFile);

        // Parse the CSV file for preview
        Papa.parse(uploadedFile, {
            header: true, // Parse the CSV with headers
            skipEmptyLines: true,
            complete: (result) => {
                setCsvData(result.data); // Store the full CSV data
                setCsvPreview(result.data.slice(0, 10)); // Initially show the first 10 rows
            },
            error: (error) => {
                console.error('Error parsing CSV:', error);
            },
        });
    };

    const handleUpload = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('csv_file', file);

        axios.post('http://127.0.0.1:8000/api/upload-csv/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(response => {
            setProducts(response.data.products);
            setFilteredProducts(response.data.products);
        })
        .catch(error => {
            console.error('Error uploading:', error);
        });
    };

    const handleDownload = () => {
        if (file) {
            const url = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name; // Use the original file name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Filter CSV data based on the search query
        const filtered = csvData.filter(row =>
            Object.values(row).some(value =>
                value.toString().toLowerCase().includes(query.toLowerCase())
            )
        );

        setCsvPreview(filtered.slice(0, 10)); // Update the preview with filtered rows (limit to 10)
    };

    const handleProductSelect = (e) => {
        setSelectedProduct(e.target.value);
    };

    const handleAddToCart = () => {
        if (selectedProduct && !cart.includes(selectedProduct)) {
            setCart(prev => [...prev, selectedProduct]);
        }
    };

    const handleRemoveFromCart = (item) => {
        setCart(prev => prev.filter(product => product !== item));
    };

    const handleExport = () => {
        const formData = new FormData();
        cart.forEach(product => {
            formData.append('products[]', product);
        });

        axios.post('http://127.0.0.1:8000/api/export-csv/', formData, {
            responseType: 'blob'
        })
        .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            const name = `${cart.join('_').substring(0, 20)}.csv`
            const date = new Date().toISOString().split('T')[0];
            link.href = url;
            link.setAttribute('download', name);
            document.body.appendChild(link);
            link.click();
            link.remove();

            axios.post('http://127.0.0.1:8000/api/save-sweep/', {
                products: cart,
                name: name
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                }
            })
            .then(res => {
                console.log('Sweep saved successfully:', res.data);
            })
            .catch(err => {
                console.error('Error saving sweep:', err);
            });

        })
        .catch(error => {
            console.error('Error exporting:', error);
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <form onSubmit={handleUpload}>
                <input type="file" onChange={handleFileChange} accept=".csv" required />
                <button type="submit">Upload CSV</button>
            </form>

            {/* Download Button */}
            {file && (
                <button
                    onClick={handleDownload}
                    style={{
                        marginTop: '10px',
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Download CSV
                </button>
            )}

            {/* Search Input */}
            {csvData.length > 0 && (
                <div style={{ marginTop: '20px', width: '80%' }}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                        }}
                    />
                </div>
            )}

            {/* CSV Preview Section */}
            {csvPreview.length > 0 && (
                <div
                    style={{
                        marginTop: '20px',
                        width: '80%',
                        maxWidth: '600px',
                        overflowX: 'auto',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '10px',
                        backgroundColor: '#f9f9f9',
                    }}
                >
                    <h3 style={{ textAlign: 'center' }}>Table Preview</h3>
                    <table
                        border="1"
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            borderCollapse: 'collapse',
                            fontSize: '14px',
                        }}
                    >
                        <thead>
                            <tr>
                                {Object.keys(csvPreview[0]).map((header, index) => (
                                    <th
                                        key={index}
                                        style={{
                                            padding: '8px',
                                            backgroundColor: '#f2f2f2',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {csvPreview.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {Object.values(row).map((value, colIndex) => (
                                        <td key={colIndex} style={{ padding: '8px' }}>
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {csvPreview.length === 0 && searchQuery && (
                <div style={{ marginTop: '20px', color: 'red' }}>
                    <p>No results found for "{searchQuery}".</p>
                </div>
            )}

            {products.length > 0 && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '40px' }}>
                    {/* Left side: Products List */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h3>Available Products</h3>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            style={{ width: '200px', marginBottom: '10px' }}
                        />
                        <select
                            size="10"
                            style={{ width: '250px', height: '200px' }}
                            onChange={handleProductSelect}
                        >
                            {filteredProducts.map((product, index) => (
                                <option key={index} value={product}>
                                    {product}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleAddToCart} style={{ marginTop: '10px' }}>
                            Add to Cart
                        </button>
                    </div>

                    {/* Right side: Cart */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h3>Cart</h3>
                        <ul style={{ width: '300px', height: '200px', overflowY: 'auto', border: '1px solid black', padding: '5px' }}>
                            {cart.map((item, index) => (
                                <li key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    {item}
                                    <button
                                        onClick={() => handleRemoveFromCart(item)}
                                        style={{ marginTop: '10px', color: 'red' }}
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button onClick={handleExport} style={{ marginTop: '10px' }}>
                            Export Sweep
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UploadCSV;
