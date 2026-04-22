export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/todo-list',
		name: 'TodoList',
		icon: 'OrderedListOutlined',
		component: './TodoList',
	},

{
  		path: '/doan-so',
  		name: 'DoanSo',
  		icon: 'SmileOutlined',
  		component: './DoanSo',
	},
	{
  path: "/quan-ly-hoc-tap",
  name: "Quản lý học tập",
  component: "./QuanLyHocTap",
    },
	{
  path: "/oan-tu-ti",
  name: "Oẳn tù tì",
  component: "./OanTuTi",
    },
	{
  path: "/ngan-hang-de-thi",
  name: "Ngân hàng đề thi",
  component: "./NganHangDeThi",
    },
	{
  path: "/dat-lich-dich-vu",
  name: "Đặt lịch dịch vụ",
  component: "./DatLichDichVu",
    },
	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
	{
  path: '/vanbang',
  name: 'Văn bằng',
  icon: 'ProfileOutlined',
  component: './VanBang',
    },
	{
  path: '/clb',
  name: 'Câu lạc bộ',
  icon: 'TeamOutlined',
  component: './CauLacBo',
},
{
  path: '/don',
  name: 'Đơn đăng ký',
  icon: 'FormOutlined',
  component: './DonDangKy',
},
{
  path: '/thanhvien',
  name: 'Thành viên',
  icon: 'UserOutlined',
  component: './ThanhVien',
},
{
  path: '/baocao',
  name: 'Báo cáo',
  icon: 'BarChartOutlined',
  component: './BaoCao',
},
	{
		path: '/th07',
		name: 'Bài thực hành 07',
		icon: 'HomeOutlined',
		component: './TH07',
	},
];
