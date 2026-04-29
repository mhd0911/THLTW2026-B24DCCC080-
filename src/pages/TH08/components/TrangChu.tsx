import { Card, Col, Row, Timeline } from 'antd';
import { Column, Line } from '@ant-design/plots';

export default () => {
  const stats = [
    { title: 'Buổi/tháng', value: 18 },
    { title: 'Calo', value: 3200 },
    { title: 'Streak', value: '6 ngày' },
    { title: 'Mục tiêu', value: '75%' },
  ];

  const columnData = [
    { week: 'W1', value: 3 },
    { week: 'W2', value: 5 },
    { week: 'W3', value: 4 },
    { week: 'W4', value: 6 },
  ];

  const lineData = [
    { date: '1', weight: 60 },
    { date: '7', weight: 59 },
    { date: '14', weight: 58.5 },
  ];

  return (
    <>
      <Row gutter={16}>
        {stats.map((s, i) => (
          <Col span={6} key={i}>
            <Card>
              <div style={{ fontSize: 12 }}>{s.title}</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{s.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Buổi tập theo tuần" style={{ marginTop: 16 }}>
        <Column data={columnData} xField="week" yField="value" />
      </Card>

      <Card title="Cân nặng" style={{ marginTop: 16 }}>
        <Line data={lineData} xField="date" yField="weight" />
      </Card>

      <Card title="5 buổi gần nhất" style={{ marginTop: 16 }}>
        <Timeline
          items={[
            { children: 'Cardio - 200 cal' },
            { children: 'HIIT - 300 cal' },
            { children: 'Yoga - 100 cal' },
            { children: 'Strength - 250 cal' },
            { children: 'Cardio - 220 cal' },
          ]}
        />
      </Card>
    </>
  );
};