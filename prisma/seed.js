const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Tạo Roles
  const adminRole = await prisma.role.upsert({
    where: { roleid: 1 },
    update: {},
    create: { roleid: 1, rolename: 'ADMIN' },
  });

  const userRole = await prisma.role.upsert({
    where: { roleid: 2 },
    update: {},
    create: { roleid: 2, rolename: 'USER' },
  });

  // Tạo MemberShip
  const goldMember = await prisma.memberShip.upsert({
    where: { mid: 1 },
    update: {},
    create: { mid: 1, mname: 'GOLD', score: 100 },
  });

  // Tạo Admin User mẫu
  const hashedPassword = await bcrypt.hash('123456', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      fullname: 'System Admin',
      password: hashedPassword,
      roleid: adminRole.roleid,
      mid: goldMember.mid,
    },
  });

  console.log('>>> SEED DATA COMPLETED SUCCESS <<<');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });