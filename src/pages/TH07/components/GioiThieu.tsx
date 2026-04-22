import React from 'react';
import { Card, Avatar, Typography, Tag, Divider, Row, Col } from 'antd';
import { GithubOutlined, MailOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const GioiThieu = () => {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar size={120} src="https://picsum.photos/seed/avatar/200/200" />
          <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>Nguyễn Đức Minh</Title>
          <Text type="secondary">Web Developer | Sinh viên CNTT</Text>
        </div>

        <Divider />

        <Title level={5}>📖 Giới thiệu</Title>
        <Paragraph>
          Xin chào! Mình là Minh, một sinh viên công nghệ thông tin đam mê lập trình web.
          Blog này là nơi mình chia sẻ kiến thức, kinh nghiệm học tập và các dự án cá nhân.
          Mình luôn tìm tòi những công nghệ mới và hy vọng có thể giúp ích cho cộng đồng.
        </Paragraph>

        <Divider />

        <Title level={5}>🛠 Kỹ năng</Title>
        <div style={{ marginBottom: 16 }}>
          <Tag color="blue">React</Tag>
          <Tag color="green">Node.js</Tag>
          <Tag color="orange">TypeScript</Tag>
          <Tag color="purple">Python</Tag>
          <Tag color="cyan">CSS/LESS</Tag>
          <Tag color="red">Git</Tag>
          <Tag color="magenta">SQL</Tag>
          <Tag color="volcano">Docker</Tag>
        </div>

        <Divider />

        <Title level={5}>🔗 Liên kết</Title>
        <Row gutter={[16, 12]}>
          <Col span={24}>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <GithubOutlined style={{ marginRight: 8 }} /> github.com/nguyenducminh
            </a>
          </Col>
          <Col span={24}>
            <a href="mailto:minh@example.com">
              <MailOutlined style={{ marginRight: 8 }} /> minh@example.com
            </a>
          </Col>
          <Col span={24}>
            <a href="https://example.com" target="_blank" rel="noreferrer">
              <GlobalOutlined style={{ marginRight: 8 }} /> portfolio.example.com
            </a>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default GioiThieu;