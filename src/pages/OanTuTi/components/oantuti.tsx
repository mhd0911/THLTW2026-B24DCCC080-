import { useMemo, useState } from "react";
import { Button, Card, Col, Row, Space, Typography, Tag, List, Divider, Alert } from "antd";

const { Title, Text } = Typography;

type Choice = "Kéo" | "Búa" | "Bao";

type RoundItem = {
  id: string;
  player: Choice;
  computer: Choice;
  result: "Thắng" | "Thua" | "Hòa";
};

const choices: Choice[] = ["Kéo", "Búa", "Bao"];

function randomChoice(): Choice {
  return choices[Math.floor(Math.random() * choices.length)];
}

function getResult(player: Choice, computer: Choice): "Thắng" | "Thua" | "Hòa" {
  if (player === computer) return "Hòa";

  if (
    (player === "Kéo" && computer === "Bao") ||
    (player === "Búa" && computer === "Kéo") ||
    (player === "Bao" && computer === "Búa")
  ) {
    return "Thắng";
  }

  return "Thua";
}

function getChoiceEmoji(choice: Choice) {
  switch (choice) {
    case "Kéo":
      return "✌️";
    case "Búa":
      return "✊";
    case "Bao":
      return "🖐️";
    default:
      return "";
  }
}

const OanTuTi = () => {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<"Thắng" | "Thua" | "Hòa" | "">("");
  const [history, setHistory] = useState<RoundItem[]>([]);

  const stats = useMemo(() => {
    return history.reduce(
      (acc, item) => {
        if (item.result === "Thắng") acc.win += 1;
        else if (item.result === "Thua") acc.lose += 1;
        else acc.draw += 1;
        return acc;
      },
      { win: 0, lose: 0, draw: 0 }
    );
  }, [history]);

  const handlePlay = (choice: Choice) => {
    const bot = randomChoice();
    const roundResult = getResult(choice, bot);

    setPlayerChoice(choice);
    setComputerChoice(bot);
    setResult(roundResult);

    const newRound: RoundItem = {
      id: `${Date.now()}_${Math.random()}`,
      player: choice,
      computer: bot,
      result: roundResult,
    };

    setHistory((prev) => [newRound, ...prev]);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult("");
    setHistory([]);
  };

  const resultColor =
    result === "Thắng" ? "success" : result === "Thua" ? "error" : result === "Hòa" ? "warning" : "info";

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: 16,
      }}
    >
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            padding: 20,
            background: "linear-gradient(135deg, rgba(22,119,255,0.10), rgba(114,46,209,0.08))",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            ✊✌️🖐️ Trò Chơi Oẳn Tù Tì
          </Title>
          <Text type="secondary">
            Người chơi chọn Kéo, Búa hoặc Bao. Máy sẽ chọn ngẫu nhiên và so kết quả thắng / thua / hòa.
          </Text>
        </div>

        <div style={{ padding: 20 }}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small" style={{ borderRadius: 12, textAlign: "center" }}>
                  <Text type="secondary">Người chơi</Text>
                  <div style={{ fontSize: 42, marginTop: 8 }}>{playerChoice ? getChoiceEmoji(playerChoice) : "❔"}</div>
                  <div style={{ marginTop: 8 }}>
                    <Text strong>{playerChoice || "Chưa chọn"}</Text>
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card size="small" style={{ borderRadius: 12, textAlign: "center" }}>
                  <Text type="secondary">Kết quả</Text>
                  <div style={{ marginTop: 16 }}>
                    {result ? (
                      <Tag color={result === "Thắng" ? "green" : result === "Thua" ? "red" : "gold"} style={{ fontSize: 16, padding: "6px 14px" }}>
                        {result}
                      </Tag>
                    ) : (
                      <Tag style={{ fontSize: 16, padding: "6px 14px" }}>Chưa chơi</Tag>
                    )}
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card size="small" style={{ borderRadius: 12, textAlign: "center" }}>
                  <Text type="secondary">Máy tính</Text>
                  <div style={{ fontSize: 42, marginTop: 8 }}>{computerChoice ? getChoiceEmoji(computerChoice) : "🤖"}</div>
                  <div style={{ marginTop: 8 }}>
                    <Text strong>{computerChoice || "Đang chờ"}</Text>
                  </div>
                </Card>
              </Col>
            </Row>

            {result ? (
              <Alert
                type={resultColor}
                showIcon
                message={
                  result === "Thắng"
                    ? "Chúc mừng! Bạn thắng ván này."
                    : result === "Thua"
                    ? "Bạn đã thua ván này."
                    : "Hai bên hòa."
                }
              />
            ) : (
              <Alert type="info" showIcon message="Hãy chọn Kéo, Búa hoặc Bao để bắt đầu." />
            )}

            <Card size="small" title="Chọn lượt chơi" style={{ borderRadius: 12 }}>
              <Space wrap>
                <Button type="primary" size="large" onClick={() => handlePlay("Kéo")}>
                  ✌️ Kéo
                </Button>
                <Button type="primary" size="large" onClick={() => handlePlay("Búa")}>
                  ✊ Búa
                </Button>
                <Button type="primary" size="large" onClick={() => handlePlay("Bao")}>
                  🖐️ Bao
                </Button>
                <Button size="large" onClick={resetGame}>
                  Chơi lại
                </Button>
              </Space>
            </Card>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small" style={{ borderRadius: 12, textAlign: "center" }}>
                  <Text type="secondary">Thắng</Text>
                  <Title level={3} style={{ margin: "8px 0 0", color: "#389e0d" }}>
                    {stats.win}
                  </Title>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card size="small" style={{ borderRadius: 12, textAlign: "center" }}>
                  <Text type="secondary">Thua</Text>
                  <Title level={3} style={{ margin: "8px 0 0", color: "#cf1322" }}>
                    {stats.lose}
                  </Title>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card size="small" style={{ borderRadius: 12, textAlign: "center" }}>
                  <Text type="secondary">Hòa</Text>
                  <Title level={3} style={{ margin: "8px 0 0", color: "#d48806" }}>
                    {stats.draw}
                  </Title>
                </Card>
              </Col>
            </Row>

            <Divider style={{ margin: 0 }} />

            <Card size="small" title="Lịch sử kết quả" style={{ borderRadius: 12 }}>
              <List
                dataSource={history}
                locale={{ emptyText: "Chưa có ván đấu nào." }}
                renderItem={(item, index) => (
                  <List.Item>
                    <Row style={{ width: "100%" }} gutter={[8, 8]} align="middle">
                      <Col xs={24} md={4}>
                        <Text strong>Ván #{history.length - index}</Text>
                      </Col>

                      <Col xs={24} md={7}>
                        <Text>
                          Bạn: {getChoiceEmoji(item.player)} <b>{item.player}</b>
                        </Text>
                      </Col>

                      <Col xs={24} md={7}>
                        <Text>
                          Máy: {getChoiceEmoji(item.computer)} <b>{item.computer}</b>
                        </Text>
                      </Col>

                      <Col xs={24} md={6}>
                        <Tag color={item.result === "Thắng" ? "green" : item.result === "Thua" ? "red" : "gold"}>
                          {item.result}
                        </Tag>
                      </Col>
                    </Row>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default OanTuTi;