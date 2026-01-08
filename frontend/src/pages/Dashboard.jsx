import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Inventory,
  ShoppingCart,
  Warning,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  orderService,
  productService,
  customerService,
} from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load data in parallel
      const [products, customers, orders] = await Promise.all([
        productService.getAll({ per_page: 100 }),
        customerService.getAll(),
        orderService.getAll({ per_page: 5 }),
      ]);

      // Calculate low stock products manually
      const lowStock = (products.data?.data || []).filter(
        product => product.total_stock <= 10
      );

      // Calculate sales stats from orders
      const orderStats = (orders.data?.data || []).reduce(
        (acc, order) => {
          return {
            totalOrders: acc.totalOrders + 1,
            totalRevenue: acc.totalRevenue + (parseFloat(order.total_amount) || 0),
          };
        },
        { totalOrders: 0, totalRevenue: 0 }
      );

      setStats({
        totalOrders: orderStats.totalOrders,
        totalRevenue: orderStats.totalRevenue,
        totalCustomers: customers.data?.total || 0,
        totalProducts: products.data?.total || 0,
      });

      setLowStockProducts(lowStock);
      setRecentOrders(orders.data?.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set fallback data
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4">
              {title.includes('Revenue') ? `$${Number(value).toFixed(2)}` : value}
            </Typography>
          </Box>
          <Box sx={{ color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#1a237e' }}>
          Dashboard
        </Typography>
        <IconButton onClick={loadDashboardData} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {/* Using Grid in a way compatible with MUI v5/v6 */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          mb: 4,
        }}
      >
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart sx={{ fontSize: 40 }} />}
          color="#3f51b5"
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={<TrendingUp sx={{ fontSize: 40 }} />}
          color="#4caf50"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<People sx={{ fontSize: 40 }} />}
          color="#ff9800"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Inventory sx={{ fontSize: 40 }} />}
          color="#f44336"
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
          },
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Warning color="warning" sx={{ mr: 1 }} />
            <Typography variant="h6">Low Stock Products</Typography>
          </Box>
          {lowStockProducts.length === 0 ? (
            <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
              No low stock products
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell>Category</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      hover
                      onClick={() => navigate(`/products/${product.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{product.product_name}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={product.total_stock}
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Recent Orders</Typography>
          {recentOrders.length === 0 ? (
            <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
              No recent orders
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      hover
                      onClick={() => navigate(`/orders/${order.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.customer?.full_name}</TableCell>
                      <TableCell align="right">${order.total_amount}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.order_status}
                          size="small"
                          color={
                            order.order_status === 'Delivered' ? 'success' :
                            order.order_status === 'Pending' ? 'warning' :
                            order.order_status === 'Cancelled' ? 'error' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
