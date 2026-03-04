import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  Progress,
} from "antd";
import moment, { Moment } from "moment";

const { Title, Text } = Typography;

type Subject = { id: string; name: string };

type StudySession = {
  id: string;
  subjectId: string;
  startAtISO: string;
  durationMin: number;
  content: string;
  note?: string;
};

type MonthlyGoal = {
  id: string;
  monthKey: string; // YYYY-MM
  subjectId: string; // "TOTAL" hoặc id môn
  targetMin: number;
};

const LS_SUBJECTS = "study_subjects_v1";
const LS_SESSIONS = "study_sessions_v1";
const LS_GOALS = "study_goals_v1";

const TOTAL_ID = "TOTAL";
const MAX_SUBJECT_NAME_LEN = 40;

const DEFAULT_SUBJECTS: Subject[] = [
  { id: "math", name: "Toán" },
  { id: "literature", name: "Văn" },
  { id: "english", name: "Anh" },
  { id: "science", name: "Khoa học" },
  { id: "tech", name: "Công nghệ" },
];

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function monthKeyOf(m: Moment) {
  return m.format("YYYY-MM");
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function clampText(s: string, maxLen: number) {
  const t = (s ?? "").trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen);
}

const QuanLyHocTap = () => {
  const [subjects, setSubjects] = useState<Subject[]>(() => loadJSON(LS_SUBJECTS, DEFAULT_SUBJECTS));
  const [sessions, setSessions] = useState<StudySession[]>(() => loadJSON(LS_SESSIONS, []));
  const [goals, setGoals] = useState<MonthlyGoal[]>(() => loadJSON(LS_GOALS, []));

  const [activeMonth, setActiveMonth] = useState<Moment>(() => moment());

  useEffect(() => saveJSON(LS_SUBJECTS, subjects), [subjects]);
  useEffect(() => saveJSON(LS_SESSIONS, sessions), [sessions]);
  useEffect(() => saveJSON(LS_GOALS, goals), [goals]);

  const monthKey = useMemo(() => monthKeyOf(activeMonth), [activeMonth]);

  const subjectName = (id: string) => {
    if (id === TOTAL_ID) return "Tổng";
    return subjects.find((s) => s.id === id)?.name ?? "(môn đã xóa)";
  };

  // ===== SUBJECT CRUD =====
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm] = Form.useForm<{ name: string }>();

  const openCreateSubject = () => {
    setEditingSubject(null);
    subjectForm.resetFields();
    setSubjectModalOpen(true);
  };

  const openEditSubject = (s: Subject) => {
    setEditingSubject(s);
    subjectForm.setFieldsValue({ name: s.name });
    setSubjectModalOpen(true);
  };

  const submitSubject = async () => {
    const v = await subjectForm.validateFields();
    const name = clampText(v.name, MAX_SUBJECT_NAME_LEN);
    if (!name) return;

    const existed = subjects.some(
      (s) => s.name.toLowerCase() === name.toLowerCase() && s.id !== editingSubject?.id
    );
    if (existed) {
      subjectForm.setFields([{ name: "name", errors: ["Tên môn đã tồn tại"] }]);
      return;
    }

    if (editingSubject) {
      setSubjects((prev) => prev.map((s) => (s.id === editingSubject.id ? { ...s, name } : s)));
    } else {
      setSubjects((prev) => [...prev, { id: uid(), name }]);
    }

    setSubjectModalOpen(false);
    message.success("Đã lưu môn học");
  };

  const deleteSubject = (id: string) => {
    Modal.confirm({
      title: "Xóa môn học?",
      content: "Lịch học và mục tiêu gắn với môn này cũng sẽ bị xóa.",
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: () => {
        setSubjects((prev) => prev.filter((x) => x.id !== id));
        setSessions((prev) => prev.filter((x) => x.subjectId !== id));
        setGoals((prev) => prev.filter((x) => x.subjectId !== id));
        message.success("Đã xóa môn");
      },
    });
  };

  // ===== SESSION CRUD =====
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [sessionForm] = Form.useForm<{
    subjectId: string;
    startAt: Moment;
    durationMin: number;
    content: string;
    note?: string;
  }>();

  const openCreateSession = () => {
    if (subjects.length === 0) {
      message.warning("Bạn cần tạo môn học trước!");
      return;
    }
    setEditingSession(null);
    sessionForm.resetFields();
    sessionForm.setFieldsValue({
      subjectId: subjects[0].id,
      startAt: moment(),
      durationMin: 60,
    });
    setSessionModalOpen(true);
  };

  const openEditSession = (ss: StudySession) => {
    setEditingSession(ss);
    sessionForm.setFieldsValue({
      subjectId: ss.subjectId,
      startAt: moment(ss.startAtISO),
      durationMin: ss.durationMin,
      content: ss.content,
      note: ss.note,
    });
    setSessionModalOpen(true);
  };

  const submitSession = async () => {
    const v = await sessionForm.validateFields();
    const payload: StudySession = {
      id: editingSession?.id ?? uid(),
      subjectId: v.subjectId,
      startAtISO: v.startAt.toISOString(),
      durationMin: Number(v.durationMin),
      content: clampText(v.content, 120),
      note: clampText(v.note ?? "", 200) || undefined,
    };

    if (editingSession) setSessions((prev) => prev.map((x) => (x.id === editingSession.id ? payload : x)));
    else setSessions((prev) => [payload, ...prev]);

    setSessionModalOpen(false);
    message.success("Đã lưu lịch học");
  };

  const deleteSession = (id: string) => {
    Modal.confirm({
      title: "Xóa lịch học?",
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: () => {
        setSessions((prev) => prev.filter((x) => x.id !== id));
        message.success("Đã xóa lịch học");
      },
    });
  };

  // ===== FILTER + STATS =====
  const [filterSubjectId, setFilterSubjectId] = useState<string | "ALL">("ALL");

  const sessionsInMonth = useMemo(() => {
    const base = sessions.filter((s) => moment(s.startAtISO).format("YYYY-MM") === monthKey);
    if (filterSubjectId === "ALL") return base;
    return base.filter((s) => s.subjectId === filterSubjectId);
  }, [sessions, monthKey, filterSubjectId]);

  const minutesBySubject = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sessions.filter((x) => moment(x.startAtISO).format("YYYY-MM") === monthKey)) {
      map.set(s.subjectId, (map.get(s.subjectId) ?? 0) + (s.durationMin || 0));
    }
    return map;
  }, [sessions, monthKey]);

  const totalMinutesThisMonth = useMemo(() => {
    let sum = 0;
    minutesBySubject.forEach((v) => (sum += v));
    return sum;
  }, [minutesBySubject]);

  // ===== GOALS =====
  const goalsInMonth = useMemo(() => goals.filter((g) => g.monthKey === monthKey), [goals, monthKey]);
  const getGoal = (subjectId: string) => goalsInMonth.find((g) => g.subjectId === subjectId)?.targetMin ?? 0;

  const upsertGoal = (subjectId: string, targetMin: number) => {
    setGoals((prev) => {
      const idx = prev.findIndex((g) => g.monthKey === monthKey && g.subjectId === subjectId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], targetMin };
        return next;
      }
      return [...prev, { id: uid(), monthKey, subjectId, targetMin }];
    });
  };

  const totalTarget = getGoal(TOTAL_ID);
  const totalPercent =
    totalTarget > 0 ? Math.min(100, Math.round((totalMinutesThisMonth / totalTarget) * 100)) : 0;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={14}>
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            background: "linear-gradient(135deg, rgba(22,119,255,0.10), rgba(114,46,209,0.06))",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size={6}>
            <Title level={3} style={{ margin: 0 }}>
              📚 Quản lý học tập
            </Title>
            <Text type="secondary">localStorage · Môn học · Lịch học · Mục tiêu tháng</Text>

            <Divider style={{ margin: "12px 0" }} />

            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} md={8}>
                <Space direction="vertical" size={2} style={{ width: "100%" }}>
                  <Text strong>Chọn tháng</Text>
                  <DatePicker
                    picker="month"
                    value={activeMonth}
                    onChange={(v) => v && setActiveMonth(v)}
                    style={{ width: "100%" }}
                  />
                </Space>
              </Col>

              <Col xs={24} md={8}>
                <Space direction="vertical" size={2} style={{ width: "100%" }}>
                  <Text strong>Lọc theo môn</Text>
                  <Select
                    value={filterSubjectId}
                    onChange={(v) => setFilterSubjectId(v)}
                    style={{ width: "100%" }}
                    options={[
                      { value: "ALL", label: "Tất cả môn" },
                      ...subjects.map((s) => ({ value: s.id, label: s.name })),
                    ]}
                  />
                </Space>
              </Col>

              <Col xs={24} md={8}>
                <Card size="small" style={{ borderRadius: 12 }}>
                  <Space direction="vertical" style={{ width: "100%" }} size={4}>
                    <Space style={{ justifyContent: "space-between", width: "100%" }}>
                      <Text strong>⏱ Tổng phút học tháng {monthKey}</Text>
                      <Tag color={totalTarget > 0 && totalMinutesThisMonth >= totalTarget ? "green" : "blue"}>
                        {totalMinutesThisMonth} phút
                      </Tag>
                    </Space>
                    <Progress percent={totalTarget > 0 ? totalPercent : 0} />
                    <Text type="secondary">
                      Mục tiêu tổng: <b>{totalTarget}</b> phút
                    </Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Space>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Card
              title="🗂 Danh mục môn học"
              extra={
                <Button type="primary" onClick={openCreateSubject}>
                  Thêm môn
                </Button>
              }
              style={{ borderRadius: 16 }}
            >
              <Table
                size="small"
                rowKey="id"
                dataSource={subjects}
                pagination={{ pageSize: 6 }}
                columns={[
                  { title: "Tên môn", dataIndex: "name" },
                  {
                    title: "Thao tác",
                    width: 170,
                    render: (_, s: Subject) => (
                      <Space>
                        <Button onClick={() => openEditSubject(s)}>Sửa</Button>
                        <Button danger onClick={() => deleteSubject(s.id)}>
                          Xóa
                        </Button>
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>

            <Card title="🎯 Mục tiêu tháng (Tổng)" style={{ borderRadius: 16, marginTop: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }} size={10}>
                <Text>Đặt mục tiêu tổng thời lượng học trong tháng {monthKey}.</Text>
                <InputNumber
                  min={0}
                  step={30}
                  value={totalTarget}
                  onChange={(v) => upsertGoal(TOTAL_ID, Number(v ?? 0))}
                  style={{ width: "100%" }}
                  addonAfter="phút"
                />
                <Text type="secondary">Nhập 0 nếu không đặt mục tiêu tổng.</Text>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card
              title="🗓 Lịch học"
              extra={
                <Button type="primary" onClick={openCreateSession}>
                  Thêm lịch học
                </Button>
              }
              style={{ borderRadius: 16 }}
            >
              <Table
                rowKey="id"
                dataSource={[...sessionsInMonth].sort((a, b) => (a.startAtISO < b.startAtISO ? 1 : -1))}
                pagination={{ pageSize: 6 }}
                columns={[
                  { title: "Môn", dataIndex: "subjectId", render: (id: string) => subjectName(id), width: 140 },
                  {
                    title: "Ngày giờ",
                    dataIndex: "startAtISO",
                    render: (iso: string) => moment(iso).format("DD/MM/YYYY HH:mm"),
                    width: 160,
                  },
                  { title: "Phút", dataIndex: "durationMin", width: 80 },
                  { title: "Nội dung", dataIndex: "content" },
                  { title: "Ghi chú", dataIndex: "note" },
                  {
                    title: "Thao tác",
                    width: 170,
                    render: (_, ss: StudySession) => (
                      <Space>
                        <Button onClick={() => openEditSession(ss)}>Sửa</Button>
                        <Button danger onClick={() => deleteSession(ss.id)}>
                          Xóa
                        </Button>
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>

            <Card title={`🎯 Mục tiêu theo môn — tháng ${monthKey}`} style={{ borderRadius: 16, marginTop: 16 }}>
              <Row gutter={[12, 12]}>
                {subjects.map((s) => {
                  const learned = minutesBySubject.get(s.id) ?? 0;
                  const target = getGoal(s.id);
                  const pct = target > 0 ? Math.min(100, Math.round((learned / target) * 100)) : 0;
                  const done = target > 0 && learned >= target;

                  return (
                    <Col xs={24} md={12} key={s.id}>
                      <Card size="small" style={{ borderRadius: 14 }}>
                        <Space direction="vertical" style={{ width: "100%" }} size={6}>
                          <Space style={{ width: "100%", justifyContent: "space-between" }}>
                            <Text strong>{s.name}</Text>
                            {target <= 0 ? (
                              <Tag>Chưa đặt</Tag>
                            ) : done ? (
                              <Tag color="green">Đạt</Tag>
                            ) : (
                              <Tag color="gold">Chưa đạt</Tag>
                            )}
                          </Space>

                          <Text>
                            Đã học: <b>{learned}</b> phút · Mục tiêu: <b>{target}</b> phút
                          </Text>

                          <Progress percent={target > 0 ? pct : 0} />

                          <InputNumber
                            min={0}
                            step={30}
                            value={target}
                            onChange={(v) => upsertGoal(s.id, Number(v ?? 0))}
                            style={{ width: "100%" }}
                            addonAfter="phút"
                          />

                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Nhập 0 để bỏ mục tiêu môn này.
                          </Text>
                        </Space>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </Col>
        </Row>
      </Space>

      {/* SUBJECT MODAL */}
      <Modal
        title={editingSubject ? "Sửa môn học" : "Thêm môn học"}
        open={subjectModalOpen}
        onCancel={() => setSubjectModalOpen(false)}
        onOk={submitSubject}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={subjectForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên môn"
            rules={[
              { required: true, message: "Nhập tên môn" },
              { max: MAX_SUBJECT_NAME_LEN, message: `Tối đa ${MAX_SUBJECT_NAME_LEN} ký tự` },
            ]}
          >
            <Input placeholder="VD: Lịch sử, Địa lý..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* SESSION MODAL */}
{/* SUBJECT MODAL */}
<Modal
  title={editingSubject ? "Sửa môn học" : "Thêm môn học"}
  visible={subjectModalOpen}
  onCancel={() => setSubjectModalOpen(false)}
  onOk={submitSubject}
  okText="Lưu"
  cancelText="Hủy"
>
  ...
</Modal>

{/* SESSION MODAL */}
<Modal
  title={editingSession ? "Sửa lịch học" : "Thêm lịch học"}
  visible={sessionModalOpen}
  onCancel={() => setSessionModalOpen(false)}
  onOk={submitSession}
  okText="Lưu"
  cancelText="Hủy"
>
  ...
</Modal>
    </div>
  );
};

export default QuanLyHocTap;