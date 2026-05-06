import { Button, Input, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { useState } from 'react';

export default function TaskListTab({
  tasks,
  setTasks,
  setEditingTask,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const deleteTask = id => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filtered = tasks.filter(
    t =>
      t.title.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter ? t.status === statusFilter : true),
  );

  return (
    <>
      <Space style={{ marginBottom: 20 }}>
        <Input.Search
          placeholder="Tìm task"
          onChange={e => setSearch(e.target.value)}
        />

        <Select
          placeholder="Filter status"
          style={{ width: 150 }}
          onChange={setStatusFilter}
          allowClear
          options={[
            { value: 'todo', label: 'Todo' },
            { value: 'doing', label: 'Doing' },
            { value: 'done', label: 'Done' },
          ]}
        />
      </Space>

      <Table
        rowKey="id"
        dataSource={filtered}
        columns={[
          {
            title: 'Task',
            dataIndex: 'title',
          },
          {
            title: 'Deadline',
            dataIndex: 'deadline',
            sorter: (a, b) =>
              new Date(a.deadline).getTime() -
              new Date(b.deadline).getTime(),
          },
          {
            title: 'Priority',
            dataIndex: 'priority',
            render: p => <Tag>{p}</Tag>,
          },
          {
            title: 'Status',
            dataIndex: 'status',
          },
          {
            title: 'Action',
            render: (_, record) => (
              <Space>
                <Button onClick={() => setEditingTask(record)}>Edit</Button>

                <Popconfirm
                  title="Xóa task?"
                  onConfirm={() => deleteTask(record.id)}
                >
                  <Button danger>Delete</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </>
  );
}