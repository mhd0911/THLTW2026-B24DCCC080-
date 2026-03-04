import { useMemo, useState } from "react";
import { Card, InputNumber, Button, Typography, Space, message, Alert, Progress, Tag, Divider } from "antd";

const { Title, Text } = Typography;

type Status = "idle" | "low" | "high" | "won" | "lost";

const MAX_ATTEMPTS = 10;

const GuessNumber = () => {
  const [randomNumber, setRandomNumber] = useState<number>(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number>(MAX_ATTEMPTS);
  const [result, setResult] = useState<string>("");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [status, setStatus] = useState<Status>("idle");

  const usedAttempts = useMemo(() => MAX_ATTEMPTS - attempts, [attempts]);
  const percent = useMemo(() => Math.round((usedAttempts / MAX_ATTEMPTS) * 100), [usedAttempts]);

  const resetGame = () => {
    setRandomNumber(Math.floor(Math.random() * 100) + 1);
    setGuess(null);
    setAttempts(MAX_ATTEMPTS);
    setResult("");
    setGameOver(false);
    setStatus("idle");
  };

  const handleGuess = () => {
    if (gameOver) return;

    if (guess === null) {
      message.warning("Vui lòng nhập số!");
      return;
    }

    const nextAttempts = attempts - 1;

    if (guess === randomNumber) {
      setResult("🎉 Chúc mừng! Bạn đã đoán đúng!");
      setStatus("won");
      setGameOver(true);
      return;
    }

    if (nextAttempts <= 0) {
      setResult(`❌ Bạn đã hết lượt! Số đúng là ${randomNumber}`);
      setStatus("lost");
      setGameOver(true);
      setAttempts(0);
      return;
    }

    if (guess < randomNumber) {
      setResult("📉 Bạn đoán quá thấp!");
      setStatus("low");
    } else {
      setResult("📈 Bạn đoán quá cao!");
      setStatus("high");
    }

    setAttempts(nextAttempts);
  };

  const alertProps = useMemo(() => {
    if (!result) return null;

    switch (status) {
      case "won":
        return { type: "success" as const, showIcon: true };
      case "lost":
        return { type: "error" as const, showIcon: true };
      case "low":
      case "high":
        return { type: "warning" as const, showIcon: true };
      default:
        return { type: "info" as const, showIcon: true };
    }
  }, [result, status]);

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter") handleGuess();
  };

  return (
    <div
      onKeyDown={onKeyDown}
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <Card
        bordered={false}
        style={{
          width: 520,
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px",
            background: "linear-gradient(135deg, rgba(22,119,255,0.16), rgba(114,46,209,0.10))",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Space direction="vertical" size={2} style={{ width: "100%" }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }} align="start">
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  🎯 Trò Chơi Đoán Số
                </Title>
                <Text type="secondary">Đoán một số từ 1 đến 100</Text>
              </div>

              <Tag
                style={{
                  marginTop: 4,
                  borderRadius: 999,
                  padding: "4px 10px",
                  fontWeight: 600,
                }}
                color={gameOver ? (status === "won" ? "green" : "red") : "blue"}
              >
                {gameOver ? (status === "won" ? "THẮNG" : "THUA") : "ĐANG CHƠI"}
              </Tag>
            </Space>

            <div style={{ marginTop: 10 }}>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Text strong>⏳ Lượt còn lại: {attempts}/{MAX_ATTEMPTS}</Text>
                <Text type="secondary">Nhấn Enter để đoán</Text>
              </Space>
              <Progress percent={percent} />
            </div>
          </Space>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          <Space direction="vertical" size={14} style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <InputNumber
                min={1}
                max={100}
                value={guess}
                onChange={(value) => setGuess(value)}
                disabled={gameOver}
                placeholder="Nhập số..."
                style={{
                  width: 220,
                  borderRadius: 10,
                }}
                size="large"
              />

              <Button
                type="primary"
                onClick={handleGuess}
                disabled={gameOver}
                size="large"
                style={{ borderRadius: 10, minWidth: 120 }}
              >
                Đoán
              </Button>

              <Button
                onClick={resetGame}
                size="large"
                style={{ borderRadius: 10 }}
              >
                Chơi lại
              </Button>
            </div>

            {alertProps ? (
              <Alert {...alertProps} message={result} />
            ) : (
              <Alert type="info" showIcon message="Hãy nhập số và bấm “Đoán” để bắt đầu!" />
            )}

            <Divider style={{ margin: "6px 0" }} />

            <div
              style={{
                padding: 12,
                borderRadius: 12,
                background: "rgba(0,0,0,0.03)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <Text type="secondary">💡 Gợi ý: Số nằm trong khoảng 1–100</Text>
              <Text type="secondary">🎮 Mục tiêu: đoán đúng trong 10 lượt</Text>
            </div>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default GuessNumber;