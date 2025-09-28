import 'dotenv/config'; 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const studentsData = [
    { email: "student1@example.com", name: "John Doe", rollNumber: "STU001", year: 2, section: "A" },
    { email: "student2@example.com", name: "Alice Lee", rollNumber: "STU002", year: 1, section: "B" },
    { email: "student3@example.com", name: "Bob Smith", rollNumber: "STU003", year: 3, section: "A" },
  ];

  for (const s of studentsData) {
    const student = await prisma.user.create({
      data: {
        email: s.email,
        role: "STUDENT",
        name: s.name,
        student: {
          create: {
            rollNumber: s.rollNumber,
            year: s.year,
            section: s.section,
            semester: "3",
          },
        },
      },
    });
    console.log("Student created:", student.email);
  }

  const teachersData = [
    { email: "teacher1@example.com", name: "Jane Smith", employeeId: "EMP001", department: "Mathematics" },
    { email: "teacher2@example.com", name: "Mark Johnson", employeeId: "EMP002", department: "Physics" },
  ];

  for (const t of teachersData) {
    const teacher = await prisma.user.create({
      data: {
        email: t.email,
        role: "TEACHER",
        name: t.name,
        teacher: {
          create: {
            employeeId: t.employeeId,
            department: t.department,
          },
        },
      },
    });
    console.log("Teacher created:", teacher.email);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
