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
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
  Warehouse as WarehouseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { warehouseService, inventoryService } from '../services/api';
import WarehouseForm from '../components/WarehouseForm';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [dialogType, setDialogType] = useState('add'); // 'add', 'edit'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inventorySummary, setInventorySummary] = useState({});
  const [summaryLoading, setSummaryLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch all warehouses
  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await warehouseService.getAll();
      setWarehouses(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load warehouses');
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Bring stock statistics for each warehouse
  const fetchInventorySummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await inventoryService.getSummary();
      if (response.success && response.data) {
        // Inventory aggregation by warehouse
        const summary = {};
        (response.data.summary || []).forEach(item => {
          const warehouseId = item.warehouse_id;
          if (!summary[warehouseId]) {
            summary[warehouseId] = {
              totalQuantity: 0,
              totalValue: 0,
              productCount: 0,
            };
          }
          summary[warehouseId].totalQuantity += parseInt(item.total_quantity);
          // The value can be calculated here if we have the price of the products.
          summary[warehouseId].productCount += 1;
        });
        setInventorySummary(summary);
      }
    } catch (err) {
      console.error('Error fetching inventory summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchInventorySummary();
  }, []);

  // Filter warehouses by search
  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.warehouse_name.toLowerCase().includes(search.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(search.toLowerCase())
  );

  // Open/Close the Dialog
  const handleOpenDialog = (type, warehouse = null) => {
    setDialogType(type);
    setSelectedWarehouse(warehouse);
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedWarehouse(null);
  };

  // Repository save processing
  const handleSaveWarehouse = async (warehouseData) => {
    try {
      if (dialogType === 'add') {
        await warehouseService.create(warehouseData);
        setSuccess('Warehouse added successfully!');
      } else {
        await warehouseService.update(selectedWarehouse.id, warehouseData);
        setSuccess('Warehouse updated successfully!');
      }

      fetchWarehouses();
      fetchInventorySummary(); // Update statistics

      setTimeout(() => {
        handleCloseDialog();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save warehouse');
    }
  };

  // Delete Repository
  const handleDeleteWarehouse = async (warehouseId) => {
    if (!window.confirm('Are you sure you want to delete this warehouse? This will also delete all inventory records in this warehouse.')) {
      return;
    }

    try {
      await warehouseService.delete(warehouseId);
      setSuccess('Warehouse deleted successfully!');
      fetchWarehouses();
      fetchInventorySummary();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete warehouse');
    }
  };

  // Data Renewal
  const handleRefresh = () => {
    fetchWarehouses();
    fetchInventorySummary();
  };

  // Statistical card
  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h5">
              {value}
            </Typography>
          </Box>
          <Box sx={{ color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Title and Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#1a237e' }}>
          <WarehouseIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Warehouses Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading || summaryLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
            sx={{ backgroundColor: '#1a237e' }}
          >
            Add Warehouse
          </Button>
        </Box>
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

      {/* Warehouse Statistics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
          Warehouse Statistics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Warehouses"
              value={warehouses.length}
              icon={<WarehouseIcon sx={{ fontSize: 40 }} />}
              color="#3f51b5"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Products"
              value={Object.values(inventorySummary).reduce((acc, curr) => acc + curr.productCount, 0)}
              icon={<InventoryIcon sx={{ fontSize: 40 }} />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Stock"
              value={Object.values(inventorySummary).reduce((acc, curr) => acc + curr.totalQuantity, 0)}
              icon={<InventoryIcon sx={{ fontSize: 40 }} />}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Actions
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate('/inventory')}
                      sx={{ backgroundColor: '#1a237e', mt: 1 }}
                    >
                      View Inventory
                    </Button>
                  </Box>
                  <LocationIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Search bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            placeholder="Search warehouses by name or location..."
            variant="outlined"
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      {/* Warehouse Schedule */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredWarehouses.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography color="textSecondary">
              {warehouses.length === 0 ? 'No warehouses found. Add your first warehouse!' : 'No warehouses match your search.'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Warehouse Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align="center">Inventory</TableCell>
                  <TableCell align="center">Total Stock</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWarehouses.map((warehouse) => {
                  const summary = inventorySummary[warehouse.id] || { totalQuantity: 0, productCount: 0 };

                  return (
                    <TableRow key={warehouse.id} hover>
                      <TableCell>{warehouse.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarehouseIcon color="primary" fontSize="small" />
                          <Typography variant="body2" fontWeight="medium">
                            {warehouse.warehouse_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            {warehouse.location}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${summary.productCount} products`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={summary.totalQuantity}
                          size="small"
                          color={
                            summary.totalQuantity === 0 ? 'default' :
                            summary.totalQuantity <= 10 ? 'warning' : 'success'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(warehouse.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Inventory">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/inventory?warehouse_id=${warehouse.id}`)}
                              color="info"
                            >
                              <InventoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog('edit', warehouse)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteWarehouse(warehouse.id)}
                              color="error"
                              disabled={summary.productCount > 0}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        {summary.productCount > 0 && (
                          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                            Cannot delete - has inventory
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog to Add/Edit Repository */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'add' ? 'Add New Warehouse' : 'Edit Warehouse'}
        </DialogTitle>
        <DialogContent>
          <WarehouseForm
            warehouse={selectedWarehouse}
            onSubmit={handleSaveWarehouse}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Warehouses;
