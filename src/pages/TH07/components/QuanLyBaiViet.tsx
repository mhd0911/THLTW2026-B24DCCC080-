import React, { useState } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag,
  Space, Popconfirm, Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { DS_TRANG_THAI } from '@/models/useModelBlog';


const QuanLyBaiViet = () => {
  const { danhSachBaiViet, danhSachThe, themBaiViet, suaBaiViet, xoaBaiViet, layTenThe } = useModel('useModelBlog' as any);

  const [hienModal, setHienModal] = useState(false);
  const [dangSua, setDangSua] = useState(null as any);
  const [timKiem, setTimKiem] = useState('');
  const [locTrangThai, setLocTrangThai] = useState(undefined as any);
  const [form] = Form.useForm();

  const moFormThem = () => {
    setDangSua(null);
    form.resetFields();
    setHienModal(true);
  };

  const moFormSua = (record: any) => {
    setDangSua(record);
    form.setFieldsValue({
      tieuDe: record.tieuDe,
      slug: record.slug,
      tomTat: record.tomTat,
      noiDung: record.noiDung,
      anhDaiDien: record.anhDaiDien,
      tags: record.tags,
      trangThai: record.trangThai,
    });
    setHienModal(true);
  };

  const xuLyLuu = (values: any) => {
    if (dangSua) {
      suaBaiViet(dangSua.id, values);
    } else {
      themBaiViet(values);
    }
    setHienModal(false);
    form.resetFields();
  };

  let dsHienThi: any[] = [];
  for (let i = 0; i < danhSachBaiViet.length; i++) {
    let hien = true;
    if (timKiem !== '' && !danhSachBaiViet[i].tieuDe.toLowerCase().includes(timKiem.toLowerCase())) {
      hien = false;
    }
    if (locTrangThai && danhSachBaiViet[i].trangThai !== locTrangThai) {
      hien = false;
    }
    if (hien) dsHienThi.push(danhSachBaiViet[i]);
  }

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'tieuDe',
      key: 'tieuDe',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 120,
      align: 'center' as const,
      render: (val: any) => (
        <Tag color={val === 'daDang' ? 'green' : 'default'}>
          {val === 'daDang' ? 'Đã đăng' : 'Nháp'}
        </Tag>
      ),
    },
    {
      title: 'Thẻ',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: any) => (
        <>
          {tags.map((tagId: any) => (
            <Tag key={tagId} color="blue" style={{ fontSize: 11 }}>{layTenThe(tagId)}</Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'luotXem',
      key: 'luotXem',
      width: 100,
      align: 'center' as const,
      sorter: (a: any, b: any) => a.luotXem - b.luotXem,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      width: 120,
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
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => xoaBaiViet(record.id)} okText="Xóa" cancelText="Hủy">
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
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Tìm tiêu đề..."
            prefix={<SearchOutlined />}
            allowClear
            value={timKiem}
            onChange={(e) => setTimKiem(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Lọc trạng thái"
            allowClear
            style={{ width: 150 }}
            value={locTrangThai}
            onChange={(val) => setLocTrangThai(val)}
            options={DS_TRANG_THAI}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={moFormThem}>
            Thêm bài viết
          </Button>
        </Space>
      </Card>

      <Card>
        <Table bordered size="small" dataSource={dsHienThi} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />
      </Card>

      <Modal
        title={dangSua ? 'Sửa bài viết' : 'Thêm bài viết'}
        visible={hienModal}
        onOk={() => form.submit()}
        onCancel={() => { setHienModal(false); form.resetFields(); }}
        okText={dangSua ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        destroyOnClose
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={xuLyLuu}>
          <Form.Item name="tieuDe" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề!' }]}>
            <Input placeholder="Tiêu đề bài viết" />
          </Form.Item>

          <Form.Item name="slug" label="Slug" rules={[{ required: true, message: 'Nhập slug!' }]}>
            <Input placeholder="vd: bai-viet-moi" />
          </Form.Item>

          <Form.Item name="tomTat" label="Tóm tắt">
            <Input.TextArea rows={2} placeholder="Tóm tắt ngắn gọn..." />
          </Form.Item>

          <Form.Item name="noiDung" label="Nội dung (Markdown)" rules={[{ required: true, message: 'Nhập nội dung!' }]}>
            <Input.TextArea rows={8} placeholder="# Tiêu đề&#10;&#10;Nội dung bài viết..." />
          </Form.Item>

          <Form.Item name="anhDaiDien" label="Ảnh đại diện (URL)">
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Form.Item name="tags" label="Thẻ">
            <Select mode="multiple" placeholder="Chọn thẻ" options={danhSachThe.map((t: any) => ({ value: t.id, label: t.ten }))} />
          </Form.Item>

          <Form.Item name="trangThai" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái!' }]}>
            <Select placeholder="Chọn" options={DS_TRANG_THAI} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuanLyBaiViet;