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
  Rate,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  TimePicker,
  Typography,
  message,
} from "antd";
import moment, { Moment } from "moment";
const { Title, Text } = Typography;
const { TextArea } = Input;
type AppointmentStatus = "Chờ duyệt" | "Xác nhận" | "Hoàn thành" | "Hủy";
type Weekday =
  | "Thứ 2"
  | "Thứ 3"
  | "Thứ 4"
  | "Thứ 5"
  | "Thứ 6"
  | "Thứ 7"
  | "Chủ nhật";
type EmployeeSchedule = {
  id: string;
  weekday: Weekday;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
};
type Employee = {
  id: string;
  name: string;
  maxCustomersPerDay: number;
  schedules: EmployeeSchedule[];
};
type Service = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
};
type Appointment = {
  id: string;
  customerName: string;
  customerPhone: string;
  employeeId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  note?: string;
  createdAt: string;
};
type Review = {
  id: string;
  appointmentId: string;
  employeeId: string;
  serviceId: string;
  customerName: string;
  rating: number;
  content: string;
  employeeReply?: string;
  createdAt: string;
};
const LS_EMPLOYEES = "booking_employees_v1";
const LS_SERVICES = "booking_services_v1";
const LS_APPOINTMENTS = "booking_appointments_v1";
const LS_REVIEWS = "booking_reviews_v1";
const WEEKDAYS: Weekday[] = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];
const STATUS_OPTIONS: AppointmentStatus[] = [
  "Chờ duyệt",
  "Xác nhận",
  "Hoàn thành",
  "Hủy",
];
const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: "e1",
    name: "Nguyễn Văn A",
    maxCustomersPerDay: 5,
    schedules: [
      { id: "s1", weekday: "Thứ 2", startTime: "09:00", endTime: "17:00" },
      { id: "s2", weekday: "Thứ 3", startTime: "09:00", endTime: "17:00" },
      { id: "s3", weekday: "Thứ 4", startTime: "09:00", endTime: "17:00" },
      { id: "s4", weekday: "Thứ 5", startTime: "09:00", endTime: "17:00" },
      { id: "s5", weekday: "Thứ 6", startTime: "09:00", endTime: "17:00" },
    ],
  },
  {
    id: "e2",
    name: "Trần Thị B",
    maxCustomersPerDay: 4,
    schedules: [
      { id: "s6", weekday: "Thứ 3", startTime: "10:00", endTime: "18:00" },
      { id: "s7", weekday: "Thứ 4", startTime: "10:00", endTime: "18:00" },
      { id: "s8", weekday: "Thứ 5", startTime: "10:00", endTime: "18:00" },
      { id: "s9", weekday: "Thứ 6", startTime: "10:00", endTime: "18:00" },
      { id: "s10", weekday: "Thứ 7", startTime: "09:00", endTime: "15:00" },
    ],
  },
];
const DEFAULT_SERVICES: Service[] = [
  { id: "dv1", name: "Cắt tóc", price: 100000, durationMinutes: 45 },
  { id: "dv2", name: "Spa chăm sóc da", price: 350000, durationMinutes: 90 },
  { id: "dv3", name: "Khám tổng quát", price: 500000, durationMinutes: 60 },
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
function getWeekdayVN(date: string): Weekday {
  const day = moment(date, "YYYY-MM-DD").isoWeekday();
  switch (day) {
    case 1:
      return "Thứ 2";
    case 2:
      return "Thứ 3";
    case 3:
      return "Thứ 4";
    case 4:
      return "Thứ 5";
    case 5:
      return "Thứ 6";
    case 6:
      return "Thứ 7";
    default:
      return "Chủ nhật";
  }
}
function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN") + " đ";
}
function statusColor(status: AppointmentStatus) {
  switch (status) {
    case "Chờ duyệt":
      return "gold";
    case "Xác nhận":
      return "blue";
    case "Hoàn thành":
      return "green";
    case "Hủy":
      return "red";
    default:
      return "default";
  }
}
const DatLichDichVu = () => {
  const [employees, setEmployees] = useState<Employee[]>(() => loadJSON(LS_EMPLOYEES, DEFAULT_EMPLOYEES));
  const [services, setServices] = useState<Service[]>(() => loadJSON(LS_SERVICES, DEFAULT_SERVICES));
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadJSON(LS_APPOINTMENTS, []));
  const [reviews, setReviews] = useState<Review[]>(() => loadJSON(LS_REVIEWS, []));
  useEffect(() => saveJSON(LS_EMPLOYEES, employees), [employees]);
  useEffect(() => saveJSON(LS_SERVICES, services), [services]);
  useEffect(() => saveJSON(LS_APPOINTMENTS, appointments), [appointments]);
  useEffect(() => saveJSON(LS_REVIEWS, reviews), [reviews]);
  const getEmployeeName = (id: string) => employees.find((x) => x.id === id)?.name || "(nhân viên đã xóa)";
  const getServiceName = (id: string) => services.find((x) => x.id === id)?.name || "(dịch vụ đã xóa)";
  const getServicePrice = (id: string) => services.find((x) => x.id === id)?.price || 0;
  const getServiceDuration = (id: string) => services.find((x) => x.id === id)?.durationMinutes || 0;
  const [employeeModalVisible, setEmployeeModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeForm] = Form.useForm<{ name: string; maxCustomersPerDay: number }>();
  const [scheduleDraft, setScheduleDraft] = useState<EmployeeSchedule[]>([]);
  const [draftWeekday, setDraftWeekday] = useState<Weekday>("Thứ 2");
  const [draftStart, setDraftStart] = useState<Moment | null>(moment("09:00", "HH:mm"));
  const [draftEnd, setDraftEnd] = useState<Moment | null>(moment("17:00", "HH:mm"));
  const openCreateEmployee = () => {
    setEditingEmployee(null);
    employeeForm.resetFields();
    employeeForm.setFieldsValue({ maxCustomersPerDay: 5 });
    setScheduleDraft([]);
    setEmployeeModalVisible(true);
  };
  const openEditEmployee = (item: Employee) => {
    setEditingEmployee(item);
    employeeForm.setFieldsValue({
      name: item.name,
      maxCustomersPerDay: item.maxCustomersPerDay,
    });
    setScheduleDraft(item.schedules || []);
    setEmployeeModalVisible(true);
  };
  const addScheduleDraft = () => {
    if (!draftStart || !draftEnd) {
      message.warning("Chọn giờ bắt đầu và giờ kết thúc");
      return;
    }
    const startTime = draftStart.format("HH:mm");
    const endTime = draftEnd.format("HH:mm");
    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      message.error("Giờ kết thúc phải lớn hơn giờ bắt đầu");
      return;
    }
    setScheduleDraft((prev) => [
      ...prev,
      {
        id: uid(),
        weekday: draftWeekday,
        startTime,
        endTime,
      },
    ]);
  };
  const removeScheduleDraft = (id: string) => {
    setScheduleDraft((prev) => prev.filter((x) => x.id !== id));
  };
  const submitEmployee = async () => {
    const values = await employeeForm.validateFields();
    if (scheduleDraft.length === 0) {
      message.error("Nhân viên phải có ít nhất 1 lịch làm việc");
      return;
    }
    const payload: Employee = {
      id: editingEmployee?.id || uid(),
      name: values.name.trim(),
      maxCustomersPerDay: Number(values.maxCustomersPerDay),
      schedules: scheduleDraft,
    };
    if (editingEmployee) {
      setEmployees((prev) => prev.map((x) => (x.id === editingEmployee.id ? payload : x)));
      message.success("Đã cập nhật nhân viên");
    } else {
      setEmployees((prev) => [...prev, payload]);
      message.success("Đã thêm nhân viên");
    }
    setEmployeeModalVisible(false);
  };
  const deleteEmployee = (id: string) => {
    const used = appointments.some((x) => x.employeeId === id);
    if (used) {
      message.error("Không thể xóa nhân viên đang có lịch hẹn");
      return;
    }
    setEmployees((prev) => prev.filter((x) => x.id !== id));
    message.success("Đã xóa nhân viên");
  };
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm] = Form.useForm<{ name: string; price: number; durationMinutes: number }>();
  const openCreateService = () => {
    setEditingService(null);
    serviceForm.resetFields();
    serviceForm.setFieldsValue({ price: 100000, durationMinutes: 60 });
    setServiceModalVisible(true);
  };
  const openEditService = (item: Service) => {
    setEditingService(item);
    serviceForm.setFieldsValue(item);
    setServiceModalVisible(true);
  };
  const submitService = async () => {
    const values = await serviceForm.validateFields();
    const payload: Service = {
      id: editingService?.id || uid(),
      name: values.name.trim(),
      price: Number(values.price),
      durationMinutes: Number(values.durationMinutes),
    };
    if (editingService) {
      setServices((prev) => prev.map((x) => (x.id === editingService.id ? payload : x)));
      message.success("Đã cập nhật dịch vụ");
    } else {
      setServices((prev) => [...prev, payload]);
      message.success("Đã thêm dịch vụ");
    }
    setServiceModalVisible(false);
  };
  const deleteService = (id: string) => {
    const used = appointments.some((x) => x.serviceId === id);
    if (used) {
      message.error("Không thể xóa dịch vụ đang có lịch hẹn");
      return;
    }
    setServices((prev) => prev.filter((x) => x.id !== id));
    message.success("Đã xóa dịch vụ");
  };
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [appointmentForm] = Form.useForm<{
    customerName: string;
    customerPhone: string;
    employeeId: string;
    serviceId: string;
    date: Moment;
    startTime: Moment;
    status: AppointmentStatus;
    note?: string;
  }>();
  const openCreateAppointment = () => {
    if (employees.length === 0 || services.length === 0) {
      message.warning("Cần có nhân viên và dịch vụ trước khi đặt lịch");
      return;
    }
    setEditingAppointment(null);
    appointmentForm.resetFields();
    appointmentForm.setFieldsValue({
      employeeId: employees[0].id,
      serviceId: services[0].id,
      date: moment(),
      startTime: moment("09:00", "HH:mm"),
      status: "Chờ duyệt",
    });
    setAppointmentModalVisible(true);
  };
  const openEditAppointment = (item: Appointment) => {
    setEditingAppointment(item);
    appointmentForm.setFieldsValue({
      customerName: item.customerName,
      customerPhone: item.customerPhone,
      employeeId: item.employeeId,
      serviceId: item.serviceId,
      date: moment(item.date, "YYYY-MM-DD"),
      startTime: moment(item.startTime, "HH:mm"),
      status: item.status,
      note: item.note,
    });
    setAppointmentModalVisible(true);
  };
  const submitAppointment = async () => {
    const values = await appointmentForm.validateFields();
    const date = values.date.format("YYYY-MM-DD");
    const startTime = values.startTime.format("HH:mm");
    const duration = getServiceDuration(values.serviceId);
    const endTime = values.startTime.clone().add(duration, "minutes").format("HH:mm");
    const employee = employees.find((x) => x.id === values.employeeId);
    if (!employee) {
      message.error("Không tìm thấy nhân viên");
      return;
    }
    const weekday = getWeekdayVN(date);
    const matchedSchedule = employee.schedules.find((x) => x.weekday === weekday);
    if (!matchedSchedule) {
      message.error(`Nhân viên không làm việc vào ${weekday}`);
      return;
    }
    const scheduleStart = timeToMinutes(matchedSchedule.startTime);
    const scheduleEnd = timeToMinutes(matchedSchedule.endTime);
    const bookingStart = timeToMinutes(startTime);
    const bookingEnd = timeToMinutes(endTime);
    if (bookingStart < scheduleStart || bookingEnd > scheduleEnd) {
      message.error(
        `Lịch hẹn nằm ngoài giờ làm việc của nhân viên (${matchedSchedule.startTime} - ${matchedSchedule.endTime})`
      );
      return;
    }
    const sameDayAppointments = appointments.filter(
      (x) =>
        x.employeeId === values.employeeId &&
        x.date === date &&
        x.status !== "Hủy" &&
        x.id !== editingAppointment?.id
    );
    if (sameDayAppointments.length >= employee.maxCustomersPerDay) {
      message.error("Nhân viên đã đạt số khách tối đa trong ngày");
      return;
    }
    const hasOverlap = sameDayAppointments.some((x) => {
      const existingStart = timeToMinutes(x.startTime);
      const existingEnd = timeToMinutes(x.endTime);
      return bookingStart < existingEnd && bookingEnd > existingStart;
    });
    if (hasOverlap) {
      message.error("Lịch hẹn bị trùng với lịch đã có của nhân viên");
      return;
    }
    const payload: Appointment = {
      id: editingAppointment?.id || uid(),
      customerName: values.customerName.trim(),
      customerPhone: values.customerPhone.trim(),
      employeeId: values.employeeId,
      serviceId: values.serviceId,
      date,
      startTime,
      endTime,
      status: values.status,
      note: values.note?.trim(),
      createdAt: editingAppointment?.createdAt || new Date().toISOString(),
    };
    if (editingAppointment) {
      setAppointments((prev) => prev.map((x) => (x.id === editingAppointment.id ? payload : x)));
      message.success("Đã cập nhật lịch hẹn");
    } else {
      setAppointments((prev) => [payload, ...prev]);
      message.success("Đặt lịch thành công");
    }
    setAppointmentModalVisible(false);
  };
  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((x) => x.id !== id));
    setReviews((prev) => prev.filter((x) => x.appointmentId !== id));
    message.success("Đã xóa lịch hẹn");
  };
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reviewForm] = Form.useForm<{ rating: number; content: string }>();
  const [replyForm] = Form.useForm<{ employeeReply: string }>();
  const openReviewModal = (appointment: Appointment) => {
    const reviewed = reviews.some((x) => x.appointmentId === appointment.id);
    if (reviewed) {
      message.warning("Lịch hẹn này đã được đánh giá");
      return;
    }
    setSelectedAppointment(appointment);
    reviewForm.resetFields();
    reviewForm.setFieldsValue({ rating: 5 });
    setReviewModalVisible(true);
  };
  const submitReview = async () => {
    const values = await reviewForm.validateFields();
    if (!selectedAppointment) return;
    const payload: Review = {
      id: uid(),
      appointmentId: selectedAppointment.id,
      employeeId: selectedAppointment.employeeId,
      serviceId: selectedAppointment.serviceId,
      customerName: selectedAppointment.customerName,
      rating: Number(values.rating),
      content: values.content.trim(),
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [payload, ...prev]);
    setReviewModalVisible(false);
    message.success("Đã gửi đánh giá");
  };
  const openReplyModal = (review: Review) => {
    setSelectedReview(review);
    replyForm.setFieldsValue({ employeeReply: review.employeeReply || "" });
    setReplyModalVisible(true);
  };
  const submitReply = async () => {
    const values = await replyForm.validateFields();
    if (!selectedReview) return;
    setReviews((prev) =>
      prev.map((x) =>
        x.id === selectedReview.id ? { ...x, employeeReply: values.employeeReply.trim() } : x
      )
    );
    setReplyModalVisible(false);
    message.success("Đã phản hồi đánh giá");
  };
  const averageRatings = useMemo(() => {
    return employees.map((employee) => {
      const employeeReviews = reviews.filter((x) => x.employeeId === employee.id);
      const avg =
        employeeReviews.length > 0
          ? employeeReviews.reduce((sum, item) => sum + item.rating, 0) / employeeReviews.length
          : 0;
      return {
        employeeId: employee.id,
        average: Number(avg.toFixed(1)),
        totalReviews: employeeReviews.length,
      };
    });
  }, [employees, reviews]);
  const [filterEmployeeId, setFilterEmployeeId] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | undefined>();
  const [filterDate, setFilterDate] = useState<string>("");
  const filteredAppointments = useMemo(() => {
    return appointments.filter((x) => {
      if (filterEmployeeId && x.employeeId !== filterEmployeeId) return false;
      if (filterStatus && x.status !== filterStatus) return false;
      if (filterDate && x.date !== filterDate) return false;
      return true;
    });
  }, [appointments, filterEmployeeId, filterStatus, filterDate]);
  const today = moment().format("YYYY-MM-DD");
  const currentMonth = moment().format("YYYY-MM");

  const appointmentsToday = appointments.filter((x) => x.date === today).length;
  const appointmentsThisMonth = appointments.filter((x) => x.date.startsWith(currentMonth)).length;

  const revenueByService = services.map((service) => {
    const related = appointments.filter(
      (x) => x.serviceId === service.id && x.status === "Hoàn thành"
    );
    const revenue = related.length * service.price;
    return {
      key: service.id,
      serviceName: service.name,
      count: related.length,
      revenue,
    };
  });
  const revenueByEmployee = employees.map((employee) => {
    const related = appointments.filter(
      (x) => x.employeeId === employee.id && x.status === "Hoàn thành"
    );
    const revenue = related.reduce((sum, item) => sum + getServicePrice(item.serviceId), 0);
    return {
      key: employee.id,
      employeeName: employee.name,
      count: related.length,
      revenue,
    };
  });
  return (
    <div style={{ maxWidth: 1450, margin: "0 auto", padding: 16 }}>
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
            📅 Ứng dụng đặt lịch dịch vụ
          </Title>
          <Text type="secondary">
            Quản lý nhân viên · dịch vụ · lịch hẹn · đánh giá · thống kê doanh thu
          </Text>
        </Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} xl={3}>
            <Card style={{ borderRadius: 12 }}>
              <Statistic title="Lịch hẹn hôm nay" value={appointmentsToday} />
            </Card>
          </Col>
          <Col xs={24} md={12} xl={3}>
            <Card style={{ borderRadius: 12 }}>
              <Statistic title="Lịch hẹn tháng này" value={appointmentsThisMonth} />
            </Card>
          </Col>
          <Col xs={24} md={12} xl={3}>
            <Card style={{ borderRadius: 12 }}>
              <Statistic title="Nhân viên" value={employees.length} />
            </Card>
          </Col>
          <Col xs={24} md={12} xl={3}>
            <Card style={{ borderRadius: 12 }}>
              <Statistic title="Dịch vụ" value={services.length} />
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <Card
              title="1. Quản lý nhân viên"
              extra={
                <Button type="primary" onClick={openCreateEmployee}>
                  Thêm nhân viên
                </Button>
              }
              style={{ borderRadius: 16 }}
            >
              <Table
                rowKey="id"
                size="small"
                pagination={{ pageSize: 5 }}
                dataSource={employees}
                columns={[
                  { title: "Tên nhân viên", dataIndex: "name" },
                  { title: "Số khách tối đa/ngày", dataIndex: "maxCustomersPerDay", width: 150 },
                  {
                    title: "Đánh giá TB",
                    width: 130,
                    render: (_, item: Employee) => {
                      const info = averageRatings.find((x) => x.employeeId === item.id);
                      return (
                        <span>
                          {info?.average || 0} ⭐ ({info?.totalReviews || 0})
                        </span>
                      );
                    },
                  },
                  {
                    title: "Thao tác",
                    width: 170,
                    render: (_, item: Employee) => (
                      <Space>
                        <Button size="small" onClick={() => openEditEmployee(item)}>
                          Sửa
                        </Button>
                        <Button size="small" danger onClick={() => deleteEmployee(item.id)}>
                          Xóa
                        </Button>
                      </Space>
                    ),
                  },
                ]}
                expandable={{
                  expandedRowRender: (record: Employee) => (
                    <Table
                      rowKey="id"
                      size="small"
                      pagination={false}
                      dataSource={record.schedules}
                      columns={[
                        { title: "Thứ", dataIndex: "weekday" },
                        { title: "Bắt đầu", dataIndex: "startTime" },
                        { title: "Kết thúc", dataIndex: "endTime" },
                      ]}
                    />
                  ),
                }}
              />
            </Card>
          </Col>
          <Col xs={24} xl={12}>
            <Card
              title="1. Quản lý dịch vụ"
              extra={
                <Button type="primary" onClick={openCreateService}>
                  Thêm dịch vụ
                </Button>
              }
              style={{ borderRadius: 16 }}
            >
              <Table
                rowKey="id"
                size="small"
                pagination={{ pageSize: 5 }}
                dataSource={services}
                columns={[
                  { title: "Tên dịch vụ", dataIndex: "name" },
                  {
                    title: "Giá",
                    dataIndex: "price",
                    render: (value: number) => formatCurrency(value),
                    width: 140,
                  },
                  { title: "Thời gian", dataIndex: "durationMinutes", width: 120, render: (v: number) => `${v} phút` },
                  {
                    title: "Thao tác",
                    width: 170,
                    render: (_, item: Service) => (
                      <Space>
                        <Button size="small" onClick={() => openEditService(item)}>
                          Sửa
                        </Button>
                        <Button size="small" danger onClick={() => deleteService(item.id)}>
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
          title="2. Quản lý lịch hẹn"
          extra={
            <Button type="primary" onClick={openCreateAppointment}>
              Đặt lịch hẹn
            </Button>
          }
          style={{ borderRadius: 16 }}
        >
          <Space wrap style={{ marginBottom: 16 }}>
            <Select
              allowClear
              placeholder="Lọc theo nhân viên"
              style={{ width: 220 }}
              value={filterEmployeeId}
              onChange={(v) => setFilterEmployeeId(v)}
              options={employees.map((x) => ({ value: x.id, label: x.name }))}
            />
            <Select
              allowClear
              placeholder="Lọc theo trạng thái"
              style={{ width: 180 }}
              value={filterStatus}
              onChange={(v) => setFilterStatus(v)}
              options={STATUS_OPTIONS.map((x) => ({ value: x, label: x }))}
            />
            <Input
              placeholder="YYYY-MM-DD"
              style={{ width: 180 }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <Button
              onClick={() => {
                setFilterEmployeeId(undefined);
                setFilterStatus(undefined);
                setFilterDate("");
              }}
            >
              Xóa lọc
            </Button>
          </Space>
          <Table
            rowKey="id"
            size="small"
            pagination={{ pageSize: 6 }}
            dataSource={filteredAppointments}
            columns={[
              { title: "Khách hàng", dataIndex: "customerName", width: 140 },
              { title: "SĐT", dataIndex: "customerPhone", width: 120 },
              {
                title: "Dịch vụ",
                dataIndex: "serviceId",
                width: 180,
                render: (id: string) => getServiceName(id),
              },
              {
                title: "Nhân viên",
                dataIndex: "employeeId",
                width: 160,
                render: (id: string) => getEmployeeName(id),
              },
              { title: "Ngày", dataIndex: "date", width: 110 },
              {
                title: "Giờ",
                width: 130,
                render: (_, item: Appointment) => `${item.startTime} - ${item.endTime}`,
              },
              {
                title: "Trạng thái",
                dataIndex: "status",
                width: 120,
                render: (value: AppointmentStatus) => <Tag color={statusColor(value)}>{value}</Tag>,
              },
              {
                title: "Thao tác",
                width: 320,
                render: (_, item: Appointment) => {
                  const reviewed = reviews.some((x) => x.appointmentId === item.id);
                  return (
                    <Space wrap>
                      <Button size="small" onClick={() => openEditAppointment(item)}>
                        Sửa
                      </Button>
                      {item.status === "Hoàn thành" && !reviewed ? (
                        <Button size="small" type="primary" onClick={() => openReviewModal(item)}>
                          Đánh giá
                        </Button>
                      ) : null}
                      <Button size="small" danger onClick={() => deleteAppointment(item.id)}>
                        Xóa
                      </Button>
                    </Space>
                  );
                },
              },
            ]}
          />
        </Card>
        <Card title="3. Đánh giá dịch vụ & nhân viên" style={{ borderRadius: 16 }}>
          <Table
            rowKey="id"
            size="small"
            pagination={{ pageSize: 5 }}
            dataSource={reviews}
            columns={[
              { title: "Khách hàng", dataIndex: "customerName", width: 140 },
              {
                title: "Nhân viên",
                dataIndex: "employeeId",
                width: 160,
                render: (id: string) => getEmployeeName(id),
              },
              {
                title: "Dịch vụ",
                dataIndex: "serviceId",
                width: 180,
                render: (id: string) => getServiceName(id),
              },
              {
                title: "Số sao",
                dataIndex: "rating",
                width: 120,
                render: (rating: number) => <Rate disabled value={rating} />,
              },
              { title: "Đánh giá", dataIndex: "content" },
              {
                title: "Phản hồi NV",
                dataIndex: "employeeReply",
                render: (value: string) => value || <Text type="secondary">Chưa phản hồi</Text>,
              },
              {
                title: "Thao tác",
                width: 120,
                render: (_, item: Review) => (
                  <Button size="small" onClick={() => openReplyModal(item)}>
                    Phản hồi
                  </Button>
                ),
              },
            ]}
          />
        </Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <Card title="4. Thống kê doanh thu theo dịch vụ" style={{ borderRadius: 16 }}>
              <Table
                rowKey="key"
                size="small"
                pagination={false}
                dataSource={revenueByService}
                columns={[
                  { title: "Dịch vụ", dataIndex: "serviceName" },
                  { title: "Số lịch hoàn thành", dataIndex: "count", width: 140 },
                  {
                    title: "Doanh thu",
                    dataIndex: "revenue",
                    width: 150,
                    render: (v: number) => formatCurrency(v),
                  },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} xl={12}>
            <Card title="4. Thống kê doanh thu theo nhân viên" style={{ borderRadius: 16 }}>
              <Table
                rowKey="key"
                size="small"
                pagination={false}
                dataSource={revenueByEmployee}
                columns={[
                  { title: "Nhân viên", dataIndex: "employeeName" },
                  { title: "Số lịch hoàn thành", dataIndex: "count", width: 140 },
                  {
                    title: "Doanh thu",
                    dataIndex: "revenue",
                    width: 150,
                    render: (v: number) => formatCurrency(v),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
        <Alert
          type="info"
          showIcon
          message="Hệ thống sẽ kiểm tra trùng lịch, số khách tối đa/ngày và lịch làm việc của nhân viên trước khi cho đặt lịch."
        />
      </Space>
      <Modal
        visible={employeeModalVisible}
        title={editingEmployee ? "Sửa nhân viên" : "Thêm nhân viên"}
        onCancel={() => setEmployeeModalVisible(false)}
        onOk={submitEmployee}
        okText="Lưu"
        cancelText="Hủy"
        width={900}
      >
        <Form form={employeeForm} layout="vertical">
          <Row gutter={12}>
            <Col span={14}>
              <Form.Item label="Tên nhân viên" name="name" rules={[{ required: true, message: "Nhập tên nhân viên" }]}>
                <Input placeholder="Nhập tên nhân viên" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                label="Số khách tối đa/ngày"
                name="maxCustomersPerDay"
                rules={[{ required: true, message: "Nhập số khách tối đa/ngày" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Divider />
        <Text strong>Lịch làm việc</Text>
        <Row gutter={12} style={{ marginTop: 12 }}>
          <Col span={8}>
            <Select
              style={{ width: "100%" }}
              value={draftWeekday}
              onChange={(v) => setDraftWeekday(v)}
              options={WEEKDAYS.map((x) => ({ value: x, label: x }))}
            />
          </Col>
          <Col span={6}>
            <TimePicker
              style={{ width: "100%" }}
              format="HH:mm"
              value={draftStart}
              onChange={(v) => setDraftStart(v)}
            />
          </Col>
          <Col span={6}>
            <TimePicker
              style={{ width: "100%" }}
              format="HH:mm"
              value={draftEnd}
              onChange={(v) => setDraftEnd(v)}
            />
          </Col>
          <Col span={4}>
            <Button type="primary" block onClick={addScheduleDraft}>
              Thêm ca
            </Button>
          </Col>
        </Row>
        <Table
          style={{ marginTop: 16 }}
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={scheduleDraft}
          locale={{ emptyText: "Chưa có lịch làm việc" }}
          columns={[
            { title: "Thứ", dataIndex: "weekday" },
            { title: "Bắt đầu", dataIndex: "startTime" },
            { title: "Kết thúc", dataIndex: "endTime" },
            {
              title: "Thao tác",
              width: 100,
              render: (_, item: EmployeeSchedule) => (
                <Button size="small" danger onClick={() => removeScheduleDraft(item.id)}>
                  Xóa
                </Button>
              ),
            },
          ]}
        />
      </Modal>
      <Modal
        visible={serviceModalVisible}
        title={editingService ? "Sửa dịch vụ" : "Thêm dịch vụ"}
        onCancel={() => setServiceModalVisible(false)}
        onOk={submitService}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={serviceForm} layout="vertical">
          <Form.Item label="Tên dịch vụ" name="name" rules={[{ required: true, message: "Nhập tên dịch vụ" }]}>
            <Input placeholder="VD: Cắt tóc, Spa..." />
          </Form.Item>
          <Form.Item label="Giá" name="price" rules={[{ required: true, message: "Nhập giá dịch vụ" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Thời gian thực hiện (phút)"
            name="durationMinutes"
            rules={[{ required: true, message: "Nhập thời gian thực hiện" }]}
          >
            <InputNumber min={15} step={15} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={appointmentModalVisible}
        title={editingAppointment ? "Sửa lịch hẹn" : "Đặt lịch hẹn"}
        onCancel={() => setAppointmentModalVisible(false)}
        onOk={submitAppointment}
        okText="Lưu"
        cancelText="Hủy"
        width={900}
      >
        <Form form={appointmentForm} layout="vertical">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Tên khách hàng"
                name="customerName"
                rules={[{ required: true, message: "Nhập tên khách hàng" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="customerPhone"
                rules={[{ required: true, message: "Nhập số điện thoại" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Dịch vụ" name="serviceId" rules={[{ required: true, message: "Chọn dịch vụ" }]}>
                <Select options={services.map((x) => ({ value: x.id, label: `${x.name} - ${formatCurrency(x.price)}` }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Nhân viên" name="employeeId" rules={[{ required: true, message: "Chọn nhân viên" }]}>
                <Select options={employees.map((x) => ({ value: x.id, label: x.name }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item label="Ngày hẹn" name="date" rules={[{ required: true, message: "Chọn ngày" }]}>
                <TimeSafeDatePicker />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Giờ bắt đầu" name="startTime" rules={[{ required: true, message: "Chọn giờ bắt đầu" }]}>
                <TimePicker style={{ width: "100%" }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: "Chọn trạng thái" }]}>
                <Select options={STATUS_OPTIONS.map((x) => ({ value: x, label: x }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Ghi chú" name="note">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={reviewModalVisible}
        title="Đánh giá dịch vụ"
        onCancel={() => setReviewModalVisible(false)}
        onOk={submitReview}
        okText="Gửi đánh giá"
        cancelText="Hủy"
      >
        <Form form={reviewForm} layout="vertical">
          <Form.Item label="Số sao" name="rating" rules={[{ required: true, message: "Chọn số sao" }]}>
            <Rate />
          </Form.Item>
          <Form.Item label="Nội dung đánh giá" name="content" rules={[{ required: true, message: "Nhập đánh giá" }]}>
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={replyModalVisible}
        title="Phản hồi đánh giá"
        onCancel={() => setReplyModalVisible(false)}
        onOk={submitReply}
        okText="Lưu phản hồi"
        cancelText="Hủy"
      >
        <Form form={replyForm} layout="vertical">
          <Form.Item
            label="Nội dung phản hồi"
            name="employeeReply"
            rules={[{ required: true, message: "Nhập nội dung phản hồi" }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
function TimeSafeDatePicker(props: any) {
  const { DatePicker } = require("antd");
  return <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" {...props} />;
}
export default DatLichDichVu;