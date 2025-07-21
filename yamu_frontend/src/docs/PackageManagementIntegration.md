# Package Management Integration Guide

## Overview
This guide shows how to integrate the package management components into your existing React application.

## Components Created

### 1. Package Service (`src/services/packageService.js`)
- Comprehensive API service for all package operations
- Handles CRUD operations for packages
- Manages package applications
- Includes budget calculation and validation

### 2. Package Management Dashboard (`src/pages/admin_dashboard/PackageManagenent.jsx`)
- Main admin dashboard for package management
- View, create, edit, and delete packages
- Package statistics and filtering
- Pagination and search functionality

### 3. Create Package Modal (`src/components/CreatePackageModal.jsx`)
- Full-featured form for creating new packages
- Resource selection (hotels, vehicles, drivers)
- Day-by-day planning interface
- Real-time budget calculation

### 4. Edit Package Modal (`src/components/EditPackageModal.jsx`)
- Edit existing packages with all features
- Pre-populated form data
- Support for updating resources and day plans

### 5. Package Applications Management (`src/pages/admin_dashboard/PackageApplicationsManagement.jsx`)
- Manage traveler applications for packages
- Approve/reject applications with admin notes
- Bulk operations for efficiency
- Application details modal

## Required Routes

Add these routes to your router configuration:

```jsx
// Admin routes (requires ADMIN role)
{
  path: "/admin-package-management",
  element: <PackageManagement />,
  // Add authentication guard for admin role
},
{
  path: "/admin-package-applications", 
  element: <PackageApplicationsManagement />,
  // Add authentication guard for admin role
}
```

## Navigation Integration

Add these menu items to your AdminLayout navigation:

```jsx
const navigationItems = [
  // ... existing items
  { 
    id: 'package-management', 
    label: 'Package Management', 
    icon: Package, 
    path: '/admin-package-management' 
  },
  { 
    id: 'package-applications', 
    label: 'Package Applications', 
    icon: Users, 
    path: '/admin-package-applications' 
  },
  // ... rest of items
];
```

## API Endpoints Required

Ensure your backend has these endpoints implemented:

### Package Management
- `GET /api/packages/admin/all` - Get all packages for admin
- `GET /api/packages/admin/statistics` - Get package statistics
- `GET /api/packages/{id}` - Get package by ID
- `POST /api/packages` - Create new package
- `PUT /api/packages/{id}` - Update package
- `DELETE /api/packages/{id}` - Delete package
- `POST /api/packages/calculate-budget` - Calculate package budget

### Application Management  
- `GET /api/packages/admin/applications/{packageId}` - Get applications for package
- `GET /api/packages/admin/applications/pending` - Get pending applications
- `PUT /api/packages/admin/applications/{id}/status` - Update application status
- `POST /api/packages/admin/applications/bulk-approve` - Bulk approve applications

### Resource APIs
- `GET /api/hotels` - Get available hotels
- `GET /api/guide/vehicles/all` - Get available vehicles (may need to create)
- `GET /api/drivers/all` - Get available drivers (may need to create)

### Public Package APIs
- `GET /api/packages/active` - Get active packages for travelers
- `POST /api/packages/{id}/apply` - Apply for a package
- `GET /api/packages/applications/traveler/{id}` - Get traveler's applications

## Security Configuration

Ensure your Spring Security configuration includes:

```java
// Admin-only endpoints
.requestMatchers("/api/packages/admin/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.POST, "/api/packages").hasRole("ADMIN")
.requestMatchers(HttpMethod.PUT, "/api/packages/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.DELETE, "/api/packages/**").hasRole("ADMIN")

// Traveler endpoints
.requestMatchers("/api/packages/**/apply").hasRole("TRAVELER")
.requestMatchers("/api/packages/applications/**").hasAnyRole("ADMIN", "TRAVELER")

// Public endpoints
.requestMatchers("/api/packages/active").permitAll()
.requestMatchers(HttpMethod.GET, "/api/packages/**").permitAll()
```

## Features Included

### Admin Features
- ✅ Create packages with day-by-day planning
- ✅ Edit existing packages
- ✅ Delete packages with confirmation
- ✅ View package statistics
- ✅ Search and filter packages
- ✅ Manage package applications
- ✅ Approve/reject applications with notes
- ✅ Bulk approve multiple applications
- ✅ Real-time budget calculation
- ✅ Resource selection (hotels, vehicles, drivers)

### Data Validation
- ✅ Form validation for required fields
- ✅ Package data structure validation
- ✅ Budget calculation validation
- ✅ Day plan consistency checking

### UI/UX Features
- ✅ Responsive design for mobile/desktop
- ✅ Loading states and error handling
- ✅ Pagination for large datasets
- ✅ Modal dialogs for forms
- ✅ Status badges and icons
- ✅ Search and filtering
- ✅ Bulk selection and operations

## Next Steps

1. **Add routes to your router configuration**
2. **Update navigation menus to include package management**
3. **Test with your backend API endpoints**
4. **Add any missing backend endpoints**
5. **Configure authentication guards for admin routes**
6. **Test the complete workflow from package creation to application approval**

## Customization

The components are designed to be easily customizable:

- **Styling**: All components use Tailwind CSS classes that can be modified
- **Validation**: Validation rules can be adjusted in the packageService
- **Fields**: Additional fields can be added to forms and data structures
- **Permissions**: Role-based access can be modified as needed

## Troubleshooting

Common issues and solutions:

1. **API Endpoints Not Found**: Ensure all backend endpoints are implemented
2. **Authentication Issues**: Verify JWT tokens are being sent with requests
3. **Resource Loading**: Check that hotel/vehicle/driver APIs return expected data format
4. **Budget Calculation**: Ensure calculate-budget endpoint returns proper structure
5. **File Imports**: Verify all component imports are correct in your project structure
