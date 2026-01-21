import React, { useMemo, useState } from 'react';
import { Button, Form, Input, InputNumber, message, Modal, Popconfirm, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

const initialProducts: Product[] = [
  { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
  { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
  { id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
  { id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
];

export default function QuanLySanPham() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<{ name: string; price: number; quantity: number }>();

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const nextId = useMemo(() => {
    return products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  }, [products]);

  const handleOpenAdd = () => {
    form.resetFields();
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    message.success('Xóa sản phẩm thành công!');
  };

  const handleAdd = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      const newProduct: Product = {
        id: nextId,
        name: values.name.trim(),
        price: values.price,
        quantity: values.quantity,
      };

      setProducts((prev) => [newProduct, ...prev]);
      setOpen(false);
      message.success('Thêm sản phẩm thành công!');
      form.resetFields();
    } catch (e) {

    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'STT',
      key: 'stt',
      width: 80,
      align: 'center',
      render: (_: any, __: Product, index: number) => index + 1,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (value: number) => value.toLocaleString('vi-VN'),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 160,
      align: 'center',
      render: (_: any, record: Product) => (
        <Space>
          <Popconfirm
            title={`Bạn chắc chắn muốn xóa "${record.name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Quản lý sản phẩm
      </Typography.Title>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <Input.Search
          placeholder="Tìm kiếm theo tên sản phẩm..."
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 420 }}
        />

        <Button type="primary" onClick={handleOpenAdd}>
          Thêm sản phẩm
        </Button>
      </div>

      <Table<Product> rowKey="id" columns={columns} dataSource={filteredProducts} pagination={{ pageSize: 5 }} />

      <Modal
        title="Thêm sản phẩm mới"
        visible={open}
        onCancel={() => setOpen(false)}
        onOk={handleAdd}
        okText="Thêm"
        cancelText="Hủy"
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input placeholder="VD: Chuột Logitech..." />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[
              { required: true, message: 'Vui lòng nhập giá' },
              {
                validator: async (_, value) => {
                  if (value == null) return;
                  if (typeof value !== 'number' || value <= 0) {
                    throw new Error('Giá phải là số dương');
                  }
                },
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} step={1000} placeholder="VD: 25000000" />
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              {
                validator: async (_, value) => {
                  if (value == null) return;
                  if (!Number.isInteger(value) || value <= 0) {
                    throw new Error('Số lượng phải là số nguyên dương');
                  }
                },
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} step={1} placeholder="VD: 10" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
