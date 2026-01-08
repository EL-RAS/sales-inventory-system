import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Warehouses from './pages/Warehouses';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
    },
    secondary: {
      main: '#ff4081',
    },
  },
});

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />

      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/customers" element={
        <ProtectedRoute roles={['Sales', 'Manager']}>
          <MainLayout>
            <Customers />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/products" element={
        <ProtectedRoute roles={['Sales', 'Warehouse', 'Manager']}>
          <MainLayout>
            <Products />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/products/:id" element={
        <ProtectedRoute roles={['Sales', 'Warehouse', 'Manager']}>
          <MainLayout>
            <ProductDetail />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/warehouses" element={
        <ProtectedRoute roles={['Warehouse', 'Manager']}>
          <MainLayout>
            <Warehouses />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/inventory" element={
        <ProtectedRoute roles={['Warehouse', 'Manager']}>
          <MainLayout>
            <Inventory />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/orders" element={
        <ProtectedRoute roles={['Sales', 'Manager']}>
          <MainLayout>
            <Orders />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute roles={['Manager']}>
          <MainLayout>
            <Reports />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute roles={['Manager']}>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
