import React, { useState, useEffect } from 'react';
import {
	Box,
	Paper,
	Typography,
	Grid,
	Card,
	CardContent,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	TextField,
	MenuItem,
	IconButton,
	CircularProgress,
	Alert,
	FormControl,
	InputLabel,
	Select,
} from '@mui/material';
import {
	TrendingUp,
	TrendingDown,
	AttachMoney,
	ShoppingCart,
	People,
	Inventory,
	Refresh,
	DateRange,
	BarChart,
	PieChart,
	Timeline,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart, Line } from 'recharts';
import {
	orderService,
	productService,
	customerService,
	inventoryService,
} from '../services/api';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const Reports = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [dateRange, setDateRange] = useState({
		startDate: startOfMonth(new Date()),
		endDate: endOfMonth(new Date()),
	});
	const [reportType, setReportType] = useState('sales');

	// State for reports data
	const [salesStats, setSalesStats] = useState(null);
	const [topProducts, setTopProducts] = useState([]);
	const [topCustomers, setTopCustomers] = useState([]);
	const [inventorySummary, setInventorySummary] = useState([]);
	const [salesData, setSalesData] = useState([]);

	// Color palette for charts
	const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

	// Load reports data
	const loadReportsData = async () => {
		setLoading(true);
		setError('');

		try {
			// Load sales statistics
			const statsParams = {
				start_date: format(dateRange.startDate, 'yyyy-MM-dd'),
				end_date: format(dateRange.endDate, 'yyyy-MM-dd'),
			};

			const [salesResponse, productsResponse, customersResponse, inventoryResponse] = await Promise.all([
				orderService.getSalesStats(statsParams),
				productService.getAll({ per_page: 100 }),
				customerService.getAll({ per_page: 100 }),
				inventoryService.getSummary(),
			]);

			// Process sales data
			setSalesStats(salesResponse.data?.statistics || {});
			setTopProducts(salesResponse.data?.top_products || []);

			// Process customers data (mock top customers for now)
			const customers = customersResponse.data?.data || [];
			const mockTopCustomers = customers.slice(0, 5).map((customer, index) => ({
				...customer,
				total_spent: Math.floor(Math.random() * 5000) + 1000,
			}));
			setTopCustomers(mockTopCustomers);

			// Process inventory data
			setInventorySummary(inventoryResponse.data?.low_stock || []);

			// Generate mock sales data for chart
			generateMockSalesData();

		} catch (err) {
			console.error('Error loading reports:', err);
			setError('Failed to load reports data. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// Generate mock sales data for chart
	const generateMockSalesData = () => {
		const days = 30;
		const data = [];

		for (let i = 0; i < days; i++) {
			const date = subDays(new Date(), days - i - 1);
			data.push({
				date: format(date, 'MMM dd'),
				sales: Math.floor(Math.random() * 5000) + 1000,
				orders: Math.floor(Math.random() * 20) + 5,
				customers: Math.floor(Math.random() * 15) + 3,
			});
		}

		setSalesData(data);
	};

	// Load data on component mount and when date range changes
	useEffect(() => {
		loadReportsData();
	}, [dateRange]);

	// Format currency
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	// Stat Card Component
	const StatCard = ({ title, value, icon, trend, color }) => (
		<Card sx={{ height: '100%' }}>
			<CardContent>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
					<Box>
						<Typography color="textSecondary" variant="body2" gutterBottom>
							{title}
						</Typography>
						<Typography variant="h4" sx={{ fontWeight: 'bold', color }}>
							{title.includes('Revenue') || title.includes('Sales') ? formatCurrency(value) : value}
						</Typography>
						{trend && (
							<Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
								{trend > 0 ? (
									<TrendingUp sx={{ fontSize: 16, color: '#4caf50', mr: 0.5 }} />
								) : (
									<TrendingDown sx={{ fontSize: 16, color: '#f44336', mr: 0.5 }} />
								)}
								<Typography variant="body2" color={trend > 0 ? '#4caf50' : '#f44336'}>
									{Math.abs(trend)}% {trend > 0 ? 'increase' : 'decrease'}
								</Typography>
							</Box>
						)}
					</Box>
					<Box sx={{ color, opacity: 0.8 }}>
						{icon}
					</Box>
				</Box>
			</CardContent>
		</Card>
	);

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Box>
				{/* Header */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
					<Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
						Reports & Analytics
					</Typography>
					<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
						<FormControl size="small" sx={{ minWidth: 150 }}>
							<InputLabel>Report Type</InputLabel>
							<Select
								value={reportType}
								label="Report Type"
								onChange={(e) => setReportType(e.target.value)}
							>
								<MenuItem value="sales">Sales Report</MenuItem>
								<MenuItem value="inventory">Inventory Report</MenuItem>
								<MenuItem value="customers">Customers Report</MenuItem>
							</Select>
						</FormControl>
						<IconButton onClick={loadReportsData} color="primary">
							<Refresh />
						</IconButton>
					</Box>
				</Box>

				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				{/* Date Range Selector */}
				<Paper sx={{ p: 3, mb: 4 }}>
					<Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<DateRange /> Date Range
					</Typography>
					<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
						<DatePicker
							label="Start Date"
							value={dateRange.startDate}
							onChange={(newValue) => setDateRange({ ...dateRange, startDate: newValue })}
							renderInput={(params) => <TextField {...params} size="small" />}
						/>
						<DatePicker
							label="End Date"
							value={dateRange.endDate}
							onChange={(newValue) => setDateRange({ ...dateRange, endDate: newValue })}
							renderInput={(params) => <TextField {...params} size="small" />}
						/>
						<Box sx={{ display: 'flex', gap: 1, flexGrow: 1, justifyContent: 'flex-end' }}>
							{['Today', 'Week', 'Month', 'Year'].map((period) => (
								<Chip
									key={period}
									label={period}
									onClick={() => {
										const now = new Date();
										if (period === 'Today') {
											setDateRange({ startDate: now, endDate: now });
										} else if (period === 'Week') {
											setDateRange({ startDate: subDays(now, 7), endDate: now });
										} else if (period === 'Month') {
											setDateRange({ startDate: startOfMonth(now), endDate: endOfMonth(now) });
										} else if (period === 'Year') {
											setDateRange({ startDate: new Date(now.getFullYear(), 0, 1), endDate: now });
										}
									}}
									variant="outlined"
									sx={{ cursor: 'pointer' }}
								/>
							))}
						</Box>
					</Box>
				</Paper>

				{/* Sales Summary Cards */}
				{reportType === 'sales' && (
					<>
						<Grid container spacing={3} sx={{ mb: 4 }}>
							<Grid item xs={12} sm={6} md={3}>
								<StatCard
									title="Total Revenue"
									value={salesStats.total_revenue || 0}
									icon={<AttachMoney sx={{ fontSize: 40 }} />}
									trend={12.5}
									color="#4caf50"
								/>
							</Grid>
							<Grid item xs={12} sm={6} md={3}>
								<StatCard
									title="Total Orders"
									value={salesStats.total_orders || 0}
									icon={<ShoppingCart sx={{ fontSize: 40 }} />}
									trend={8.2}
									color="#2196f3"
								/>
							</Grid>
							<Grid item xs={12} sm={6} md={3}>
								<StatCard
									title="Avg Order Value"
									value={salesStats.avg_order_value || 0}
									icon={<TrendingUp sx={{ fontSize: 40 }} />}
									trend={4.7}
									color="#ff9800"
								/>
							</Grid>
							<Grid item xs={12} sm={6} md={3}>
								<StatCard
									title="Total Customers"
									value={topCustomers.length || 0}
									icon={<People sx={{ fontSize: 40 }} />}
									trend={15.3}
									color="#9c27b0"
								/>
							</Grid>
						</Grid>

						{/* Charts */}
						<Grid container spacing={3} sx={{ mb: 4 }}>
							<Grid item xs={12} md={8}>
								<Paper sx={{ p: 3, height: 400 }}>
									<Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Timeline /> Sales Trend (Last 30 Days)
									</Typography>
									<ResponsiveContainer width="100%" height="90%">
										<LineChart data={salesData}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="date" />
											<YAxis />
											<Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
											<Legend />
											<Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
											<Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} />
										</LineChart>
									</ResponsiveContainer>
								</Paper>
							</Grid>
							<Grid item xs={12} md={4}>
								<Paper sx={{ p: 3, height: 400 }}>
									<Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<PieChart /> Sales by Category
									</Typography>
									<ResponsiveContainer width="100%" height="90%">
										<RePieChart>
											<Pie
												data={[
													{ name: 'Electronics', value: 4000 },
													{ name: 'Clothing', value: 3000 },
													{ name: 'Furniture', value: 2000 },
													{ name: 'Books', value: 1500 },
													{ name: 'Others', value: 1000 },
												]}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={(entry) => `${entry.name}: $${entry.value}`}
												outerRadius={80}
												fill="#8884d8"
												dataKey="value"
											>
												{COLORS.map((color, index) => (
													<Cell key={`cell-${index}`} fill={color} />
												))}
											</Pie>
											<Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
										</RePieChart>
									</ResponsiveContainer>
								</Paper>
							</Grid>
						</Grid>

						{/* Top Products Table */}
						<Paper sx={{ p: 3, mb: 4 }}>
							<Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<BarChart /> Top Selling Products
							</Typography>
							<TableContainer>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>Product</TableCell>
											<TableCell align="right">Quantity Sold</TableCell>
											<TableCell align="right">Total Revenue</TableCell>
											<TableCell align="right">Category</TableCell>
											<TableCell>Performance</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{topProducts.length > 0 ? (
											topProducts.map((product) => (
												<TableRow key={product.product_name}>
													<TableCell>{product.product_name}</TableCell>
													<TableCell align="right">{product.total_quantity || 0}</TableCell>
													<TableCell align="right">{formatCurrency(product.total_revenue || 0)}</TableCell>
													<TableCell align="right">
														<Chip label={product.category || 'N/A'} size="small" />
													</TableCell>
													<TableCell>
														<Box sx={{ width: '100%', bgcolor: '#e0e0e0', borderRadius: 1, height: 8 }}>
															<Box
																sx={{
																	width: `${Math.min((product.total_quantity || 0) * 5, 100)}%`,
																	bgcolor: '#4caf50',
																	height: '100%',
																	borderRadius: 1,
																}}
															/>
														</Box>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell colSpan={5} align="center">
													<Typography color="textSecondary" sx={{ py: 2 }}>
														No sales data available
													</Typography>
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</TableContainer>
						</Paper>
					</>
				)}

				{/* Inventory Report */}
				{reportType === 'inventory' && (
					<>
						<Paper sx={{ p: 3, mb: 4 }}>
							<Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Inventory /> Low Stock Alert
							</Typography>
							<TableContainer>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>Product</TableCell>
											<TableCell>Warehouse</TableCell>
											<TableCell align="right">Current Stock</TableCell>
											<TableCell align="right">Reorder Level</TableCell>
											<TableCell>Status</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{inventorySummary.length > 0 ? (
											inventorySummary.map((item) => (
												<TableRow key={item.id}>
													<TableCell>{item.product?.product_name || 'N/A'}</TableCell>
													<TableCell>{item.warehouse?.warehouse_name || 'N/A'}</TableCell>
													<TableCell align="right">
														<Chip
															label={item.quantity}
															color={item.quantity <= 5 ? 'error' : item.quantity <= 10 ? 'warning' : 'default'}
															size="small"
														/>
													</TableCell>
													<TableCell align="right">10</TableCell>
													<TableCell>
														{item.quantity <= 5 ? (
															<Chip label="Critical" color="error" size="small" />
														) : item.quantity <= 10 ? (
															<Chip label="Low" color="warning" size="small" />
														) : (
															<Chip label="Adequate" color="success" size="small" />
														)}
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell colSpan={5} align="center">
													<Typography color="textSecondary" sx={{ py: 2 }}>
														All inventory levels are adequate
													</Typography>
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</TableContainer>
						</Paper>

						{/* Inventory Chart */}
						<Paper sx={{ p: 3 }}>
							<Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<BarChart /> Inventory Distribution
							</Typography>
							<Box sx={{ height: 400 }}>
								<ResponsiveContainer width="100%" height="100%">
									<ReBarChart
										data={[
											{ name: 'Electronics', stock: 1500 },
											{ name: 'Clothing', stock: 3200 },
											{ name: 'Furniture', stock: 800 },
											{ name: 'Books', stock: 2000 },
											{ name: 'Others', stock: 1200 },
										]}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="name" />
										<YAxis />
										<Tooltip formatter={(value) => [value, 'Units']} />
										<Legend />
										<Bar dataKey="stock" fill="#8884d8" name="Current Stock" />
									</ReBarChart>
								</ResponsiveContainer>
							</Box>
						</Paper>
					</>
				)}

				{/* Customers Report */}
				{reportType === 'customers' && (
					<>
						<Paper sx={{ p: 3, mb: 4 }}>
							<Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<People /> Top Customers
							</Typography>
							<TableContainer>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>Customer</TableCell>
											<TableCell>Email</TableCell>
											<TableCell align="right">Total Orders</TableCell>
											<TableCell align="right">Total Spent</TableCell>
											<TableCell>Customer Since</TableCell>
											<TableCell>Status</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{topCustomers.map((customer) => (
											<TableRow key={customer.id}>
												<TableCell>{customer.full_name}</TableCell>
												<TableCell>{customer.email}</TableCell>
												<TableCell align="right">
													{Math.floor(Math.random() * 20) + 1}
												</TableCell>
												<TableCell align="right">{formatCurrency(customer.total_spent)}</TableCell>
												<TableCell>
													{new Date(customer.registration_date).toLocaleDateString()}
												</TableCell>
												<TableCell>
													<Chip
														label={customer.total_spent > 5000 ? 'VIP' : 'Regular'}
														color={customer.total_spent > 5000 ? 'primary' : 'default'}
														size="small"
													/>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</Paper>

						{/* Customer Acquisition Chart */}
						<Paper sx={{ p: 3 }}>
							<Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Timeline /> Customer Acquisition Trend
							</Typography>
							<Box sx={{ height: 400 }}>
								<ResponsiveContainer width="100%" height="100%">
									<ReBarChart
										data={[
											{ month: 'Jan', new: 65, returning: 40 },
											{ month: 'Feb', new: 59, returning: 48 },
											{ month: 'Mar', new: 80, returning: 55 },
											{ month: 'Apr', new: 81, returning: 60 },
											{ month: 'May', new: 56, returning: 45 },
											{ month: 'Jun', new: 55, returning: 50 },
										]}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="month" />
										<YAxis />
										<Tooltip />
										<Legend />
										<Bar dataKey="new" fill="#8884d8" name="New Customers" />
										<Bar dataKey="returning" fill="#82ca9d" name="Returning Customers" />
									</ReBarChart>
								</ResponsiveContainer>
							</Box>
						</Paper>
					</>
				)}
			</Box>
		</LocalizationProvider>
	);
};

export default Reports;
