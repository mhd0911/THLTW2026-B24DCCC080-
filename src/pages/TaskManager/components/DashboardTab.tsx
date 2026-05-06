import { Card, Col, Progress, Row } from 'antd';

export default function DashboardTab({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const doing = tasks.filter(t => t.status === 'doing').length;
  const todo = tasks.filter(t => t.status === 'todo').length;

  const overdue = tasks.filter(
    t => new Date(t.deadline) < new Date() && t.status !== 'done',
  ).length;

  return (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <Card title="Tổng task">{total}</Card>
        </Col>
        <Col span={6}>
          <Card title="Hoàn thành">{done}</Card>
        </Col>
        <Col span={6}>
          <Card title="Đang làm">{doing}</Card>
        </Col>
        <Col span={6}>
          <Card title="Quá hạn">{overdue}</Card>
        </Col>
      </Row>

      <Card title="Tiến độ" style={{ marginTop: 20 }}>
        <Progress percent={total ? Math.round((done / total) * 100) : 0} />
        <p>Cần làm: {todo}</p>
        <p>Đang làm: {doing}</p>
      </Card>
    </>
  );
}