import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Auto-cancel deposits that exceed 24 hours without approval
 * Status: ChoDuyet → DaHuy
 * Beds: DaCoc → Trong (available again)
 * Runs every 5 minutes
 */
export async function startDepositAutoCancelCron() {
  // Run every 5 minutes: "*/5 * * * *"
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`⏱️  [CRON] Deposit auto-cancel check running at ${now.toISOString()}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      const depositThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

      // Find deposits that exceed 24 hours and still waiting for approval
      const expiredDeposits = await prisma.phieuCoc.findMany({
        where: {
          ngayCoc: {
            lt: depositThreshold, // Created before 24 hours ago
          },
          trangThai: {
            in: ['ChoDuyet'], // Only waiting for approval
          },
        },
        include: {
          chiTietPhieuCoc: {
            include: { giuong: true },
          },
        },
      });

      if (expiredDeposits.length === 0) {
        console.log('✅ No expired deposits found');
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        return;
      }

      console.log(`⚠️  Found ${expiredDeposits.length} expired deposit(s) to cancel`);

      // Process each expired deposit
      for (const deposit of expiredDeposits) {
        try {
          // Get all bed IDs associated with this deposit
          let bedIds = deposit.chiTietPhieuCoc.map((ct) => ct.maGiuong);
          
          // If room deposit but no chiTietPhieuCoc (phòng được tạo mà không có chi tiết), fetch giường từ phòng
          if (deposit.maPhong && bedIds.length === 0) {
            console.log(`   🔄 Room deposit but no chiTietPhieuCoc - fetching beds from room ${deposit.maPhong}`);
            const room = await prisma.phong.findUnique({
              where: { maPhong: deposit.maPhong },
              include: { giuong: true },
            });
            if (room) {
              bedIds = room.giuong.map(g => g.maGiuong);
              console.log(`   Beds from room: ${bedIds.join(', ')}`);
            }
          }

          // VALIDATION: Kiểm tra tất cả giường/phòng có trạng thái khác bằng DaCoc không
          if (bedIds.length > 0) {
            // Fetch giường từ DB để check trạng thái hiện tại
            const currentBeds = await prisma.giuong.findMany({
              where: { maGiuong: { in: bedIds } },
            });
            console.log(`   Current bed statuses:`, currentBeds.map(b => `${b.maGiuong}:${b.trangThai}`).join(', '));
            
            const bedsNotInDaCoc = currentBeds.filter(b => b.trangThai !== 'DaCoc');
            
            if (bedsNotInDaCoc.length > 0) {
              // Skip this deposit - beds have been transitioned to another status
              const bedsInfo = bedsNotInDaCoc.map(b => `${b.maGiuong}(${b.trangThai})`).join(', ');
              console.log(`   ⏭️  ${deposit.maPC} skipped - beds not in DaCoc status: ${bedsInfo}`);
              continue;
            }
          }

          // Update deposit status to DaHuy (auto-cancelled)
          await prisma.phieuCoc.update({
            where: { maPC: deposit.maPC },
            data: {
              trangThai: 'DaHuy', // Auto-cancelled
            },
          });

          // Release beds back to available status
          if (bedIds.length > 0) {
            const updateResult = await prisma.giuong.updateMany({
              where: { 
                maGiuong: { in: bedIds },
                trangThai: 'DaCoc', // Only release beds that are still in DaCoc state
              },
              data: { trangThai: 'Trong' }, // Available again
            });
            console.log(`   ✅ Released ${updateResult.count} beds to "Trong"`);

            // Also reset room status if all beds in room are now Trong
            // Get unique room IDs from the beds
            let roomIds = [...new Set(deposit.chiTietPhieuCoc.map(ct => ct.giuong?.maPhong).filter(Boolean))];
            if (deposit.maPhong && !roomIds.includes(deposit.maPhong)) {
              roomIds.push(deposit.maPhong);
            }
            
            for (const roomId of roomIds) {
              // Fetch lại trạng thái mới của các giường sau khi release
              const updatedRoomBeds = await prisma.giuong.findMany({ where: { maPhong: roomId } });
              const allEmpty = updatedRoomBeds.every(b => b.trangThai === 'Trong');
              if (allEmpty) {
                await prisma.phong.update({
                  where: { maPhong: roomId },
                  data: { trangThai: 'Trong' },
                });
              }
            }

            console.log(`   ✅ ${deposit.maPC} auto-cancelled (${bedIds.length} beds released)`);
          }

          // Release room for room deposits (maPhong set directly on phieuCoc) when no chiTietPhieuCoc
          if (deposit.maPhong && bedIds.length === 0) {
            // Fetch lại trạng thái mới của các giường sau khi release
            const updatedRoomBeds = await prisma.giuong.findMany({ where: { maPhong: deposit.maPhong } });
            const allEmpty = updatedRoomBeds.every(b => b.trangThai === 'Trong');
            if (allEmpty) {
              await prisma.phong.update({
                where: { maPhong: deposit.maPhong },
                data: { trangThai: 'Trong' },
              });
            }
            console.log(`   ✅ ${deposit.maPC} auto-cancelled (room deposit: ${deposit.maPhong} released)`);
          }
        } catch (err) {
          console.error(`   ❌ Error processing ${deposit.maPC}: ${err.message}`);
        }
      }

      console.log(`✅ Auto-cancel completed: ${expiredDeposits.length} deposit(s)\n`);
    } catch (error) {
      console.error('❌ [CRON] Deposit auto-cancel error:', error.message);
    }
  });

  console.log('✓ Deposit auto-cancel cron job started (every 5 minutes)');
}

/**
 * Stop cron job (useful for testing or graceful shutdown)
 */
export function stopDepositAutoCancelCron() {
  // Note: node-cron doesn't provide direct stop method for individual tasks
  // This is a placeholder for documentation
  console.log('Deposit auto-cancel cron job will stop on process termination');
}
