import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Grid,
  Typography,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const WarehouseForm = ({ warehouse, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validation phrasing
  const validationSchema = Yup.object({
    warehouse_name: Yup.string()
      .required('Warehouse name is required')
      .max(100, 'Name must be at most 100 characters')
      .min(3, 'Name must be at least 3 characters'),
    location: Yup.string()
      .required('Location is required')
      .max(150, 'Location must be at most 150 characters')
      .min(5, 'Location must be at least 5 characters'),
  });

  // Initializing Formik
  const formik = useFormik({
    initialValues: {
      warehouse_name: warehouse?.warehouse_name || '',
      location: warehouse?.location || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        await onSubmit(values);
      } catch (err) {
        setError(err.message || 'Failed to save warehouse');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="warehouse_name"
            label="Warehouse Name"
            value={formik.values.warehouse_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.warehouse_name && Boolean(formik.errors.warehouse_name)}
            helperText={formik.touched.warehouse_name && formik.errors.warehouse_name}
            disabled={loading}
            required
            placeholder="e.g., Main Warehouse, Storage Facility"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            name="location"
            label="Location"
            value={formik.values.location}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.location && Boolean(formik.errors.location)}
            helperText={formik.touched.location && formik.errors.location}
            disabled={loading}
            required
            multiline
            rows={2}
            placeholder="e.g., 123 Industrial Street, City, Country"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Note: Warehouses cannot be deleted if they contain inventory records.
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !formik.isValid}
          sx={{ backgroundColor: '#1a237e' }}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : warehouse ? (
            'Update Warehouse'
          ) : (
            'Add Warehouse'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default WarehouseForm;
