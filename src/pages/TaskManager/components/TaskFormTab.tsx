import { Button, DatePicker, Form, Input, Select } from 'antd';
import { useEffect } from 'react';

export default function TaskFormTab({
  tasks,
  setTasks,
  editingTask,
  setEditingTask,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingTask) {
      form.setFieldsValue(editingTask);
    }
  }, [editingTask]);

  const onFinish = values => {
    if (editingTask) {
      setTasks(
        tasks.map(t =>
          t.id === editingTask.id ? { ...editingTask, ...values } : t,
        ),
      );
      setEditingTask(null);
    } else {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          ...values,
        },
      ]);
    }

    form.resetFields();
  };

  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      <Form.Item name="title" label="Tên task">
        <Input />
      </Form.Item>

      <Form.Item name="description" label="Mô tả">
        <Input.TextArea />
      </Form.Item>

      <Form.Item name="deadline" label="Deadline">
        <Input type="date" />
      </Form.Item>

      <Form.Item name="priority" label="Priority">
        <Select
          options={[
            { value: 'High' },
            { value: 'Medium' },
            { value: 'Low' },
          ]}
        />
      </Form.Item>

      <Form.Item name="status" label="Status">
        <Select
          options={[
            { value: 'todo' },
            { value: 'doing' },
            { value: 'done' },
          ]}
        />
      </Form.Item>

      <Form.Item name="tag" label="Tag">
        <Input />
      </Form.Item>

      <Button type="primary" htmlType="submit">
        {editingTask ? 'Cập nhật task' : 'Thêm task'}
      </Button>
    </Form>
  );
}