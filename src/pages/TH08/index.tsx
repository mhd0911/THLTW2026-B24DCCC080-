import { Tabs } from 'antd';
import { DashboardOutlined, FireOutlined, HeartOutlined, AimOutlined, AppstoreOutlined } from '@ant-design/icons';
import TrangChu from './components/TrangChu';
import QuanLyWorkout from './components/QuanLyWorkout';
import QuanLySucKhoe from './components/QuanLySucKhoe';
import QuanLyMucTieu from './components/QuanLyMucTieu';
import ThuVienBaiTap from './components/ThuVienBaiTap';

export default () => (
  <Tabs
    items={[
      { key: '1', label: (<><DashboardOutlined/> Dashboard</>), children: <TrangChu/> },
      { key: '2', label: (<><FireOutlined/> Workout</>), children: <QuanLyWorkout/> },
      { key: '3', label: (<><HeartOutlined/> Health</>), children: <QuanLySucKhoe/> },
      { key: '4', label: (<><AimOutlined/> Goals</>), children: <QuanLyMucTieu/> },
      { key: '5', label: (<><AppstoreOutlined/> Exercises</>), children: <ThuVienBaiTap/> },
    ]}
  />
);