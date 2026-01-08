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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tooltip,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warehouse as WarehouseIcon,
  Inventory as InventoryIcon,
  TransferWithinAStation as TransferIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { inventoryService, warehouseService, productService } from '../services/api';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    quantity: 0,
  });
  const [transferData, setTransferData] = useState({
    from_warehouse_id: '',
    to_warehouse_id: '',
    product_id: '',
    quantity: 1,
    reason: '',
  });
  const [updateData, setUpdateData] = useState({
    operation: 'add',
    quantity: 1,
    reason: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [summary, setSummary] = useState(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [inventoryRes, warehousesRes, productsRes, summaryRes] = await Promise.all([
        inventoryService.getAll(),
        warehouseService.getAll(),
        productService.getAll({ per_page: 1000 }),
        inventoryService.getSummary(),
      ]);

      // For warehouses: if it is paginated
      const warehousesData = warehousesRes?.data?.data ||
        (Array.isArray(warehousesRes?.data) ? warehousesRes?.data : []) ||
        (Array.isArray(warehousesRes) ? warehousesRes : []);

      // For inventory: if it is paginated
      const inventoryData = inventoryRes?.data?.data ||
        (Array.isArray(inventoryRes?.data) ? inventoryRes?.data : []) ||
        (Array.isArray(inventoryRes) ? inventoryRes : []);

      // For products: if it is paginated
      const productsData = productsRes?.data?.data ||
        (Array.isArray(productsRes?.data) ? productsRes?.data : []) ||
        (Array.isArray(productsRes) ? productsRes : []);

      setInventory(inventoryData);
      setWarehouses(warehousesData);
      setProducts(productsData);
      setSummary(summaryRes?.data || summaryRes || {});

    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({ open: true, message: 'Failed to load data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const product = products.find(p => p.id === item.product_id);
    const warehouse = warehouses.find(w => w.id === item.warehouse_id);

    const matchesSearch =
      product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse?.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWarehouse = warehouseFilter === 'all' || item.warehouse_id.toString() === warehouseFilter;
    const matchesLowStock = !lowStockFilter || item.quantity <= 10;

    return matchesSearch && matchesWarehouse && matchesLowStock;
  });

  // Handle dialog open for new inventory
  const handleOpenNewDialog = () => {
    setCurrentItem(null);
    setFormData({
      product_id: '',
      warehouse_id: '',
      quantity: 0,
    });
    setOpenDialog(true);
  };

  // Handle dialog open for edit inventory
  const handleOpenEditDialog = (item) => {
    setCurrentItem(item);
    setFormData({
      product_id: item.product_id.toString(),
      warehouse_id: item.warehouse_id.toString(),
      quantity: item.quantity,
    });
    setOpenDialog(true);
  };

  // Handle dialog open for update stock
  const handleOpenUpdateDialog = (item) => {
    setCurrentItem(item);
    setUpdateData({
      operation: 'add',
      quantity: 1,
      reason: '',
    });
    setOpenUpdateDialog(true);
  };

  // Handle dialog open for transfer stock
  const handleOpenTransferDialog = (item = null) => {
    setTransferData({
      from_warehouse_id: item ? item.warehouse_id.toString() : '',
      to_warehouse_id: '',
      product_id: item ? item.product_id.toString() : '',
      quantity: 1,
      reason: '',
    });
    setOpenTransferDialog(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle transfer form change
  const handleTransferChange = (e) => {
    const { name, value } = e.target;
    setTransferData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle update form change
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save inventory
  const handleSaveInventory = async () => {
    try {
      const inventoryData = {
        ...formData,
        product_id: parseInt(formData.product_id),
        warehouse_id: parseInt(formData.warehouse_id),
        quantity: parseInt(formData.quantity),
      };

      if (currentItem) {
        await inventoryService.update(currentItem.id, inventoryData);
        setSnackbar({ open: true, message: 'Inventory updated successfully', severity: 'success' });
      } else {
        await inventoryService.create(inventoryData);
        setSnackbar({ open: true, message: 'Inventory created successfully', severity: 'success' });
      }

      setOpenDialog(false);
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save inventory';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  // Handle delete inventory
  const handleDeleteInventory = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory record?')) {
      try {
        await inventoryService.delete(id);
        setSnackbar({ open: true, message: 'Inventory deleted successfully', severity: 'success' });
        fetchData();
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete inventory';
        setSnackbar({ open: true, message, severity: 'error' });
      }
    }
  };

  // Handle transfer stock
  const handleTransferStock = async () => {
    try {
      const transferDataToSend = {
        ...transferData,
        from_warehouse_id: parseInt(transferData.from_warehouse_id),
        to_warehouse_id: parseInt(transferData.to_warehouse_id),
        product_id: parseInt(transferData.product_id),
        quantity: parseInt(transferData.quantity),
      };

      await inventoryService.transferStock(transferDataToSend);
      setSnackbar({ open: true, message: 'Stock transferred successfully', severity: 'success' });
      setOpenTransferDialog(false);
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to transfer stock';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  // Handle update stock
  const handleUpdateStock = async () => {
    try {
      await inventoryService.updateStock(currentItem.id, updateData);
      setSnackbar({ open: true, message: 'Stock updated successfully', severity: 'success' });
      setOpenUpdateDialog(false);
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update stock';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  // Get product name
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.product_name : 'Unknown Product';
  };

  // Get warehouse name
  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.warehouse_name : 'Unknown Warehouse';
  };

  // Get product SKU
  const getProductSKU = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.sku : 'N/A';
  };

  // Calculate total stock for a product
  const getTotalStock = (productId) => {
    return inventory
      .filter(item => item.product_id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginated inventory
  const paginatedInventory = filteredInventory.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Low stock items
  const lowStockItems = inventory.filter(item => item.quantity <= 10);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#1a237e' }}>
          Inventory Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<TransferIcon />}
            onClick={() => handleOpenTransferDialog()}
          >
            Transfer Stock
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenNewDialog}
            sx={{ backgroundColor: '#1a237e' }}
          >
            Add Inventory
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Items
                  </Typography>
                  <Typography variant="h4">
                    {inventory.length}
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, color: '#3f51b5' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Warehouses
                  </Typography>
                  <Typography variant="h4">
                    {warehouses.length}
                  </Typography>
                </Box>
                <WarehouseIcon sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4" color={lowStockItems.length > 0 ? 'warning.main' : 'inherit'}>
                    {lowStockItems.length}
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Products
                  </Typography>
                  <Typography variant="h4">
                    {products.length}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#f44336' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search products or warehouses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Warehouse</InputLabel>
              <Select
                value={warehouseFilter}
                label="Warehouse"
                onChange={(e) => setWarehouseFilter(e.target.value)}
              >
                <MenuItem value="all">All Warehouses</MenuItem>
                {warehouses.map(warehouse => (
                  <MenuItem key={warehouse.id} value={warehouse.id.toString()}>
                    {warehouse.warehouse_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Stock Level</InputLabel>
              <Select
                value={lowStockFilter}
                label="Stock Level"
                onChange={(e) => setLowStockFilter(e.target.value)}
              >
                <MenuItem value={false}>All Stock</MenuItem>
                <MenuItem value={true}>Low Stock Only (≤10)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="textSecondary">
              {filteredInventory.length} records
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Inventory Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Product</strong></TableCell>
              <TableCell><strong>SKU</strong></TableCell>
              <TableCell><strong>Warehouse</strong></TableCell>
              <TableCell align="right"><strong>Quantity</strong></TableCell>
              <TableCell align="right"><strong>Total Stock</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <LinearProgress sx={{ width: '100%' }} />
                </TableCell>
              </TableRow>
            ) : paginatedInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No inventory records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedInventory.map((item) => {
                const totalStock = getTotalStock(item.product_id);
                const isLowStock = item.quantity <= 10;

                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{getProductName(item.product_id)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={getProductSKU(item.product_id)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarehouseIcon fontSize="small" color="action" />
                        <Typography variant="body2">{getWarehouseName(item.warehouse_id)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          color={isLowStock ? 'warning.main' : 'success.main'}
                        >
                          {item.quantity}
                        </Typography>
                        {isLowStock && <WarningIcon fontSize="small" color="warning" />}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {totalStock}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Add/Remove Stock">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenUpdateDialog(item)}
                          >
                            {item.quantity > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Transfer">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleOpenTransferDialog(item)}
                          >
                            <TransferIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleOpenEditDialog(item)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteInventory(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredInventory.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Add/Edit Inventory Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentItem ? 'Edit Inventory' : 'Add New Inventory'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={formData.product_id}
                    label="Product"
                    name="product_id"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">Select Product</MenuItem>
                    {products.map(product => (
                      <MenuItem key={product.id} value={product.id.toString()}>
                        {product.product_name} (SKU: {product.sku})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Warehouse</InputLabel>
                  <Select
                    value={formData.warehouse_id}
                    label="Warehouse"
                    name="warehouse_id"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">Select Warehouse</MenuItem>
                    {warehouses.map(warehouse => (
                      <MenuItem key={warehouse.id} value={warehouse.id.toString()}>
                        {warehouse.warehouse_name} ({warehouse.location})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveInventory}
            variant="contained"
            disabled={!formData.product_id || !formData.warehouse_id || formData.quantity < 0}
            sx={{ backgroundColor: '#1a237e' }}
          >
            {currentItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Stock Dialog */}
      <Dialog open={openTransferDialog} onClose={() => setOpenTransferDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Stock Between Warehouses</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>From Warehouse</InputLabel>
                  <Select
                    value={transferData.from_warehouse_id}
                    label="From Warehouse"
                    name="from_warehouse_id"
                    onChange={handleTransferChange}
                  >
                    <MenuItem value="">Select Source Warehouse</MenuItem>
                    {warehouses.map(warehouse => (
                      <MenuItem key={warehouse.id} value={warehouse.id.toString()}>
                        {warehouse.warehouse_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>To Warehouse</InputLabel>
                  <Select
                    value={transferData.to_warehouse_id}
                    label="To Warehouse"
                    name="to_warehouse_id"
                    onChange={handleTransferChange}
                  >
                    <MenuItem value="">Select Destination Warehouse</MenuItem>
                    {warehouses
                      .filter(w => w.id.toString() !== transferData.from_warehouse_id)
                      .map(warehouse => (
                        <MenuItem key={warehouse.id} value={warehouse.id.toString()}>
                          {warehouse.warehouse_name}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={transferData.product_id}
                    label="Product"
                    name="product_id"
                    onChange={handleTransferChange}
                  >
                    <MenuItem value="">Select Product</MenuItem>
                    {products.map(product => (
                      <MenuItem key={product.id} value={product.id.toString()}>
                        {product.product_name} (Current: {getTotalStock(product.id)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quantity to Transfer"
                  name="quantity"
                  type="number"
                  value={transferData.quantity}
                  onChange={handleTransferChange}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason for Transfer"
                  name="reason"
                  value={transferData.reason}
                  onChange={handleTransferChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransferDialog(false)}>Cancel</Button>
          <Button
            onClick={handleTransferStock}
            variant="contained"
            disabled={
              !transferData.from_warehouse_id ||
              !transferData.to_warehouse_id ||
              !transferData.product_id ||
              transferData.quantity < 1 ||
              transferData.from_warehouse_id === transferData.to_warehouse_id
            }
            sx={{ backgroundColor: '#1a237e' }}
          >
            Transfer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Stock Dialog */}
      <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Stock - {currentItem && getProductName(currentItem.product_id)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Operation</InputLabel>
                  <Select
                    value={updateData.operation}
                    label="Operation"
                    name="operation"
                    onChange={handleUpdateChange}
                  >
                    <MenuItem value="add">Add Stock</MenuItem>
                    <MenuItem value="subtract">Remove Stock</MenuItem>
                    <MenuItem value="set">Set Exact Quantity</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={updateData.quantity}
                  onChange={handleUpdateChange}
                  required
                  inputProps={{ min: 1 }}
                  helperText={
                    updateData.operation === 'subtract'
                      ? `Current stock: ${currentItem?.quantity || 0}`
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  name="reason"
                  value={updateData.reason}
                  onChange={handleUpdateChange}
                  placeholder="e.g., New shipment, Damaged items, etc."
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateStock}
            variant="contained"
            disabled={!updateData.quantity || updateData.quantity < 1}
            sx={{ backgroundColor: '#1a237e' }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Inventory;
