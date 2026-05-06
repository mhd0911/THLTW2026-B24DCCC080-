import React, { useEffect } from 'react';
import { Typography, Tag, Card, Row, Col, Button, Divider } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';

const { Title, Text } = Typography;

var renderMarkdown = function (md: any) {
  var html = md;
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:#f5f5f5;padding:12px;border-radius:6px;overflow-x:auto"><code>$2</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 6px;border-radius:3px">$1</code>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/\n\n/g, '<br/><br/>');
  return html;
};

const ChiTietBaiViet = (props: any) => {
  const { danhSachBaiViet, layTenThe, tangLuotXem } = useModel('useModelBlog' as any);

  var baiViet = null as any;
  for (var i = 0; i < danhSachBaiViet.length; i++) {
    if (danhSachBaiViet[i].id === props.idBaiViet) {
      baiViet = danhSachBaiViet[i];
      break;
    }
  }

  useEffect(() => {
    if (props.idBaiViet) {
      tangLuotXem(props.idBaiViet);
    }
  }, [props.idBaiViet]);

  if (!baiViet) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Text>Không tìm thấy bài viết</Text>
        <br />
        <Button onClick={props.quayLai} style={{ marginTop: 16 }}>Quay lại</Button>
      </div>
    );
  }

  var dsLienQuan = [] as any[];
  for (var i = 0; i < danhSachBaiViet.length; i++) {
    var bv = danhSachBaiViet[i];
    if (bv.id === baiViet.id) continue;
    if (bv.trangThai !== 'daDang') continue;
    var cungTag = false;
    for (var j = 0; j < baiViet.tags.length; j++) {
      if (bv.tags.indexOf(baiViet.tags[j]) >= 0) {
        cungTag = true;
        break;
      }
    }
    if (cungTag) dsLienQuan.push(bv);
  }

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={props.quayLai} style={{ marginBottom: 16 }}>
        Quay lại danh sách
      </Button>

      <Card>
        {baiViet.anhDaiDien && (
          <img
            src={baiViet.anhDaiDien}
            alt={baiViet.tieuDe}
            style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
          />
        )}

        <Title level={2}>{baiViet.tieuDe}</Title>

        <div style={{ marginBottom: 16, color: '#999' }}>
          <UserOutlined /> {baiViet.tacGia}
          <Divider type="vertical" />
          <CalendarOutlined /> {baiViet.ngayTao}
          <Divider type="vertical" />
          <EyeOutlined /> {baiViet.luotXem + 1} lượt xem
        </div>

        <div style={{ marginBottom: 16 }}>
          {baiViet.tags.map((tagId: any) => (
            <Tag key={tagId} color="blue">{layTenThe(tagId)}</Tag>
          ))}
        </div>

        <Divider />

        <div
          style={{ fontSize: 15, lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(baiViet.noiDung) }}
        />
      </Card>

      {dsLienQuan.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Title level={4}>📌 Bài viết liên quan</Title>
          <Row gutter={[16, 16]}>
            {dsLienQuan.slice(0, 3).map((bv: any) => (
              <Col xs={24} sm={12} md={8} key={bv.id}>
                <Card
                  hoverable
                  size="small"
                  onClick={() => props.moChiTiet(bv.id)}
                  cover={
                    <img
                      src={bv.anhDaiDien || 'https://picsum.photos/seed/default/400/200'}
                      alt={bv.tieuDe}
                      style={{ height: 120, objectFit: 'cover' }}
                    />
                  }
                >
                  <Card.Meta title={bv.tieuDe} description={<Text type="secondary" style={{ fontSize: 12 }}>{bv.ngayTao}</Text>} />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default ChiTietBaiViet;