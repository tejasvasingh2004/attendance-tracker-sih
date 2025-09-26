// const redis = new Redis({
//   host: "localhost",
//   port: 6379,
// });

// redis.set("test", "test");

// export async function getAttendance() {

//     const attendance = await redis.get("attendance"); //10ms

//     if (!attendance) {

//     const attendance = await prisma.attendance.findOne({ //300ms
//       data: {
//         studentId: "12345",
//       },
//     });

//     redis.set("attendance", attendance, "EX", 60);
//   }
//   return attendance;
// }

// app.get("/attendance", async (req, res) => {
//   let attendance = await redis.get("attendance"); //10ms

//   if (!attendance) {
//   attendance =  prisma.attendance.findOne({ //300ms
//       data: {
//         studentId: "12345",
//       },
//     });
//   }

//   return attendance;
// });

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });

// console.log(test);