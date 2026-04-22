import { useState, useEffect } from 'react';
import { message } from 'antd';

export const DS_TRANG_THAI = [
  { value: 'daDang', label: 'Đã đăng' },
  { value: 'nhap', label: 'Nháp' },
];

const THE_MAC_DINH = [
  { id: 't1', ten: 'React' },
  { id: 't2', ten: 'JavaScript' },
  { id: 't3', ten: 'TypeScript' },
  { id: 't4', ten: 'CSS' },
  { id: 't5', ten: 'Node.js' },
  { id: 't6', ten: 'Python' },
];

const BAI_VIET_MAU = [
  {
    id: 'bv1',
    tieuDe: 'Giới thiệu React Hooks',
    slug: 'gioi-thieu-react-hooks',
    tomTat: 'Tìm hiểu về useState, useEffect và các hooks cơ bản trong React.',
    noiDung: '# Giới thiệu React Hooks\n\nReact Hooks là tính năng được giới thiệu từ **React 16.8**, cho phép sử dụng state và các tính năng khác mà không cần viết class.\n\n## useState\n\n`useState` là hook cơ bản nhất:\n\n```js\nconst [count, setCount] = useState(0);\n```\n\n## useEffect\n\n`useEffect` cho phép thực hiện side effects:\n\n```js\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n```\n\n## Lợi ích\n\n- Code ngắn gọn hơn\n- Dễ tái sử dụng logic\n- Không cần hiểu `this` binding',
    anhDaiDien: 'https://picsum.photos/seed/react/800/400',
    tags: ['t1', 't2'],
    trangThai: 'daDang',
    tacGia: 'Nguyễn Đức Minh',
    ngayTao: '2026-04-10',
    luotXem: 42,
  },
  {
    id: 'bv2',
    tieuDe: 'TypeScript cho người mới bắt đầu',
    slug: 'typescript-cho-nguoi-moi',
    tomTat: 'Hướng dẫn cơ bản về TypeScript - superset của JavaScript.',
    noiDung: '# TypeScript cho người mới\n\nTypeScript là **superset** của JavaScript, thêm tính năng kiểm tra kiểu tĩnh.\n\n## Kiểu cơ bản\n\n```ts\nlet ten: string = "Minh";\nlet tuoi: number = 20;\nlet dangHoc: boolean = true;\n```\n\n## Interface\n\n```ts\ninterface SinhVien {\n  ten: string;\n  tuoi: number;\n}\n```\n\n## Tại sao nên dùng?\n\n- Phát hiện lỗi sớm\n- IntelliSense tốt hơn\n- Code dễ bảo trì',
    anhDaiDien: 'https://picsum.photos/seed/typescript/800/400',
    tags: ['t3', 't2'],
    trangThai: 'daDang',
    tacGia: 'Nguyễn Đức Minh',
    ngayTao: '2026-04-12',
    luotXem: 28,
  },
  {
    id: 'bv3',
    tieuDe: 'CSS Flexbox từ A đến Z',
    slug: 'css-flexbox-a-den-z',
    tomTat: 'Toàn bộ kiến thức về Flexbox layout trong CSS.',
    noiDung: '# CSS Flexbox\n\nFlexbox giúp căn chỉnh và phân bố không gian giữa các item.\n\n## Container\n\n```css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n```\n\n## Thuộc tính quan trọng\n\n- `flex-direction`: row, column\n- `justify-content`: center, space-between\n- `align-items`: center, stretch\n- `flex-wrap`: wrap, nowrap',
    anhDaiDien: 'https://picsum.photos/seed/css/800/400',
    tags: ['t4'],
    trangThai: 'daDang',
    tacGia: 'Nguyễn Đức Minh',
    ngayTao: '2026-04-14',
    luotXem: 35,
  },
  {
    id: 'bv4',
    tieuDe: 'Node.js REST API cơ bản',
    slug: 'nodejs-rest-api',
    tomTat: 'Xây dựng REST API đơn giản với Node.js và Express.',
    noiDung: '# Node.js REST API\n\nHướng dẫn tạo REST API cơ bản.\n\n## Cài đặt\n\n```bash\nnpm init -y\nnpm install express\n```\n\n## Server cơ bản\n\n```js\nconst express = require("express");\nconst app = express();\n\napp.get("/api/users", (req, res) => {\n  res.json([{ id: 1, ten: "Minh" }]);\n});\n\napp.listen(3000);\n```',
    anhDaiDien: 'https://picsum.photos/seed/node/800/400',
    tags: ['t5', 't2'],
    trangThai: 'daDang',
    tacGia: 'Nguyễn Đức Minh',
    ngayTao: '2026-04-15',
    luotXem: 19,
  },
  {
    id: 'bv5',
    tieuDe: 'Python Data Science nhập môn',
    slug: 'python-data-science',
    tomTat: 'Bước đầu làm quen với Python trong phân tích dữ liệu.',
    noiDung: '# Python Data Science\n\n## Thư viện cần thiết\n\n- **pandas**: xử lý dữ liệu\n- **numpy**: tính toán số học\n- **matplotlib**: vẽ biểu đồ\n\n## Ví dụ\n\n```python\nimport pandas as pd\ndf = pd.read_csv("data.csv")\nprint(df.head())\n```',
    anhDaiDien: 'https://picsum.photos/seed/python/800/400',
    tags: ['t6'],
    trangThai: 'nhap',
    tacGia: 'Nguyễn Đức Minh',
    ngayTao: '2026-04-16',
    luotXem: 5,
  },
  {
    id: 'bv6',
    tieuDe: 'React Component Patterns',
    slug: 'react-component-patterns',
    tomTat: 'Các pattern phổ biến khi viết React component.',
    noiDung: '# React Component Patterns\n\n## 1. Container / Presentational\n\nTách logic và UI thành 2 component riêng.\n\n## 2. Render Props\n\nTruyền function qua props để render.\n\n## 3. Custom Hooks\n\nTách logic thành hook riêng để tái sử dụng.\n\n```js\nfunction useCounter(init = 0) {\n  const [count, setCount] = useState(init);\n  return { count, tang: () => setCount(c => c + 1) };\n}\n```',
    anhDaiDien: 'https://picsum.photos/seed/pattern/800/400',
    tags: ['t1', 't2'],
    trangThai: 'daDang',
    tacGia: 'Nguyễn Đức Minh',
    ngayTao: '2026-04-18',
    luotXem: 15,
  },
  {
    id: 'bv7',
    tieuDe: 'JavaScript ES6+ Features',
    slug: 'javascript-es6-features',
    tomTat: 'Tổng hợp các tính năng mới trong ES6 và sau đó.',
    noiDung: '# JavaScript ES6+\n\n## Arrow Functions\n\n```js\nconst add = (a, b) => a + b;\n```\n\n## Destructuring\n\n```js\nconst { name, age } = person;\nconst [first, ...rest] = arr;\n```\n\n## Template Literals\n\n```js\nconst msg = `Hello ${name}`;\n```\n\n## Spread Operator\n\n```js\nconst newArr = [...arr, 4, 5];\n```',
    anhDaiDien: 'https://picsum.photos/seed/es6/800/400',
    tags: ['t2'],
    trangThai: 'daDang',
    tacGia: 'Nguyễn Đức Minh',
    ngayTao: '2026-04-19',
    luotXem: 22,
  },
  {
    id: 'bv8',
    tieuDe: 'CSS Grid Layout',
    slug: 'css-grid-layout',
    tomTat: 'Tìm hiểu CSS Grid để xây dựng layout phức tạp.',
    noiDung: '# CSS Grid Layout\n\n## Cơ bản\n\n```css\n.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}\n```\n\n## Grid Areas\n\n```css\n.layout {\n  grid-template-areas:\n    "header header"\n    "sidebar main"\n    "footer footer";\n}\n```',
    anhDaiDien: 'https://picsum.photos/seed/grid/800/400',
    tags: ['t4'],
    trangThai: 'daDang',
    tacGia: 'Nguyễn Đức Minh',
    ngayTao: '2026-04-20',
    luotXem: 18,
  },
  {
    id: 'bv9',
    tieuDe: 'React và TypeScript kết hợp',
    slug: 'react-va-typescript',
    tomTat: 'Hướng dẫn sử dụng TypeScript trong dự án React.',
    noiDung: '# React + TypeScript\n\n## Props typing\n\n```tsx\ninterface Props {\n  name: string;\n  age: number;\n}\n\nconst Hello = (props: Props) => {\n  return <h1>Hello {props.name}</h1>;\n};\n```\n\n## useState với type\n\n```tsx\nconst [user, setUser] = useState<User | null>(null);\n```',
    anhDaiDien: 'https://picsum.photos/seed/reactts/800/400',
    tags: ['t1', 't3'],
    trangThai: 'daDang',
    tacGia: 'Nguyễn Đức Minh',
    ngayTao: '2026-04-21',
    luotXem: 31,
  },
  {
    id: 'bv10',
    tieuDe: 'Node.js Authentication với JWT',
    slug: 'nodejs-jwt-auth',
    tomTat: 'Xác thực người dùng bằng JSON Web Token.',
    noiDung: '# JWT Authentication\n\n## Cài đặt\n\n```bash\nnpm install jsonwebtoken bcryptjs\n```\n\n## Tạo token\n\n```js\nconst jwt = require("jsonwebtoken");\nconst token = jwt.sign({ id: user._id }, "secret", { expiresIn: "1h" });\n```\n\n## Verify\n\n```js\nconst decoded = jwt.verify(token, "secret");\n```',
    anhDaiDien: 'https://picsum.photos/seed/jwt/800/400',
    tags: ['t5', 't2'],
    trangThai: 'nhap',
    tacGia: 'Nguyễn Đức Minh',
    ngayTao: '2026-04-22',
    luotXem: 3,
  },
];

