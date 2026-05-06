import { Tabs } from 'antd';
import { useEffect, useState } from 'react';

import DashboardTab from './components/DashboardTab';
import KanbanTab from './components/KanbanTab';
import TaskListTab from './components/TaskListTab';
import TaskFormTab from './components/TaskFormTab';

import { defaultTasks } from './mock';

export default function TaskManager() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  const [editingTask, setEditingTask] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  return (
    <Tabs>
      <Tabs.TabPane tab="Dashboard" key="1">
        <DashboardTab tasks={tasks} />
      </Tabs.TabPane>

      <Tabs.TabPane tab="Kanban Board" key="2">
        <KanbanTab tasks={tasks} setTasks={setTasks} />
      </Tabs.TabPane>

      <Tabs.TabPane tab="Danh sách task" key="3">
        <TaskListTab
          tasks={tasks}
          setTasks={setTasks}
          setEditingTask={setEditingTask}
        />
      </Tabs.TabPane>

      <Tabs.TabPane tab="Thêm / sửa task" key="4">
        <TaskFormTab
          tasks={tasks}
          setTasks={setTasks}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
        />
      </Tabs.TabPane>
    </Tabs>
  );
}