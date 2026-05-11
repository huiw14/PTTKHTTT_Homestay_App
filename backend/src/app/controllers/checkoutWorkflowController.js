import prisma from '../db/prisma.js';

const workflowStore = new Map();
const appliedLiquidations = new Set();

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const toPlain = (value) => JSON.parse(JSON.stringify(value));

const getRoomSummary = (contract) => {
  const names = (contract?.phieuCoc?.chiTietPhieuCoc || [])
    .map((item) => item.giuong?.phong?.tenPhong || item.giuong?.maPhong)
    .filter(Boolean);
  return [...new Set(names)].join(', ');
};

const getPrimaryRoomCode = (contract) => {
  const roomFromDeposit = contract?.phieuCoc?.phong?.maPhong;
  if (roomFromDeposit) return roomFromDeposit;

  const firstBed = contract?.phieuCoc?.chiTietPhieuCoc?.[0]?.giuong;
  return firstBed?.maPhong || null;
};

const buildWorkflowFromContract = (contract) => ({
  id: `OUT-${contract.maHD}`,
  contractId: contract.maHD,
  customerName: contract.phieuCoc?.khachHang?.hoTen || '',
  roomName: getRoomSummary(contract),
  expectedCheckoutDate: formatDate(contract.ngayKetThuc),
  reason: 'Khách hàng yêu cầu trả phòng',
  bedCount: contract.phieuCoc?.chiTietPhieuCoc?.length || 1,
  depositAmount: Number(contract.phieuCoc?.tienCoc || 0),
  startDate: formatDate(contract.ngayBatDau),
  contractEndDate: formatDate(contract.ngayKetThuc),
  stayMonths: Number(contract.kyThanhToan || 0),
  status: 'Chờ duyệt',
  electricStart: 0,
  waterStart: 0,
  electricEnd: 0,
  waterEnd: 0,
  unpaidRent: 0,
  unpaidService: 0,
  violationFee: 0,
  refundRate: 0,
  damageItems: [],
  inspectionChecklist: {
    keyReturned: false,
    roomClean: false,
    assetsIntact: false,
    servicesPaid: false,
  },
  settlementData: null,
  liquidationData: null,
  liquidationDate: null,
  contractStatus: contract.trangThai,
  roomStatus: null,
  paymentMethod: null,
  settlementType: null,
  maHD: contract.maHD,
  maPhong: getPrimaryRoomCode(contract),
  maKH: contract.phieuCoc?.khachHang?.maKH || null,
  maNV: contract.maNV,
});

const seedWorkflowsFromContracts = async () => {
  if (workflowStore.size > 0) return;

  const contracts = await prisma.hopDong.findMany({
    orderBy: { ngayKy: 'desc' },
    include: {
      phieuCoc: {
        include: {
          khachHang: true,
          phong: true,
          chiTietPhieuCoc: {
            include: {
              giuong: {
                include: { phong: true },
              },
            },
          },
        },
      },
    },
  });

  contracts
    .filter((contract) => ['DangHieuLuc', 'HetHan'].includes(contract.trangThai))
    .forEach((contract) => {
      const workflow = buildWorkflowFromContract(contract);
      workflowStore.set(workflow.id, workflow);
    });
};

const computeRefundRate = (workflow) => {
  const settlementDate = workflow.expectedCheckoutDate ? new Date(workflow.expectedCheckoutDate) : null;
  const contractEndDate = workflow.contractEndDate ? new Date(workflow.contractEndDate) : null;

  if (contractEndDate && settlementDate && contractEndDate <= settlementDate) {
    return 100;
  }

  const stayMonths = Number(workflow.stayMonths || 0);
  return stayMonths < 6 ? 50 : 70;
};

const applyLiquidationToDatabase = async (workflow) => {
  const contract = await prisma.hopDong.findUnique({
    where: { maHD: workflow.contractId },
    include: {
      phieuCoc: {
        include: {
          khachHang: true,
          phong: true,
          chiTietPhieuCoc: {
            include: {
              giuong: true,
            },
          },
        },
      },
    },
  });

  if (!contract) {
    throw new Error('Không tìm thấy hợp đồng để thanh lý.');
  }

  if (contract.trangThai === 'DaThanhLy') {
    return;
  }

  const bedCodes = contract.phieuCoc?.chiTietPhieuCoc?.map((item) => item.giuong?.maGiuong).filter(Boolean) || [];
  const roomCode = contract.phieuCoc?.phong?.maPhong || contract.phieuCoc?.chiTietPhieuCoc?.[0]?.giuong?.maPhong || null;

  await prisma.$transaction(async (tx) => {
    await tx.hopDong.update({ where: { maHD: contract.maHD }, data: { trangThai: 'DaThanhLy' } });

    if (contract.phieuCoc?.khachHang?.maKH) {
      await tx.khachHang.update({ where: { maKH: contract.phieuCoc.khachHang.maKH }, data: { trangThai: 0 } });
    }

    if (bedCodes.length > 0) {
      await tx.giuong.updateMany({ where: { maGiuong: { in: bedCodes } }, data: { trangThai: 'Trong' } });
    }

    if (roomCode) {
      await tx.phong.update({ where: { maPhong: roomCode }, data: { trangThai: 'Trong' } }).catch(() => null);
    }

    await tx.thanhVien.updateMany({ where: { maHD: contract.maHD }, data: { trangThai: 0 } }).catch(() => null);
  });
};

const syncLiquidations = async (nextWorkflows) => {
  for (const workflow of nextWorkflows) {
    if (workflow.status === 'Đã thanh lý' && !appliedLiquidations.has(workflow.id)) {
      await applyLiquidationToDatabase(workflow);
      appliedLiquidations.add(workflow.id);
    }
  }
};

export const getCheckoutWorkflows = async (_req, res) => {
  try {
    await seedWorkflowsFromContracts();
    res.json({ success: true, data: [...workflowStore.values()].map(toPlain) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể lấy danh sách trả phòng.', error: error.message });
  }
};

export const saveCheckoutWorkflows = async (req, res) => {
  try {
    const { workflows } = req.body;

    if (!Array.isArray(workflows)) {
      return res.status(400).json({ success: false, message: 'workflows phải là một mảng hợp lệ.' });
    }

    const nextWorkflows = workflows.map((workflow) => ({
      ...workflow,
      refundRate: workflow.status === 'Đã đối soát' || workflow.status === 'Đã thanh lý'
        ? workflow.refundRate || computeRefundRate(workflow)
        : workflow.refundRate || 0,
    }));

    await syncLiquidations(nextWorkflows);

    workflowStore.clear();
    nextWorkflows.forEach((workflow) => {
      workflowStore.set(workflow.id, toPlain(workflow));
    });

    res.json({ success: true, data: [...workflowStore.values()].map(toPlain) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể lưu danh sách trả phòng.', error: error.message });
  }
};

export default {
  getCheckoutWorkflows,
  saveCheckoutWorkflows,
};