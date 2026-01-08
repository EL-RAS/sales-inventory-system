import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Box,
	Paper,
	Typography,
	Button,
	Grid,
	Card,
	CardContent,
	Chip,
	Divider,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	LinearProgress,
	Alert,
} from '@mui/material';
import {
	ArrowBack as ArrowBackIcon,
	Edit as EditIcon,
	Inventory as InventoryIcon,
	TrendingUp as TrendingUpIcon,
	Warehouse as WarehouseIcon,
} from '@mui/icons-material';
import { productService, inventoryService } from '../services/api';

const ProductDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [product, setProduct] = useState(null);
	const [inventory, setInventory] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		fetchProductDetails();
	}, [id]);

	const fetchProductDetails = async () => {
		setLoading(true);
		try {
			const [productData, inventoryData] = await Promise.all([
				productService.getById(id),
				inventoryService.getAll({ product_id: id }),
			]);

			setProduct(productData.data);
			setInventory(inventoryData.data?.data || []);
		} catch (err) {
			setError('Failed to load product details');
			console.error('Error:', err);
		} finally {
			setLoading(false);
		}
	};

	const calculateTotalStock = () => {
		return inventory.reduce((total, item) => total + (item.quantity || 0), 0);
	};

	const handleUpdateStock = () => {
		// Inventory update logic can be added here
		alert('Update stock functionality would go here');
	};

	if (loading) {
		return (
			<Box sx={{ width: '100%' }}>
				<LinearProgress />
			</Box>
		);
	}

	if (error || !product) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">{error || 'Product not found'}</Alert>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate('/products')}
					sx={{ mt: 2 }}
				>
					Back to Products
				</Button>
			</Box>
		);
	}

	return (
		<Box>
			{/* Title bar */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<IconButton onClick={() => navigate('/products')}>
						<ArrowBackIcon />
					</IconButton>
					<Typography variant="h4" sx={{ color: '#1a237e' }}>
						{product.product_name}
					</Typography>
					<Chip label={product.sku} size="small" variant="outlined" />
				</Box>
				<Button
					variant="contained"
					startIcon={<EditIcon />}
					onClick={() => navigate(`/products/edit/${id}`)}
					sx={{ backgroundColor: '#1a237e' }}
				>
					Edit Product
				</Button>
			</Box>

			<Grid container spacing={3}>
				{/* Product Information */}
				<Grid item xs={12} md={8}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
							Product Information
						</Typography>

						<Grid container spacing={2}>
							<Grid item xs={6}>
								<Typography variant="subtitle2" color="textSecondary">Category</Typography>
								<Typography variant="body1">
									{product.category || 'Uncategorized'}
								</Typography>
							</Grid>
							<Grid item xs={6}>
								<Typography variant="subtitle2" color="textSecondary">Price</Typography>
								<Typography variant="h6" color="primary">
									${parseFloat(product.unit_price).toFixed(2)}
								</Typography>
							</Grid>
							<Grid item xs={12}>
								<Typography variant="subtitle2" color="textSecondary">Description</Typography>
								<Typography variant="body1" sx={{ mt: 1 }}>
									{product.description || 'No description available.'}
								</Typography>
							</Grid>
						</Grid>

						<Divider sx={{ my: 3 }} />

						{/* Inventory Statistics */}
						<Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
							Stock Information
						</Typography>
						<Grid container spacing={2}>
							<Grid item xs={6} md={3}>
								<Card>
									<CardContent>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<InventoryIcon color="primary" />
											<Typography variant="h6">{calculateTotalStock()}</Typography>
										</Box>
										<Typography variant="body2" color="textSecondary">
											Total Stock
										</Typography>
									</CardContent>
								</Card>
							</Grid>
							<Grid item xs={6} md={3}>
								<Card>
									<CardContent>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<WarehouseIcon color="action" />
											<Typography variant="h6">{inventory.length}</Typography>
										</Box>
										<Typography variant="body2" color="textSecondary">
											Warehouses
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						</Grid>
					</Paper>
				</Grid>

				{/* Quick procedures */}
				<Grid item xs={12} md={4}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
							Quick Actions
						</Typography>

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<Button
								variant="contained"
								fullWidth
								onClick={handleUpdateStock}
								sx={{ backgroundColor: '#4caf50' }}
							>
								Update Stock
							</Button>
							<Button
								variant="outlined"
								fullWidth
								onClick={() => navigate(`/inventory?product_id=${id}`)}
							>
								View Inventory Details
							</Button>
							<Button
								variant="outlined"
								fullWidth
								onClick={() => navigate('/orders/new', { state: { productId: id } })}
							>
								Create Order with this Product
							</Button>
						</Box>
					</Paper>
				</Grid>

				{/* Inventory by warehouse */}
				<Grid item xs={12}>
					<Paper sx={{ p: 3 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
							<Typography variant="h6" sx={{ color: '#1a237e' }}>
								Stock by Warehouse
							</Typography>
							<Button
								variant="outlined"
								size="small"
								onClick={() => navigate('/inventory')}
							>
								Manage All Inventory
							</Button>
						</Box>

						{inventory.length === 0 ? (
							<Alert severity="info">
								This product has no inventory records. Add stock to warehouses.
							</Alert>
						) : (
							<TableContainer>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>Warehouse</TableCell>
											<TableCell align="right">Quantity</TableCell>
											<TableCell>Location</TableCell>
											<TableCell align="right">Last Updated</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{inventory.map((item) => (
											<TableRow key={item.id}>
												<TableCell>
													<Typography fontWeight="medium">
														{item.warehouse?.warehouse_name || 'Unknown'}
													</Typography>
												</TableCell>
												<TableCell align="right">
													<Chip
														label={item.quantity}
														size="small"
														color={item.quantity <= 10 ? 'error' : 'success'}
													/>
												</TableCell>
												<TableCell>{item.warehouse?.location || 'N/A'}</TableCell>
												<TableCell align="right">
													{new Date(item.updated_at).toLocaleDateString()}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						)}
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default ProductDetail;
