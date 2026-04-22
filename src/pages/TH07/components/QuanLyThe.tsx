import React, { useState } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Space, Popconfirm, Typography, Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useModel } from 'umi';

const { Text } = Typography;

const QuanLyThe = () => {
  const { danhSachThe, themThe, suaThe, xoaThe, demBaiVietTheoThe } = useModel('useModelBlog' as any);

  const [hienModal, setHienModal] = useState(false);
  const [dangSua, setDangSua] = useState(null as any);
  const [form] = Form.useForm();

  const moFormThem = () => {
    setDangSua(null);
    form.resetFields();
    setHienModal(true);
  };

  const moFormSua = (record: any) => {
    setDangSua(record);
    form.setFieldsValue({ ten: record.ten });
    setHienModal(true);
  };

  const xuLyLuu = (values: any) => {
    let ok = false;
    if (dangSua) {
      ok = suaThe(dangSua.id, values.ten);
    } else {
      ok = themThe(values.ten);
    }
    if (ok) {
      setHienModal(false);
      form.resetFields();
    }
  };

  const columns = [
    {
      title: 'Tên thẻ',
      dataIndex: 'ten',
      key: 'ten',
    },
    {
      title: 'Số bài viết',
      key: 'soBaiViet',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Text strong>{demBaiVietTheoThe(record.id)}</Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'thaoTac',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => moFormSua(record)} />
          </Tooltip>
          <Popconfirm title="Xóa thẻ này?" onConfirm={() => xoaThe(record.id)} okText="Xóa" cancelText="Hủy">
            <Tooltip title="Xóa">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={moFormThem}>
          Thêm thẻ
        </Button>
      </div>

      <Card>
        <Table bordered size="small" dataSource={danhSachThe} columns={columns} rowKey="id" pagination={false} />
      </Card>

      <Modal
        title={dangSua ? 'Sửa thẻ' : 'Thêm thẻ'}
        visible={hienModal}
        onOk={() => form.submit()}
        onCancel={() => { setHienModal(false); form.resetFields(); }}
        okText={dangSua ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        destroyOnClose
        width={400}
      >
        <Form form={form} layout="vertical" onFinish={xuLyLuu}>
          <Form.Item name="ten" label="Tên thẻ" rules={[{ required: true, message: 'Nhập tên thẻ!' }]}>
            <Input placeholder="VD: React" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuanLyThe;