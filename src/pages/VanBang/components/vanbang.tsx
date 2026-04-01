import { useState } from 'react';
import { Button, Table, Space, Modal, message, Input } from 'antd';
// Đảm bảo file Form.tsx tồn tại cùng thư mục, nếu không hãy comment dòng dưới lại để test trước
// import FormVanBang from './Form'; 

const VanBang = () => {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState<any>({});

  const dynamicFields = [
    { name: 'dan_toc', type: 'string', label: 'Dân tộc' },
    { name: 'diem_tb', type: 'number', label: 'Điểm TB' },
    { name: 'ngay_nhap_hoc', type: 'date', label: 'Ngày nhập học' },
  ];

  const handleSubmit = (values: any) => {
    if (editing) {
      setData(data.map(item => (item.id === editing.id ? { ...item, ...values } : item)));
    } else {
      setData([...data, { ...values, id: Date.now(), so_vao_so: data.length + 1 }]);
    }
    setOpen(false);
    setEditing(null);
  };

  const filteredData = data.filter((item: any) => {
    return Object.keys(search).every(key => {
      if (!search[key]) return true;
      return item[key]?.toString().toLowerCase().includes(search[key].toLowerCase());
    });
  });

  const columns = [
    { title: 'Số vào sổ', dataIndex: 'so_vao_so', key: 'so_vao_so' },
    { title: 'Số hiệu', dataIndex: 'so_hieu', key: 'so_hieu' },
    { title: 'MSV', dataIndex: 'msv', key: 'msv' },
    { title: 'Họ tên', dataIndex: 'ho_ten', key: 'ho_ten' },
    ...dynamicFields.map(f => ({ title: f.label, dataIndex: f.name, key: f.name })),
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => { setEditing(record); setOpen(true); }}>Sửa</Button>
          <Button type="link" danger onClick={() => setData(data.filter(i => i.id !== record.id))}>Xóa</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 20 }}>
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="Số hiệu" onChange={e => setSearch({ ...search, so_hieu: e.target.value })} />
        <Input placeholder="MSV" onChange={e => setSearch({ ...search, msv: e.target.value })} />
        <Button type="primary" onClick={() => message.info('Đang lọc dữ liệu...')}>Tìm</Button>
      </Space>

      <Table columns={columns} dataSource={filteredData} rowKey="id" />

      <Modal 
        visible={open} 
        onCancel={() => setOpen(false)} 
        footer={null} 
        destroyOnClose
      >
        {/* Tạm thời để text nếu bạn chưa sửa xong file Form */}
        <div>Form nhập liệu ở đây</div> 
      </Modal>
    </div>
  );
};

export default VanBang; 