import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const ProductForm = ({ product, type, onSubmit, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Default Category Matrix
  const defaultCategories = [
    'Electronics',
    'Clothing',
    'Furniture',
    'Books',
    'Food',
    'Footwear',
    'Mobile',
    'Accessories',
    'Sports',
    'Toys',
  ];

  // Verification phrasing
  const validationSchema = Yup.object({
    product_name: Yup.string()
      .required('Product name is required')
      .max(150, 'Name must be at most 150 characters'),
    category: Yup.string()
      .nullable()
      .max(50, 'Category must be at most 50 characters'),
    unit_price: Yup.number()
      .required('Price is required')
      .min(0, 'Price must be positive')
      .max(999999.99, 'Price is too high'),
    sku: Yup.string()
      .required('SKU is required')
      .max(50, 'SKU must be at most 50 characters'),
    description: Yup.string()
      .nullable()
      .max(500, 'Description must be at most 500 characters'),
  });

  // Initializing Formik
  const formik = useFormik({
    initialValues: {
      product_name: product?.product_name || '',
      category: product?.category || '',
      unit_price: product?.unit_price || '',
      sku: product?.sku || '',
      description: product?.description || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      await onSubmit(values);
      setLoading(false);
    },
  });

  // Automatically generate SKU if it is new
  useEffect(() => {
    if (type === 'add' && !formik.values.sku) {
      const generateSKU = () => {
        const prefix = formik.values.category?.substring(0, 3).toUpperCase() || 'PRD';
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${random}`;
      };

      formik.setFieldValue('sku', generateSKU());
    }
  }, [formik.values.category, type]);

  if (type === 'view') {
    return (
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">Product Name</Typography>
            <Typography variant="body1">{product.product_name}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">SKU</Typography>
            <Typography variant="body1">{product.sku}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Category</Typography>
            <Typography variant="body1">{product.category || 'Uncategorized'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Price</Typography>
            <Typography variant="body1">${parseFloat(product.unit_price).toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Stock</Typography>
            <Typography variant="body1">{product.total_stock || 0} units</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">Description</Typography>
            <Typography variant="body1">{product.description || 'No description'}</Typography>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="product_name"
            label="Product Name"
            value={formik.values.product_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.product_name && Boolean(formik.errors.product_name)}
            helperText={formik.touched.product_name && formik.errors.product_name}
            disabled={loading}
            required
          />
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Category *</InputLabel>
            <Select
              name="category"
              value={formik.values.category}
              label="Category"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.category && Boolean(formik.errors.category)}
              disabled={loading}
            >
              <MenuItem value="">
                <em>Select Category</em>
              </MenuItem>
              {defaultCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            name="sku"
            label="SKU"
            value={formik.values.sku}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.sku && Boolean(formik.errors.sku)}
            helperText={formik.touched.sku && formik.errors.sku}
            disabled={loading || type === 'edit'}
            required
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            name="unit_price"
            label="Unit Price"
            type="number"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              inputProps: { min: 0, step: 0.01 }
            }}
            value={formik.values.unit_price}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.unit_price && Boolean(formik.errors.unit_price)}
            helperText={formik.touched.unit_price && formik.errors.unit_price}
            disabled={loading}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            name="description"
            label="Description"
            multiline
            rows={3}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            disabled={loading}
            placeholder="Enter product description..."
          />
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
          ) : type === 'add' ? (
            'Add Product'
          ) : (
            'Update Product'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ProductForm;
