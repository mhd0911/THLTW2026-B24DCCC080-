import { Table, Button, Modal, Form, Input, Select, DatePicker, Popconfirm, Space } from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';

export default () => {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('');
  const [range, setRange] = useState<any>([]);

  const submit = () => {
    form.validateFields().then(v => {
      setData([...data, { ...v, key: Date.now() }]);
      setOpen(false); form.resetFields();
    });
  };

  const filtered = data.filter(i =>
    (!keyword || i.type?.toLowerCase().includes(keyword.toLowerCase())) &&
    (!type || i.type === type) &&
    (!range?.length || (dayjs(i.date).isAfter(range[0]) && dayjs(i.date).isBefore(range[1])))
  );

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="Search..." onChange={e => setKeyword(e.target.value)} />
        <Select placeholder="Type" allowClear onChange={setType}
          options={['Cardio','Strength','Yoga','HIIT'].map(v => ({ value: v }))}/>
        <DatePicker.RangePicker onChange={setRange}/>
        <Button type="primary" onClick={() => setOpen(true)}>Thêm</Button>
      </Space>

      <Table dataSource={filtered} columns={[
        { title: 'Ngày', dataIndex: 'date' },
        { title: 'Loại', dataIndex: 'type' },
        { title: 'Phút', dataIndex: 'duration' },
        { title: 'Calo', dataIndex: 'calories' },
        {
          title: 'Action',
          render: (_, r) => (
            <Popconfirm title="Xóa?" onConfirm={() => setData(data.filter(i => i.key !== r.key))}>
              <Button danger>Xóa</Button>
            </Popconfirm>
          )
        }
      ]}/>

      <Modal open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="date" label="Ngày" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }}/>
          </Form.Item>
          <Form.Item name="type" label="Loại">
            <Select options={['Cardio','Strength','Yoga','HIIT'].map(v => ({ value: v }))}/>
          </Form.Item>
          <Form.Item name="duration" label="Phút"><Input/></Form.Item>
          <Form.Item name="calories" label="Calo"><Input/></Form.Item>
        </Form>
      </Modal>
    </>
  );
};