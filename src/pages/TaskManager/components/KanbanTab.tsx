import { Button, Card, Col, Row, Tag } from 'antd';

export default function KanbanTab({ tasks, setTasks }) {
  const moveTask = (id, newStatus) => {
    setTasks(tasks.map(t => (t.id === id ? { ...t, status: newStatus } : t)));
  };

  const renderColumn = (status, title) => (
    <Col span={8}>
      <h2>{title}</h2>

      {tasks
        .filter(t => t.status === status)
        .map(task => (
          <Card key={task.id} style={{ marginBottom: 10 }}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <Tag>{task.priority}</Tag>

            <div style={{ marginTop: 10 }}>
              {status !== 'todo' && (
                <Button onClick={() => moveTask(task.id, 'todo')}>
                  Todo
                </Button>
              )}

              {status !== 'doing' && (
                <Button onClick={() => moveTask(task.id, 'doing')}>
                  Doing
                </Button>
              )}

              {status !== 'done' && (
                <Button onClick={() => moveTask(task.id, 'done')}>
                  Done
                </Button>
              )}
            </div>
          </Card>
        ))}
    </Col>
  );

  return (
    <Row gutter={16}>
      {renderColumn('todo', 'Cần làm')}
      {renderColumn('doing', 'Đang làm')}
      {renderColumn('done', 'Hoàn thành')}
    </Row>
  );
}