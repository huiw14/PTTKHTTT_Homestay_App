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
          const bedIds = deposit.chiTietPhieuCoc.map((ct) => ct.maGiuong);

          // Update deposit status to DaHuy (auto-cancelled)
          await prisma.phieuCoc.update({
            where: { maPC: deposit.maPC },
            data: {
              trangThai: 'DaHuy', // Auto-cancelled
            },
          });

          // Release beds back to available status
          if (bedIds.length > 0) {
            await prisma.giuong.updateMany({
              where: { maGiuong: { in: bedIds } },
              data: { trangThai: 'Trong' }, // Available again
            });

            console.log(`   ✅ ${deposit.maPC} cancelled (${bedIds.length} beds: ${bedIds.join(', ')} released)`);
          } else {
            console.log(`   ✅ ${deposit.maPC} cancelled (room deposit)`);
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
