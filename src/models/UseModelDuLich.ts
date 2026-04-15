import { useState, useEffect } from 'react';
import { message } from 'antd';
import { KHOA_LUU_TRU, DU_LIEU_MAU_DIEM_DEN } from './duLichConstants';
import type { KieuDiemDen, KieuLichTrinh, KieuNgayLichTrinh, KieuChiPhi, KieuHangMuc } from './duLichTypes';

export default function useModelDuLich() {

  const layDuLieuBanDau = () => {
    const duLieuLuu = localStorage.getItem(KHOA_LUU_TRU.DIEM_DEN);
    if (duLieuLuu) {
      return JSON.parse(duLieuLuu);
    }
    return DU_LIEU_MAU_DIEM_DEN;
  };

  const [danhSachDiemDen, setDanhSachDiemDen] = useState<KieuDiemDen[]>(layDuLieuBanDau);
  const [danhSachLichTrinh, setDanhSachLichTrinh] = useState<KieuLichTrinh[]>(
    JSON.parse(localStorage.getItem(KHOA_LUU_TRU.LICH_TRINH) || '[]')
  );

  useEffect(() => {
    localStorage.setItem(KHOA_LUU_TRU.DIEM_DEN, JSON.stringify(danhSachDiemDen));
  }, [danhSachDiemDen]);

  useEffect(() => {
    localStorage.setItem(KHOA_LUU_TRU.LICH_TRINH, JSON.stringify(danhSachLichTrinh));
  }, [danhSachLichTrinh]);

  const themDiemDen = (diemDenMoi: any) => {
    const banGhiMoi = {
      ...diemDenMoi,
      id: 'DD_' + Date.now(),
    };
    setDanhSachDiemDen([...danhSachDiemDen, banGhiMoi]);
    message.success('Thêm điểm đến thành công!');
  };

  const suaDiemDen = (id: string, duLieu: any) => {
    const danhSachMoi = danhSachDiemDen.map((dd) => {
      if (dd.id === id) {
        return { ...dd, ...duLieu };
      }
      return dd;
    });
    setDanhSachDiemDen(danhSachMoi);
    message.success('Cập nhật điểm đến thành công!');
  };

  const xoaDiemDen = (id: string) => {
    const danhSachMoi = danhSachDiemDen.filter((dd) => dd.id !== id);
    setDanhSachDiemDen(danhSachMoi);
    message.success('Đã xóa điểm đến!');
  };

  const themLichTrinh = (tenLichTrinh: string, nganSachToiDa: number) => {
    const lichTrinhMoi: KieuLichTrinh = {
      id: 'LT_' + Date.now(),
      tenLichTrinh: tenLichTrinh,
      ngayTao: new Date().toISOString(),
      nganSachToiDa: nganSachToiDa,
      danhSachNgay: [{ ngay: 1, danhSachDiemDen: [] }], // mặc định có 1 ngày
    };
    setDanhSachLichTrinh([...danhSachLichTrinh, lichTrinhMoi]);
    message.success('Tạo lịch trình thành công!');
    return lichTrinhMoi.id;
  };

  const xoaLichTrinh = (id: string) => {
    const danhSachMoi = danhSachLichTrinh.filter((lt) => lt.id !== id);
    setDanhSachLichTrinh(danhSachMoi);
    message.success('Đã xóa lịch trình!');
  };

  const themNgay = (idLichTrinh: string) => {
    const danhSachMoi = danhSachLichTrinh.map((lt) => {
      if (lt.id === idLichTrinh) {
        const soNgayMoi = lt.danhSachNgay.length + 1;
        return {
          ...lt,
          danhSachNgay: [...lt.danhSachNgay, { ngay: soNgayMoi, danhSachDiemDen: [] }],
        };
      }
      return lt;
    });
    setDanhSachLichTrinh(danhSachMoi);
  };

  const xoaNgay = (idLichTrinh: string, soNgay: number) => {
    const danhSachMoi = danhSachLichTrinh.map((lt) => {
      if (lt.id === idLichTrinh) {

        const ngayConLai = lt.danhSachNgay.filter((n) => n.ngay !== soNgay);
        const ngayDaDanhSoLai = ngayConLai.map((n, i) => ({ ...n, ngay: i + 1 }));
        return { ...lt, danhSachNgay: ngayDaDanhSoLai };
      }
      return lt;
    });
    setDanhSachLichTrinh(danhSachMoi);
  };

  const themDiemDenVaoNgay = (idLichTrinh: string, soNgay: number, idDiemDen: string) => {
    const danhSachMoi = danhSachLichTrinh.map((lt) => {
      if (lt.id === idLichTrinh) {
        const ngayMoi = lt.danhSachNgay.map((n) => {
          if (n.ngay === soNgay) {
            const thuTuMoi = n.danhSachDiemDen.length + 1;
            return {
              ...n,
              danhSachDiemDen: [...n.danhSachDiemDen, { idDiemDen: idDiemDen, thuTu: thuTuMoi }],
            };
          }
          return n;
        });
        return { ...lt, danhSachNgay: ngayMoi };
      }
      return lt;
    });
    setDanhSachLichTrinh(danhSachMoi);
  };

  const xoaDiemDenKhoiNgay = (idLichTrinh: string, soNgay: number, idDiemDen: string) => {
    const danhSachMoi = danhSachLichTrinh.map((lt) => {
      if (lt.id === idLichTrinh) {
        const ngayMoi = lt.danhSachNgay.map((n) => {
          if (n.ngay === soNgay) {

            const diemDenConLai = n.danhSachDiemDen
              .filter((dd) => dd.idDiemDen !== idDiemDen)
              .map((dd, i) => ({ ...dd, thuTu: i + 1 }));
            return { ...n, danhSachDiemDen: diemDenConLai };
          }
          return n;
        });
        return { ...lt, danhSachNgay: ngayMoi };
      }
      return lt;
    });
    setDanhSachLichTrinh(danhSachMoi);
  };

  const diChuyenDiemDen = (idLichTrinh: string, soNgay: number, viTriCu: number, viTriMoi: number) => {
    const danhSachMoi = danhSachLichTrinh.map((lt) => {
      if (lt.id === idLichTrinh) {
        const ngayMoi = lt.danhSachNgay.map((n) => {
          if (n.ngay === soNgay) {

            const dsMoi = [...n.danhSachDiemDen];
            const phanTu = dsMoi.splice(viTriCu, 1)[0]; 
            dsMoi.splice(viTriMoi, 0, phanTu); 

            const dsDaDanhSo = dsMoi.map((dd, i) => ({ ...dd, thuTu: i + 1 }));
            return { ...n, danhSachDiemDen: dsDaDanhSo };
          }
          return n;
        });
        return { ...lt, danhSachNgay: ngayMoi };
      }
      return lt;
    });
    setDanhSachLichTrinh(danhSachMoi);
  };

  const tinhTongChiPhiDiemDen = (chiPhi: KieuChiPhi) => {
    return chiPhi.anUong + chiPhi.luuTru + chiPhi.diChuyen + chiPhi.veVao + chiPhi.khac;
  };

  const tinhChiPhiNgay = (ngay: KieuNgayLichTrinh) => {
    let tongChi = 0;
    for (let i = 0; i < ngay.danhSachDiemDen.length; i++) {
      const diemDen = danhSachDiemDen.find((dd) => dd.id === ngay.danhSachDiemDen[i].idDiemDen);
      if (diemDen) {
        tongChi = tongChi + tinhTongChiPhiDiemDen(diemDen.chiPhi);
      }
    }
    return tongChi;
  };
  const tinhTongChiPhiLichTrinh = (lichTrinh: KieuLichTrinh) => {
    let tongChi = 0;
    for (let i = 0; i < lichTrinh.danhSachNgay.length; i++) {
      tongChi = tongChi + tinhChiPhiNgay(lichTrinh.danhSachNgay[i]);
    }
    return tongChi;
  };

  const tinhChiPhiTheoHangMuc = (lichTrinh: KieuLichTrinh) => {
    const ketQua = { anUong: 0, luuTru: 0, diChuyen: 0, veVao: 0, khac: 0 };
    for (let i = 0; i < lichTrinh.danhSachNgay.length; i++) {
      const ngay = lichTrinh.danhSachNgay[i];
      for (let j = 0; j < ngay.danhSachDiemDen.length; j++) {
        const diemDen = danhSachDiemDen.find((dd) => dd.id === ngay.danhSachDiemDen[j].idDiemDen);
        if (diemDen) {
          ketQua.anUong += diemDen.chiPhi.anUong;
          ketQua.luuTru += diemDen.chiPhi.luuTru;
          ketQua.diChuyen += diemDen.chiPhi.diChuyen;
          ketQua.veVao += diemDen.chiPhi.veVao;
          ketQua.khac += diemDen.chiPhi.khac;
        }
      }
    }
    return ketQua;
  };

  const tinhThoiGianNgay = (ngay: KieuNgayLichTrinh) => {
    let tongGio = 0;
    for (let i = 0; i < ngay.danhSachDiemDen.length; i++) {
      const diemDen = danhSachDiemDen.find((dd) => dd.id === ngay.danhSachDiemDen[i].idDiemDen);
      if (diemDen) {
        tongGio = tongGio + diemDen.thoiGianThamQuan;
      }
    }
    return tongGio;
  };

  const tinhThoiGianDiChuyenNgay = (ngay: KieuNgayLichTrinh) => {
    const soDiemDen = ngay.danhSachDiemDen.length;
    if (soDiemDen > 1) {
      return (soDiemDen - 1) * 1; // 1 giờ mỗi lần
    }
    return 0;
  };

  return {
    danhSachDiemDen,
    danhSachLichTrinh,
    themDiemDen,
    suaDiemDen,
    xoaDiemDen,
    themLichTrinh,
    xoaLichTrinh,
    themNgay,
    xoaNgay,
    themDiemDenVaoNgay,
    xoaDiemDenKhoiNgay,
    diChuyenDiemDen,
    tinhTongChiPhiDiemDen,
    tinhChiPhiNgay,
    tinhTongChiPhiLichTrinh,
    tinhChiPhiTheoHangMuc,
    tinhThoiGianNgay,
    tinhThoiGianDiChuyenNgay,
  };
}