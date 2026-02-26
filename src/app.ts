// import cors from "cors";
// import express, { Application } from "express";
// import { toNodeHandler } from "better-auth/node";
// import { auth } from "./lib/auth";
// import { userRouter } from "./modules/user/user.router";
// import { tutorRouter } from "./modules/tutor/tutor.router";
// import { categoryRouter } from "./modules/category/category.router";
// import { availabilityRouter } from "./modules/availability/availability.router";
// import { bookingRouter } from "./modules/booking/booking.router";
// import { reviewRouter } from "./modules/review/review.router";
// import errorHandler from "./middleware/errorHandler";
// import { notFound } from "./middleware/notFound";

// const app: Application = express();


// // app.use(cors({
// //   origin: "*"
// // }));
// app.use(cors({
//   origin:process.env.APP_URL|| "http://localhost:3000",
//   // origin:process.env.FRONTEND_URL,
//   //  origin: [
//   //     'http://localhost:3000',
//   //     'http://localhost:4000'
//   //   ],
//   credentials: true
// }));

// // middleware
// app.use(express.json());
// // console.log("postRouter =", postRouter);
// // app.all(/^\/api\/auth\/.*/, toNodeHandler(auth));
// app.all("/api/auth/*splat", toNodeHandler(auth));


// app.use("/api/user",userRouter);
// app.use("/api/tutors",tutorRouter);
// app.use("/api/categories",categoryRouter);
// app.use("/aip/availability",availabilityRouter);
// app.use("/api/bookings",bookingRouter);
// app.use("/api/reviews",reviewRouter);



// app.get("/",(req,res)=>{
//     res.send("Hello World :prisma is working");
// });
// app.use(errorHandler)
// app.use(notFound)


// export default app;



// app.ts
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { userRouter } from "./modules/user/user.router";
import { tutorRouter } from "./modules/tutor/tutor.router";
import { categoryRouter } from "./modules/category/category.router";
import { availabilityRouter } from "./modules/availability/availability.router";
import { bookingRouter } from "./modules/booking/booking.router";
import { reviewRouter } from "./modules/review/review.router";
import errorHandler from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

// Load environment variables
dotenv.config();

const app: Application = express();

// CORS configuration
const allowedOrigins = [
  process.env.APP_URL?.trim() || "http://localhost:3000", // production frontend URL
  "http://localhost:4000" // optional dev URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // for Postman or server-to-server requests
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// Middleware
app.use(express.json());

// Auth routes
app.all("/api/auth/*splat", toNodeHandler(auth));

// API routes
app.use("/api/user", userRouter);
app.use("/api/tutors", tutorRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);

// Test route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World : Prisma is working");
});

// Error handling
app.use(errorHandler);
app.use(notFound);

export default app;




