const products = [
  {
    id: 'p1',
    title: 'iphone 15 pro max',
    brand: 'Apple',
    category: 'smartphones',
    price: 1250000,
    rating: 4.8,
    stock: 32,
    availabilityStatus: 'In stock',
    shippingInformation: 'Free delivery from 2 days',
    weight: 0.8,
    description: 'A premium smartphone with powerful performance and a pro-grade camera system.',
    images: [
      'https://images.unsplash.com/photo-1676701665131-0ef3e39e6a5d?auto=format&fit=crop&w=900&q=80'
    ],
    reviews: [
      {
        rating: 5,
        comment: 'The phone looks amazing and the camera is superb.',
        date: '2024-10-01',
        reviewerName: 'Jane D.'
      },
      {
        rating: 4,
        comment: 'Fast and elegant, worth the price.',
        date: '2024-10-04',
        reviewerName: 'Max K.'
      }
    ]
  },
  {
    id: 'p2',
    title: 'samsung galaxy s24 ultra',
    brand: 'Samsung',
    category: 'smartphones',
    price: 1180000,
    rating: 4.7,
    stock: 22,
    availabilityStatus: 'In stock',
    shippingInformation: 'Ships in 24 hours',
    weight: 0.9,
    description: 'Designed for creators with a powerful S Pen and ultra-clear display.',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80'
    ],
    reviews: [
      {
        rating: 5,
        comment: 'Everything feels premium and responsive.',
        date: '2024-11-02',
        reviewerName: 'Tosin A.'
      }
    ]
  },
  {
    id: 'p3',
    title: 'xiaomi redmi note 13',
    brand: 'Xiaomi',
    category: 'smartphones',
    price: 320000,
    rating: 4.4,
    stock: 15,
    availabilityStatus: 'Low stock',
    shippingInformation: 'Delivery within 3 days',
    weight: 0.6,
    description: 'A value-for-money phone with great battery life and modern display.',
    images: [
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=900&q=80'
    ],
    reviews: [
      {
        rating: 4,
        comment: 'Good value and solid battery.',
        date: '2024-11-11',
        reviewerName: 'Faith O.'
      }
    ]
  },
  {
    id: 'p4',
    title: 'hp pavilion laptop 15',
    brand: 'HP',
    category: 'laptops',
    price: 780000,
    rating: 4.5,
    stock: 18,
    availabilityStatus: 'In stock',
    shippingInformation: 'Free delivery available',
    weight: 1.9,
    description: 'A sleek laptop built for everyday productivity and entertainment.',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80'
    ],
    reviews: [
      {
        rating: 5,
        comment: 'Great processing speed and comfortable keyboard.',
        date: '2024-09-20',
        reviewerName: 'Idris M.'
      }
    ]
  },
  {
    id: 'p5',
    title: 'sony playstation 5',
    brand: 'Sony',
    category: 'gaming',
    price: 640000,
    rating: 4.9,
    stock: 10,
    availabilityStatus: 'In stock',
    shippingInformation: 'Express shipping',
    weight: 4.5,
    description: 'Next-gen gaming console with ultra-fast loading and stunning visuals.',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=80'
    ],
    reviews: [
      {
        rating: 5,
        comment: 'The graphics are incredible and the gameplay is smooth.',
        date: '2024-10-17',
        reviewerName: 'Chibuzor P.'
      }
    ]
  }
];

const categories = [
  'smartphones',
  'laptops',
  'gaming',
  'accessories',
  'appliances',
  'fashion'
];

module.exports = { products, categories };
