import { Card, Row, Col, Modal, Select } from 'antd';
import { useState } from 'react';

export default () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const data = [
    { name: 'Push Up', muscle: 'Chest', level: 'Dễ' },
    { name: 'Squat', muscle: 'Legs', level: 'Trung bình' },
  ];

  return (
    <>
      <Select placeholder="Muscle" style={{ width: 200, marginBottom: 16 }}
        options={['Chest','Legs','Back'].map(v => ({ value: v }))}/>

      <Row gutter={16}>
        {data.map((e,i)=>(
          <Col span={8} key={i}>
            <Card onClick={()=>{setSelected(e);setOpen(true);}}>
              {e.name} - {e.level}
            </Card>
          </Col>
        ))}
      </Row>

      <Modal open={open} onCancel={()=>setOpen(false)} footer={null}>
        <h3>{selected?.name}</h3>
        <p>Hướng dẫn chi tiết...</p>
      </Modal>
    </>
  );
};