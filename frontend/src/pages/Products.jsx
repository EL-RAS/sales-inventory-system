import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import ProductForm from '../components/ProductForm';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogType, setDialogType] = useState('add'); // 'add', 'edit', 'view'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  // Bringing products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: search || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      };

      const response = await productService.getAll(params);
      setProducts(response.data?.data || []);
      setTotal(response.data?.total || 0);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, search, categoryFilter]);

  // Extract unique categories
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Page Change Handling
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open/Close the Dialog
  const handleOpenDialog = (type, product = null) => {
    setDialogType(type);
    setSelectedProduct(product);
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  // Product preservation treatment
  const handleSaveProduct = async (productData) => {
    try {
      if (dialogType === 'add') {
        await productService.create(productData);
        setSuccess('Product added successfully!');
      } else {
        await productService.update(selectedProduct.id, productData);
        setSuccess('Product updated successfully!');
      }

      fetchProducts();
      setTimeout(() => {
        handleCloseDialog();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productService.delete(productId);
      setSuccess('Product deleted successfully!');
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <Box>
      {/* Title and Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#1a237e' }}>
          <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Products Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
          sx={{ backgroundColor: '#1a237e' }}
        >
          Add Product
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Search and filter bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search products..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories
                .filter(cat => cat !== 'all')
                .map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={() => {
              setSearch('');
              setCategoryFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Products Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography color="textSecondary">
              No products found. {search || categoryFilter !== 'all' ? 'Try changing your filters.' : 'Add your first product!'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Stock</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {product.product_name}
                          </Typography>
                          {product.description && (
                            <Typography variant="caption" color="textSecondary" noWrap sx={{ maxWidth: 200 }}>
                              {product.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={product.sku} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {product.category ? (
                          <Chip label={product.category} size="small" color="primary" />
                        ) : (
                          <Typography variant="caption" color="textSecondary">Uncategorized</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="medium">
                          ${parseFloat(product.unit_price).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={product.total_stock || 0}
                          size="small"
                          color={
                            (product.total_stock || 0) <= 10 ? 'error' :
                            (product.total_stock || 0) <= 25 ? 'warning' : 'success'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/products/${product.id}`)}
                              color="info"
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog('edit', product)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteProduct(product.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Dialog to Add/Edit Product */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'add' ? 'Add New Product' : dialogType === 'edit' ? 'Edit Product' : 'Product Details'}
        </DialogTitle>
        <DialogContent>
          <ProductForm
            product={selectedProduct}
            type={dialogType}
            onSubmit={handleSaveProduct}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Products;