export default function useModelBlog() {
  const [danhSachThe, setDanhSachThe] = useState(() => {
    const luu = localStorage.getItem('BLOG_THE');
    if (luu) return JSON.parse(luu);
    return THE_MAC_DINH;
  });

  const [danhSachBaiViet, setDanhSachBaiViet] = useState(() => {
    const luu = localStorage.getItem('BLOG_BAI_VIET');
    if (luu) return JSON.parse(luu);
    return BAI_VIET_MAU;
  });

  useEffect(() => {
    localStorage.setItem('BLOG_THE', JSON.stringify(danhSachThe));
  }, [danhSachThe]);

  useEffect(() => {
    localStorage.setItem('BLOG_BAI_VIET', JSON.stringify(danhSachBaiViet));
  }, [danhSachBaiViet]);

  // === BAI VIET ===
  const themBaiViet = (duLieu: any) => {
    const moi = {
      id: 'bv_' + Date.now(),
      tieuDe: duLieu.tieuDe,
      slug: duLieu.slug,
      tomTat: duLieu.tomTat || '',
      noiDung: duLieu.noiDung || '',
      anhDaiDien: duLieu.anhDaiDien || '',
      tags: duLieu.tags || [],
      trangThai: duLieu.trangThai || 'nhap',
      tacGia: 'Nguyễn Đức Minh',
      ngayTao: new Date().toISOString().split('T')[0],
      luotXem: 0,
    };
    setDanhSachBaiViet([moi, ...danhSachBaiViet]);
    message.success('Thêm bài viết thành công!');
    return true;
  };

  const suaBaiViet = (id: any, duLieu: any) => {
    const ds: any[] = [];
    for (let i = 0; i < danhSachBaiViet.length; i++) {
      if (danhSachBaiViet[i].id === id) {
        ds.push({
          id: danhSachBaiViet[i].id,
          tieuDe: duLieu.tieuDe,
          slug: duLieu.slug,
          tomTat: duLieu.tomTat || '',
          noiDung: duLieu.noiDung || '',
          anhDaiDien: duLieu.anhDaiDien || '',
          tags: duLieu.tags || [],
          trangThai: duLieu.trangThai,
          tacGia: danhSachBaiViet[i].tacGia,
          ngayTao: danhSachBaiViet[i].ngayTao,
          luotXem: danhSachBaiViet[i].luotXem,
        });
      } else {
        ds.push(danhSachBaiViet[i]);
      }
    }
    setDanhSachBaiViet(ds);
    message.success('Cập nhật thành công!');
    return true;
  };

  const xoaBaiViet = (id: any) => {
    const ds: any[] = [];
    for (let i = 0; i < danhSachBaiViet.length; i++) {
      if (danhSachBaiViet[i].id !== id) {
        ds.push(danhSachBaiViet[i]);
      }
    }
    setDanhSachBaiViet(ds);
    message.success('Đã xóa!');
    return true;
  };

  const tangLuotXem = (id: any) => {
    const ds: any[] = [];
    for (let i = 0; i < danhSachBaiViet.length; i++) {
      if (danhSachBaiViet[i].id === id) {
        var bv = danhSachBaiViet[i];
        ds.push({ id: bv.id, tieuDe: bv.tieuDe, slug: bv.slug, tomTat: bv.tomTat, noiDung: bv.noiDung, anhDaiDien: bv.anhDaiDien, tags: bv.tags, trangThai: bv.trangThai, tacGia: bv.tacGia, ngayTao: bv.ngayTao, luotXem: bv.luotXem + 1 });
      } else {
        ds.push(danhSachBaiViet[i]);
      }
    }
    setDanhSachBaiViet(ds);
  };

  // === THE ===
  const themThe = (ten: any) => {
    for (let i = 0; i < danhSachThe.length; i++) {
      if (danhSachThe[i].ten.toLowerCase() === ten.toLowerCase()) {
        message.error('Tên thẻ đã tồn tại!');
        return false;
      }
    }
    setDanhSachThe([...danhSachThe, { id: 'the_' + Date.now(), ten: ten }]);
    message.success('Thêm thẻ thành công!');
    return true;
  };

  const suaThe = (id: any, ten: any) => {
    for (let i = 0; i < danhSachThe.length; i++) {
      if (danhSachThe[i].id !== id && danhSachThe[i].ten.toLowerCase() === ten.toLowerCase()) {
        message.error('Tên thẻ đã tồn tại!');
        return false;
      }
    }
    const ds: any[] = [];
    for (let i = 0; i < danhSachThe.length; i++) {
      if (danhSachThe[i].id === id) {
        ds.push({ id: id, ten: ten });
      } else {
        ds.push(danhSachThe[i]);
      }
    }
    setDanhSachThe(ds);
    message.success('Cập nhật thẻ thành công!');
    return true;
  };

  const xoaThe = (id: any) => {
    const ds: any[] = [];
    for (let i = 0; i < danhSachThe.length; i++) {
      if (danhSachThe[i].id !== id) ds.push(danhSachThe[i]);
    }
    setDanhSachThe(ds);
    message.success('Đã xóa thẻ!');
    return true;
  };

  const demBaiVietTheoThe = (idThe: any) => {
    let dem = 0;
    for (let i = 0; i < danhSachBaiViet.length; i++) {
      if (danhSachBaiViet[i].tags && danhSachBaiViet[i].tags.indexOf(idThe) >= 0) {
        dem++;
      }
    }
    return dem;
  };

  const layTenThe = (idThe: any) => {
    for (let i = 0; i < danhSachThe.length; i++) {
      if (danhSachThe[i].id === idThe) return danhSachThe[i].ten;
    }
    return '';
  };

  return {
    danhSachBaiViet, danhSachThe,
    themBaiViet, suaBaiViet, xoaBaiViet, tangLuotXem,
    themThe, suaThe, xoaThe, demBaiVietTheoThe, layTenThe,
  };
}