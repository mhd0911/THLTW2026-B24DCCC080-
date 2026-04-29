import { Table, Button, Tag } from 'antd';
import { useState } from 'react';

const bmiTag = (b: number) => {
  if (b < 18.5) return <Tag color="blue">Thiếu cân</Tag>;
  if (b < 25) return <Tag color="green">Bình thường</Tag>;
  if (b < 30) return <Tag color="gold">Thừa cân</Tag>;
  return <Tag color="red">Béo phì</Tag>;
};

export default () => {
  const [data, setData] = useState<any[]>([]);

  const add = () => {
    const w = 60, h = 170;
    const bmi = +(w / ((h/100)*(h/100))).toFixed(1);
    setData([...data, { key: Date.now(), weight: w, height: h, bmi }]);
  };

  return (
    <>
      <Button onClick={add}>Thêm</Button>
      <Table dataSource={data} columns={[
        { title: 'Kg', dataIndex: 'weight' },
        { title: 'Cm', dataIndex: 'height' },
        { title: 'BMI', dataIndex: 'bmi' },
        { title: 'Phân loại', render: (_, r) => bmiTag(r.bmi) }
      ]}/>
    </>
  );
};