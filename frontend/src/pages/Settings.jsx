import React, { useState, useEffect } from 'react';
import {
	Box,
	Paper,
	Typography,
	Card,
	CardContent,
	TextField,
	Button,
	Switch,
	FormControlLabel,
	Divider,
	Alert,
	Snackbar,
	Tabs,
	Tab,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Chip,
} from '@mui/material';
import {
	Save as SaveIcon,
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Security as SecurityIcon,
	Business as BusinessIcon,
	Notifications as NotificationsIcon,
	Palette as PaletteIcon,
} from '@mui/icons-material';
import Grid from '@mui/material/Grid';

const Settings = () => {
	const [tabValue, setTabValue] = useState(0);
	const [loading, setLoading] = useState(false);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
	const [userDialog, setUserDialog] = useState(false);
	const [currentUser, setCurrentUser] = useState(null);

	// General Settings
	const [generalSettings, setGeneralSettings] = useState({
		companyName: 'Sales & Inventory System',
		companyEmail: 'info@sales-inventory.com',
		companyPhone: '+962 7 9999 9999',
		companyAddress: 'Amman, Jordan',
		currency: 'USD',
		timezone: 'Asia/Amman',
	});

	// Security Settings
	const [securitySettings, setSecuritySettings] = useState({
		requireStrongPasswords: true,
		twoFactorAuth: false,
		sessionTimeout: 30,
		maxLoginAttempts: 5,
		autoLogout: true,
	});

	// Notification Settings
	const [notificationSettings, setNotificationSettings] = useState({
		lowStockAlert: true,
		newOrderAlert: true,
		orderStatusAlert: true,
		emailNotifications: true,
		smsNotifications: false,
		dailyReport: true,
	});

	// Theme Settings
	const [themeSettings, setThemeSettings] = useState({
		themeMode: 'light',
		primaryColor: '#1a237e',
		secondaryColor: '#ff4081',
		compactMode: false,
		showAnimations: true,
	});

	// Mock users data
	const [users, setUsers] = useState([
		{ id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Manager', status: 'active' },
		{ id: 2, name: 'Sales User', email: 'sales@example.com', role: 'Sales', status: 'active' },
		{ id: 3, name: 'Warehouse User', email: 'warehouse@example.com', role: 'Warehouse', status: 'inactive' },
		{ id: 4, name: 'John Doe', email: 'john@example.com', role: 'Sales', status: 'active' },
	]);

	const [userForm, setUserForm] = useState({
		name: '',
		email: '',
		role: 'Sales',
		password: '',
		confirmPassword: '',
	});

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	const handleGeneralChange = (e) => {
		const { name, value } = e.target;
		setGeneralSettings(prev => ({ ...prev, [name]: value }));
	};

	const handleSecurityChange = (e) => {
		const { name, value, checked } = e.target;
		setSecuritySettings(prev => ({
			...prev,
			[name]: e.target.type === 'checkbox' ? checked : value
		}));
	};

	const handleNotificationChange = (e) => {
		const { name, checked } = e.target;
		setNotificationSettings(prev => ({ ...prev, [name]: checked }));
	};

	const handleThemeChange = (e) => {
		const { name, value, checked } = e.target;
		setThemeSettings(prev => ({
			...prev,
			[name]: e.target.type === 'checkbox' ? checked : value
		}));
	};

	const handleUserFormChange = (e) => {
		const { name, value } = e.target;
		setUserForm(prev => ({ ...prev, [name]: value }));
	};

	const handleSaveSettings = async (section) => {
		setLoading(true);
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));

			setSnackbar({
				open: true,
				message: `${section} settings saved successfully`,
				severity: 'success'
			});
		} catch (error) {
			setSnackbar({
				open: true,
				message: 'Failed to save settings',
				severity: 'error'
			});
		} finally {
			setLoading(false);
		}
	};

	const handleOpenUserDialog = (user = null) => {
		setCurrentUser(user);
		if (user) {
			setUserForm({
				name: user.name,
				email: user.email,
				role: user.role,
				password: '',
				confirmPassword: '',
			});
		} else {
			setUserForm({
				name: '',
				email: '',
				role: 'Sales',
				password: '',
				confirmPassword: '',
			});
		}
		setUserDialog(true);
	};

	const handleSaveUser = () => {
		if (currentUser) {
			// Update existing user
			setUsers(users.map(u =>
				u.id === currentUser.id
					? { ...u, ...userForm, password: undefined }
					: u
			));
		} else {
			// Add new user
			const newUser = {
				id: users.length + 1,
				name: userForm.name,
				email: userForm.email,
				role: userForm.role,
				status: 'active',
			};
			setUsers([...users, newUser]);
		}
		setUserDialog(false);
		setSnackbar({
			open: true,
			message: `User ${currentUser ? 'updated' : 'added'} successfully`,
			severity: 'success'
		});
	};

	const handleDeleteUser = (id) => {
		if (window.confirm('Are you sure you want to delete this user?')) {
			setUsers(users.filter(user => user.id !== id));
			setSnackbar({
				open: true,
				message: 'User deleted successfully',
				severity: 'success'
			});
		}
	};

	const handleToggleUserStatus = (id) => {
		setUsers(users.map(user =>
			user.id === id
				? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
				: user
		));
	};

	const getRoleColor = (role) => {
		switch (role) {
			case 'Manager': return 'error';
			case 'Sales': return 'primary';
			case 'Warehouse': return 'warning';
			default: return 'default';
		}
	};

	const getStatusColor = (status) => {
		return status === 'active' ? 'success' : 'default';
	};

	return (
		<Box>
			{/* Header */}
			<Typography variant="h4" sx={{ color: '#1a237e', mb: 3 }}>
				System Settings
			</Typography>

			{/* Settings Tabs */}
			<Paper sx={{ mb: 3 }}>
				<Tabs
					value={tabValue}
					onChange={handleTabChange}
					variant="scrollable"
					scrollButtons="auto"
					sx={{ borderBottom: 1, borderColor: 'divider' }}
				>
					<Tab icon={<BusinessIcon />} label="General" />
					<Tab icon={<SecurityIcon />} label="Security" />
					<Tab icon={<NotificationsIcon />} label="Notifications" />
					<Tab icon={<PaletteIcon />} label="Theme" />
					<Tab icon={<SecurityIcon />} label="User Management" />
				</Tabs>
			</Paper>

			{loading && (
				<Alert severity="info" sx={{ mb: 2 }}>
					Saving settings...
				</Alert>
			)}

			{/* General Settings Tab */}
			{tabValue === 0 && (
				<Paper sx={{ p: 3 }}>
					<Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
						General Settings
					</Typography>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								label="Company Name"
								name="companyName"
								value={generalSettings.companyName}
								onChange={handleGeneralChange}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								label="Company Email"
								name="companyEmail"
								type="email"
								value={generalSettings.companyEmail}
								onChange={handleGeneralChange}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								label="Company Phone"
								name="companyPhone"
								value={generalSettings.companyPhone}
								onChange={handleGeneralChange}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								label="Company Address"
								name="companyAddress"
								value={generalSettings.companyAddress}
								onChange={handleGeneralChange}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<FormControl fullWidth>
								<InputLabel>Currency</InputLabel>
								<Select
									value={generalSettings.currency}
									label="Currency"
									name="currency"
									onChange={handleGeneralChange}
								>
									<MenuItem value="USD">US Dollar ($)</MenuItem>
									<MenuItem value="EUR">Euro (€)</MenuItem>
									<MenuItem value="GBP">British Pound (£)</MenuItem>
									<MenuItem value="JOD">Jordanian Dinar (د.ا)</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<FormControl fullWidth>
								<InputLabel>Timezone</InputLabel>
								<Select
									value={generalSettings.timezone}
									label="Timezone"
									name="timezone"
									onChange={handleGeneralChange}
								>
									<MenuItem value="Asia/Amman">Asia/Amman (Jordan)</MenuItem>
									<MenuItem value="UTC">UTC</MenuItem>
									<MenuItem value="America/New_York">America/New_York</MenuItem>
									<MenuItem value="Europe/London">Europe/London</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<Button
								variant="contained"
								startIcon={<SaveIcon />}
								onClick={() => handleSaveSettings('General')}
								sx={{ backgroundColor: '#1a237e' }}
							>
								Save General Settings
							</Button>
						</Grid>
					</Grid>
				</Paper>
			)}

			{/* Security Settings Tab */}
			{tabValue === 1 && (
				<Paper sx={{ p: 3 }}>
					<Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
						Security Settings
					</Typography>
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<FormControlLabel
								control={
									<Switch
										checked={securitySettings.requireStrongPasswords}
										onChange={handleSecurityChange}
										name="requireStrongPasswords"
									/>
								}
								label="Require Strong Passwords"
							/>
							<Typography variant="caption" color="textSecondary" display="block">
								Passwords must contain at least 8 characters including uppercase, lowercase, numbers, and symbols.
							</Typography>
						</Grid>
						<Grid item xs={12}>
							<FormControlLabel
								control={
									<Switch
										checked={securitySettings.twoFactorAuth}
										onChange={handleSecurityChange}
										name="twoFactorAuth"
									/>
								}
								label="Enable Two-Factor Authentication"
							/>
						</Grid>
						<Grid item xs={12}>
							<FormControlLabel
								control={
									<Switch
										checked={securitySettings.autoLogout}
										onChange={handleSecurityChange}
										name="autoLogout"
									/>
								}
								label="Auto Logout After Inactivity"
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								label="Session Timeout (minutes)"
								name="sessionTimeout"
								type="number"
								value={securitySettings.sessionTimeout}
								onChange={handleSecurityChange}
								inputProps={{ min: 1, max: 120 }}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								label="Max Login Attempts"
								name="maxLoginAttempts"
								type="number"
								value={securitySettings.maxLoginAttempts}
								onChange={handleSecurityChange}
								inputProps={{ min: 1, max: 10 }}
							/>
						</Grid>
						<Grid item xs={12}>
							<Button
								variant="contained"
								startIcon={<SaveIcon />}
								onClick={() => handleSaveSettings('Security')}
								sx={{ backgroundColor: '#1a237e' }}
							>
								Save Security Settings
							</Button>
						</Grid>
					</Grid>
				</Paper>
			)}

			{/* Notification Settings Tab */}
			{tabValue === 2 && (
				<Paper sx={{ p: 3 }}>
					<Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
						Notification Settings
					</Typography>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 6 }}>
							<FormControlLabel
								control={
									<Switch
										checked={notificationSettings.lowStockAlert}
										onChange={handleNotificationChange}
										name="lowStockAlert"
									/>
								}
								label="Low Stock Alerts"
							/>
							<Typography variant="caption" color="textSecondary" display="block">
								Receive alerts when inventory levels fall below threshold.
							</Typography>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<FormControlLabel
								control={
									<Switch
										checked={notificationSettings.newOrderAlert}
										onChange={handleNotificationChange}
										name="newOrderAlert"
									/>
								}
								label="New Order Alerts"
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<FormControlLabel
								control={
									<Switch
										checked={notificationSettings.orderStatusAlert}
										onChange={handleNotificationChange}
										name="orderStatusAlert"
									/>
								}
								label="Order Status Updates"
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<FormControlLabel
								control={
									<Switch
										checked={notificationSettings.dailyReport}
										onChange={handleNotificationChange}
										name="dailyReport"
									/>
								}
								label="Daily Sales Report"
							/>
						</Grid>
						<Grid item xs={12}>
							<Divider sx={{ my: 2 }} />
							<Typography variant="subtitle1" gutterBottom>
								Notification Channels
							</Typography>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<FormControlLabel
								control={
									<Switch
										checked={notificationSettings.emailNotifications}
										onChange={handleNotificationChange}
										name="emailNotifications"
									/>
								}
								label="Email Notifications"
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<FormControlLabel
								control={
									<Switch
										checked={notificationSettings.smsNotifications}
										onChange={handleNotificationChange}
										name="smsNotifications"
									/>
								}
								label="SMS Notifications"
							/>
						</Grid>
						<Grid item xs={12}>
							<Button
								variant="contained"
								startIcon={<SaveIcon />}
								onClick={() => handleSaveSettings('Notification')}
								sx={{ backgroundColor: '#1a237e' }}
							>
								Save Notification Settings
							</Button>
						</Grid>
					</Grid>
				</Paper>
			)}

			{/* Theme Settings Tab */}
			{tabValue === 3 && (
				<Paper sx={{ p: 3 }}>
					<Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
						Theme & Appearance
					</Typography>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 6 }}>
							<FormControl fullWidth>
								<InputLabel>Theme Mode</InputLabel>
								<Select
									value={themeSettings.themeMode}
									label="Theme Mode"
									name="themeMode"
									onChange={handleThemeChange}
								>
									<MenuItem value="light">Light Mode</MenuItem>
									<MenuItem value="dark">Dark Mode</MenuItem>
									<MenuItem value="auto">Auto (System Preference)</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<FormControlLabel
								control={
									<Switch
										checked={themeSettings.compactMode}
										onChange={handleThemeChange}
										name="compactMode"
									/>
								}
								label="Compact Mode"
							/>
							<Typography variant="caption" color="textSecondary" display="block">
								Use compact spacing for lists and tables.
							</Typography>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								label="Primary Color"
								name="primaryColor"
								type="color"
								value={themeSettings.primaryColor}
								onChange={handleThemeChange}
								InputProps={{
									startAdornment: (
										<Box
											sx={{
												width: 20,
												height: 20,
												backgroundColor: themeSettings.primaryColor,
												borderRadius: '4px',
												mr: 1,
												border: '1px solid #ddd',
											}}
										/>
									),
								}}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								label="Secondary Color"
								name="secondaryColor"
								type="color"
								value={themeSettings.secondaryColor}
								onChange={handleThemeChange}
								InputProps={{
									startAdornment: (
										<Box
											sx={{
												width: 20,
												height: 20,
												backgroundColor: themeSettings.secondaryColor,
												borderRadius: '4px',
												mr: 1,
												border: '1px solid #ddd',
											}}
										/>
									),
								}}
							/>
						</Grid>
						<Grid item xs={12}>
							<FormControlLabel
								control={
									<Switch
										checked={themeSettings.showAnimations}
										onChange={handleThemeChange}
										name="showAnimations"
									/>
								}
								label="Show Animations"
							/>
						</Grid>
						<Grid item xs={12}>
							<Button
								variant="contained"
								startIcon={<SaveIcon />}
								onClick={() => handleSaveSettings('Theme')}
								sx={{ backgroundColor: '#1a237e' }}
							>
								Save Theme Settings
							</Button>
						</Grid>
					</Grid>
				</Paper>
			)}

			{/* User Management Tab */}
			{tabValue === 4 && (
				<Paper sx={{ p: 3 }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
						<Typography variant="h6" sx={{ color: '#1a237e' }}>
							User Management
						</Typography>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={() => handleOpenUserDialog()}
							sx={{ backgroundColor: '#1a237e' }}
						>
							Add New User
						</Button>
					</Box>

					<List>
						{users.map((user) => (
							<ListItem key={user.id} divider>
								<ListItemText
									primary={
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Typography variant="subtitle1">{user.name}</Typography>
											<Chip
												label={user.role}
												size="small"
												color={getRoleColor(user.role)}
											/>
											<Chip
												label={user.status}
												size="small"
												color={getStatusColor(user.status)}
												variant="outlined"
											/>
										</Box>
									}
									secondary={user.email}
								/>
								<ListItemSecondaryAction>
									<IconButton
										edge="end"
										onClick={() => handleToggleUserStatus(user.id)}
										color={user.status === 'active' ? 'success' : 'default'}
									>
										{user.status === 'active' ? '✓' : '✗'}
									</IconButton>
									<IconButton
										edge="end"
										onClick={() => handleOpenUserDialog(user)}
										sx={{ ml: 1 }}
									>
										<EditIcon />
									</IconButton>
									<IconButton
										edge="end"
										onClick={() => handleDeleteUser(user.id)}
										sx={{ ml: 1 }}
										color="error"
									>
										<DeleteIcon />
									</IconButton>
								</ListItemSecondaryAction>
							</ListItem>
						))}
					</List>

					<Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
						Total Users: {users.length} | Active: {users.filter(u => u.status === 'active').length}
					</Typography>
				</Paper>
			)}

			{/* Add/Edit User Dialog */}
			<Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="sm" fullWidth>
				<DialogTitle>
					{currentUser ? 'Edit User' : 'Add New User'}
				</DialogTitle>
				<DialogContent>
					<Grid container spacing={2} sx={{ pt: 2 }}>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Full Name"
								name="name"
								value={userForm.name}
								onChange={handleUserFormChange}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Email"
								name="email"
								type="email"
								value={userForm.email}
								onChange={handleUserFormChange}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<FormControl fullWidth required>
								<InputLabel>Role</InputLabel>
								<Select
									value={userForm.role}
									label="Role"
									name="role"
									onChange={handleUserFormChange}
								>
									<MenuItem value="Manager">Manager</MenuItem>
									<MenuItem value="Sales">Sales Staff</MenuItem>
									<MenuItem value="Warehouse">Warehouse Staff</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						{!currentUser && (
							<>
								<Grid item xs={12}>
									<TextField
										fullWidth
										label="Password"
										name="password"
										type="password"
										value={userForm.password}
										onChange={handleUserFormChange}
										required={!currentUser}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										fullWidth
										label="Confirm Password"
										name="confirmPassword"
										type="password"
										value={userForm.confirmPassword}
										onChange={handleUserFormChange}
										required={!currentUser}
										error={userForm.password !== userForm.confirmPassword}
										helperText={
											userForm.password !== userForm.confirmPassword
												? 'Passwords do not match'
												: ''
										}
									/>
								</Grid>
							</>
						)}
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setUserDialog(false)}>Cancel</Button>
					<Button
						onClick={handleSaveUser}
						variant="contained"
						disabled={
							!userForm.name ||
							!userForm.email ||
							!userForm.role ||
							(!currentUser && (!userForm.password || userForm.password !== userForm.confirmPassword))
						}
						sx={{ backgroundColor: '#1a237e' }}
					>
						{currentUser ? 'Update' : 'Create'}
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

export default Settings;
