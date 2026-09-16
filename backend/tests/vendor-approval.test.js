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
  const signup = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Vendor Approver Test',
      username: `vendor-approver-${Date.now()}`,
      email: `vendor-approve-${Date.now()}@example.com`,
      password: 'Password123',
      role: 'vendor',
      shopName: 'Approve Me Shop',
      phoneNumber: '08020000000',
      shopAddress: '2 Approval Street',
      businessName: 'Approve Me Ltd',
    }),
  });

  if (signup.status !== 201) {
    console.error('FAIL: vendor signup status', signup.status, signup.data);
    process.exit(1);
  }

  const vendorId = signup.data.user?.id || signup.data.user?._id;
  if (!vendorId) {
    console.error('FAIL: vendor id missing from signup response', signup.data);
    process.exit(1);
  }

  const pending = await request('/api/auth/vendors/pending');
  if (pending.status !== 200) {
    console.error('FAIL: pending vendors endpoint status', pending.status, pending.data);
    process.exit(1);
  }

  const approval = await request(`/api/auth/vendors/${vendorId}/approve`, {
    method: 'PATCH',
  });

  if (approval.status !== 200) {
    console.error('FAIL: vendor approval status', approval.status, approval.data);
    process.exit(1);
  }

  console.log('PASS');
  process.exit(0);
})();
