import React, { useState } from 'react';
import { Tabs } from 'antd';
import { HomeOutlined, FormOutlined, TagsOutlined, UserOutlined } from '@ant-design/icons';
// @ts-ignore
import TrangChu from './components/TrangChu';
// @ts-ignore
import ChiTietBaiViet from './components/ChiTietBaiViet';
// @ts-ignore
import GioiThieu from './components/GioiThieu';
// @ts-ignore
import QuanLyBaiViet from './components/QuanLyBaiViet';
// @ts-ignore
import QuanLyThe from './components/QuanLyThe';

const { TabPane } = Tabs;

const TH07 = () => {
  const [idBaiVietDangXem, setIdBaiVietDangXem] = useState('');
  const [tabHienTai, setTabHienTai] = useState('1');

  const moChiTiet = (id: any) => {
    setIdBaiVietDangXem(id);
  };

  const quayLaiDanhSach = () => {
    setIdBaiVietDangXem('');
  };

  if (idBaiVietDangXem !== '') {
    return (
      <div style={{ padding: 24 }}>
        <ChiTietBaiViet
          idBaiViet={idBaiVietDangXem}
          quayLai={quayLaiDanhSach}
          moChiTiet={moChiTiet}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Tabs activeKey={tabHienTai} onChange={(key) => setTabHienTai(key)}>
        <TabPane tab={<span><HomeOutlined /> Trang chủ</span>} key="1">
          <TrangChu moChiTiet={moChiTiet} />
        </TabPane>
        <TabPane tab={<span><FormOutlined /> Quản lý bài viết</span>} key="2">
          <QuanLyBaiViet />
        </TabPane>
        <TabPane tab={<span><TagsOutlined /> Quản lý thẻ</span>} key="3">
          <QuanLyThe />
        </TabPane>
        <TabPane tab={<span><UserOutlined /> Giới thiệu</span>} key="4">
          <GioiThieu />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TH07;