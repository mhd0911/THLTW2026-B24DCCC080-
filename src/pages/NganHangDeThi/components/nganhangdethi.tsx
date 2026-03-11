import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";

const { Title, Text } = Typography;
const { TextArea } = Input;

type Difficulty = "Dễ" | "Trung bình" | "Khó" | "Rất khó";

type KnowledgeBlock = {
  id: string;
  name: string;
};

type Subject = {
  id: string;
  code: string;
  name: string;
  credits: number;
};

type Question = {
  id: string;
  code: string;
  subjectId: string;
  content: string;
  difficulty: Difficulty;
  blockId: string;
};

type ExamStructureItem = {
  id: string;
  blockId: string;
  difficulty: Difficulty;
  quantity: number;
};

type ExamTemplate = {
  id: string;
  name: string;
  subjectId: string;
  items: ExamStructureItem[];
};

type GeneratedExam = {
  id: string;
  name: string;
  subjectId: string;
  templateId?: string;
  createdAt: string;
  items: Question[];
};

const DIFFICULTIES: Difficulty[] = ["Dễ", "Trung bình", "Khó", "Rất khó"];

const LS_BLOCKS = "essay_exam_blocks_v1";
const LS_SUBJECTS = "essay_exam_subjects_v1";
const LS_QUESTIONS = "essay_exam_questions_v1";
const LS_TEMPLATES = "essay_exam_templates_v1";
const LS_EXAMS = "essay_exam_generated_v1";

const DEFAULT_BLOCKS: KnowledgeBlock[] = [
  { id: "b1", name: "Tổng quan" },
  { id: "b2", name: "Chuyên sâu" },
];

const DEFAULT_SUBJECTS: Subject[] = [
  { id: "s1", code: "INT101", name: "Nhập môn Công nghệ thông tin", credits: 3 },
  { id: "s2", code: "PRJ201", name: "Lập trình Web", credits: 3 },
];

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
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

function randomPick<T>(arr: T[], quantity: number): T[] {
  const cloned = [...arr];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned.slice(0, quantity);
}

function difficultyColor(level: Difficulty) {
  switch (level) {
    case "Dễ":
      return "green";
    case "Trung bình":
      return "blue";
    case "Khó":
      return "orange";
    case "Rất khó":
      return "red";
    default:
      return "default";
  }
}

