import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Tag, Pagination, Typography, Empty } from 'antd';
import { SearchOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { useModel } from 'umi';

const { Title, Text, Paragraph } = Typography;

const TrangChu = (props: any) => {
  const { danhSachBaiViet, danhSachThe, layTenThe } = useModel('useModelBlog' as any);

  const [timKiem, setTimKiem] = useState('');
  const [timKiemDebounce, setTimKiemDebounce] = useState('');
  const [tagLoc, setTagLoc] = useState('');
  const [trangHienTai, setTrangHienTai] = useState(1);
  var soBaiMotTrang = 9;

  useEffect(() => {
    var timer = setTimeout(() => {
      setTimKiemDebounce(timKiem);
    }, 300);
    return () => clearTimeout(timer);
  }, [timKiem]);

  var dsBaiDaDang = [] as any[];
  for (var i = 0; i < danhSachBaiViet.length; i++) {
    if (danhSachBaiViet[i].trangThai === 'daDang') {
      dsBaiDaDang.push(danhSachBaiViet[i]);
    }
  }

  var dsHienThi = [] as any[];
  for (var i = 0; i < dsBaiDaDang.length; i++) {
    var hienThi = true;

    if (timKiemDebounce !== '') {
      var tk = timKiemDebounce.toLowerCase();
      if (!dsBaiDaDang[i].tieuDe.toLowerCase().includes(tk) && !dsBaiDaDang[i].tomTat.toLowerCase().includes(tk)) {
        hienThi = false;
      }
    }

    if (tagLoc !== '' && dsBaiDaDang[i].tags.indexOf(tagLoc) < 0) {
      hienThi = false;
    }

    if (hienThi) dsHienThi.push(dsBaiDaDang[i]);
  }

  var tongSo = dsHienThi.length;
  var batDau = (trangHienTai - 1) * soBaiMotTrang;
  var dsTrang = dsHienThi.slice(batDau, batDau + soBaiMotTrang);

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>📝 Blog Cá Nhân</Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
        Chia sẻ kiến thức lập trình & công nghệ
      </Text>

      <Input
        placeholder="Tìm kiếm bài viết..."
        prefix={<SearchOutlined />}
        allowClear
        value={timKiem}
        onChange={(e) => { setTimKiem(e.target.value); setTrangHienTai(1); }}
        style={{ marginBottom: 16, maxWidth: 400 }}
      />

      <div style={{ marginBottom: 16 }}>
        <Tag
          color={tagLoc === '' ? '#1890ff' : undefined}
          style={{ cursor: 'pointer', marginBottom: 4 }}
          onClick={() => { setTagLoc(''); setTrangHienTai(1); }}
        >
          Tất cả
        </Tag>
        {danhSachThe.map((t: any) => (
          <Tag
            key={t.id}
            color={tagLoc === t.id ? '#1890ff' : undefined}
            style={{ cursor: 'pointer', marginBottom: 4 }}
            onClick={() => { setTagLoc(t.id); setTrangHienTai(1); }}
          >
            {t.ten}
          </Tag>
        ))}
      </div>

      {dsTrang.length === 0 ? (
        <Empty description="Không có bài viết nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {dsTrang.map((bv: any) => (
            <Col xs={24} sm={12} md={8} key={bv.id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={bv.tieuDe}
                    src={bv.anhDaiDien || 'https://picsum.photos/seed/default/800/400'}
                    style={{ height: 180, objectFit: 'cover' }}
                  />
                }
                onClick={() => props.moChiTiet(bv.id)}
                style={{ height: '100%' }}
              >
                <Card.Meta
                  title={bv.tieuDe}
                  description={
                    <div>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8, color: '#666' }}>
                        {bv.tomTat}
                      </Paragraph>
                      <div style={{ marginBottom: 8 }}>
                        {bv.tags.map((tagId: any) => (
                          <Tag key={tagId} color="blue" style={{ fontSize: 11 }}>{layTenThe(tagId)}</Tag>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999' }}>
                        <span><CalendarOutlined /> {bv.ngayTao}</span>
                        <span><EyeOutlined /> {bv.luotXem} lượt xem</span>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{bv.tacGia}</Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {tongSo > soBaiMotTrang && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={trangHienTai}
            total={tongSo}
            pageSize={soBaiMotTrang}
            onChange={(page) => setTrangHienTai(page)}
          />
        </div>
      )}
    </div>
  );
};

export default TrangChu;