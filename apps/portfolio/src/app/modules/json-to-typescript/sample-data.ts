/**
 * Sample JSON Data for Testing the JSON to TypeScript Generator
 * Use these examples to test the component functionality
 */

// Sample 1: Simple User Profile
export const SAMPLE_USER_PROFILE = {
  id: 1,
  username: 'johndoe',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  isActive: true,
  registeredAt: '2024-01-15T10:30:00Z',
};

// Sample 2: Product with Nested Object
export const SAMPLE_PRODUCT = {
  id: 101,
  name: 'Laptop Pro',
  description: 'High-performance laptop for developers',
  price: 1299.99,
  inStock: true,
  quantity: 50,
  manufacturer: {
    name: 'TechCorp',
    country: 'USA',
    foundedYear: 1995,
  },
  specifications: {
    processor: 'Intel i9',
    ram: '32GB',
    storage: '1TB SSD',
    display: '15.6 inch 4K',
  },
};

// Sample 3: API Response with Arrays
export const SAMPLE_API_RESPONSE = {
  success: true,
  status: 200,
  message: 'Data retrieved successfully',
  data: {
    users: [
      {
        id: 1,
        name: 'Alice Johnson',
        role: 'Admin',
      },
      {
        id: 2,
        name: 'Bob Smith',
        role: 'User',
      },
    ],
    total: 2,
    page: 1,
  },
};

// Sample 4: Complex Nested Structure
export const SAMPLE_COMPLEX_DATA = {
  id: 'org-123',
  name: 'Tech Company Inc',
  founded: 2010,
  headquarters: {
    address: {
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      country: 'USA',
    },
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
  },
  employees: [
    {
      id: 'emp-001',
      name: 'Sarah Williams',
      position: 'Senior Developer',
      department: 'Engineering',
      salary: 120000,
      skills: ['TypeScript', 'Angular', 'Node.js'],
      contact: {
        email: 'sarah@techcorp.com',
        phone: '+1-415-555-0101',
      },
    },
    {
      id: 'emp-002',
      name: 'Michael Chen',
      position: 'Product Manager',
      department: 'Product',
      salary: 110000,
      skills: ['Product Strategy', 'Analytics', 'Leadership'],
      contact: {
        email: 'michael@techcorp.com',
        phone: '+1-415-555-0102',
      },
    },
  ],
  departments: ['Engineering', 'Product', 'Sales', 'Marketing', 'HR'],
  financials: {
    revenue: 5000000,
    expenses: 3500000,
    profit: 1500000,
    currency: 'USD',
  },
  active: true,
};

// Sample 5: E-commerce Cart
export const SAMPLE_ECOMMERCE_CART = {
  cartId: 'cart-789',
  customerId: 'cust-456',
  items: [
    {
      productId: 'prod-001',
      name: 'Wireless Mouse',
      quantity: 2,
      unitPrice: 29.99,
      discount: 0.1,
      totalPrice: 53.98,
    },
    {
      productId: 'prod-002',
      name: 'USB-C Cable',
      quantity: 5,
      unitPrice: 9.99,
      discount: 0,
      totalPrice: 49.95,
    },
    {
      productId: 'prod-003',
      name: 'Monitor Stand',
      quantity: 1,
      unitPrice: 49.99,
      discount: 0,
      totalPrice: 49.99,
    },
  ],
  summary: {
    subtotal: 153.92,
    taxRate: 0.08,
    taxAmount: 12.31,
    shippingCost: 10.0,
    total: 176.23,
  },
  shipping: {
    address: '123 Main St, Anytown, ST 12345',
    method: 'Standard',
    estimatedDelivery: '2024-01-20',
  },
  createdAt: '2024-01-15T15:45:00Z',
  updatedAt: '2024-01-15T16:20:00Z',
};

// Sample 6: Social Media Post
export const SAMPLE_SOCIAL_POST = {
  id: 'post-12345',
  author: {
    userId: 'user-999',
    username: 'techguru',
    displayName: 'Tech Guru',
    avatar: 'https://example.com/avatars/techguru.jpg',
    verified: true,
  },
  content: 'Just launched my new project! Check it out on GitHub 🚀',
  tags: ['typescript', 'angular', 'opensource'],
  attachments: [
    {
      type: 'image',
      url: 'https://example.com/images/project-preview.jpg',
      altText: 'Project preview',
    },
  ],
  metrics: {
    likes: 245,
    comments: 38,
    shares: 12,
    views: 1203,
  },
  comments: [
    {
      id: 'comment-1',
      author: 'user-888',
      text: 'Amazing work! Love the UI design.',
      likes: 10,
      timestamp: '2024-01-15T16:30:00Z',
    },
    {
      id: 'comment-2',
      author: 'user-777',
      text: 'This is exactly what I was looking for!',
      likes: 8,
      timestamp: '2024-01-15T16:45:00Z',
    },
  ],
  createdAt: '2024-01-15T14:00:00Z',
  updatedAt: '2024-01-15T17:00:00Z',
  isEdited: true,
};

/**
 * JSON Strings for Direct Paste Testing
 * Copy and paste these directly into the component textarea
 */

export const SAMPLE_JSON_STRINGS = {
  simpleObject: JSON.stringify(
    {
      name: 'John',
      age: 30,
      email: 'john@example.com',
    },
    null,
    2,
  ),

  withArray: JSON.stringify(
    {
      title: 'My Collection',
      items: [1, 2, 3, 4, 5],
      tags: ['typescript', 'angular'],
    },
    null,
    2,
  ),

  nested: JSON.stringify(
    {
      user: {
        profile: {
          name: 'Alice',
          bio: 'Software Engineer',
        },
      },
    },
    null,
    2,
  ),

  complex: JSON.stringify(
    {
      id: 1,
      name: 'Product',
      metadata: {
        created: '2024-01-15',
        updated: '2024-01-16',
        tags: ['new', 'featured'],
      },
      variants: [
        { size: 'S', color: 'Red' },
        { size: 'M', color: 'Blue' },
      ],
    },
    null,
    2,
  ),
};
