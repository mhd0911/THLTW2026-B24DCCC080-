import { Card, Progress, Button, Drawer, Form, Input, Segmented } from 'antd';
import { useState } from 'react';

export default () => {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('all');
  const [form] = Form.useForm();

  const add = () => {
    form.validateFields().then(v => {
      setData([...data, { ...v, key: Date.now(), current: 0 }]);
      setOpen(false); form.resetFields();
    });
  };

  const filtered = status==='all'?data:data.filter(i=>i.status===status);

  return (
    <>
      <Segmented options={['all','doing','done']} onChange={setStatus}/>
      <Button onClick={()=>setOpen(true)}>Thêm</Button>

      {filtered.map(g => (
        <Card key={g.key} title={g.name} style={{ marginTop: 12 }}>
          <Progress percent={(g.current/g.target)*100}/>
        </Card>
      ))}

      <Drawer open={open} onClose={()=>setOpen(false)} onCloseCapture={()=>form.resetFields()}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên"><Input/></Form.Item>
          <Form.Item name="target" label="Target"><Input/></Form.Item>
          <Form.Item name="status" label="Status"><Input/></Form.Item>
          <Button onClick={add}>Lưu</Button>
        </Form>
      </Drawer>
    </>
  );
};