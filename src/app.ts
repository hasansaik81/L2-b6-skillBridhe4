import cors from "cors";
import express, { Application } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { userRouter } from "./modules/user/user.router";

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


app.use("/api/auth",userRouter);


app.get("/",(req,res)=>{
    res.send("Hello World :prisma is working");
});
// app.use(notFond)
// app.use(errorHandler)

export default app;




