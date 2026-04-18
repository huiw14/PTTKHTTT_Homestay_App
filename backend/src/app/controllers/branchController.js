import prisma from '../db/prisma.js';

export const getBranches = async (req, res) => {
  try {
    const branches = await prisma.chiNhanh.findMany({
      orderBy: { maCN: 'asc' },
    });

    res.json({ success: true, data: branches, total: branches.length });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Loi lay danh sach chi nhanh',
      error: error.message,
    });
  }
};

export default { getBranches };
