const baseUrl = 'http://localhost:5001';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: response.status, data };
}

(async () => {
  const email = `vendor-upload-${Date.now()}@example.com`;

  const signup = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Upload Vendor',
      email,
      password: 'Password123',
      role: 'vendor',
      shopName: 'Upload Shop',
      phoneNumber: '08030000000',
      businessName: 'Upload Ltd',
    }),
  });

  if (signup.status !== 201) {
    console.error('FAIL: vendor signup status', signup.status, signup.data);
    process.exit(1);
  }

  const token = signup.data.token;
  const vendorId = signup.data.user?.id || signup.data.user?._id;

  const blockedCreate = await request('/api/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: 'Blocked Vendor Product',
      brand: 'Blocked Brand',
      category: 'smartphones',
      price: 249.99,
      stock: 10,
      description: 'This should be rejected before approval.',
      images: ['https://example.com/blocked.png'],
    }),
  });

  if (blockedCreate.status !== 403) {
    console.error('FAIL: unapproved vendor product creation status', blockedCreate.status, blockedCreate.data);
    process.exit(1);
  }

  const approval = await request(`/api/auth/vendors/${vendorId}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (approval.status !== 200) {
    console.error('FAIL: vendor approval status', approval.status, approval.data);
    process.exit(1);
  }

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password: 'Password123',
    }),
  });

  if (login.status !== 200) {
    console.error('FAIL: vendor re-login status', login.status, login.data);
    process.exit(1);
  }

  const approvedToken = login.data.token;

  const createProduct = await request('/api/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${approvedToken}` },
    body: JSON.stringify({
      title: 'Approved Vendor Product',
      brand: 'Nova Brand',
      category: 'smartphones',
      price: 399.99,
      salePrice: 349.99,
      compareAtPrice: 429.99,
      stock: 18,
      description: 'A product listing created by an approved vendor.',
      images: ['https://example.com/product.png'],
      shippingInformation: '2-4 business days',
      weight: 0.42,
    }),
  });

  if (createProduct.status !== 201) {
    console.error('FAIL: approved vendor product creation status', createProduct.status, createProduct.data);
    process.exit(1);
  }

  console.log('PASS');
  process.exit(0);
})();