const NganHangDeThi = () => {
  const [blocks, setBlocks] = useState<KnowledgeBlock[]>(() => loadJSON(LS_BLOCKS, DEFAULT_BLOCKS));
  const [subjects, setSubjects] = useState<Subject[]>(() => loadJSON(LS_SUBJECTS, DEFAULT_SUBJECTS));
  const [questions, setQuestions] = useState<Question[]>(() => loadJSON(LS_QUESTIONS, []));
  const [templates, setTemplates] = useState<ExamTemplate[]>(() => loadJSON(LS_TEMPLATES, []));
  const [generatedExams, setGeneratedExams] = useState<GeneratedExam[]>(() => loadJSON(LS_EXAMS, []));

  useEffect(() => saveJSON(LS_BLOCKS, blocks), [blocks]);
  useEffect(() => saveJSON(LS_SUBJECTS, subjects), [subjects]);
  useEffect(() => saveJSON(LS_QUESTIONS, questions), [questions]);
  useEffect(() => saveJSON(LS_TEMPLATES, templates), [templates]);
  useEffect(() => saveJSON(LS_EXAMS, generatedExams), [generatedExams]);

  const getBlockName = (id: string) => blocks.find((x) => x.id === id)?.name || "(khối đã xóa)";
  const getSubjectName = (id: string) => subjects.find((x) => x.id === id)?.name || "(môn đã xóa)";
  const getSubjectCode = (id: string) => subjects.find((x) => x.id === id)?.code || "---";

  // ===== BLOCK CRUD =====
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState<KnowledgeBlock | null>(null);
  const [blockForm] = Form.useForm<{ name: string }>();

  const openCreateBlock = () => {
    setEditingBlock(null);
    blockForm.resetFields();
    setBlockModalVisible(true);
  };

  const openEditBlock = (item: KnowledgeBlock) => {
    setEditingBlock(item);
    blockForm.setFieldsValue({ name: item.name });
    setBlockModalVisible(true);
  };

  const submitBlock = async () => {
    const values = await blockForm.validateFields();
    const name = values.name.trim();

    const duplicated = blocks.some(
      (x) => x.name.toLowerCase() === name.toLowerCase() && x.id !== editingBlock?.id
    );
    if (duplicated) {
      message.error("Tên khối kiến thức đã tồn tại");
      return;
    }

    if (editingBlock) {
      setBlocks((prev) => prev.map((x) => (x.id === editingBlock.id ? { ...x, name } : x)));
      message.success("Đã cập nhật khối kiến thức");
    } else {
      setBlocks((prev) => [...prev, { id: uid(), name }]);
      message.success("Đã thêm khối kiến thức");
    }

    setBlockModalVisible(false);
  };

  const deleteBlock = (id: string) => {
    const usedByQuestions = questions.some((x) => x.blockId === id);
    const usedByTemplates = templates.some((t) => t.items.some((x) => x.blockId === id));

    if (usedByQuestions || usedByTemplates) {
      message.error("Không thể xóa vì khối kiến thức đang được sử dụng");
      return;
    }

    setBlocks((prev) => prev.filter((x) => x.id !== id));
    message.success("Đã xóa khối kiến thức");
  };

  // ===== SUBJECT CRUD =====
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm] = Form.useForm<{ code: string; name: string; credits: number }>();

  const openCreateSubject = () => {
    setEditingSubject(null);
    subjectForm.resetFields();
    setSubjectModalVisible(true);
  };

  const openEditSubject = (item: Subject) => {
    setEditingSubject(item);
    subjectForm.setFieldsValue({
      code: item.code,
      name: item.name,
      credits: item.credits,
    });
    setSubjectModalVisible(true);
  };

  const submitSubject = async () => {
    const values = await subjectForm.validateFields();
    const code = values.code.trim().toUpperCase();
    const name = values.name.trim();

    const duplicatedCode = subjects.some(
      (x) => x.code.toLowerCase() === code.toLowerCase() && x.id !== editingSubject?.id
    );
    if (duplicatedCode) {
      message.error("Mã môn đã tồn tại");
      return;
    }

    if (editingSubject) {
      setSubjects((prev) =>
        prev.map((x) =>
          x.id === editingSubject.id ? { ...x, code, name, credits: Number(values.credits) } : x
        )
      );
      message.success("Đã cập nhật môn học");
    } else {
      setSubjects((prev) => [...prev, { id: uid(), code, name, credits: Number(values.credits) }]);
      message.success("Đã thêm môn học");
    }

    setSubjectModalVisible(false);
  };

  const deleteSubject = (id: string) => {
    const usedByQuestions = questions.some((x) => x.subjectId === id);
    const usedByTemplates = templates.some((x) => x.subjectId === id);
    const usedByExams = generatedExams.some((x) => x.subjectId === id);

    if (usedByQuestions || usedByTemplates || usedByExams) {
      message.error("Không thể xóa vì môn học đang được sử dụng");
      return;
    }

    setSubjects((prev) => prev.filter((x) => x.id !== id));
    message.success("Đã xóa môn học");
  };

  // ===== QUESTION CRUD =====
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm] = Form.useForm<{
    code: string;
    subjectId: string;
    content: string;
    difficulty: Difficulty;
    blockId: string;
  }>();

  const [questionFilterSubject, setQuestionFilterSubject] = useState<string | undefined>();
  const [questionFilterDifficulty, setQuestionFilterDifficulty] = useState<Difficulty | undefined>();
  const [questionFilterBlock, setQuestionFilterBlock] = useState<string | undefined>();

  const openCreateQuestion = () => {
    if (subjects.length === 0 || blocks.length === 0) {
      message.warning("Bạn cần tạo môn học và khối kiến thức trước");
      return;
    }
    setEditingQuestion(null);
    questionForm.resetFields();
    questionForm.setFieldsValue({
      subjectId: subjects[0].id,
      blockId: blocks[0].id,
      difficulty: "Dễ",
    });
    setQuestionModalVisible(true);
  };

  const openEditQuestion = (item: Question) => {
    setEditingQuestion(item);
    questionForm.setFieldsValue({
      code: item.code,
      subjectId: item.subjectId,
      content: item.content,
      difficulty: item.difficulty,
      blockId: item.blockId,
    });
    setQuestionModalVisible(true);
  };

  const submitQuestion = async () => {
    const values = await questionForm.validateFields();
    const code = values.code.trim().toUpperCase();
    const content = values.content.trim();

    const duplicatedCode = questions.some(
      (x) => x.code.toLowerCase() === code.toLowerCase() && x.id !== editingQuestion?.id
    );
    if (duplicatedCode) {
      message.error("Mã câu hỏi đã tồn tại");
      return;
    }

    const payload: Question = {
      id: editingQuestion?.id || uid(),
      code,
      subjectId: values.subjectId,
      content,
      difficulty: values.difficulty,
      blockId: values.blockId,
    };

    if (editingQuestion) {
      setQuestions((prev) => prev.map((x) => (x.id === editingQuestion.id ? payload : x)));
      message.success("Đã cập nhật câu hỏi");
    } else {
      setQuestions((prev) => [payload, ...prev]);
      message.success("Đã thêm câu hỏi");
    }

    setQuestionModalVisible(false);
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((x) => x.id !== id));
    message.success("Đã xóa câu hỏi");
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((x) => {
      if (questionFilterSubject && x.subjectId !== questionFilterSubject) return false;
      if (questionFilterDifficulty && x.difficulty !== questionFilterDifficulty) return false;
      if (questionFilterBlock && x.blockId !== questionFilterBlock) return false;
      return true;
    });
  }, [questions, questionFilterSubject, questionFilterDifficulty, questionFilterBlock]);

  // ===== TEMPLATE CRUD =====
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExamTemplate | null>(null);
  const [templateForm] = Form.useForm<{ name: string; subjectId: string }>();

  const [templateItemsDraft, setTemplateItemsDraft] = useState<ExamStructureItem[]>([]);
  const [ruleBlockId, setRuleBlockId] = useState<string>("");
  const [ruleDifficulty, setRuleDifficulty] = useState<Difficulty>("Dễ");
  const [ruleQuantity, setRuleQuantity] = useState<number>(1);

  const openCreateTemplate = () => {
    if (subjects.length === 0 || blocks.length === 0) {
      message.warning("Bạn cần có môn học và khối kiến thức trước");
      return;
    }
    setEditingTemplate(null);
    templateForm.resetFields();
    templateForm.setFieldsValue({ subjectId: subjects[0].id });
    setTemplateItemsDraft([]);
    setRuleBlockId(blocks[0]?.id || "");
    setRuleDifficulty("Dễ");
    setRuleQuantity(1);
    setTemplateModalVisible(true);
  };

  const openEditTemplate = (item: ExamTemplate) => {
    setEditingTemplate(item);
    templateForm.setFieldsValue({
      name: item.name,
      subjectId: item.subjectId,
    });
    setTemplateItemsDraft(item.items);
    setRuleBlockId(blocks[0]?.id || "");
    setRuleDifficulty("Dễ");
    setRuleQuantity(1);
    setTemplateModalVisible(true);
  };

  const addRuleToTemplateDraft = () => {
    if (!ruleBlockId) {
      message.warning("Chọn khối kiến thức");
      return;
    }
    if (!ruleQuantity || ruleQuantity <= 0) {
      message.warning("Số lượng phải lớn hơn 0");
      return;
    }

    setTemplateItemsDraft((prev) => [
      ...prev,
      {
        id: uid(),
        blockId: ruleBlockId,
        difficulty: ruleDifficulty,
        quantity: Number(ruleQuantity),
      },
    ]);
  };

  const removeTemplateRule = (id: string) => {
    setTemplateItemsDraft((prev) => prev.filter((x) => x.id !== id));
  };

  const submitTemplate = async () => {
    const values = await templateForm.validateFields();

    if (templateItemsDraft.length === 0) {
      message.error("Cấu trúc đề phải có ít nhất 1 dòng");
      return;
    }

    const payload: ExamTemplate = {
      id: editingTemplate?.id || uid(),
      name: values.name.trim(),
      subjectId: values.subjectId,
      items: templateItemsDraft,
    };

    if (editingTemplate) {
      setTemplates((prev) => prev.map((x) => (x.id === editingTemplate.id ? payload : x)));
      message.success("Đã cập nhật cấu trúc đề");
    } else {
      setTemplates((prev) => [payload, ...prev]);
      message.success("Đã lưu cấu trúc đề");
    }

    setTemplateModalVisible(false);
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((x) => x.id !== id));
    message.success("Đã xóa cấu trúc đề");
  };

  // ===== GENERATE EXAM =====
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [examName, setExamName] = useState<string>("");

  const selectedTemplate = useMemo(
    () => templates.find((x) => x.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  const openGenerateExam = () => {
    if (templates.length === 0) {
      message.warning("Bạn cần tạo cấu trúc đề trước");
      return;
    }
    setSelectedTemplateId(templates[0].id);
    setExamName(`Đề thi ${new Date().toLocaleString()}`);
    setExamModalVisible(true);
  };

  const handleGenerateExam = () => {
    if (!selectedTemplate) {
      message.error("Chưa chọn cấu trúc đề");
      return;
    }

    const selectedQuestions: Question[] = [];

    for (const rule of selectedTemplate.items) {
      const available = questions.filter(
        (q) =>
          q.subjectId === selectedTemplate.subjectId &&
          q.blockId === rule.blockId &&
          q.difficulty === rule.difficulty &&
          !selectedQuestions.some((picked) => picked.id === q.id)
      );

      if (available.length < rule.quantity) {
        message.error(
          `Không đủ câu hỏi cho khối "${getBlockName(rule.blockId)}" - mức "${rule.difficulty}". Cần ${rule.quantity}, hiện có ${available.length}.`
        );
        return;
      }

      const picked = randomPick(available, rule.quantity);
      selectedQuestions.push(...picked);
    }

    const payload: GeneratedExam = {
      id: uid(),
      name: examName.trim() || `Đề thi ${new Date().toLocaleString()}`,
      subjectId: selectedTemplate.subjectId,
      templateId: selectedTemplate.id,
      createdAt: new Date().toISOString(),
      items: selectedQuestions,
    };

    setGeneratedExams((prev) => [payload, ...prev]);
    setExamModalVisible(false);
    message.success("Tạo đề thi thành công");
  };

  const deleteExam = (id: string) => {
    setGeneratedExams((prev) => prev.filter((x) => x.id !== id));
    message.success("Đã xóa đề thi");
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 16 }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            background: "linear-gradient(135deg, rgba(22,119,255,0.10), rgba(114,46,209,0.06))",
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            📝 Hệ thống quản lý ngân hàng câu hỏi tự luận
          </Title>
          <Text type="secondary">
            Quản lý khối kiến thức · môn học · câu hỏi · cấu trúc đề · tạo đề thi tự động
          </Text>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={8}>
            <Card
              title="1. Danh mục khối kiến thức"
              extra={
                <Button type="primary" onClick={openCreateBlock}>
                  Thêm khối
                </Button>
              }
              style={{ borderRadius: 16 }}
            >
              <Table
                rowKey="id"
                size="small"
                pagination={{ pageSize: 5 }}
                dataSource={blocks}
                columns={[
                  { title: "Tên khối", dataIndex: "name" },
                  {
                    title: "Thao tác",
                    width: 170,
                    render: (_, item: KnowledgeBlock) => (
                      <Space>
                        <Button size="small" onClick={() => openEditBlock(item)}>
                          Sửa
                        </Button>
                        <Button size="small" danger onClick={() => deleteBlock(item.id)}>
                          Xóa
                        </Button>
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>

          <Col xs={24} xl={16}>
            <Card
              title="2. Danh mục môn học"
              extra={
                <Button type="primary" onClick={openCreateSubject}>
                  Thêm môn
                </Button>
              }
              style={{ borderRadius: 16 }}
            >
              <Table
                rowKey="id"
                size="small"
                pagination={{ pageSize: 5 }}
                dataSource={subjects}
                columns={[
                  { title: "Mã môn", dataIndex: "code", width: 120 },
                  { title: "Tên môn", dataIndex: "name" },
                  { title: "Số tín chỉ", dataIndex: "credits", width: 100 },
                  {
                    title: "Thao tác",
                    width: 170,
                    render: (_, item: Subject) => (
                      <Space>
                        <Button size="small" onClick={() => openEditSubject(item)}>
                          Sửa
                        </Button>
                        <Button size="small" danger onClick={() => deleteSubject(item.id)}>
                          Xóa
                        </Button>
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title="3. Quản lý câu hỏi"
          extra={
            <Button type="primary" onClick={openCreateQuestion}>
              Thêm câu hỏi
            </Button>
          }
          style={{ borderRadius: 16 }}
        >
          <Space wrap style={{ marginBottom: 16 }}>
            <Select
              allowClear
              placeholder="Lọc theo môn học"
              style={{ width: 220 }}
              value={questionFilterSubject}
              onChange={(v) => setQuestionFilterSubject(v)}
              options={subjects.map((x) => ({ value: x.id, label: `${x.code} - ${x.name}` }))}
            />
            <Select
              allowClear
              placeholder="Lọc theo mức độ"
              style={{ width: 180 }}
              value={questionFilterDifficulty}
              onChange={(v) => setQuestionFilterDifficulty(v)}
              options={DIFFICULTIES.map((x) => ({ value: x, label: x }))}
            />
            <Select
              allowClear
              placeholder="Lọc theo khối kiến thức"
              style={{ width: 220 }}
              value={questionFilterBlock}
              onChange={(v) => setQuestionFilterBlock(v)}
              options={blocks.map((x) => ({ value: x.id, label: x.name }))}
            />
            <Button
              onClick={() => {
                setQuestionFilterSubject(undefined);
                setQuestionFilterDifficulty(undefined);
                setQuestionFilterBlock(undefined);
              }}
            >
              Xóa lọc
            </Button>
          </Space>

          <Table
            rowKey="id"
            size="small"
            pagination={{ pageSize: 6 }}
            dataSource={filteredQuestions}
            columns={[
              { title: "Mã câu hỏi", dataIndex: "code", width: 130 },
              {
                title: "Môn học",
                dataIndex: "subjectId",
                width: 220,
                render: (id: string) => `${getSubjectCode(id)} - ${getSubjectName(id)}`,
              },
              {
                title: "Khối kiến thức",
                dataIndex: "blockId",
                width: 160,
                render: (id: string) => getBlockName(id),
              },
              {
                title: "Mức độ",
                dataIndex: "difficulty",
                width: 120,
                render: (value: Difficulty) => <Tag color={difficultyColor(value)}>{value}</Tag>,
              },
              { title: "Nội dung", dataIndex: "content" },
              {
                title: "Thao tác",
                width: 170,
                render: (_, item: Question) => (
                  <Space>
                    <Button size="small" onClick={() => openEditQuestion(item)}>
                      Sửa
                    </Button>
                    <Button size="small" danger onClick={() => deleteQuestion(item.id)}>
                      Xóa
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <Card
              title="4.1 Cấu trúc đề thi"
              extra={
                <Button type="primary" onClick={openCreateTemplate}>
                  Tạo cấu trúc đề
                </Button>
              }
              style={{ borderRadius: 16 }}
            >
              <Table
                rowKey="id"
                size="small"
                pagination={{ pageSize: 5 }}
                dataSource={templates}
                columns={[
                  { title: "Tên cấu trúc", dataIndex: "name" },
                  {
                    title: "Môn học",
                    dataIndex: "subjectId",
                    render: (id: string) => `${getSubjectCode(id)} - ${getSubjectName(id)}`,
                  },
                  {
                    title: "Số dòng",
                    render: (_, item: ExamTemplate) => item.items.length,
                    width: 100,
                  },
                  {
                    title: "Thao tác",
                    width: 180,
                    render: (_, item: ExamTemplate) => (
                      <Space>
                        <Button size="small" onClick={() => openEditTemplate(item)}>
                          Sửa
                        </Button>
                        <Button size="small" danger onClick={() => deleteTemplate(item.id)}>
                          Xóa
                        </Button>
                      </Space>
                    ),
                  },
                ]}
                expandable={{
                  expandedRowRender: (record: ExamTemplate) => (
                    <Table
                      rowKey="id"
                      size="small"
                      pagination={false}
                      dataSource={record.items}
                      columns={[
                        {
                          title: "Khối kiến thức",
                          dataIndex: "blockId",
                          render: (id: string) => getBlockName(id),
                        },
                        { title: "Mức độ", dataIndex: "difficulty" },
                        { title: "Số lượng", dataIndex: "quantity" },
                      ]}
                    />
                  ),
                }}
              />
            </Card>
          </Col>

          <Col xs={24} xl={12}>
            <Card
              title="4.2 Đề thi đã tạo"
              extra={
                <Button type="primary" onClick={openGenerateExam}>
                  Tạo đề thi tự động
                </Button>
              }
              style={{ borderRadius: 16 }}
            >
              <Table
                rowKey="id"
                size="small"
                pagination={{ pageSize: 5 }}
                dataSource={generatedExams}
                columns={[
                  { title: "Tên đề thi", dataIndex: "name" },
                  {
                    title: "Môn học",
                    dataIndex: "subjectId",
                    render: (id: string) => `${getSubjectCode(id)} - ${getSubjectName(id)}`,
                  },
                  {
                    title: "Số câu",
                    render: (_, item: GeneratedExam) => item.items.length,
                    width: 80,
                  },
                  {
                    title: "Ngày tạo",
                    dataIndex: "createdAt",
                    width: 180,
                    render: (value: string) => new Date(value).toLocaleString(),
                  },
                  {
                    title: "Thao tác",
                    width: 110,
                    render: (_, item: GeneratedExam) => (
                      <Button size="small" danger onClick={() => deleteExam(item.id)}>
                        Xóa
                      </Button>
                    ),
                  },
                ]}
                expandable={{
                  expandedRowRender: (record: GeneratedExam) => (
                    <Table
                      rowKey="id"
                      size="small"
                      pagination={false}
                      dataSource={record.items}
                      columns={[
                        { title: "Mã câu hỏi", dataIndex: "code", width: 120 },
                        {
                          title: "Khối kiến thức",
                          dataIndex: "blockId",
                          width: 150,
                          render: (id: string) => getBlockName(id),
                        },
                        {
                          title: "Mức độ",
                          dataIndex: "difficulty",
                          width: 120,
                          render: (value: Difficulty) => <Tag color={difficultyColor(value)}>{value}</Tag>,
                        },
                        { title: "Nội dung", dataIndex: "content" },
                      ]}
                    />
                  ),
                }}
              />
            </Card>
          </Col>
        </Row>

        <Alert
          type="info"
          showIcon
          message="Khi tạo đề thi, hệ thống sẽ lấy ngẫu nhiên câu hỏi theo đúng môn học, khối kiến thức và mức độ khó trong cấu trúc đề. Nếu không đủ câu hỏi phù hợp, hệ thống sẽ báo lỗi."
        />
      </Space>

      {/* BLOCK MODAL */}
      <Modal
        visible={blockModalVisible}
        title={editingBlock ? "Sửa khối kiến thức" : "Thêm khối kiến thức"}
        onCancel={() => setBlockModalVisible(false)}
        onOk={submitBlock}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={blockForm} layout="vertical">
          <Form.Item
            label="Tên khối kiến thức"
            name="name"
            rules={[{ required: true, message: "Nhập tên khối kiến thức" }]}
          >
            <Input placeholder="VD: Tổng quan, Chuyên sâu..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* SUBJECT MODAL */}
      <Modal
        visible={subjectModalVisible}
        title={editingSubject ? "Sửa môn học" : "Thêm môn học"}
        onCancel={() => setSubjectModalVisible(false)}
        onOk={submitSubject}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={subjectForm} layout="vertical">
          <Form.Item label="Mã môn" name="code" rules={[{ required: true, message: "Nhập mã môn" }]}>
            <Input placeholder="VD: INT101" />
          </Form.Item>
          <Form.Item label="Tên môn" name="name" rules={[{ required: true, message: "Nhập tên môn" }]}>
            <Input placeholder="VD: Nhập môn CNTT" />
          </Form.Item>
          <Form.Item
            label="Số tín chỉ"
            name="credits"
            rules={[{ required: true, message: "Nhập số tín chỉ" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* QUESTION MODAL */}
      <Modal
        visible={questionModalVisible}
        title={editingQuestion ? "Sửa câu hỏi" : "Thêm câu hỏi"}
        onCancel={() => setQuestionModalVisible(false)}
        onOk={submitQuestion}
        okText="Lưu"
        cancelText="Hủy"
        width={800}
      >
        <Form form={questionForm} layout="vertical">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Mã câu hỏi" name="code" rules={[{ required: true, message: "Nhập mã câu hỏi" }]}>
                <Input placeholder="VD: Q001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Môn học" name="subjectId" rules={[{ required: true, message: "Chọn môn học" }]}>
                <Select options={subjects.map((x) => ({ value: x.id, label: `${x.code} - ${x.name}` }))} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Mức độ khó"
                name="difficulty"
                rules={[{ required: true, message: "Chọn mức độ khó" }]}
              >
                <Select options={DIFFICULTIES.map((x) => ({ value: x, label: x }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Khối kiến thức"
                name="blockId"
                rules={[{ required: true, message: "Chọn khối kiến thức" }]}
              >
                <Select options={blocks.map((x) => ({ value: x.id, label: x.name }))} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Nội dung câu hỏi" name="content" rules={[{ required: true, message: "Nhập nội dung câu hỏi" }]}>
            <TextArea rows={6} placeholder="Nhập nội dung câu hỏi tự luận..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* TEMPLATE MODAL */}
      <Modal
        visible={templateModalVisible}
        title={editingTemplate ? "Sửa cấu trúc đề" : "Tạo cấu trúc đề"}
        onCancel={() => setTemplateModalVisible(false)}
        onOk={submitTemplate}
        okText="Lưu"
        cancelText="Hủy"
        width={900}
      >
        <Form form={templateForm} layout="vertical">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Tên cấu trúc đề"
                name="name"
                rules={[{ required: true, message: "Nhập tên cấu trúc đề" }]}
              >
                <Input placeholder="VD: Đề giữa kỳ 1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Môn học" name="subjectId" rules={[{ required: true, message: "Chọn môn học" }]}>
                <Select options={subjects.map((x) => ({ value: x.id, label: `${x.code} - ${x.name}` }))} />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Divider />

        <Text strong>Thêm dòng cấu trúc đề</Text>
        <Row gutter={12} style={{ marginTop: 12 }}>
          <Col span={8}>
            <Select
              style={{ width: "100%" }}
              placeholder="Khối kiến thức"
              value={ruleBlockId}
              onChange={(v) => setRuleBlockId(v)}
              options={blocks.map((x) => ({ value: x.id, label: x.name }))}
            />
          </Col>
          <Col span={8}>
            <Select
              style={{ width: "100%" }}
              placeholder="Mức độ"
              value={ruleDifficulty}
              onChange={(v) => setRuleDifficulty(v)}
              options={DIFFICULTIES.map((x) => ({ value: x, label: x }))}
            />
          </Col>
          <Col span={4}>
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              value={ruleQuantity}
              onChange={(v) => setRuleQuantity(Number(v || 1))}
            />
          </Col>
          <Col span={4}>
            <Button type="primary" block onClick={addRuleToTemplateDraft}>
              Thêm dòng
            </Button>
          </Col>
        </Row>

        <Table
          style={{ marginTop: 16 }}
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={templateItemsDraft}
          locale={{ emptyText: "Chưa có dòng cấu trúc nào" }}
          columns={[
            {
              title: "Khối kiến thức",
              dataIndex: "blockId",
              render: (id: string) => getBlockName(id),
            },
            { title: "Mức độ", dataIndex: "difficulty" },
            { title: "Số lượng", dataIndex: "quantity", width: 100 },
            {
              title: "Thao tác",
              width: 120,
              render: (_, item: ExamStructureItem) => (
                <Button danger size="small" onClick={() => removeTemplateRule(item.id)}>
                  Xóa
                </Button>
              ),
            },
          ]}
        />
      </Modal>

      {/* GENERATE EXAM MODAL */}
      <Modal
        visible={examModalVisible}
        title="Tạo đề thi tự động"
        onCancel={() => setExamModalVisible(false)}
        onOk={handleGenerateExam}
        okText="Tạo đề"
        cancelText="Hủy"
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <div>
            <Text strong>Tên đề thi</Text>
            <Input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="Nhập tên đề thi" />
          </div>

          <div>
            <Text strong>Chọn cấu trúc đề</Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              value={selectedTemplateId}
              onChange={(v) => setSelectedTemplateId(v)}
              options={templates.map((x) => ({
                value: x.id,
                label: `${x.name} - ${getSubjectCode(x.subjectId)} - ${getSubjectName(x.subjectId)}`,
              }))}
            />
          </div>

          {selectedTemplate ? (
            <Alert
              type="info"
              showIcon
              message={`Môn học: ${getSubjectCode(selectedTemplate.subjectId)} - ${getSubjectName(selectedTemplate.subjectId)}`}
              description={`Tổng số dòng cấu trúc: ${selectedTemplate.items.length}`}
            />
          ) : null}
        </Space>
      </Modal>
    </div>
  );
};

export default NganHangDeThi;