import cors from "cors";
import express, { Application } from "express";
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

const app: Application = express();


// app.use(cors({
//   origin: "*"
// }));
app.use(cors({
  origin:process.env.APP_URL|| "http://localhost:3000",
  // origin:process.env.FRONTEND_URL,
  //  origin: [
  //     'http://localhost:3000',
  //     'http://localhost:4000'
  //   ],
  credentials: true
}));

// middleware
app.use(express.json());
// console.log("postRouter =", postRouter);
// app.all(/^\/api\/auth\/.*/, toNodeHandler(auth));
app.all("/api/auth/*splat", toNodeHandler(auth));


app.use("/api/user",userRouter);
app.use("/api/tutors",tutorRouter);
app.use("/api/categories",categoryRouter);
app.use("/aip/availability",availabilityRouter);
app.use("/api/bookings",bookingRouter);
app.use("/api/reviews",reviewRouter);



app.get("/",(req,res)=>{
    res.send("Hello World :prisma is working");
});
app.use(errorHandler)
app.use(notFound)


export default app;




