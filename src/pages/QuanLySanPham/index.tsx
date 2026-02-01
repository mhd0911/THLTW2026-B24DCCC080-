import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import moment, { Moment } from 'moment';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number; // tồn kho
};

type OrderStatus = 'Chờ xử lý' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';

type OrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string; // DH001
  customerName: string;
  phone: string;
  address: string;
  products: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string; // YYYY-MM-DD
};

const LS_PRODUCTS = 'bai2_products';
const LS_ORDERS = 'bai2_orders';

const initialProducts: Product[] = [
  { id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
  { id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
  { id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
  { id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
  { id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
  { id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
  { id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 },
];

const initialOrders: Order[] = [
  {
    id: 'DH001',
    customerName: 'Nguyễn Văn A',
    phone: '0912345678',
    address: '123 Nguyễn Huệ, Q1, TP.HCM',
    products: [{ productId: 1, productName: 'Laptop Dell XPS 13', quantity: 1, price: 25000000 }],
    totalAmount: 25000000,
    status: 'Chờ xử lý',
    createdAt: '2024-01-15',
  },
];

function formatMoney(v: number) {
  return v.toLocaleString('vi-VN');
}

function getProductStockTag(quantity: number) {
  if (quantity === 0) return <Tag color="red">Hết hàng</Tag>;
  if (quantity <= 10) return <Tag color="orange">Sắp hết</Tag>;
  return <Tag color="green">Còn hàng</Tag>;
}

function nextOrderId(orders: Order[]) {
  // DH001, DH002...
  const nums = orders
    .map((o) => Number(String(o.id).replace('DH', '')))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  const next = max + 1;
  return `DH${String(next).padStart(3, '0')}`;
}

export default function QuanLySanPham_Bai2() {
  // ====== STATE: products & orders (localStorage) ======
  const [products, setProducts] = useState<Product[]>(() => {
    const raw = localStorage.getItem(LS_PRODUCTS);
    return raw ? JSON.parse(raw) : initialProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const raw = localStorage.getItem(LS_ORDERS);
    return raw ? JSON.parse(raw) : initialOrders;
  });

  useEffect(() => {
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
  }, [orders]);

  // ====== UI Tabs ======
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');

  // ====== FILTER/SORT: Products ======
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set);
  }, [products]);

  const [pSearch, setPSearch] = useState('');
  const [pCategory, setPCategory] = useState<string | undefined>(undefined);
  const [pStatus, setPStatus] = useState<'Còn hàng' | 'Sắp hết' | 'Hết hàng' | undefined>(undefined);
  const [pPriceMin, setPPriceMin] = useState<number | undefined>(undefined);
  const [pPriceMax, setPPriceMax] = useState<number | undefined>(undefined);

  const filteredProducts = useMemo(() => {
    const q = pSearch.trim().toLowerCase();

    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (pCategory && p.category !== pCategory) return false;

      if (pStatus) {
        if (pStatus === 'Còn hàng' && !(p.quantity > 10)) return false;
        if (pStatus === 'Sắp hết' && !(p.quantity >= 1 && p.quantity <= 10)) return false;
        if (pStatus === 'Hết hàng' && !(p.quantity === 0)) return false;
      }

      if (typeof pPriceMin === 'number' && p.price < pPriceMin) return false;
      if (typeof pPriceMax === 'number' && p.price > pPriceMax) return false;

      return true;
    });
  }, [products, pSearch, pCategory, pStatus, pPriceMin, pPriceMax]);

  // ====== Product: Edit Modal ======
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [productForm] = Form.useForm<{ name: string; category: string; price: number; quantity: number }>();

  const openEdit = (p: Product) => {
    setEditing(p);
    productForm.setFieldsValue({
      name: p.name,
      category: p.category,
      price: p.price,
      quantity: p.quantity,
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    try {
      const values = await productForm.validateFields();
      setProducts((prev) =>
        prev.map((p) => (p.id === editing?.id ? { ...p, ...values } : p)),
      );
      setEditOpen(false);
      message.success('Cập nhật sản phẩm thành công!');
    } catch {
      // ignore validation errors
    }
  };

  // ====== Orders: Search/Filter/Sort ======
  const [oSearch, setOSearch] = useState('');
  const [oStatus, setOStatus] = useState<OrderStatus | undefined>(undefined);
  const [oDateRange, setODateRange] = useState<[Moment | null, Moment | null] | null>(null);

  const filteredOrders = useMemo(() => {
    const q = oSearch.trim().toLowerCase();

    return orders.filter((o) => {
      if (q) {
        const matchCustomer = o.customerName.toLowerCase().includes(q);
        const matchId = o.id.toLowerCase().includes(q);
        if (!matchCustomer && !matchId) return false;
      }

      if (oStatus && o.status !== oStatus) return false;

      if (oDateRange && oDateRange[0] && oDateRange[1]) {
        const start = oDateRange[0].startOf('day');
        const end = oDateRange[1].endOf('day');
        const d = moment(o.createdAt, 'YYYY-MM-DD');
        if (d.isBefore(start) || d.isAfter(end)) return false;
      }

      return true;
    });
  }, [orders, oSearch, oStatus, oDateRange]);

  // ====== Orders: Create Order Modal ======
  const [createOpen, setCreateOpen] = useState(false);
  const [orderForm] = Form.useForm<{
    customerName: string;
    phone: string;
    address: string;
    productIds: number[];
  }>();

  // map productId -> quantity ordered
  const [orderQtyMap, setOrderQtyMap] = useState<Record<number, number>>({});

  const selectedProductIds = Form.useWatch('productIds', orderForm) || [];

  useEffect(() => {
    // remove qty for unselected
    setOrderQtyMap((prev) => {
      const next: Record<number, number> = {};
      selectedProductIds.forEach((id: number) => {
        next[id] = prev[id] ?? 1;
      });
      return next;
    });
  }, [selectedProductIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedProducts = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return (selectedProductIds as number[])
      .map((id) => map.get(id))
      .filter(Boolean) as Product[];
  }, [selectedProductIds, products]);

  const orderTotal = useMemo(() => {
    return selectedProducts.reduce((sum, p) => {
      const qty = orderQtyMap[p.id] ?? 0;
      return sum + p.price * qty;
    }, 0);
  }, [selectedProducts, orderQtyMap]);

  const openCreateOrder = () => {
    orderForm.resetFields();
    setOrderQtyMap({});
    setCreateOpen(true);
  };

  const validatePhone = (phone: string) => /^[0-9]{10,11}$/.test(phone);

  const submitCreateOrder = async () => {
    try {
      const values = await orderForm.validateFields();

      if (!values.productIds || values.productIds.length === 0) {
        message.error('Vui lòng chọn ít nhất 1 sản phẩm');
        return;
      }

      // Validate qty not exceed stock
      for (const p of selectedProducts) {
        const qty = orderQtyMap[p.id] ?? 0;
        if (!Number.isInteger(qty) || qty <= 0) {
          message.error(`Số lượng của "${p.name}" phải là số nguyên dương`);
          return;
        }
        if (qty > p.quantity) {
          message.error(`Số lượng đặt của "${p.name}" vượt quá tồn kho (${p.quantity})`);
          return;
        }
      }

      const newOrder: Order = {
        id: nextOrderId(orders),
        customerName: values.customerName.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        products: selectedProducts.map((p) => ({
          productId: p.id,
          productName: p.name,
          quantity: orderQtyMap[p.id] ?? 1,
          price: p.price,
        })),
        totalAmount: orderTotal,
        status: 'Chờ xử lý',
        createdAt: moment().format('YYYY-MM-DD'),
      };

      setOrders((prev) => [newOrder, ...prev]);
      setCreateOpen(false);
      message.success('Tạo đơn hàng thành công!');
    } catch {
      // ignore
    }
  };

  // ====== Orders: Detail Modal ======
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const openDetail = (o: Order) => {
    setDetailOrder(o);
    setDetailOpen(true);
  };

  // ====== Orders: Status update (trừ/hoàn kho) ======
  const updateStock = useCallback((productId: number, diff: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: p.quantity + diff } : p)),
    );
  }, []);

  const changeOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) => {
      const current = prev.find((o) => o.id === orderId);
      if (!current) return prev;
      const oldStatus = current.status;

      // if going to "Hoàn thành" from non-complete => subtract stock
      if (oldStatus !== 'Hoàn thành' && nextStatus === 'Hoàn thành') {
        // check stock again to avoid negative
        for (const item of current.products) {
          const p = products.find((x) => x.id === item.productId);
          const stock = p?.quantity ?? 0;
          if (item.quantity > stock) {
            message.error(`Không đủ tồn kho để hoàn thành đơn (thiếu "${item.productName}")`);
            return prev;
          }
        }
        current.products.forEach((it) => updateStock(it.productId, -it.quantity));
      }

      // if leaving "Hoàn thành" => restore stock (including when cancel)
      if (oldStatus === 'Hoàn thành' && nextStatus !== 'Hoàn thành') {
        current.products.forEach((it) => updateStock(it.productId, it.quantity));
      }

      // Spec: when "Đã hủy" -> hoàn trả (thực tế: chỉ cần nếu trước đó đã trừ kho)
      // (đã cover bằng rule leave "Hoàn thành")

      return prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
    });

    message.success('Cập nhật trạng thái đơn hàng thành công!');
  };

  // ====== Dashboard stats ======
  const totalStockValue = useMemo(() => {
    return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  }, [products]);

  const revenue = useMemo(() => {
    return orders
      .filter((o) => o.status === 'Hoàn thành')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const orderStatusCount = useMemo(() => {
    const base: Record<OrderStatus, number> = {
      'Chờ xử lý': 0,
      'Đang giao': 0,
      'Hoàn thành': 0,
      'Đã hủy': 0,
    };
    orders.forEach((o) => {
      base[o.status] += 1;
    });
    return base;
  }, [orders]);

  // ====== Columns: Products ======
  const productColumns: ColumnsType<Product> = [
    { title: 'STT', width: 70, align: 'center', render: (_: any, __: Product, i: number) => i + 1 },
    { title: 'Tên sản phẩm', dataIndex: 'name' },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      filters: categories.map((c) => ({ text: c, value: c })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      align: 'right',
      sorter: (a, b) => a.price - b.price,
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      align: 'center',
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Trạng thái',
      align: 'center',
      render: (_: any, r: Product) => getProductStockTag(r.quantity),
    },
    {
      title: 'Thao tác',
      width: 160,
      align: 'center',
      render: (_: any, r: Product) => (
        <Space>
          <Button onClick={() => openEdit(r)}>Sửa</Button>
        </Space>
      ),
    },
  ];

  // ====== Columns: Orders ======
  const orderColumns: ColumnsType<Order> = [
    { title: 'Mã đơn', dataIndex: 'id', sorter: (a, b) => a.id.localeCompare(b.id) },
    { title: 'Tên khách hàng', dataIndex: 'customerName' },
    { title: 'Số sản phẩm', align: 'center', render: (_: any, r: Order) => r.products.length },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      align: 'right',
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Trạng thái',
      render: (_: any, r: Order) => (
        <Select<OrderStatus>
          value={r.status}
          style={{ width: 140 }}
          onChange={(v) => changeOrderStatus(r.id, v)}
        >
          <Select.Option value="Chờ xử lý">Chờ xử lý</Select.Option>
          <Select.Option value="Đang giao">Đang giao</Select.Option>
          <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
          <Select.Option value="Đã hủy">Đã hủy</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      sorter: (a, b) => moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf(),
    },
    {
      title: 'Thao tác',
      width: 200,
      align: 'center',
      render: (_: any, r: Order) => (
        <Space>
          <Button onClick={() => openDetail(r)}>Chi tiết</Button>
          <Popconfirm
            title={`Xóa đơn ${r.id}?`}
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => {
              // nếu đơn đang hoàn thành mà xóa -> hoàn kho trước (an toàn)
              if (r.status === 'Hoàn thành') {
                r.products.forEach((it) => updateStock(it.productId, it.quantity));
              }
              setOrders((prev) => prev.filter((o) => o.id !== r.id));
              message.success('Xóa đơn hàng thành công!');
            }}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Bài 2: Quản lý Sản phẩm & Đơn hàng
      </Typography.Title>

      {/* Tabs (không tạo page mới) */}
      <Space style={{ marginBottom: 12 }}>
        <Button type={activeTab === 'dashboard' ? 'primary' : 'default'} onClick={() => setActiveTab('dashboard')}>
          Dashboard
        </Button>
        <Button type={activeTab === 'products' ? 'primary' : 'default'} onClick={() => setActiveTab('products')}>
          Quản lý Sản phẩm
        </Button>
        <Button type={activeTab === 'orders' ? 'primary' : 'default'} onClick={() => setActiveTab('orders')}>
          Quản lý Đơn hàng
        </Button>
      </Space>

      {/* ====== DASHBOARD ====== */}
      {activeTab === 'dashboard' && (
        <div>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Card>
                <Statistic title="Tổng số sản phẩm" value={products.length} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic title="Tổng giá trị tồn kho" value={totalStockValue} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic title="Tổng số đơn hàng" value={orders.length} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic title="Doanh thu (Hoàn thành)" value={revenue} />
              </Card>
            </Col>
          </Row>

          <Divider />

          <Card title="Số đơn hàng theo trạng thái">
            <Space direction="vertical" style={{ width: '100%' }}>
              {(['Chờ xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'] as OrderStatus[]).map((st) => {
                const total = orders.length || 1;
                const count = orderStatusCount[st];
                const percent = Math.round((count / total) * 100);
                return (
                  <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Badge status="processing" text={st} />
                    <div style={{ flex: 1 }}>
                      <Progress percent={percent} />
                    </div>
                    <div style={{ width: 60, textAlign: 'right' }}>{count}</div>
                  </div>
                );
              })}
            </Space>
          </Card>
        </div>
      )}

      {/* ====== PRODUCTS ====== */}
      {activeTab === 'products' && (
        <div>
          <Card style={{ marginBottom: 12 }}>
            <Row gutter={12}>
              <Col xs={24} md={8}>
                <Input
                  placeholder="Tìm theo tên sản phẩm..."
                  allowClear
                  value={pSearch}
                  onChange={(e) => setPSearch(e.target.value)}
                />
              </Col>

              <Col xs={24} md={5}>
                <Select
                  allowClear
                  placeholder="Lọc danh mục"
                  value={pCategory}
                  onChange={(v) => setPCategory(v)}
                  style={{ width: '100%' }}
                >
                  {categories.map((c) => (
                    <Select.Option key={c} value={c}>
                      {c}
                    </Select.Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} md={5}>
                <Select
                  allowClear
                  placeholder="Lọc trạng thái"
                  value={pStatus}
                  onChange={(v) => setPStatus(v)}
                  style={{ width: '100%' }}
                >
                  <Select.Option value="Còn hàng">Còn hàng</Select.Option>
                  <Select.Option value="Sắp hết">Sắp hết</Select.Option>
                  <Select.Option value="Hết hàng">Hết hàng</Select.Option>
                </Select>
              </Col>

              <Col xs={24} md={3}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Giá min"
                  min={0}
                  value={pPriceMin}
                  onChange={(v) => setPPriceMin(v as number)}
                />
              </Col>

              <Col xs={24} md={3}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Giá max"
                  min={0}
                  value={pPriceMax}
                  onChange={(v) => setPPriceMax(v as number)}
                />
              </Col>
            </Row>
          </Card>

          <Table<Product>
            rowKey="id"
            columns={productColumns}
            dataSource={filteredProducts}
            pagination={{ pageSize: 5 }}
          />

          <Modal
            title="Sửa sản phẩm"
            visible={editOpen}
            onCancel={() => setEditOpen(false)}
            onOk={submitEdit}
            okText="Lưu"
            cancelText="Hủy"
            destroyOnClose
          >
            <Form form={productForm} layout="vertical">
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[{ required: true, message: 'Bắt buộc nhập tên' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true, message: 'Bắt buộc chọn danh mục' }]}
              >
                <Select>
                  {categories.map((c) => (
                    <Select.Option key={c} value={c}>
                      {c}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Giá"
                name="price"
                rules={[
                  { required: true, message: 'Bắt buộc nhập giá' },
                  {
                    validator: async (_, value) => {
                      if (value == null) return;
                      if (typeof value !== 'number' || value <= 0) throw new Error('Giá phải là số dương');
                    },
                  },
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={1} step={1000} />
              </Form.Item>

              <Form.Item
                label="Số lượng tồn kho"
                name="quantity"
                rules={[
                  { required: true, message: 'Bắt buộc nhập số lượng' },
                  {
                    validator: async (_, value) => {
                      if (value == null) return;
                      if (!Number.isInteger(value) || value < 0) throw new Error('Tồn kho phải là số nguyên >= 0');
                    },
                  },
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={1} />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )}

      {/* ====== ORDERS ====== */}
      {activeTab === 'orders' && (
        <div>
          <Card style={{ marginBottom: 12 }}>
            <Row gutter={12} align="middle">
              <Col xs={24} md={7}>
                <Input
                  placeholder="Tìm theo tên KH hoặc mã đơn..."
                  allowClear
                  value={oSearch}
                  onChange={(e) => setOSearch(e.target.value)}
                />
              </Col>

              <Col xs={24} md={5}>
                <Select
                  allowClear
                  placeholder="Lọc trạng thái"
                  value={oStatus}
                  onChange={(v) => setOStatus(v)}
                  style={{ width: '100%' }}
                >
                  <Select.Option value="Chờ xử lý">Chờ xử lý</Select.Option>
                  <Select.Option value="Đang giao">Đang giao</Select.Option>
                  <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
                  <Select.Option value="Đã hủy">Đã hủy</Select.Option>
                </Select>
              </Col>

              <Col xs={24} md={8}>
                <DatePicker.RangePicker
                  style={{ width: '100%' }}
                  value={oDateRange as any}
                  onChange={(v) => setODateRange(v as any)}
                />
              </Col>

              <Col xs={24} md={4} style={{ textAlign: 'right' }}>
                <Button type="primary" onClick={openCreateOrder}>
                  Tạo đơn hàng
                </Button>
              </Col>
            </Row>
          </Card>

          <Table<Order> rowKey="id" columns={orderColumns} dataSource={filteredOrders} pagination={{ pageSize: 5 }} />

          {/* Create Order Modal */}
          <Modal
            title="Tạo đơn hàng mới"
            visible={createOpen}
            onCancel={() => setCreateOpen(false)}
            onOk={submitCreateOrder}
            okText="Tạo"
            cancelText="Hủy"
            destroyOnClose
            width={800}
          >
            <Form form={orderForm} layout="vertical">
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label="Tên khách hàng"
                    name="customerName"
                    rules={[{ required: true, message: 'Bắt buộc nhập tên khách hàng' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                      { required: true, message: 'Bắt buộc nhập số điện thoại' },
                      {
                        validator: async (_, value) => {
                          if (!value) return;
                          if (!validatePhone(String(value).trim())) throw new Error('SĐT phải 10-11 chữ số');
                        },
                      },
                    ]}
                  >
                    <Input placeholder="VD: 0912345678" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: 'Bắt buộc nhập địa chỉ' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Chọn sản phẩm"
                name="productIds"
                rules={[{ required: true, message: 'Bắt buộc chọn sản phẩm' }]}
              >
                <Select mode="multiple" placeholder="Chọn 1 hoặc nhiều sản phẩm">
                  {products.map((p) => (
                    <Select.Option key={p.id} value={p.id} disabled={p.quantity === 0}>
                      {p.name} (tồn: {p.quantity})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedProducts.length > 0 && (
                <div style={{ border: '1px solid #f0f0f0', padding: 12, borderRadius: 6 }}>
                  <Typography.Text strong>Nhập số lượng đặt:</Typography.Text>
                  <div style={{ marginTop: 8 }}>
                    {selectedProducts.map((p) => (
                      <Row key={p.id} gutter={12} style={{ marginBottom: 8 }} align="middle">
                        <Col span={12}>
                          <Typography.Text>
                            {p.name} <Tag>{formatMoney(p.price)}</Tag> {getProductStockTag(p.quantity)}
                          </Typography.Text>
                        </Col>
                        <Col span={6}>
                          <InputNumber
                            min={1}
                            step={1}
                            value={orderQtyMap[p.id] ?? 1}
                            onChange={(v) => {
                              const num = Number(v);
                              setOrderQtyMap((prev) => ({ ...prev, [p.id]: num }));
                            }}
                            style={{ width: '100%' }}
                          />
                        </Col>
                        <Col span={6} style={{ textAlign: 'right' }}>
                          <Typography.Text>
                            Tạm tính: {formatMoney((orderQtyMap[p.id] ?? 1) * p.price)}
                          </Typography.Text>
                        </Col>
                      </Row>
                    ))}
                  </div>

                  <Divider style={{ margin: '12px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography.Text strong>Tổng tiền:</Typography.Text>
                    <Typography.Text strong>{formatMoney(orderTotal)}</Typography.Text>
                  </div>
                </div>
              )}
            </Form>
          </Modal>

          {/* Detail Modal */}
          <Modal
            title={`Chi tiết đơn hàng ${detailOrder?.id ?? ''}`}
            visible={detailOpen}
            onCancel={() => setDetailOpen(false)}
            footer={<Button onClick={() => setDetailOpen(false)}>Đóng</Button>}
            width={800}
            destroyOnClose
          >
            {detailOrder && (
              <div>
                <Row gutter={12}>
                  <Col span={12}>
                    <Card size="small">
                      <div><b>Khách hàng:</b> {detailOrder.customerName}</div>
                      <div><b>SĐT:</b> {detailOrder.phone}</div>
                      <div><b>Địa chỉ:</b> {detailOrder.address}</div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small">
                      <div><b>Trạng thái:</b> {detailOrder.status}</div>
                      <div><b>Ngày tạo:</b> {detailOrder.createdAt}</div>
                      <div><b>Tổng tiền:</b> {formatMoney(detailOrder.totalAmount)}</div>
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <Table<OrderItem>
                  rowKey={(r) => String(r.productId)}
                  pagination={false}
                  dataSource={detailOrder.products}
                  columns={[
                    { title: 'Sản phẩm', dataIndex: 'productName' },
                    { title: 'Giá', dataIndex: 'price', align: 'right', render: (v: number) => formatMoney(v) },
                    { title: 'Số lượng', dataIndex: 'quantity', align: 'center' },
                    {
                      title: 'Thành tiền',
                      align: 'right',
                      render: (_: any, r: OrderItem) => formatMoney(r.price * r.quantity),
                    },
                  ]}
                />
              </div>
            )}
          </Modal>
        </div>
      )}
    </div>
  );
}
