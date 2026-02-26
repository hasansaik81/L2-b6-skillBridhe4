var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";

// src/lib/auth.ts
import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import nodemailer2 from "nodemailer";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.4.1",
  "engineVersion": "55ae170b1ced7fc6ed07a15f110549408c501bb3",
  "activeProvider": "postgresql",
  "inlineSchema": 'model User {\n  id            String    @id\n  name          String\n  email         String\n  emailVerified Boolean   @default(false)\n  image         String?\n  phone         String?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n\n  role            UserRoles\n  status          UserStatus     @default(ACTIVE)\n  tutorProfile    TutorProfiles?\n  StudentBookings Booking[]\n  studentReviews  Review[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nenum UserRoles {\n  ADMIN\n  TUTOR\n  STUDENT\n}\n\nenum UserStatus {\n  ACTIVE\n  BANNED\n}\n\nmodel Availability {\n  id        String             @id @default(uuid())\n  tutorId   String\n  day       WeekDay\n  startTime String\n  endTime   String\n  status    AvailabilityStatus @default(AVAILABLE)\n\n  tutor   TutorProfiles @relation(fields: [tutorId], references: [id], onDelete: Cascade)\n  booking Booking[]\n\n  @@index([tutorId])\n  @@map("availability")\n}\n\nenum AvailabilityStatus {\n  AVAILABLE\n  BOOKED\n}\n\nenum WeekDay {\n  MONDAY\n  TUESDAY\n  WEDNESDAY\n  THURSDAY\n  FRIDAY\n  SATURDAY\n  SUNDAY\n}\n\nmodel Booking {\n  id             String        @id @default(uuid())\n  studentId      String\n  tutorId        String\n  subjectId      String?\n  availabilityId String?\n  status         BookingStatus @default(CONFIRMED)\n  price          Int\n  createdAt      DateTime      @default(now())\n  completedAt    DateTime?\n\n  stdudent     User          @relation(fields: [studentId], references: [id])\n  tutor        TutorProfiles @relation(fields: [tutorId], references: [id])\n  subject      Subject?      @relation(fields: [subjectId], references: [id])\n  availability Availability? @relation(fields: [availabilityId], references: [id], onDelete: SetNull)\n  review       Review?\n\n  @@index([studentId, tutorId])\n  @@map("bookings")\n}\n\nenum BookingStatus {\n  CONFIRMED\n  COMPLETED\n  CANCELLED\n}\n\nmodel Category {\n  id          String   @id @default(uuid())\n  name        String   @unique\n  description String?\n  createdAt   DateTime @default(now())\n\n  tutors   TutorProfiles[]\n  subjects Subject[]\n\n  @@map("categories")\n}\n\nmodel Review {\n  id        String   @id @default(uuid())\n  bookingId String   @unique\n  studentId String\n  tutorId   String\n  review    String\n  rating    Decimal  @db.Decimal(2, 1)\n  createdAt DateTime @default(now())\n\n  student User          @relation(fields: [studentId], references: [id])\n  tutor   TutorProfiles @relation(fields: [tutorId], references: [id], onDelete: Cascade)\n  booking Booking       @relation(fields: [bookingId], references: [id], onDelete: Cascade)\n\n  @@index([studentId])\n  @@index([tutorId])\n  @@map("reviews")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// // Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Subject {\n  id         String   @id @default(uuid())\n  name       String   @unique\n  categoryId String\n  createdAt  DateTime @default(now())\n\n  category Category       @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n  tutors   TutorSubject[]\n  bookings Booking[]\n\n  @@index([categoryId])\n  @@map("subjects")\n}\n\nmodel TutorProfiles {\n  id           String   @id @default(uuid())\n  userId       String   @unique\n  bio          String?\n  hourlyRate   Int?\n  categoryId   String?\n  isFeatured   Boolean  @default(false)\n  avgRating    Decimal  @default(0) @db.Decimal(2, 1)\n  totalReviews Int      @default(0)\n  createdAt    DateTime @default(now())\n\n  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  category     Category?      @relation(fields: [categoryId], references: [id])\n  availability Availability[]\n  bookings     Booking[]\n  reviews      Review[]\n  subjects     TutorSubject[]\n\n  @@index([categoryId])\n  @@map("totor_profiles")\n}\n\nmodel TutorSubject {\n  tutorId   String\n  subjectId String\n\n  tutor   TutorProfiles @relation(fields: [tutorId], references: [id])\n  subject Subject       @relation(fields: [subjectId], references: [id])\n\n  @@id([tutorId, subjectId])\n  @@map("tutor_subjects")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"role","kind":"enum","type":"UserRoles"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"tutorProfile","kind":"object","type":"TutorProfiles","relationName":"TutorProfilesToUser"},{"name":"StudentBookings","kind":"object","type":"Booking","relationName":"BookingToUser"},{"name":"studentReviews","kind":"object","type":"Review","relationName":"ReviewToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Availability":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"day","kind":"enum","type":"WeekDay"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"AvailabilityStatus"},{"name":"tutor","kind":"object","type":"TutorProfiles","relationName":"AvailabilityToTutorProfiles"},{"name":"booking","kind":"object","type":"Booking","relationName":"AvailabilityToBooking"}],"dbName":"availability"},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"availabilityId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"price","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"completedAt","kind":"scalar","type":"DateTime"},{"name":"stdudent","kind":"object","type":"User","relationName":"BookingToUser"},{"name":"tutor","kind":"object","type":"TutorProfiles","relationName":"BookingToTutorProfiles"},{"name":"subject","kind":"object","type":"Subject","relationName":"BookingToSubject"},{"name":"availability","kind":"object","type":"Availability","relationName":"AvailabilityToBooking"},{"name":"review","kind":"object","type":"Review","relationName":"BookingToReview"}],"dbName":"bookings"},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"tutors","kind":"object","type":"TutorProfiles","relationName":"CategoryToTutorProfiles"},{"name":"subjects","kind":"object","type":"Subject","relationName":"CategoryToSubject"}],"dbName":"categories"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"review","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Decimal"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"student","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"tutor","kind":"object","type":"TutorProfiles","relationName":"ReviewToTutorProfiles"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToReview"}],"dbName":"reviews"},"Subject":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToSubject"},{"name":"tutors","kind":"object","type":"TutorSubject","relationName":"SubjectToTutorSubject"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToSubject"}],"dbName":"subjects"},"TutorProfiles":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"hourlyRate","kind":"scalar","type":"Int"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"isFeatured","kind":"scalar","type":"Boolean"},{"name":"avgRating","kind":"scalar","type":"Decimal"},{"name":"totalReviews","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfilesToUser"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToTutorProfiles"},{"name":"availability","kind":"object","type":"Availability","relationName":"AvailabilityToTutorProfiles"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToTutorProfiles"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToTutorProfiles"},{"name":"subjects","kind":"object","type":"TutorSubject","relationName":"TutorProfilesToTutorSubject"}],"dbName":"totor_profiles"},"TutorSubject":{"fields":[{"name":"tutorId","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfiles","relationName":"TutorProfilesToTutorSubject"},{"name":"subject","kind":"object","type":"Subject","relationName":"SubjectToTutorSubject"}],"dbName":"tutor_subjects"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","tutors","category","tutor","subject","stdudent","booking","_count","availability","student","review","bookings","subjects","reviews","tutorProfile","StudentBookings","studentReviews","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Availability.findUnique","Availability.findUniqueOrThrow","Availability.findFirst","Availability.findFirstOrThrow","Availability.findMany","Availability.createOne","Availability.createMany","Availability.createManyAndReturn","Availability.updateOne","Availability.updateMany","Availability.updateManyAndReturn","Availability.upsertOne","Availability.deleteOne","Availability.deleteMany","Availability.groupBy","Availability.aggregate","Booking.findUnique","Booking.findUniqueOrThrow","Booking.findFirst","Booking.findFirstOrThrow","Booking.findMany","Booking.createOne","Booking.createMany","Booking.createManyAndReturn","Booking.updateOne","Booking.updateMany","Booking.updateManyAndReturn","Booking.upsertOne","Booking.deleteOne","Booking.deleteMany","_avg","_sum","Booking.groupBy","Booking.aggregate","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","Category.upsertOne","Category.deleteOne","Category.deleteMany","Category.groupBy","Category.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","Subject.findUnique","Subject.findUniqueOrThrow","Subject.findFirst","Subject.findFirstOrThrow","Subject.findMany","Subject.createOne","Subject.createMany","Subject.createManyAndReturn","Subject.updateOne","Subject.updateMany","Subject.updateManyAndReturn","Subject.upsertOne","Subject.deleteOne","Subject.deleteMany","Subject.groupBy","Subject.aggregate","TutorProfiles.findUnique","TutorProfiles.findUniqueOrThrow","TutorProfiles.findFirst","TutorProfiles.findFirstOrThrow","TutorProfiles.findMany","TutorProfiles.createOne","TutorProfiles.createMany","TutorProfiles.createManyAndReturn","TutorProfiles.updateOne","TutorProfiles.updateMany","TutorProfiles.updateManyAndReturn","TutorProfiles.upsertOne","TutorProfiles.deleteOne","TutorProfiles.deleteMany","TutorProfiles.groupBy","TutorProfiles.aggregate","TutorSubject.findUnique","TutorSubject.findUniqueOrThrow","TutorSubject.findFirst","TutorSubject.findFirstOrThrow","TutorSubject.findMany","TutorSubject.createOne","TutorSubject.createMany","TutorSubject.createManyAndReturn","TutorSubject.updateOne","TutorSubject.updateMany","TutorSubject.updateManyAndReturn","TutorSubject.upsertOne","TutorSubject.deleteOne","TutorSubject.deleteMany","TutorSubject.groupBy","TutorSubject.aggregate","AND","OR","NOT","tutorId","subjectId","equals","in","notIn","lt","lte","gt","gte","contains","startsWith","endsWith","not","id","userId","bio","hourlyRate","categoryId","isFeatured","avgRating","totalReviews","createdAt","name","bookingId","studentId","rating","description","every","some","none","availabilityId","BookingStatus","status","price","completedAt","WeekDay","day","startTime","endTime","AvailabilityStatus","identifier","value","expiresAt","updatedAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","email","emailVerified","image","phone","UserRoles","role","UserStatus","tutorId_subjectId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "hgZksAESBAAA-AIAIAUAAPkCACATAAD6AgAgFAAA-wIAIBUAAPwCACDOAQAA9AIAMM8BAAA8ABDQAQAA9AIAMN4BAQAAAAHmAUAA1wIAIecBAQDqAgAh8QEAAPcCkAIi_AFAANcCACGJAgEAAAABigIgAPUCACGLAgEA1gIAIYwCAQDWAgAhjgIAAPYCjgIiAQAAAAEAIAwDAAD_AgAgzgEAAJcDADDPAQAAAwAQ0AEAAJcDADDeAQEA6gIAId8BAQDqAgAh5gFAANcCACH7AUAA1wIAIfwBQADXAgAhhgIBAOoCACGHAgEA1gIAIYgCAQDWAgAhAwMAAKcFACCHAgAAoAMAIIgCAACgAwAgDAMAAP8CACDOAQAAlwMAMM8BAAADABDQAQAAlwMAMN4BAQAAAAHfAQEA6gIAIeYBQADXAgAh-wFAANcCACH8AUAA1wIAIYYCAQAAAAGHAgEA1gIAIYgCAQDWAgAhAwAAAAMAIAEAAAQAMAIAAAUAIBEDAAD_AgAgzgEAAJYDADDPAQAABwAQ0AEAAJYDADDeAQEA6gIAId8BAQDqAgAh5gFAANcCACH8AUAA1wIAIf0BAQDqAgAh_gEBAOoCACH_AQEA1gIAIYACAQDWAgAhgQIBANYCACGCAkAAiAMAIYMCQACIAwAhhAIBANYCACGFAgEA1gIAIQgDAACnBQAg_wEAAKADACCAAgAAoAMAIIECAACgAwAgggIAAKADACCDAgAAoAMAIIQCAACgAwAghQIAAKADACARAwAA_wIAIM4BAACWAwAwzwEAAAcAENABAACWAwAw3gEBAAAAAd8BAQDqAgAh5gFAANcCACH8AUAA1wIAIf0BAQDqAgAh_gEBAOoCACH_AQEA1gIAIYACAQDWAgAhgQIBANYCACGCAkAAiAMAIYMCQACIAwAhhAIBANYCACGFAgEA1gIAIQMAAAAHACABAAAIADACAAAJACASAwAA_wIAIAcAAJQDACANAACVAwAgEAAA-wIAIBEAAJEDACASAAD8AgAgzgEAAJIDADDPAQAACwAQ0AEAAJIDADDeAQEA6gIAId8BAQDqAgAh4AEBANYCACHhAQIAkwMAIeIBAQDWAgAh4wEgAPUCACHkARAA_gIAIeUBAgCHAwAh5gFAANcCACEBAAAACwAgCQYAANgCACARAADZAgAgzgEAANUCADDPAQAADQAQ0AEAANUCADDeAQEA6gIAIeYBQADXAgAh5wEBAOoCACHrAQEA1gIAIQEAAAANACAJAwAApwUAIAcAAKwFACANAACuBQAgEAAApQUAIBEAAK0FACASAACmBQAg4AEAAKADACDhAQAAoAMAIOIBAACgAwAgEgMAAP8CACAHAACUAwAgDQAAlQMAIBAAAPsCACARAACRAwAgEgAA_AIAIM4BAACSAwAwzwEAAAsAENABAACSAwAw3gEBAAAAAd8BAQAAAAHgAQEA1gIAIeEBAgCTAwAh4gEBANYCACHjASAA9QIAIeQBEAD-AgAh5QECAIcDACHmAUAA1wIAIQMAAAALACABAAAPADACAAAQACAKBgAAkQMAIAcAAJADACAQAAD7AgAgzgEAAI8DADDPAQAAEgAQ0AEAAI8DADDeAQEA6gIAIeIBAQDqAgAh5gFAANcCACHnAQEA6gIAIQMGAACtBQAgBwAArAUAIBAAAKUFACAKBgAAkQMAIAcAAJADACAQAAD7AgAgzgEAAI8DADDPAQAAEgAQ0AEAAI8DADDeAQEAAAAB4gEBAOoCACHmAUAA1wIAIecBAQAAAAEDAAAAEgAgAQAAEwAwAgAAFAAgBwgAAIADACAJAACOAwAgzgEAAI0DADDPAQAAFgAQ0AEAAI0DADDRAQEA6gIAIdIBAQDqAgAhAggAAKQFACAJAACpBQAgCAgAAIADACAJAACOAwAgzgEAAI0DADDPAQAAFgAQ0AEAAI0DADDRAQEA6gIAIdIBAQDqAgAhkAIAAIwDACADAAAAFgAgAQAAFwAwAgAAGAAgEQgAAIADACAJAACJAwAgCgAA_wIAIA0AAIoDACAPAACLAwAgzgEAAIUDADDPAQAAGgAQ0AEAAIUDADDRAQEA6gIAIdIBAQDWAgAh3gEBAOoCACHmAUAA1wIAIekBAQDqAgAh7wEBANYCACHxAQAAhgPxASLyAQIAhwMAIfMBQACIAwAhCAgAAKQFACAJAACpBQAgCgAApwUAIA0AAKoFACAPAACrBQAg0gEAAKADACDvAQAAoAMAIPMBAACgAwAgEQgAAIADACAJAACJAwAgCgAA_wIAIA0AAIoDACAPAACLAwAgzgEAAIUDADDPAQAAGgAQ0AEAAIUDADDRAQEA6gIAIdIBAQDWAgAh3gEBAAAAAeYBQADXAgAh6QEBAOoCACHvAQEA1gIAIfEBAACGA_EBIvIBAgCHAwAh8wFAAIgDACEDAAAAGgAgAQAAGwAwAgAAHAAgAQAAABIAIAsIAACAAwAgCwAA-wIAIM4BAACCAwAwzwEAAB8AENABAACCAwAw0QEBAOoCACHeAQEA6gIAIfEBAACEA_kBIvUBAACDA_UBIvYBAQDqAgAh9wEBAOoCACEBAAAAHwAgAwAAABoAIAEAABsAMAIAABwAIAEAAAAaACANCAAAgAMAIAsAAIEDACAOAAD_AgAgDwEA6gIAIc4BAAD9AgAwzwEAACMAENABAAD9AgAw0QEBAOoCACHeAQEA6gIAIeYBQADXAgAh6AEBAOoCACHpAQEA6gIAIeoBEAD-AgAhAQAAACMAIAEAAAAWACABAAAAGgAgAQAAAAsAIAEAAAASACACCAAApAUAIAsAAKUFACALCAAAgAMAIAsAAPsCACDOAQAAggMAMM8BAAAfABDQAQAAggMAMNEBAQDqAgAh3gEBAAAAAfEBAACEA_kBIvUBAACDA_UBIvYBAQDqAgAh9wEBAOoCACEDAAAAHwAgAQAAKQAwAgAAKgAgAwAAABoAIAEAABsAMAIAABwAIAMIAACkBQAgCwAAqAUAIA4AAKcFACANCAAAgAMAIAsAAIEDACAOAAD_AgAgDwEA6gIAIc4BAAD9AgAwzwEAACMAENABAAD9AgAw0QEBAOoCACHeAQEAAAAB5gFAANcCACHoAQEAAAAB6QEBAOoCACHqARAA_gIAIQMAAAAjACABAAAtADACAAAuACADAAAAFgAgAQAAFwAwAgAAGAAgAQAAAB8AIAEAAAAaACABAAAAIwAgAQAAABYAIAMAAAAaACABAAAbADACAAAcACADAAAAIwAgAQAALQAwAgAALgAgAQAAAAMAIAEAAAAHACABAAAAGgAgAQAAACMAIAEAAAABACASBAAA-AIAIAUAAPkCACATAAD6AgAgFAAA-wIAIBUAAPwCACDOAQAA9AIAMM8BAAA8ABDQAQAA9AIAMN4BAQDqAgAh5gFAANcCACHnAQEA6gIAIfEBAAD3ApACIvwBQADXAgAhiQIBAOoCACGKAiAA9QIAIYsCAQDWAgAhjAIBANYCACGOAgAA9gKOAiIHBAAAogUAIAUAAKMFACATAACkBQAgFAAApQUAIBUAAKYFACCLAgAAoAMAIIwCAACgAwAgAwAAADwAIAEAAD0AMAIAAAEAIAMAAAA8ACABAAA9ADACAAABACADAAAAPAAgAQAAPQAwAgAAAQAgDwQAAJ0FACAFAACeBQAgEwAAnwUAIBQAAKAFACAVAAChBQAg3gEBAAAAAeYBQAAAAAHnAQEAAAAB8QEAAACQAgL8AUAAAAABiQIBAAAAAYoCIAAAAAGLAgEAAAABjAIBAAAAAY4CAAAAjgICARsAAEEAIAreAQEAAAAB5gFAAAAAAecBAQAAAAHxAQAAAJACAvwBQAAAAAGJAgEAAAABigIgAAAAAYsCAQAAAAGMAgEAAAABjgIAAACOAgIBGwAAQwAwARsAAEMAMA8EAADpBAAgBQAA6gQAIBMAAOsEACAUAADsBAAgFQAA7QQAIN4BAQCbAwAh5gFAAKsDACHnAQEAmwMAIfEBAADoBJACIvwBQACrAwAhiQIBAJsDACGKAiAAqAMAIYsCAQCmAwAhjAIBAKYDACGOAgAA5wSOAiICAAAAAQAgGwAARgAgCt4BAQCbAwAh5gFAAKsDACHnAQEAmwMAIfEBAADoBJACIvwBQACrAwAhiQIBAJsDACGKAiAAqAMAIYsCAQCmAwAhjAIBAKYDACGOAgAA5wSOAiICAAAAPAAgGwAASAAgAgAAADwAIBsAAEgAIAMAAAABACAiAABBACAjAABGACABAAAAAQAgAQAAADwAIAUMAADkBAAgKAAA5gQAICkAAOUEACCLAgAAoAMAIIwCAACgAwAgDc4BAADtAgAwzwEAAE8AENABAADtAgAw3gEBALoCACHmAUAAxAIAIecBAQC6AgAh8QEAAO8CkAIi_AFAAMQCACGJAgEAugIAIYoCIADBAgAhiwIBAL8CACGMAgEAvwIAIY4CAADuAo4CIgMAAAA8ACABAABOADAnAABPACADAAAAPAAgAQAAPQAwAgAAAQAgAQAAAAUAIAEAAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACAJAwAA4wQAIN4BAQAAAAHfAQEAAAAB5gFAAAAAAfsBQAAAAAH8AUAAAAABhgIBAAAAAYcCAQAAAAGIAgEAAAABARsAAFcAIAjeAQEAAAAB3wEBAAAAAeYBQAAAAAH7AUAAAAAB_AFAAAAAAYYCAQAAAAGHAgEAAAABiAIBAAAAAQEbAABZADABGwAAWQAwCQMAAOIEACDeAQEAmwMAId8BAQCbAwAh5gFAAKsDACH7AUAAqwMAIfwBQACrAwAhhgIBAJsDACGHAgEApgMAIYgCAQCmAwAhAgAAAAUAIBsAAFwAIAjeAQEAmwMAId8BAQCbAwAh5gFAAKsDACH7AUAAqwMAIfwBQACrAwAhhgIBAJsDACGHAgEApgMAIYgCAQCmAwAhAgAAAAMAIBsAAF4AIAIAAAADACAbAABeACADAAAABQAgIgAAVwAgIwAAXAAgAQAAAAUAIAEAAAADACAFDAAA3wQAICgAAOEEACApAADgBAAghwIAAKADACCIAgAAoAMAIAvOAQAA7AIAMM8BAABlABDQAQAA7AIAMN4BAQC6AgAh3wEBALoCACHmAUAAxAIAIfsBQADEAgAh_AFAAMQCACGGAgEAugIAIYcCAQC_AgAhiAIBAL8CACEDAAAAAwAgAQAAZAAwJwAAZQAgAwAAAAMAIAEAAAQAMAIAAAUAIAEAAAAJACABAAAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgDgMAAN4EACDeAQEAAAAB3wEBAAAAAeYBQAAAAAH8AUAAAAAB_QEBAAAAAf4BAQAAAAH_AQEAAAABgAIBAAAAAYECAQAAAAGCAkAAAAABgwJAAAAAAYQCAQAAAAGFAgEAAAABARsAAG0AIA3eAQEAAAAB3wEBAAAAAeYBQAAAAAH8AUAAAAAB_QEBAAAAAf4BAQAAAAH_AQEAAAABgAIBAAAAAYECAQAAAAGCAkAAAAABgwJAAAAAAYQCAQAAAAGFAgEAAAABARsAAG8AMAEbAABvADAOAwAA3QQAIN4BAQCbAwAh3wEBAJsDACHmAUAAqwMAIfwBQACrAwAh_QEBAJsDACH-AQEAmwMAIf8BAQCmAwAhgAIBAKYDACGBAgEApgMAIYICQADZAwAhgwJAANkDACGEAgEApgMAIYUCAQCmAwAhAgAAAAkAIBsAAHIAIA3eAQEAmwMAId8BAQCbAwAh5gFAAKsDACH8AUAAqwMAIf0BAQCbAwAh_gEBAJsDACH_AQEApgMAIYACAQCmAwAhgQIBAKYDACGCAkAA2QMAIYMCQADZAwAhhAIBAKYDACGFAgEApgMAIQIAAAAHACAbAAB0ACACAAAABwAgGwAAdAAgAwAAAAkAICIAAG0AICMAAHIAIAEAAAAJACABAAAABwAgCgwAANoEACAoAADcBAAgKQAA2wQAIP8BAACgAwAggAIAAKADACCBAgAAoAMAIIICAACgAwAggwIAAKADACCEAgAAoAMAIIUCAACgAwAgEM4BAADrAgAwzwEAAHsAENABAADrAgAw3gEBALoCACHfAQEAugIAIeYBQADEAgAh_AFAAMQCACH9AQEAugIAIf4BAQC6AgAh_wEBAL8CACGAAgEAvwIAIYECAQC_AgAhggJAANwCACGDAkAA3AIAIYQCAQC_AgAhhQIBAL8CACEDAAAABwAgAQAAegAwJwAAewAgAwAAAAcAIAEAAAgAMAIAAAkAIAnOAQAA6QIAMM8BAACBAQAQ0AEAAOkCADDeAQEAAAAB5gFAANcCACH5AQEA6gIAIfoBAQDqAgAh-wFAANcCACH8AUAA1wIAIQEAAAB-ACABAAAAfgAgCc4BAADpAgAwzwEAAIEBABDQAQAA6QIAMN4BAQDqAgAh5gFAANcCACH5AQEA6gIAIfoBAQDqAgAh-wFAANcCACH8AUAA1wIAIQADAAAAgQEAIAEAAIIBADACAAB-ACADAAAAgQEAIAEAAIIBADACAAB-ACADAAAAgQEAIAEAAIIBADACAAB-ACAG3gEBAAAAAeYBQAAAAAH5AQEAAAAB-gEBAAAAAfsBQAAAAAH8AUAAAAABARsAAIYBACAG3gEBAAAAAeYBQAAAAAH5AQEAAAAB-gEBAAAAAfsBQAAAAAH8AUAAAAABARsAAIgBADABGwAAiAEAMAbeAQEAmwMAIeYBQACrAwAh-QEBAJsDACH6AQEAmwMAIfsBQACrAwAh_AFAAKsDACECAAAAfgAgGwAAiwEAIAbeAQEAmwMAIeYBQACrAwAh-QEBAJsDACH6AQEAmwMAIfsBQACrAwAh_AFAAKsDACECAAAAgQEAIBsAAI0BACACAAAAgQEAIBsAAI0BACADAAAAfgAgIgAAhgEAICMAAIsBACABAAAAfgAgAQAAAIEBACADDAAA1wQAICgAANkEACApAADYBAAgCc4BAADoAgAwzwEAAJQBABDQAQAA6AIAMN4BAQC6AgAh5gFAAMQCACH5AQEAugIAIfoBAQC6AgAh-wFAAMQCACH8AUAAxAIAIQMAAACBAQAgAQAAkwEAMCcAAJQBACADAAAAgQEAIAEAAIIBADACAAB-ACABAAAAKgAgAQAAACoAIAMAAAAfACABAAApADACAAAqACADAAAAHwAgAQAAKQAwAgAAKgAgAwAAAB8AIAEAACkAMAIAACoAIAgIAADWBAAgCwAAhQQAINEBAQAAAAHeAQEAAAAB8QEAAAD5AQL1AQAAAPUBAvYBAQAAAAH3AQEAAAABARsAAJwBACAG0QEBAAAAAd4BAQAAAAHxAQAAAPkBAvUBAAAA9QEC9gEBAAAAAfcBAQAAAAEBGwAAngEAMAEbAACeAQAwCAgAANUEACALAAD4AwAg0QEBAJsDACHeAQEAmwMAIfEBAAD2A_kBIvUBAAD1A_UBIvYBAQCbAwAh9wEBAJsDACECAAAAKgAgGwAAoQEAIAbRAQEAmwMAId4BAQCbAwAh8QEAAPYD-QEi9QEAAPUD9QEi9gEBAJsDACH3AQEAmwMAIQIAAAAfACAbAACjAQAgAgAAAB8AIBsAAKMBACADAAAAKgAgIgAAnAEAICMAAKEBACABAAAAKgAgAQAAAB8AIAMMAADSBAAgKAAA1AQAICkAANMEACAJzgEAAOECADDPAQAAqgEAENABAADhAgAw0QEBALoCACHeAQEAugIAIfEBAADjAvkBIvUBAADiAvUBIvYBAQC6AgAh9wEBALoCACEDAAAAHwAgAQAAqQEAMCcAAKoBACADAAAAHwAgAQAAKQAwAgAAKgAgAQAAABwAIAEAAAAcACADAAAAGgAgAQAAGwAwAgAAHAAgAwAAABoAIAEAABsAMAIAABwAIAMAAAAaACABAAAbADACAAAcACAOCAAAgwQAIAkAAOgDACAKAADnAwAgDQAA6QMAIA8AAOoDACDRAQEAAAAB0gEBAAAAAd4BAQAAAAHmAUAAAAAB6QEBAAAAAe8BAQAAAAHxAQAAAPEBAvIBAgAAAAHzAUAAAAABARsAALIBACAJ0QEBAAAAAdIBAQAAAAHeAQEAAAAB5gFAAAAAAekBAQAAAAHvAQEAAAAB8QEAAADxAQLyAQIAAAAB8wFAAAAAAQEbAAC0AQAwARsAALQBADABAAAAEgAgAQAAAB8AIA4IAACBBAAgCQAA3AMAIAoAANsDACANAADdAwAgDwAA3gMAINEBAQCbAwAh0gEBAKYDACHeAQEAmwMAIeYBQACrAwAh6QEBAJsDACHvAQEApgMAIfEBAADYA_EBIvIBAgCqAwAh8wFAANkDACECAAAAHAAgGwAAuQEAIAnRAQEAmwMAIdIBAQCmAwAh3gEBAJsDACHmAUAAqwMAIekBAQCbAwAh7wEBAKYDACHxAQAA2APxASLyAQIAqgMAIfMBQADZAwAhAgAAABoAIBsAALsBACACAAAAGgAgGwAAuwEAIAEAAAASACABAAAAHwAgAwAAABwAICIAALIBACAjAAC5AQAgAQAAABwAIAEAAAAaACAIDAAAzQQAICgAANAEACApAADPBAAgegAAzgQAIHsAANEEACDSAQAAoAMAIO8BAACgAwAg8wEAAKADACAMzgEAANoCADDPAQAAxAEAENABAADaAgAw0QEBALoCACHSAQEAvwIAId4BAQC6AgAh5gFAAMQCACHpAQEAugIAIe8BAQC_AgAh8QEAANsC8QEi8gECAMMCACHzAUAA3AIAIQMAAAAaACABAADDAQAwJwAAxAEAIAMAAAAaACABAAAbADACAAAcACAJBgAA2AIAIBEAANkCACDOAQAA1QIAMM8BAAANABDQAQAA1QIAMN4BAQAAAAHmAUAA1wIAIecBAQAAAAHrAQEA1gIAIQEAAADHAQAgAQAAAMcBACADBgAAywQAIBEAAMwEACDrAQAAoAMAIAMAAAANACABAADKAQAwAgAAxwEAIAMAAAANACABAADKAQAwAgAAxwEAIAMAAAANACABAADKAQAwAgAAxwEAIAYGAADJBAAgEQAAygQAIN4BAQAAAAHmAUAAAAAB5wEBAAAAAesBAQAAAAEBGwAAzgEAIATeAQEAAAAB5gFAAAAAAecBAQAAAAHrAQEAAAABARsAANABADABGwAA0AEAMAYGAACvBAAgEQAAsAQAIN4BAQCbAwAh5gFAAKsDACHnAQEAmwMAIesBAQCmAwAhAgAAAMcBACAbAADTAQAgBN4BAQCbAwAh5gFAAKsDACHnAQEAmwMAIesBAQCmAwAhAgAAAA0AIBsAANUBACACAAAADQAgGwAA1QEAIAMAAADHAQAgIgAAzgEAICMAANMBACABAAAAxwEAIAEAAAANACAEDAAArAQAICgAAK4EACApAACtBAAg6wEAAKADACAHzgEAANQCADDPAQAA3AEAENABAADUAgAw3gEBALoCACHmAUAAxAIAIecBAQC6AgAh6wEBAL8CACEDAAAADQAgAQAA2wEAMCcAANwBACADAAAADQAgAQAAygEAMAIAAMcBACABAAAALgAgAQAAAC4AIAMAAAAjACABAAAtADACAAAuACADAAAAIwAgAQAALQAwAgAALgAgAwAAACMAIAEAAC0AMAIAAC4AIAoIAADlAwAgCwAAzQMAIA4AAMwDACAPAQAAAAHRAQEAAAAB3gEBAAAAAeYBQAAAAAHoAQEAAAAB6QEBAAAAAeoBEAAAAAEBGwAA5AEAIAcPAQAAAAHRAQEAAAAB3gEBAAAAAeYBQAAAAAHoAQEAAAAB6QEBAAAAAeoBEAAAAAEBGwAA5gEAMAEbAADmAQAwCggAAOQDACALAADKAwAgDgAAyQMAIA8BAJsDACHRAQEAmwMAId4BAQCbAwAh5gFAAKsDACHoAQEAmwMAIekBAQCbAwAh6gEQAKkDACECAAAALgAgGwAA6QEAIAcPAQCbAwAh0QEBAJsDACHeAQEAmwMAIeYBQACrAwAh6AEBAJsDACHpAQEAmwMAIeoBEACpAwAhAgAAACMAIBsAAOsBACACAAAAIwAgGwAA6wEAIAMAAAAuACAiAADkAQAgIwAA6QEAIAEAAAAuACABAAAAIwAgBQwAAKcEACAoAACqBAAgKQAAqQQAIHoAAKgEACB7AACrBAAgCg8BALoCACHOAQAA0wIAMM8BAADyAQAQ0AEAANMCADDRAQEAugIAId4BAQC6AgAh5gFAAMQCACHoAQEAugIAIekBAQC6AgAh6gEQAMICACEDAAAAIwAgAQAA8QEAMCcAAPIBACADAAAAIwAgAQAALQAwAgAALgAgAQAAABQAIAEAAAAUACADAAAAEgAgAQAAEwAwAgAAFAAgAwAAABIAIAEAABMAMAIAABQAIAMAAAASACABAAATADACAAAUACAHBgAApQQAIAcAAKQEACAQAACmBAAg3gEBAAAAAeIBAQAAAAHmAUAAAAAB5wEBAAAAAQEbAAD6AQAgBN4BAQAAAAHiAQEAAAAB5gFAAAAAAecBAQAAAAEBGwAA_AEAMAEbAAD8AQAwBwYAAJAEACAHAACPBAAgEAAAkQQAIN4BAQCbAwAh4gEBAJsDACHmAUAAqwMAIecBAQCbAwAhAgAAABQAIBsAAP8BACAE3gEBAJsDACHiAQEAmwMAIeYBQACrAwAh5wEBAJsDACECAAAAEgAgGwAAgQIAIAIAAAASACAbAACBAgAgAwAAABQAICIAAPoBACAjAAD_AQAgAQAAABQAIAEAAAASACADDAAAjAQAICgAAI4EACApAACNBAAgB84BAADSAgAwzwEAAIgCABDQAQAA0gIAMN4BAQC6AgAh4gEBALoCACHmAUAAxAIAIecBAQC6AgAhAwAAABIAIAEAAIcCADAnAACIAgAgAwAAABIAIAEAABMAMAIAABQAIAEAAAAQACABAAAAEAAgAwAAAAsAIAEAAA8AMAIAABAAIAMAAAALACABAAAPADACAAAQACADAAAACwAgAQAADwAwAgAAEAAgDwMAAIYEACAHAACHBAAgDQAAiAQAIBAAAIkEACARAACLBAAgEgAAigQAIN4BAQAAAAHfAQEAAAAB4AEBAAAAAeEBAgAAAAHiAQEAAAAB4wEgAAAAAeQBEAAAAAHlAQIAAAAB5gFAAAAAAQEbAACQAgAgCd4BAQAAAAHfAQEAAAAB4AEBAAAAAeEBAgAAAAHiAQEAAAAB4wEgAAAAAeQBEAAAAAHlAQIAAAAB5gFAAAAAAQEbAACSAgAwARsAAJICADABAAAADQAgDwMAAKwDACAHAACtAwAgDQAArgMAIBAAAK8DACARAACxAwAgEgAAsAMAIN4BAQCbAwAh3wEBAJsDACHgAQEApgMAIeEBAgCnAwAh4gEBAKYDACHjASAAqAMAIeQBEACpAwAh5QECAKoDACHmAUAAqwMAIQIAAAAQACAbAACWAgAgCd4BAQCbAwAh3wEBAJsDACHgAQEApgMAIeEBAgCnAwAh4gEBAKYDACHjASAAqAMAIeQBEACpAwAh5QECAKoDACHmAUAAqwMAIQIAAAALACAbAACYAgAgAgAAAAsAIBsAAJgCACABAAAADQAgAwAAABAAICIAAJACACAjAACWAgAgAQAAABAAIAEAAAALACAIDAAAoQMAICgAAKQDACApAACjAwAgegAAogMAIHsAAKUDACDgAQAAoAMAIOEBAACgAwAg4gEAAKADACAMzgEAAL4CADDPAQAAoAIAENABAAC-AgAw3gEBALoCACHfAQEAugIAIeABAQC_AgAh4QECAMACACHiAQEAvwIAIeMBIADBAgAh5AEQAMICACHlAQIAwwIAIeYBQADEAgAhAwAAAAsAIAEAAJ8CADAnAACgAgAgAwAAAAsAIAEAAA8AMAIAABAAIAEAAAAYACABAAAAGAAgAwAAABYAIAEAABcAMAIAABgAIAMAAAAWACABAAAXADACAAAYACADAAAAFgAgAQAAFwAwAgAAGAAgBAgAAJ4DACAJAACfAwAg0QEBAAAAAdIBAQAAAAEBGwAAqAIAIALRAQEAAAAB0gEBAAAAAQEbAACqAgAwARsAAKoCADAECAAAnAMAIAkAAJ0DACDRAQEAmwMAIdIBAQCbAwAhAgAAABgAIBsAAK0CACAC0QEBAJsDACHSAQEAmwMAIQIAAAAWACAbAACvAgAgAgAAABYAIBsAAK8CACADAAAAGAAgIgAAqAIAICMAAK0CACABAAAAGAAgAQAAABYAIAMMAACYAwAgKAAAmgMAICkAAJkDACAFzgEAALkCADDPAQAAtgIAENABAAC5AgAw0QEBALoCACHSAQEAugIAIQMAAAAWACABAAC1AgAwJwAAtgIAIAMAAAAWACABAAAXADACAAAYACAFzgEAALkCADDPAQAAtgIAENABAAC5AgAw0QEBALoCACHSAQEAugIAIQ4MAAC8AgAgKAAAvQIAICkAAL0CACDTAQEAAAAB1AEBAAAABNUBAQAAAATWAQEAAAAB1wEBAAAAAdgBAQAAAAHZAQEAAAAB2gEBAAAAAdsBAQAAAAHcAQEAAAAB3QEBALsCACEODAAAvAIAICgAAL0CACApAAC9AgAg0wEBAAAAAdQBAQAAAATVAQEAAAAE1gEBAAAAAdcBAQAAAAHYAQEAAAAB2QEBAAAAAdoBAQAAAAHbAQEAAAAB3AEBAAAAAd0BAQC7AgAhCNMBAgAAAAHUAQIAAAAE1QECAAAABNYBAgAAAAHXAQIAAAAB2AECAAAAAdkBAgAAAAHdAQIAvAIAIQvTAQEAAAAB1AEBAAAABNUBAQAAAATWAQEAAAAB1wEBAAAAAdgBAQAAAAHZAQEAAAAB2gEBAAAAAdsBAQAAAAHcAQEAAAAB3QEBAL0CACEMzgEAAL4CADDPAQAAoAIAENABAAC-AgAw3gEBALoCACHfAQEAugIAIeABAQC_AgAh4QECAMACACHiAQEAvwIAIeMBIADBAgAh5AEQAMICACHlAQIAwwIAIeYBQADEAgAhDgwAAM4CACAoAADRAgAgKQAA0QIAINMBAQAAAAHUAQEAAAAF1QEBAAAABdYBAQAAAAHXAQEAAAAB2AEBAAAAAdkBAQAAAAHaAQEAAAAB2wEBAAAAAdwBAQAAAAHdAQEA0AIAIQ0MAADOAgAgKAAAzgIAICkAAM4CACB6AADPAgAgewAAzgIAINMBAgAAAAHUAQIAAAAF1QECAAAABdYBAgAAAAHXAQIAAAAB2AECAAAAAdkBAgAAAAHdAQIAzQIAIQUMAAC8AgAgKAAAzAIAICkAAMwCACDTASAAAAAB3QEgAMsCACENDAAAvAIAICgAAMoCACApAADKAgAgegAAygIAIHsAAMoCACDTARAAAAAB1AEQAAAABNUBEAAAAATWARAAAAAB1wEQAAAAAdgBEAAAAAHZARAAAAAB3QEQAMkCACENDAAAvAIAICgAALwCACApAAC8AgAgegAAyAIAIHsAALwCACDTAQIAAAAB1AECAAAABNUBAgAAAATWAQIAAAAB1wECAAAAAdgBAgAAAAHZAQIAAAAB3QECAMcCACELDAAAvAIAICgAAMYCACApAADGAgAg0wFAAAAAAdQBQAAAAATVAUAAAAAE1gFAAAAAAdcBQAAAAAHYAUAAAAAB2QFAAAAAAd0BQADFAgAhCwwAALwCACAoAADGAgAgKQAAxgIAINMBQAAAAAHUAUAAAAAE1QFAAAAABNYBQAAAAAHXAUAAAAAB2AFAAAAAAdkBQAAAAAHdAUAAxQIAIQjTAUAAAAAB1AFAAAAABNUBQAAAAATWAUAAAAAB1wFAAAAAAdgBQAAAAAHZAUAAAAAB3QFAAMYCACENDAAAvAIAICgAALwCACApAAC8AgAgegAAyAIAIHsAALwCACDTAQIAAAAB1AECAAAABNUBAgAAAATWAQIAAAAB1wECAAAAAdgBAgAAAAHZAQIAAAAB3QECAMcCACEI0wEIAAAAAdQBCAAAAATVAQgAAAAE1gEIAAAAAdcBCAAAAAHYAQgAAAAB2QEIAAAAAd0BCADIAgAhDQwAALwCACAoAADKAgAgKQAAygIAIHoAAMoCACB7AADKAgAg0wEQAAAAAdQBEAAAAATVARAAAAAE1gEQAAAAAdcBEAAAAAHYARAAAAAB2QEQAAAAAd0BEADJAgAhCNMBEAAAAAHUARAAAAAE1QEQAAAABNYBEAAAAAHXARAAAAAB2AEQAAAAAdkBEAAAAAHdARAAygIAIQUMAAC8AgAgKAAAzAIAICkAAMwCACDTASAAAAAB3QEgAMsCACEC0wEgAAAAAd0BIADMAgAhDQwAAM4CACAoAADOAgAgKQAAzgIAIHoAAM8CACB7AADOAgAg0wECAAAAAdQBAgAAAAXVAQIAAAAF1gECAAAAAdcBAgAAAAHYAQIAAAAB2QECAAAAAd0BAgDNAgAhCNMBAgAAAAHUAQIAAAAF1QECAAAABdYBAgAAAAHXAQIAAAAB2AECAAAAAdkBAgAAAAHdAQIAzgIAIQjTAQgAAAAB1AEIAAAABdUBCAAAAAXWAQgAAAAB1wEIAAAAAdgBCAAAAAHZAQgAAAAB3QEIAM8CACEODAAAzgIAICgAANECACApAADRAgAg0wEBAAAAAdQBAQAAAAXVAQEAAAAF1gEBAAAAAdcBAQAAAAHYAQEAAAAB2QEBAAAAAdoBAQAAAAHbAQEAAAAB3AEBAAAAAd0BAQDQAgAhC9MBAQAAAAHUAQEAAAAF1QEBAAAABdYBAQAAAAHXAQEAAAAB2AEBAAAAAdkBAQAAAAHaAQEAAAAB2wEBAAAAAdwBAQAAAAHdAQEA0QIAIQfOAQAA0gIAMM8BAACIAgAQ0AEAANICADDeAQEAugIAIeIBAQC6AgAh5gFAAMQCACHnAQEAugIAIQoPAQC6AgAhzgEAANMCADDPAQAA8gEAENABAADTAgAw0QEBALoCACHeAQEAugIAIeYBQADEAgAh6AEBALoCACHpAQEAugIAIeoBEADCAgAhB84BAADUAgAwzwEAANwBABDQAQAA1AIAMN4BAQC6AgAh5gFAAMQCACHnAQEAugIAIesBAQC_AgAhCQYAANgCACARAADZAgAgzgEAANUCADDPAQAADQAQ0AEAANUCADDeAQEA6gIAIeYBQADXAgAh5wEBAOoCACHrAQEA1gIAIQvTAQEAAAAB1AEBAAAABdUBAQAAAAXWAQEAAAAB1wEBAAAAAdgBAQAAAAHZAQEAAAAB2gEBAAAAAdsBAQAAAAHcAQEAAAAB3QEBANECACEI0wFAAAAAAdQBQAAAAATVAUAAAAAE1gFAAAAAAdcBQAAAAAHYAUAAAAAB2QFAAAAAAd0BQADGAgAhA-wBAAALACDtAQAACwAg7gEAAAsAIAPsAQAAEgAg7QEAABIAIO4BAAASACAMzgEAANoCADDPAQAAxAEAENABAADaAgAw0QEBALoCACHSAQEAvwIAId4BAQC6AgAh5gFAAMQCACHpAQEAugIAIe8BAQC_AgAh8QEAANsC8QEi8gECAMMCACHzAUAA3AIAIQcMAAC8AgAgKAAA4AIAICkAAOACACDTAQAAAPEBAtQBAAAA8QEI1QEAAADxAQjdAQAA3wLxASILDAAAzgIAICgAAN4CACApAADeAgAg0wFAAAAAAdQBQAAAAAXVAUAAAAAF1gFAAAAAAdcBQAAAAAHYAUAAAAAB2QFAAAAAAd0BQADdAgAhCwwAAM4CACAoAADeAgAgKQAA3gIAINMBQAAAAAHUAUAAAAAF1QFAAAAABdYBQAAAAAHXAUAAAAAB2AFAAAAAAdkBQAAAAAHdAUAA3QIAIQjTAUAAAAAB1AFAAAAABdUBQAAAAAXWAUAAAAAB1wFAAAAAAdgBQAAAAAHZAUAAAAAB3QFAAN4CACEHDAAAvAIAICgAAOACACApAADgAgAg0wEAAADxAQLUAQAAAPEBCNUBAAAA8QEI3QEAAN8C8QEiBNMBAAAA8QEC1AEAAADxAQjVAQAAAPEBCN0BAADgAvEBIgnOAQAA4QIAMM8BAACqAQAQ0AEAAOECADDRAQEAugIAId4BAQC6AgAh8QEAAOMC-QEi9QEAAOIC9QEi9gEBALoCACH3AQEAugIAIQcMAAC8AgAgKAAA5wIAICkAAOcCACDTAQAAAPUBAtQBAAAA9QEI1QEAAAD1AQjdAQAA5gL1ASIHDAAAvAIAICgAAOUCACApAADlAgAg0wEAAAD5AQLUAQAAAPkBCNUBAAAA-QEI3QEAAOQC-QEiBwwAALwCACAoAADlAgAgKQAA5QIAINMBAAAA-QEC1AEAAAD5AQjVAQAAAPkBCN0BAADkAvkBIgTTAQAAAPkBAtQBAAAA-QEI1QEAAAD5AQjdAQAA5QL5ASIHDAAAvAIAICgAAOcCACApAADnAgAg0wEAAAD1AQLUAQAAAPUBCNUBAAAA9QEI3QEAAOYC9QEiBNMBAAAA9QEC1AEAAAD1AQjVAQAAAPUBCN0BAADnAvUBIgnOAQAA6AIAMM8BAACUAQAQ0AEAAOgCADDeAQEAugIAIeYBQADEAgAh-QEBALoCACH6AQEAugIAIfsBQADEAgAh_AFAAMQCACEJzgEAAOkCADDPAQAAgQEAENABAADpAgAw3gEBAOoCACHmAUAA1wIAIfkBAQDqAgAh-gEBAOoCACH7AUAA1wIAIfwBQADXAgAhC9MBAQAAAAHUAQEAAAAE1QEBAAAABNYBAQAAAAHXAQEAAAAB2AEBAAAAAdkBAQAAAAHaAQEAAAAB2wEBAAAAAdwBAQAAAAHdAQEAvQIAIRDOAQAA6wIAMM8BAAB7ABDQAQAA6wIAMN4BAQC6AgAh3wEBALoCACHmAUAAxAIAIfwBQADEAgAh_QEBALoCACH-AQEAugIAIf8BAQC_AgAhgAIBAL8CACGBAgEAvwIAIYICQADcAgAhgwJAANwCACGEAgEAvwIAIYUCAQC_AgAhC84BAADsAgAwzwEAAGUAENABAADsAgAw3gEBALoCACHfAQEAugIAIeYBQADEAgAh-wFAAMQCACH8AUAAxAIAIYYCAQC6AgAhhwIBAL8CACGIAgEAvwIAIQ3OAQAA7QIAMM8BAABPABDQAQAA7QIAMN4BAQC6AgAh5gFAAMQCACHnAQEAugIAIfEBAADvApACIvwBQADEAgAhiQIBALoCACGKAiAAwQIAIYsCAQC_AgAhjAIBAL8CACGOAgAA7gKOAiIHDAAAvAIAICgAAPMCACApAADzAgAg0wEAAACOAgLUAQAAAI4CCNUBAAAAjgII3QEAAPICjgIiBwwAALwCACAoAADxAgAgKQAA8QIAINMBAAAAkAIC1AEAAACQAgjVAQAAAJACCN0BAADwApACIgcMAAC8AgAgKAAA8QIAICkAAPECACDTAQAAAJACAtQBAAAAkAII1QEAAACQAgjdAQAA8AKQAiIE0wEAAACQAgLUAQAAAJACCNUBAAAAkAII3QEAAPECkAIiBwwAALwCACAoAADzAgAgKQAA8wIAINMBAAAAjgIC1AEAAACOAgjVAQAAAI4CCN0BAADyAo4CIgTTAQAAAI4CAtQBAAAAjgII1QEAAACOAgjdAQAA8wKOAiISBAAA-AIAIAUAAPkCACATAAD6AgAgFAAA-wIAIBUAAPwCACDOAQAA9AIAMM8BAAA8ABDQAQAA9AIAMN4BAQDqAgAh5gFAANcCACHnAQEA6gIAIfEBAAD3ApACIvwBQADXAgAhiQIBAOoCACGKAiAA9QIAIYsCAQDWAgAhjAIBANYCACGOAgAA9gKOAiIC0wEgAAAAAd0BIADMAgAhBNMBAAAAjgIC1AEAAACOAgjVAQAAAI4CCN0BAADzAo4CIgTTAQAAAJACAtQBAAAAkAII1QEAAACQAgjdAQAA8QKQAiID7AEAAAMAIO0BAAADACDuAQAAAwAgA-wBAAAHACDtAQAABwAg7gEAAAcAIBQDAAD_AgAgBwAAlAMAIA0AAJUDACAQAAD7AgAgEQAAkQMAIBIAAPwCACDOAQAAkgMAMM8BAAALABDQAQAAkgMAMN4BAQDqAgAh3wEBAOoCACHgAQEA1gIAIeEBAgCTAwAh4gEBANYCACHjASAA9QIAIeQBEAD-AgAh5QECAIcDACHmAUAA1wIAIZECAAALACCSAgAACwAgA-wBAAAaACDtAQAAGgAg7gEAABoAIAPsAQAAIwAg7QEAACMAIO4BAAAjACANCAAAgAMAIAsAAIEDACAOAAD_AgAgDwEA6gIAIc4BAAD9AgAwzwEAACMAENABAAD9AgAw0QEBAOoCACHeAQEA6gIAIeYBQADXAgAh6AEBAOoCACHpAQEA6gIAIeoBEAD-AgAhCNMBEAAAAAHUARAAAAAE1QEQAAAABNYBEAAAAAHXARAAAAAB2AEQAAAAAdkBEAAAAAHdARAAygIAIRQEAAD4AgAgBQAA-QIAIBMAAPoCACAUAAD7AgAgFQAA_AIAIM4BAAD0AgAwzwEAADwAENABAAD0AgAw3gEBAOoCACHmAUAA1wIAIecBAQDqAgAh8QEAAPcCkAIi_AFAANcCACGJAgEA6gIAIYoCIAD1AgAhiwIBANYCACGMAgEA1gIAIY4CAAD2Ao4CIpECAAA8ACCSAgAAPAAgFAMAAP8CACAHAACUAwAgDQAAlQMAIBAAAPsCACARAACRAwAgEgAA_AIAIM4BAACSAwAwzwEAAAsAENABAACSAwAw3gEBAOoCACHfAQEA6gIAIeABAQDWAgAh4QECAJMDACHiAQEA1gIAIeMBIAD1AgAh5AEQAP4CACHlAQIAhwMAIeYBQADXAgAhkQIAAAsAIJICAAALACATCAAAgAMAIAkAAIkDACAKAAD_AgAgDQAAigMAIA8AAIsDACDOAQAAhQMAMM8BAAAaABDQAQAAhQMAMNEBAQDqAgAh0gEBANYCACHeAQEA6gIAIeYBQADXAgAh6QEBAOoCACHvAQEA1gIAIfEBAACGA_EBIvIBAgCHAwAh8wFAAIgDACGRAgAAGgAgkgIAABoAIAsIAACAAwAgCwAA-wIAIM4BAACCAwAwzwEAAB8AENABAACCAwAw0QEBAOoCACHeAQEA6gIAIfEBAACEA_kBIvUBAACDA_UBIvYBAQDqAgAh9wEBAOoCACEE0wEAAAD1AQLUAQAAAPUBCNUBAAAA9QEI3QEAAOcC9QEiBNMBAAAA-QEC1AEAAAD5AQjVAQAAAPkBCN0BAADlAvkBIhEIAACAAwAgCQAAiQMAIAoAAP8CACANAACKAwAgDwAAiwMAIM4BAACFAwAwzwEAABoAENABAACFAwAw0QEBAOoCACHSAQEA1gIAId4BAQDqAgAh5gFAANcCACHpAQEA6gIAIe8BAQDWAgAh8QEAAIYD8QEi8gECAIcDACHzAUAAiAMAIQTTAQAAAPEBAtQBAAAA8QEI1QEAAADxAQjdAQAA4ALxASII0wECAAAAAdQBAgAAAATVAQIAAAAE1gECAAAAAdcBAgAAAAHYAQIAAAAB2QECAAAAAd0BAgC8AgAhCNMBQAAAAAHUAUAAAAAF1QFAAAAABdYBQAAAAAHXAUAAAAAB2AFAAAAAAdkBQAAAAAHdAUAA3gIAIQwGAACRAwAgBwAAkAMAIBAAAPsCACDOAQAAjwMAMM8BAAASABDQAQAAjwMAMN4BAQDqAgAh4gEBAOoCACHmAUAA1wIAIecBAQDqAgAhkQIAABIAIJICAAASACANCAAAgAMAIAsAAPsCACDOAQAAggMAMM8BAAAfABDQAQAAggMAMNEBAQDqAgAh3gEBAOoCACHxAQAAhAP5ASL1AQAAgwP1ASL2AQEA6gIAIfcBAQDqAgAhkQIAAB8AIJICAAAfACAPCAAAgAMAIAsAAIEDACAOAAD_AgAgDwEA6gIAIc4BAAD9AgAwzwEAACMAENABAAD9AgAw0QEBAOoCACHeAQEA6gIAIeYBQADXAgAh6AEBAOoCACHpAQEA6gIAIeoBEAD-AgAhkQIAACMAIJICAAAjACAC0QEBAAAAAdIBAQAAAAEHCAAAgAMAIAkAAI4DACDOAQAAjQMAMM8BAAAWABDQAQAAjQMAMNEBAQDqAgAh0gEBAOoCACEMBgAAkQMAIAcAAJADACAQAAD7AgAgzgEAAI8DADDPAQAAEgAQ0AEAAI8DADDeAQEA6gIAIeIBAQDqAgAh5gFAANcCACHnAQEA6gIAIZECAAASACCSAgAAEgAgCgYAAJEDACAHAACQAwAgEAAA-wIAIM4BAACPAwAwzwEAABIAENABAACPAwAw3gEBAOoCACHiAQEA6gIAIeYBQADXAgAh5wEBAOoCACELBgAA2AIAIBEAANkCACDOAQAA1QIAMM8BAAANABDQAQAA1QIAMN4BAQDqAgAh5gFAANcCACHnAQEA6gIAIesBAQDWAgAhkQIAAA0AIJICAAANACAD7AEAABYAIO0BAAAWACDuAQAAFgAgEgMAAP8CACAHAACUAwAgDQAAlQMAIBAAAPsCACARAACRAwAgEgAA_AIAIM4BAACSAwAwzwEAAAsAENABAACSAwAw3gEBAOoCACHfAQEA6gIAIeABAQDWAgAh4QECAJMDACHiAQEA1gIAIeMBIAD1AgAh5AEQAP4CACHlAQIAhwMAIeYBQADXAgAhCNMBAgAAAAHUAQIAAAAF1QECAAAABdYBAgAAAAHXAQIAAAAB2AECAAAAAdkBAgAAAAHdAQIAzgIAIQsGAADYAgAgEQAA2QIAIM4BAADVAgAwzwEAAA0AENABAADVAgAw3gEBAOoCACHmAUAA1wIAIecBAQDqAgAh6wEBANYCACGRAgAADQAgkgIAAA0AIAPsAQAAHwAg7QEAAB8AIO4BAAAfACARAwAA_wIAIM4BAACWAwAwzwEAAAcAENABAACWAwAw3gEBAOoCACHfAQEA6gIAIeYBQADXAgAh_AFAANcCACH9AQEA6gIAIf4BAQDqAgAh_wEBANYCACGAAgEA1gIAIYECAQDWAgAhggJAAIgDACGDAkAAiAMAIYQCAQDWAgAhhQIBANYCACEMAwAA_wIAIM4BAACXAwAwzwEAAAMAENABAACXAwAw3gEBAOoCACHfAQEA6gIAIeYBQADXAgAh-wFAANcCACH8AUAA1wIAIYYCAQDqAgAhhwIBANYCACGIAgEA1gIAIQAAAAGWAgEAAAABBSIAAP8FACAjAACFBgAgkwIAAIAGACCUAgAAhAYAIJkCAAAQACAFIgAA_QUAICMAAIIGACCTAgAA_gUAIJQCAACBBgAgmQIAABQAIAMiAAD_BQAgkwIAAIAGACCZAgAAEAAgAyIAAP0FACCTAgAA_gUAIJkCAAAUACAAAAAAAAABlgIBAAAAAQWWAgIAAAABnAICAAAAAZ0CAgAAAAGeAgIAAAABnwICAAAAAQGWAiAAAAABBZYCEAAAAAGcAhAAAAABnQIQAAAAAZ4CEAAAAAGfAhAAAAABBZYCAgAAAAGcAgIAAAABnQICAAAAAZ4CAgAAAAGfAgIAAAABAZYCQAAAAAEFIgAAzQUAICMAAPsFACCTAgAAzgUAIJQCAAD6BQAgmQIAAAEAIAciAADLBQAgIwAA-AUAIJMCAADMBQAglAIAAPcFACCXAgAADQAgmAIAAA0AIJkCAADHAQAgCyIAAOsDADAjAADwAwAwkwIAAOwDADCUAgAA7QMAMJUCAADuAwAglgIAAO8DADCXAgAA7wMAMJgCAADvAwAwmQIAAO8DADCaAgAA8QMAMJsCAADyAwAwCyIAAM4DADAjAADTAwAwkwIAAM8DADCUAgAA0AMAMJUCAADRAwAglgIAANIDADCXAgAA0gMAMJgCAADSAwAwmQIAANIDADCaAgAA1AMAMJsCAADVAwAwCyIAAL4DADAjAADDAwAwkwIAAL8DADCUAgAAwAMAMJUCAADBAwAglgIAAMIDADCXAgAAwgMAMJgCAADCAwAwmQIAAMIDADCaAgAAxAMAMJsCAADFAwAwCyIAALIDADAjAAC3AwAwkwIAALMDADCUAgAAtAMAMJUCAAC1AwAglgIAALYDADCXAgAAtgMAMJgCAAC2AwAwmQIAALYDADCaAgAAuAMAMJsCAAC5AwAwAgkAAJ8DACDSAQEAAAABAgAAABgAICIAAL0DACADAAAAGAAgIgAAvQMAICMAALwDACABGwAA9gUAMAgIAACAAwAgCQAAjgMAIM4BAACNAwAwzwEAABYAENABAACNAwAw0QEBAOoCACHSAQEA6gIAIZACAACMAwAgAgAAABgAIBsAALwDACACAAAAugMAIBsAALsDACAFzgEAALkDADDPAQAAugMAENABAAC5AwAw0QEBAOoCACHSAQEA6gIAIQXOAQAAuQMAMM8BAAC6AwAQ0AEAALkDADDRAQEA6gIAIdIBAQDqAgAhAdIBAQCbAwAhAgkAAJ0DACDSAQEAmwMAIQIJAACfAwAg0gEBAAAAAQgLAADNAwAgDgAAzAMAIA8BAAAAAd4BAQAAAAHmAUAAAAAB6AEBAAAAAekBAQAAAAHqARAAAAABAgAAAC4AICIAAMsDACADAAAALgAgIgAAywMAICMAAMgDACABGwAA9QUAMA0IAACAAwAgCwAAgQMAIA4AAP8CACAPAQDqAgAhzgEAAP0CADDPAQAAIwAQ0AEAAP0CADDRAQEA6gIAId4BAQAAAAHmAUAA1wIAIegBAQAAAAHpAQEA6gIAIeoBEAD-AgAhAgAAAC4AIBsAAMgDACACAAAAxgMAIBsAAMcDACAKDwEA6gIAIc4BAADFAwAwzwEAAMYDABDQAQAAxQMAMNEBAQDqAgAh3gEBAOoCACHmAUAA1wIAIegBAQDqAgAh6QEBAOoCACHqARAA_gIAIQoPAQDqAgAhzgEAAMUDADDPAQAAxgMAENABAADFAwAw0QEBAOoCACHeAQEA6gIAIeYBQADXAgAh6AEBAOoCACHpAQEA6gIAIeoBEAD-AgAhBg8BAJsDACHeAQEAmwMAIeYBQACrAwAh6AEBAJsDACHpAQEAmwMAIeoBEACpAwAhCAsAAMoDACAOAADJAwAgDwEAmwMAId4BAQCbAwAh5gFAAKsDACHoAQEAmwMAIekBAQCbAwAh6gEQAKkDACEFIgAA7QUAICMAAPMFACCTAgAA7gUAIJQCAADyBQAgmQIAAAEAIAUiAADrBQAgIwAA8AUAIJMCAADsBQAglAIAAO8FACCZAgAAHAAgCAsAAM0DACAOAADMAwAgDwEAAAAB3gEBAAAAAeYBQAAAAAHoAQEAAAAB6QEBAAAAAeoBEAAAAAEDIgAA7QUAIJMCAADuBQAgmQIAAAEAIAMiAADrBQAgkwIAAOwFACCZAgAAHAAgDAkAAOgDACAKAADnAwAgDQAA6QMAIA8AAOoDACDSAQEAAAAB3gEBAAAAAeYBQAAAAAHpAQEAAAAB7wEBAAAAAfEBAAAA8QEC8gECAAAAAfMBQAAAAAECAAAAHAAgIgAA5gMAIAMAAAAcACAiAADmAwAgIwAA2gMAIAEbAADqBQAwEQgAAIADACAJAACJAwAgCgAA_wIAIA0AAIoDACAPAACLAwAgzgEAAIUDADDPAQAAGgAQ0AEAAIUDADDRAQEA6gIAIdIBAQDWAgAh3gEBAAAAAeYBQADXAgAh6QEBAOoCACHvAQEA1gIAIfEBAACGA_EBIvIBAgCHAwAh8wFAAIgDACECAAAAHAAgGwAA2gMAIAIAAADWAwAgGwAA1wMAIAzOAQAA1QMAMM8BAADWAwAQ0AEAANUDADDRAQEA6gIAIdIBAQDWAgAh3gEBAOoCACHmAUAA1wIAIekBAQDqAgAh7wEBANYCACHxAQAAhgPxASLyAQIAhwMAIfMBQACIAwAhDM4BAADVAwAwzwEAANYDABDQAQAA1QMAMNEBAQDqAgAh0gEBANYCACHeAQEA6gIAIeYBQADXAgAh6QEBAOoCACHvAQEA1gIAIfEBAACGA_EBIvIBAgCHAwAh8wFAAIgDACEI0gEBAKYDACHeAQEAmwMAIeYBQACrAwAh6QEBAJsDACHvAQEApgMAIfEBAADYA_EBIvIBAgCqAwAh8wFAANkDACEBlgIAAADxAQIBlgJAAAAAAQwJAADcAwAgCgAA2wMAIA0AAN0DACAPAADeAwAg0gEBAKYDACHeAQEAmwMAIeYBQACrAwAh6QEBAJsDACHvAQEApgMAIfEBAADYA_EBIvIBAgCqAwAh8wFAANkDACEFIgAA2gUAICMAAOgFACCTAgAA2wUAIJQCAADnBQAgmQIAAAEAIAciAADYBQAgIwAA5QUAIJMCAADZBQAglAIAAOQFACCXAgAAEgAgmAIAABIAIJkCAAAUACAHIgAA1gUAICMAAOIFACCTAgAA1wUAIJQCAADhBQAglwIAAB8AIJgCAAAfACCZAgAAKgAgByIAAN8DACAjAADiAwAgkwIAAOADACCUAgAA4QMAIJcCAAAjACCYAgAAIwAgmQIAAC4AIAgIAADlAwAgDgAAzAMAIA8BAAAAAdEBAQAAAAHeAQEAAAAB5gFAAAAAAekBAQAAAAHqARAAAAABAgAAAC4AICIAAN8DACADAAAAIwAgIgAA3wMAICMAAOMDACAKAAAAIwAgCAAA5AMAIA4AAMkDACAPAQCbAwAhGwAA4wMAINEBAQCbAwAh3gEBAJsDACHmAUAAqwMAIekBAQCbAwAh6gEQAKkDACEICAAA5AMAIA4AAMkDACAPAQCbAwAh0QEBAJsDACHeAQEAmwMAIeYBQACrAwAh6QEBAJsDACHqARAAqQMAIQUiAADcBQAgIwAA3wUAIJMCAADdBQAglAIAAN4FACCZAgAAEAAgAyIAANwFACCTAgAA3QUAIJkCAAAQACAMCQAA6AMAIAoAAOcDACANAADpAwAgDwAA6gMAINIBAQAAAAHeAQEAAAAB5gFAAAAAAekBAQAAAAHvAQEAAAAB8QEAAADxAQLyAQIAAAAB8wFAAAAAAQMiAADaBQAgkwIAANsFACCZAgAAAQAgAyIAANgFACCTAgAA2QUAIJkCAAAUACADIgAA1gUAIJMCAADXBQAgmQIAACoAIAMiAADfAwAgkwIAAOADACCZAgAALgAgBgsAAIUEACDeAQEAAAAB8QEAAAD5AQL1AQAAAPUBAvYBAQAAAAH3AQEAAAABAgAAACoAICIAAIQEACADAAAAKgAgIgAAhAQAICMAAPcDACABGwAA1QUAMAsIAACAAwAgCwAA-wIAIM4BAACCAwAwzwEAAB8AENABAACCAwAw0QEBAOoCACHeAQEAAAAB8QEAAIQD-QEi9QEAAIMD9QEi9gEBAOoCACH3AQEA6gIAIQIAAAAqACAbAAD3AwAgAgAAAPMDACAbAAD0AwAgCc4BAADyAwAwzwEAAPMDABDQAQAA8gMAMNEBAQDqAgAh3gEBAOoCACHxAQAAhAP5ASL1AQAAgwP1ASL2AQEA6gIAIfcBAQDqAgAhCc4BAADyAwAwzwEAAPMDABDQAQAA8gMAMNEBAQDqAgAh3gEBAOoCACHxAQAAhAP5ASL1AQAAgwP1ASL2AQEA6gIAIfcBAQDqAgAhBd4BAQCbAwAh8QEAAPYD-QEi9QEAAPUD9QEi9gEBAJsDACH3AQEAmwMAIQGWAgAAAPUBAgGWAgAAAPkBAgYLAAD4AwAg3gEBAJsDACHxAQAA9gP5ASL1AQAA9QP1ASL2AQEAmwMAIfcBAQCbAwAhCyIAAPkDADAjAAD9AwAwkwIAAPoDADCUAgAA-wMAMJUCAAD8AwAglgIAANIDADCXAgAA0gMAMJgCAADSAwAwmQIAANIDADCaAgAA_gMAMJsCAADVAwAwDAgAAIMEACAJAADoAwAgCgAA5wMAIA8AAOoDACDRAQEAAAAB0gEBAAAAAd4BAQAAAAHmAUAAAAAB6QEBAAAAAfEBAAAA8QEC8gECAAAAAfMBQAAAAAECAAAAHAAgIgAAggQAIAMAAAAcACAiAACCBAAgIwAAgAQAIAEbAADUBQAwAgAAABwAIBsAAIAEACACAAAA1gMAIBsAAP8DACAI0QEBAJsDACHSAQEApgMAId4BAQCbAwAh5gFAAKsDACHpAQEAmwMAIfEBAADYA_EBIvIBAgCqAwAh8wFAANkDACEMCAAAgQQAIAkAANwDACAKAADbAwAgDwAA3gMAINEBAQCbAwAh0gEBAKYDACHeAQEAmwMAIeYBQACrAwAh6QEBAJsDACHxAQAA2APxASLyAQIAqgMAIfMBQADZAwAhBSIAAM8FACAjAADSBQAgkwIAANAFACCUAgAA0QUAIJkCAAAQACAMCAAAgwQAIAkAAOgDACAKAADnAwAgDwAA6gMAINEBAQAAAAHSAQEAAAAB3gEBAAAAAeYBQAAAAAHpAQEAAAAB8QEAAADxAQLyAQIAAAAB8wFAAAAAAQMiAADPBQAgkwIAANAFACCZAgAAEAAgBgsAAIUEACDeAQEAAAAB8QEAAAD5AQL1AQAAAPUBAvYBAQAAAAH3AQEAAAABBCIAAPkDADCTAgAA-gMAMJUCAAD8AwAgmQIAANIDADADIgAAzQUAIJMCAADOBQAgmQIAAAEAIAMiAADLBQAgkwIAAMwFACCZAgAAxwEAIAQiAADrAwAwkwIAAOwDADCVAgAA7gMAIJkCAADvAwAwBCIAAM4DADCTAgAAzwMAMJUCAADRAwAgmQIAANIDADAEIgAAvgMAMJMCAAC_AwAwlQIAAMEDACCZAgAAwgMAMAQiAACyAwAwkwIAALMDADCVAgAAtQMAIJkCAAC2AwAwAAAABSIAAMQFACAjAADJBQAgkwIAAMUFACCUAgAAyAUAIJkCAADHAQAgCyIAAJsEADAjAACfBAAwkwIAAJwEADCUAgAAnQQAMJUCAACeBAAglgIAALYDADCXAgAAtgMAMJgCAAC2AwAwmQIAALYDADCaAgAAoAQAMJsCAAC5AwAwCyIAAJIEADAjAACWBAAwkwIAAJMEADCUAgAAlAQAMJUCAACVBAAglgIAANIDADCXAgAA0gMAMJgCAADSAwAwmQIAANIDADCaAgAAlwQAMJsCAADVAwAwDAgAAIMEACAKAADnAwAgDQAA6QMAIA8AAOoDACDRAQEAAAAB3gEBAAAAAeYBQAAAAAHpAQEAAAAB7wEBAAAAAfEBAAAA8QEC8gECAAAAAfMBQAAAAAECAAAAHAAgIgAAmgQAIAMAAAAcACAiAACaBAAgIwAAmQQAIAEbAADHBQAwAgAAABwAIBsAAJkEACACAAAA1gMAIBsAAJgEACAI0QEBAJsDACHeAQEAmwMAIeYBQACrAwAh6QEBAJsDACHvAQEApgMAIfEBAADYA_EBIvIBAgCqAwAh8wFAANkDACEMCAAAgQQAIAoAANsDACANAADdAwAgDwAA3gMAINEBAQCbAwAh3gEBAJsDACHmAUAAqwMAIekBAQCbAwAh7wEBAKYDACHxAQAA2APxASLyAQIAqgMAIfMBQADZAwAhDAgAAIMEACAKAADnAwAgDQAA6QMAIA8AAOoDACDRAQEAAAAB3gEBAAAAAeYBQAAAAAHpAQEAAAAB7wEBAAAAAfEBAAAA8QEC8gECAAAAAfMBQAAAAAECCAAAngMAINEBAQAAAAECAAAAGAAgIgAAowQAIAMAAAAYACAiAACjBAAgIwAAogQAIAEbAADGBQAwAgAAABgAIBsAAKIEACACAAAAugMAIBsAAKEEACAB0QEBAJsDACECCAAAnAMAINEBAQCbAwAhAggAAJ4DACDRAQEAAAABAyIAAMQFACCTAgAAxQUAIJkCAADHAQAgBCIAAJsEADCTAgAAnAQAMJUCAACeBAAgmQIAALYDADAEIgAAkgQAMJMCAACTBAAwlQIAAJUEACCZAgAA0gMAMAAAAAAAAAAACyIAAL0EADAjAADCBAAwkwIAAL4EADCUAgAAvwQAMJUCAADABAAglgIAAMEEADCXAgAAwQQAMJgCAADBBAAwmQIAAMEEADCaAgAAwwQAMJsCAADEBAAwCyIAALEEADAjAAC2BAAwkwIAALIEADCUAgAAswQAMJUCAAC0BAAglgIAALUEADCXAgAAtQQAMJgCAAC1BAAwmQIAALUEADCaAgAAtwQAMJsCAAC4BAAwBQYAAKUEACAQAACmBAAg3gEBAAAAAeYBQAAAAAHnAQEAAAABAgAAABQAICIAALwEACADAAAAFAAgIgAAvAQAICMAALsEACABGwAAwwUAMAoGAACRAwAgBwAAkAMAIBAAAPsCACDOAQAAjwMAMM8BAAASABDQAQAAjwMAMN4BAQAAAAHiAQEA6gIAIeYBQADXAgAh5wEBAAAAAQIAAAAUACAbAAC7BAAgAgAAALkEACAbAAC6BAAgB84BAAC4BAAwzwEAALkEABDQAQAAuAQAMN4BAQDqAgAh4gEBAOoCACHmAUAA1wIAIecBAQDqAgAhB84BAAC4BAAwzwEAALkEABDQAQAAuAQAMN4BAQDqAgAh4gEBAOoCACHmAUAA1wIAIecBAQDqAgAhA94BAQCbAwAh5gFAAKsDACHnAQEAmwMAIQUGAACQBAAgEAAAkQQAIN4BAQCbAwAh5gFAAKsDACHnAQEAmwMAIQUGAAClBAAgEAAApgQAIN4BAQAAAAHmAUAAAAAB5wEBAAAAAQ0DAACGBAAgDQAAiAQAIBAAAIkEACARAACLBAAgEgAAigQAIN4BAQAAAAHfAQEAAAAB4AEBAAAAAeEBAgAAAAHjASAAAAAB5AEQAAAAAeUBAgAAAAHmAUAAAAABAgAAABAAICIAAMgEACADAAAAEAAgIgAAyAQAICMAAMcEACABGwAAwgUAMBIDAAD_AgAgBwAAlAMAIA0AAJUDACAQAAD7AgAgEQAAkQMAIBIAAPwCACDOAQAAkgMAMM8BAAALABDQAQAAkgMAMN4BAQAAAAHfAQEAAAAB4AEBANYCACHhAQIAkwMAIeIBAQDWAgAh4wEgAPUCACHkARAA_gIAIeUBAgCHAwAh5gFAANcCACECAAAAEAAgGwAAxwQAIAIAAADFBAAgGwAAxgQAIAzOAQAAxAQAMM8BAADFBAAQ0AEAAMQEADDeAQEA6gIAId8BAQDqAgAh4AEBANYCACHhAQIAkwMAIeIBAQDWAgAh4wEgAPUCACHkARAA_gIAIeUBAgCHAwAh5gFAANcCACEMzgEAAMQEADDPAQAAxQQAENABAADEBAAw3gEBAOoCACHfAQEA6gIAIeABAQDWAgAh4QECAJMDACHiAQEA1gIAIeMBIAD1AgAh5AEQAP4CACHlAQIAhwMAIeYBQADXAgAhCN4BAQCbAwAh3wEBAJsDACHgAQEApgMAIeEBAgCnAwAh4wEgAKgDACHkARAAqQMAIeUBAgCqAwAh5gFAAKsDACENAwAArAMAIA0AAK4DACAQAACvAwAgEQAAsQMAIBIAALADACDeAQEAmwMAId8BAQCbAwAh4AEBAKYDACHhAQIApwMAIeMBIACoAwAh5AEQAKkDACHlAQIAqgMAIeYBQACrAwAhDQMAAIYEACANAACIBAAgEAAAiQQAIBEAAIsEACASAACKBAAg3gEBAAAAAd8BAQAAAAHgAQEAAAAB4QECAAAAAeMBIAAAAAHkARAAAAAB5QECAAAAAeYBQAAAAAEEIgAAvQQAMJMCAAC-BAAwlQIAAMAEACCZAgAAwQQAMAQiAACxBAAwkwIAALIEADCVAgAAtAQAIJkCAAC1BAAwAAAAAAAAAAAAAAUiAAC9BQAgIwAAwAUAIJMCAAC-BQAglAIAAL8FACCZAgAAEAAgAyIAAL0FACCTAgAAvgUAIJkCAAAQACAAAAAAAAAFIgAAuAUAICMAALsFACCTAgAAuQUAIJQCAAC6BQAgmQIAAAEAIAMiAAC4BQAgkwIAALkFACCZAgAAAQAgAAAABSIAALMFACAjAAC2BQAgkwIAALQFACCUAgAAtQUAIJkCAAABACADIgAAswUAIJMCAAC0BQAgmQIAAAEAIAAAAAGWAgAAAI4CAgGWAgAAAJACAgsiAACRBQAwIwAAlgUAMJMCAACSBQAwlAIAAJMFADCVAgAAlAUAIJYCAACVBQAwlwIAAJUFADCYAgAAlQUAMJkCAACVBQAwmgIAAJcFADCbAgAAmAUAMAsiAACFBQAwIwAAigUAMJMCAACGBQAwlAIAAIcFADCVAgAAiAUAIJYCAACJBQAwlwIAAIkFADCYAgAAiQUAMJkCAACJBQAwmgIAAIsFADCbAgAAjAUAMAciAACABQAgIwAAgwUAIJMCAACBBQAglAIAAIIFACCXAgAACwAgmAIAAAsAIJkCAAAQACALIgAA9wQAMCMAAPsEADCTAgAA-AQAMJQCAAD5BAAwlQIAAPoEACCWAgAA0gMAMJcCAADSAwAwmAIAANIDADCZAgAA0gMAMJoCAAD8BAAwmwIAANUDADALIgAA7gQAMCMAAPIEADCTAgAA7wQAMJQCAADwBAAwlQIAAPEEACCWAgAAwgMAMJcCAADCAwAwmAIAAMIDADCZAgAAwgMAMJoCAADzBAAwmwIAAMUDADAICAAA5QMAIAsAAM0DACAPAQAAAAHRAQEAAAAB3gEBAAAAAeYBQAAAAAHoAQEAAAAB6gEQAAAAAQIAAAAuACAiAAD2BAAgAwAAAC4AICIAAPYEACAjAAD1BAAgARsAALIFADACAAAALgAgGwAA9QQAIAIAAADGAwAgGwAA9AQAIAYPAQCbAwAh0QEBAJsDACHeAQEAmwMAIeYBQACrAwAh6AEBAJsDACHqARAAqQMAIQgIAADkAwAgCwAAygMAIA8BAJsDACHRAQEAmwMAId4BAQCbAwAh5gFAAKsDACHoAQEAmwMAIeoBEACpAwAhCAgAAOUDACALAADNAwAgDwEAAAAB0QEBAAAAAd4BAQAAAAHmAUAAAAAB6AEBAAAAAeoBEAAAAAEMCAAAgwQAIAkAAOgDACANAADpAwAgDwAA6gMAINEBAQAAAAHSAQEAAAAB3gEBAAAAAeYBQAAAAAHvAQEAAAAB8QEAAADxAQLyAQIAAAAB8wFAAAAAAQIAAAAcACAiAAD_BAAgAwAAABwAICIAAP8EACAjAAD-BAAgARsAALEFADACAAAAHAAgGwAA_gQAIAIAAADWAwAgGwAA_QQAIAjRAQEAmwMAIdIBAQCmAwAh3gEBAJsDACHmAUAAqwMAIe8BAQCmAwAh8QEAANgD8QEi8gECAKoDACHzAUAA2QMAIQwIAACBBAAgCQAA3AMAIA0AAN0DACAPAADeAwAg0QEBAJsDACHSAQEApgMAId4BAQCbAwAh5gFAAKsDACHvAQEApgMAIfEBAADYA_EBIvIBAgCqAwAh8wFAANkDACEMCAAAgwQAIAkAAOgDACANAADpAwAgDwAA6gMAINEBAQAAAAHSAQEAAAAB3gEBAAAAAeYBQAAAAAHvAQEAAAAB8QEAAADxAQLyAQIAAAAB8wFAAAAAAQ0HAACHBAAgDQAAiAQAIBAAAIkEACARAACLBAAgEgAAigQAIN4BAQAAAAHgAQEAAAAB4QECAAAAAeIBAQAAAAHjASAAAAAB5AEQAAAAAeUBAgAAAAHmAUAAAAABAgAAABAAICIAAIAFACADAAAACwAgIgAAgAUAICMAAIQFACAPAAAACwAgBwAArQMAIA0AAK4DACAQAACvAwAgEQAAsQMAIBIAALADACAbAACEBQAg3gEBAJsDACHgAQEApgMAIeEBAgCnAwAh4gEBAKYDACHjASAAqAMAIeQBEACpAwAh5QECAKoDACHmAUAAqwMAIQ0HAACtAwAgDQAArgMAIBAAAK8DACARAACxAwAgEgAAsAMAIN4BAQCbAwAh4AEBAKYDACHhAQIApwMAIeIBAQCmAwAh4wEgAKgDACHkARAAqQMAIeUBAgCqAwAh5gFAAKsDACEM3gEBAAAAAeYBQAAAAAH8AUAAAAAB_QEBAAAAAf4BAQAAAAH_AQEAAAABgAIBAAAAAYECAQAAAAGCAkAAAAABgwJAAAAAAYQCAQAAAAGFAgEAAAABAgAAAAkAICIAAJAFACADAAAACQAgIgAAkAUAICMAAI8FACABGwAAsAUAMBEDAAD_AgAgzgEAAJYDADDPAQAABwAQ0AEAAJYDADDeAQEAAAAB3wEBAOoCACHmAUAA1wIAIfwBQADXAgAh_QEBAOoCACH-AQEA6gIAIf8BAQDWAgAhgAIBANYCACGBAgEA1gIAIYICQACIAwAhgwJAAIgDACGEAgEA1gIAIYUCAQDWAgAhAgAAAAkAIBsAAI8FACACAAAAjQUAIBsAAI4FACAQzgEAAIwFADDPAQAAjQUAENABAACMBQAw3gEBAOoCACHfAQEA6gIAIeYBQADXAgAh_AFAANcCACH9AQEA6gIAIf4BAQDqAgAh_wEBANYCACGAAgEA1gIAIYECAQDWAgAhggJAAIgDACGDAkAAiAMAIYQCAQDWAgAhhQIBANYCACEQzgEAAIwFADDPAQAAjQUAENABAACMBQAw3gEBAOoCACHfAQEA6gIAIeYBQADXAgAh_AFAANcCACH9AQEA6gIAIf4BAQDqAgAh_wEBANYCACGAAgEA1gIAIYECAQDWAgAhggJAAIgDACGDAkAAiAMAIYQCAQDWAgAhhQIBANYCACEM3gEBAJsDACHmAUAAqwMAIfwBQACrAwAh_QEBAJsDACH-AQEAmwMAIf8BAQCmAwAhgAIBAKYDACGBAgEApgMAIYICQADZAwAhgwJAANkDACGEAgEApgMAIYUCAQCmAwAhDN4BAQCbAwAh5gFAAKsDACH8AUAAqwMAIf0BAQCbAwAh_gEBAJsDACH_AQEApgMAIYACAQCmAwAhgQIBAKYDACGCAkAA2QMAIYMCQADZAwAhhAIBAKYDACGFAgEApgMAIQzeAQEAAAAB5gFAAAAAAfwBQAAAAAH9AQEAAAAB_gEBAAAAAf8BAQAAAAGAAgEAAAABgQIBAAAAAYICQAAAAAGDAkAAAAABhAIBAAAAAYUCAQAAAAEH3gEBAAAAAeYBQAAAAAH7AUAAAAAB_AFAAAAAAYYCAQAAAAGHAgEAAAABiAIBAAAAAQIAAAAFACAiAACcBQAgAwAAAAUAICIAAJwFACAjAACbBQAgARsAAK8FADAMAwAA_wIAIM4BAACXAwAwzwEAAAMAENABAACXAwAw3gEBAAAAAd8BAQDqAgAh5gFAANcCACH7AUAA1wIAIfwBQADXAgAhhgIBAAAAAYcCAQDWAgAhiAIBANYCACECAAAABQAgGwAAmwUAIAIAAACZBQAgGwAAmgUAIAvOAQAAmAUAMM8BAACZBQAQ0AEAAJgFADDeAQEA6gIAId8BAQDqAgAh5gFAANcCACH7AUAA1wIAIfwBQADXAgAhhgIBAOoCACGHAgEA1gIAIYgCAQDWAgAhC84BAACYBQAwzwEAAJkFABDQAQAAmAUAMN4BAQDqAgAh3wEBAOoCACHmAUAA1wIAIfsBQADXAgAh_AFAANcCACGGAgEA6gIAIYcCAQDWAgAhiAIBANYCACEH3gEBAJsDACHmAUAAqwMAIfsBQACrAwAh_AFAAKsDACGGAgEAmwMAIYcCAQCmAwAhiAIBAKYDACEH3gEBAJsDACHmAUAAqwMAIfsBQACrAwAh_AFAAKsDACGGAgEAmwMAIYcCAQCmAwAhiAIBAKYDACEH3gEBAAAAAeYBQAAAAAH7AUAAAAAB_AFAAAAAAYYCAQAAAAGHAgEAAAABiAIBAAAAAQQiAACRBQAwkwIAAJIFADCVAgAAlAUAIJkCAACVBQAwBCIAAIUFADCTAgAAhgUAMJUCAACIBQAgmQIAAIkFADADIgAAgAUAIJMCAACBBQAgmQIAABAAIAQiAAD3BAAwkwIAAPgEADCVAgAA-gQAIJkCAADSAwAwBCIAAO4EADCTAgAA7wQAMJUCAADxBAAgmQIAAMIDADAAAAkDAACnBQAgBwAArAUAIA0AAK4FACAQAAClBQAgEQAArQUAIBIAAKYFACDgAQAAoAMAIOEBAACgAwAg4gEAAKADACAAAAcEAACiBQAgBQAAowUAIBMAAKQFACAUAAClBQAgFQAApgUAIIsCAACgAwAgjAIAAKADACAICAAApAUAIAkAAKkFACAKAACnBQAgDQAAqgUAIA8AAKsFACDSAQAAoAMAIO8BAACgAwAg8wEAAKADACADBgAArQUAIAcAAKwFACAQAAClBQAgAggAAKQFACALAAClBQAgAwgAAKQFACALAACoBQAgDgAApwUAIAMGAADLBAAgEQAAzAQAIOsBAACgAwAgAAAH3gEBAAAAAeYBQAAAAAH7AUAAAAAB_AFAAAAAAYYCAQAAAAGHAgEAAAABiAIBAAAAAQzeAQEAAAAB5gFAAAAAAfwBQAAAAAH9AQEAAAAB_gEBAAAAAf8BAQAAAAGAAgEAAAABgQIBAAAAAYICQAAAAAGDAkAAAAABhAIBAAAAAYUCAQAAAAEI0QEBAAAAAdIBAQAAAAHeAQEAAAAB5gFAAAAAAe8BAQAAAAHxAQAAAPEBAvIBAgAAAAHzAUAAAAABBg8BAAAAAdEBAQAAAAHeAQEAAAAB5gFAAAAAAegBAQAAAAHqARAAAAABDgUAAJ4FACATAACfBQAgFAAAoAUAIBUAAKEFACDeAQEAAAAB5gFAAAAAAecBAQAAAAHxAQAAAJACAvwBQAAAAAGJAgEAAAABigIgAAAAAYsCAQAAAAGMAgEAAAABjgIAAACOAgICAAAAAQAgIgAAswUAIAMAAAA8ACAiAACzBQAgIwAAtwUAIBAAAAA8ACAFAADqBAAgEwAA6wQAIBQAAOwEACAVAADtBAAgGwAAtwUAIN4BAQCbAwAh5gFAAKsDACHnAQEAmwMAIfEBAADoBJACIvwBQACrAwAhiQIBAJsDACGKAiAAqAMAIYsCAQCmAwAhjAIBAKYDACGOAgAA5wSOAiIOBQAA6gQAIBMAAOsEACAUAADsBAAgFQAA7QQAIN4BAQCbAwAh5gFAAKsDACHnAQEAmwMAIfEBAADoBJACIvwBQACrAwAhiQIBAJsDACGKAiAAqAMAIYsCAQCmAwAhjAIBAKYDACGOAgAA5wSOAiIOBAAAnQUAIBMAAJ8FACAUAACgBQAgFQAAoQUAIN4BAQAAAAHmAUAAAAAB5wEBAAAAAfEBAAAAkAIC_AFAAAAAAYkCAQAAAAGKAiAAAAABiwIBAAAAAYwCAQAAAAGOAgAAAI4CAgIAAAABACAiAAC4BQAgAwAAADwAICIAALgFACAjAAC8BQAgEAAAADwAIAQAAOkEACATAADrBAAgFAAA7AQAIBUAAO0EACAbAAC8BQAg3gEBAJsDACHmAUAAqwMAIecBAQCbAwAh8QEAAOgEkAIi_AFAAKsDACGJAgEAmwMAIYoCIACoAwAhiwIBAKYDACGMAgEApgMAIY4CAADnBI4CIg4EAADpBAAgEwAA6wQAIBQAAOwEACAVAADtBAAg3gEBAJsDACHmAUAAqwMAIecBAQCbAwAh8QEAAOgEkAIi_AFAAKsDACGJAgEAmwMAIYoCIACoAwAhiwIBAKYDACGMAgEApgMAIY4CAADnBI4CIg4DAACGBAAgBwAAhwQAIBAAAIkEACARAACLBAAgEgAAigQAIN4BAQAAAAHfAQEAAAAB4AEBAAAAAeEBAgAAAAHiAQEAAAAB4wEgAAAAAeQBEAAAAAHlAQIAAAAB5gFAAAAAAQIAAAAQACAiAAC9BQAgAwAAAAsAICIAAL0FACAjAADBBQAgEAAAAAsAIAMAAKwDACAHAACtAwAgEAAArwMAIBEAALEDACASAACwAwAgGwAAwQUAIN4BAQCbAwAh3wEBAJsDACHgAQEApgMAIeEBAgCnAwAh4gEBAKYDACHjASAAqAMAIeQBEACpAwAh5QECAKoDACHmAUAAqwMAIQ4DAACsAwAgBwAArQMAIBAAAK8DACARAACxAwAgEgAAsAMAIN4BAQCbAwAh3wEBAJsDACHgAQEApgMAIeEBAgCnAwAh4gEBAKYDACHjASAAqAMAIeQBEACpAwAh5QECAKoDACHmAUAAqwMAIQjeAQEAAAAB3wEBAAAAAeABAQAAAAHhAQIAAAAB4wEgAAAAAeQBEAAAAAHlAQIAAAAB5gFAAAAAAQPeAQEAAAAB5gFAAAAAAecBAQAAAAEFBgAAyQQAIN4BAQAAAAHmAUAAAAAB5wEBAAAAAesBAQAAAAECAAAAxwEAICIAAMQFACAB0QEBAAAAAQjRAQEAAAAB3gEBAAAAAeYBQAAAAAHpAQEAAAAB7wEBAAAAAfEBAAAA8QEC8gECAAAAAfMBQAAAAAEDAAAADQAgIgAAxAUAICMAAMoFACAHAAAADQAgBgAArwQAIBsAAMoFACDeAQEAmwMAIeYBQACrAwAh5wEBAJsDACHrAQEApgMAIQUGAACvBAAg3gEBAJsDACHmAUAAqwMAIecBAQCbAwAh6wEBAKYDACEFEQAAygQAIN4BAQAAAAHmAUAAAAAB5wEBAAAAAesBAQAAAAECAAAAxwEAICIAAMsFACAOBAAAnQUAIAUAAJ4FACAUAACgBQAgFQAAoQUAIN4BAQAAAAHmAUAAAAAB5wEBAAAAAfEBAAAAkAIC_AFAAAAAAYkCAQAAAAGKAiAAAAABiwIBAAAAAYwCAQAAAAGOAgAAAI4CAgIAAAABACAiAADNBQAgDgMAAIYEACAHAACHBAAgDQAAiAQAIBEAAIsEACASAACKBAAg3gEBAAAAAd8BAQAAAAHgAQEAAAAB4QECAAAAAeIBAQAAAAHjASAAAAAB5AEQAAAAAeUBAgAAAAHmAUAAAAABAgAAABAAICIAAM8FACADAAAACwAgIgAAzwUAICMAANMFACAQAAAACwAgAwAArAMAIAcAAK0DACANAACuAwAgEQAAsQMAIBIAALADACAbAADTBQAg3gEBAJsDACHfAQEAmwMAIeABAQCmAwAh4QECAKcDACHiAQEApgMAIeMBIACoAwAh5AEQAKkDACHlAQIAqgMAIeYBQACrAwAhDgMAAKwDACAHAACtAwAgDQAArgMAIBEAALEDACASAACwAwAg3gEBAJsDACHfAQEAmwMAIeABAQCmAwAh4QECAKcDACHiAQEApgMAIeMBIACoAwAh5AEQAKkDACHlAQIAqgMAIeYBQACrAwAhCNEBAQAAAAHSAQEAAAAB3gEBAAAAAeYBQAAAAAHpAQEAAAAB8QEAAADxAQLyAQIAAAAB8wFAAAAAAQXeAQEAAAAB8QEAAAD5AQL1AQAAAPUBAvYBAQAAAAH3AQEAAAABBwgAANYEACDRAQEAAAAB3gEBAAAAAfEBAAAA-QEC9QEAAAD1AQL2AQEAAAAB9wEBAAAAAQIAAAAqACAiAADWBQAgBgYAAKUEACAHAACkBAAg3gEBAAAAAeIBAQAAAAHmAUAAAAAB5wEBAAAAAQIAAAAUACAiAADYBQAgDgQAAJ0FACAFAACeBQAgEwAAnwUAIBUAAKEFACDeAQEAAAAB5gFAAAAAAecBAQAAAAHxAQAAAJACAvwBQAAAAAGJAgEAAAABigIgAAAAAYsCAQAAAAGMAgEAAAABjgIAAACOAgICAAAAAQAgIgAA2gUAIA4DAACGBAAgBwAAhwQAIA0AAIgEACAQAACJBAAgEQAAiwQAIN4BAQAAAAHfAQEAAAAB4AEBAAAAAeEBAgAAAAHiAQEAAAAB4wEgAAAAAeQBEAAAAAHlAQIAAAAB5gFAAAAAAQIAAAAQACAiAADcBQAgAwAAAAsAICIAANwFACAjAADgBQAgEAAAAAsAIAMAAKwDACAHAACtAwAgDQAArgMAIBAAAK8DACARAACxAwAgGwAA4AUAIN4BAQCbAwAh3wEBAJsDACHgAQEApgMAIeEBAgCnAwAh4gEBAKYDACHjASAAqAMAIeQBEACpAwAh5QECAKoDACHmAUAAqwMAIQ4DAACsAwAgBwAArQMAIA0AAK4DACAQAACvAwAgEQAAsQMAIN4BAQCbAwAh3wEBAJsDACHgAQEApgMAIeEBAgCnAwAh4gEBAKYDACHjASAAqAMAIeQBEACpAwAh5QECAKoDACHmAUAAqwMAIQMAAAAfACAiAADWBQAgIwAA4wUAIAkAAAAfACAIAADVBAAgGwAA4wUAINEBAQCbAwAh3gEBAJsDACHxAQAA9gP5ASL1AQAA9QP1ASL2AQEAmwMAIfcBAQCbAwAhBwgAANUEACDRAQEAmwMAId4BAQCbAwAh8QEAAPYD-QEi9QEAAPUD9QEi9gEBAJsDACH3AQEAmwMAIQMAAAASACAiAADYBQAgIwAA5gUAIAgAAAASACAGAACQBAAgBwAAjwQAIBsAAOYFACDeAQEAmwMAIeIBAQCbAwAh5gFAAKsDACHnAQEAmwMAIQYGAACQBAAgBwAAjwQAIN4BAQCbAwAh4gEBAJsDACHmAUAAqwMAIecBAQCbAwAhAwAAADwAICIAANoFACAjAADpBQAgEAAAADwAIAQAAOkEACAFAADqBAAgEwAA6wQAIBUAAO0EACAbAADpBQAg3gEBAJsDACHmAUAAqwMAIecBAQCbAwAh8QEAAOgEkAIi_AFAAKsDACGJAgEAmwMAIYoCIACoAwAhiwIBAKYDACGMAgEApgMAIY4CAADnBI4CIg4EAADpBAAgBQAA6gQAIBMAAOsEACAVAADtBAAg3gEBAJsDACHmAUAAqwMAIecBAQCbAwAh8QEAAOgEkAIi_AFAAKsDACGJAgEAmwMAIYoCIACoAwAhiwIBAKYDACGMAgEApgMAIY4CAADnBI4CIgjSAQEAAAAB3gEBAAAAAeYBQAAAAAHpAQEAAAAB7wEBAAAAAfEBAAAA8QEC8gECAAAAAfMBQAAAAAENCAAAgwQAIAkAAOgDACAKAADnAwAgDQAA6QMAINEBAQAAAAHSAQEAAAAB3gEBAAAAAeYBQAAAAAHpAQEAAAAB7wEBAAAAAfEBAAAA8QEC8gECAAAAAfMBQAAAAAECAAAAHAAgIgAA6wUAIA4EAACdBQAgBQAAngUAIBMAAJ8FACAUAACgBQAg3gEBAAAAAeYBQAAAAAHnAQEAAAAB8QEAAACQAgL8AUAAAAABiQIBAAAAAYoCIAAAAAGLAgEAAAABjAIBAAAAAY4CAAAAjgICAgAAAAEAICIAAO0FACADAAAAGgAgIgAA6wUAICMAAPEFACAPAAAAGgAgCAAAgQQAIAkAANwDACAKAADbAwAgDQAA3QMAIBsAAPEFACDRAQEAmwMAIdIBAQCmAwAh3gEBAJsDACHmAUAAqwMAIekBAQCbAwAh7wEBAKYDACHxAQAA2APxASLyAQIAqgMAIfMBQADZAwAhDQgAAIEEACAJAADcAwAgCgAA2wMAIA0AAN0DACDRAQEAmwMAIdIBAQCmAwAh3gEBAJsDACHmAUAAqwMAIekBAQCbAwAh7wEBAKYDACHxAQAA2APxASLyAQIAqgMAIfMBQADZAwAhAwAAADwAICIAAO0FACAjAAD0BQAgEAAAADwAIAQAAOkEACAFAADqBAAgEwAA6wQAIBQAAOwEACAbAAD0BQAg3gEBAJsDACHmAUAAqwMAIecBAQCbAwAh8QEAAOgEkAIi_AFAAKsDACGJAgEAmwMAIYoCIACoAwAhiwIBAKYDACGMAgEApgMAIY4CAADnBI4CIg4EAADpBAAgBQAA6gQAIBMAAOsEACAUAADsBAAg3gEBAJsDACHmAUAAqwMAIecBAQCbAwAh8QEAAOgEkAIi_AFAAKsDACGJAgEAmwMAIYoCIACoAwAhiwIBAKYDACGMAgEApgMAIY4CAADnBI4CIgYPAQAAAAHeAQEAAAAB5gFAAAAAAegBAQAAAAHpAQEAAAAB6gEQAAAAAQHSAQEAAAABAwAAAA0AICIAAMsFACAjAAD5BQAgBwAAAA0AIBEAALAEACAbAAD5BQAg3gEBAJsDACHmAUAAqwMAIecBAQCbAwAh6wEBAKYDACEFEQAAsAQAIN4BAQCbAwAh5gFAAKsDACHnAQEAmwMAIesBAQCmAwAhAwAAADwAICIAAM0FACAjAAD8BQAgEAAAADwAIAQAAOkEACAFAADqBAAgFAAA7AQAIBUAAO0EACAbAAD8BQAg3gEBAJsDACHmAUAAqwMAIecBAQCbAwAh8QEAAOgEkAIi_AFAAKsDACGJAgEAmwMAIYoCIACoAwAhiwIBAKYDACGMAgEApgMAIY4CAADnBI4CIg4EAADpBAAgBQAA6gQAIBQAAOwEACAVAADtBAAg3gEBAJsDACHmAUAAqwMAIecBAQCbAwAh8QEAAOgEkAIi_AFAAKsDACGJAgEAmwMAIYoCIACoAwAhiwIBAKYDACGMAgEApgMAIY4CAADnBI4CIgYHAACkBAAgEAAApgQAIN4BAQAAAAHiAQEAAAAB5gFAAAAAAecBAQAAAAECAAAAFAAgIgAA_QUAIA4DAACGBAAgBwAAhwQAIA0AAIgEACAQAACJBAAgEgAAigQAIN4BAQAAAAHfAQEAAAAB4AEBAAAAAeEBAgAAAAHiAQEAAAAB4wEgAAAAAeQBEAAAAAHlAQIAAAAB5gFAAAAAAQIAAAAQACAiAAD_BQAgAwAAABIAICIAAP0FACAjAACDBgAgCAAAABIAIAcAAI8EACAQAACRBAAgGwAAgwYAIN4BAQCbAwAh4gEBAJsDACHmAUAAqwMAIecBAQCbAwAhBgcAAI8EACAQAACRBAAg3gEBAJsDACHiAQEAmwMAIeYBQACrAwAh5wEBAJsDACEDAAAACwAgIgAA_wUAICMAAIYGACAQAAAACwAgAwAArAMAIAcAAK0DACANAACuAwAgEAAArwMAIBIAALADACAbAACGBgAg3gEBAJsDACHfAQEAmwMAIeABAQCmAwAh4QECAKcDACHiAQEApgMAIeMBIACoAwAh5AEQAKkDACHlAQIAqgMAIeYBQACrAwAhDgMAAKwDACAHAACtAwAgDQAArgMAIBAAAK8DACASAACwAwAg3gEBAJsDACHfAQEAmwMAIeABAQCmAwAh4QECAKcDACHiAQEApgMAIeMBIACoAwAh5AEQAKkDACHlAQIAqgMAIeYBQACrAwAhBgQGAgUKAwwADxMMBBQ1CBU2CwEDAAEBAwABBwMAAQcOBQwADg0rCRAsCBEwBxIvCwMGEQQMAA0RFQYEBhkHBwAFDAAMEB0IAggABAkABgUIAAQJHgYKAAENIAkPJAsDCAAECyEIDAAKAQsiAAMIAAQLAAgOAAECBiUAECYAAgYnABEoAAQNMQAQMgARNAASMwAEBDcABTgAFDkAFToAAAAAAwwAFCgAFSkAFgAAAAMMABQoABUpABYBAwABAQMAAQMMABsoABwpAB0AAAADDAAbKAAcKQAdAQMAAQEDAAEDDAAiKAAjKQAkAAAAAwwAIigAIykAJAAAAAMMACooACspACwAAAADDAAqKAArKQAsAQgABAEIAAQDDAAxKAAyKQAzAAAAAwwAMSgAMikAMwQIAAQJtwEGCgABDbgBCQQIAAQJvgEGCgABDb8BCQUMADgoADspADx6ADl7ADoAAAAAAAUMADgoADspADx6ADl7ADoAAAMMAEEoAEIpAEMAAAADDABBKABCKQBDAwgABAsACA4AAQMIAAQLAAgOAAEFDABIKABLKQBMegBJewBKAAAAAAAFDABIKABLKQBMegBJewBKAQcABQEHAAUDDABRKABSKQBTAAAAAwwAUSgAUikAUwIDAAEHlQIFAgMAAQebAgUFDABYKABbKQBcegBZewBaAAAAAAAFDABYKABbKQBcegBZewBaAggABAkABgIIAAQJAAYDDABhKABiKQBjAAAAAwwAYSgAYikAYxYCARc7ARg-ARk_ARpAARxCAR1EEB5FER9HASBJECFKEiRLASVMASZNECpQEytRFyxSAi1TAi5UAi9VAjBWAjFYAjJaEDNbGDRdAjVfEDZgGTdhAjhiAjljEDpmGjtnHjxoAz1pAz5qAz9rA0BsA0FuA0JwEENxH0RzA0V1EEZ2IEd3A0h4A0l5EEp8IUt9JUx_Jk2AASZOgwEmT4QBJlCFASZRhwEmUokBEFOKASdUjAEmVY4BEFaPAShXkAEmWJEBJlmSARBalQEpW5YBLVyXAQldmAEJXpkBCV-aAQlgmwEJYZ0BCWKfARBjoAEuZKIBCWWkARBmpQEvZ6YBCWinAQlpqAEQaqsBMGusATRsrQEIba4BCG6vAQhvsAEIcLEBCHGzAQhytQEQc7YBNXS6AQh1vAEQdr0BNnfAAQh4wQEIecIBEHzFATd9xgE9fsgBBX_JAQWAAcsBBYEBzAEFggHNAQWDAc8BBYQB0QEQhQHSAT6GAdQBBYcB1gEQiAHXAT-JAdgBBYoB2QEFiwHaARCMAd0BQI0B3gFEjgHfAQuPAeABC5AB4QELkQHiAQuSAeMBC5MB5QELlAHnARCVAegBRZYB6gELlwHsARCYAe0BRpkB7gELmgHvAQubAfABEJwB8wFHnQH0AU2eAfUBBp8B9gEGoAH3AQahAfgBBqIB-QEGowH7AQakAf0BEKUB_gFOpgGAAganAYICEKgBgwJPqQGEAgaqAYUCBqsBhgIQrAGJAlCtAYoCVK4BiwIErwGMAgSwAY0CBLEBjgIEsgGPAgSzAZECBLQBkwIQtQGUAlW2AZcCBLcBmQIQuAGaAla5AZwCBLoBnQIEuwGeAhC8AaECV70BogJdvgGjAge_AaQCB8ABpQIHwQGmAgfCAacCB8MBqQIHxAGrAhDFAawCXsYBrgIHxwGwAhDIAbECX8kBsgIHygGzAgfLAbQCEMwBtwJgzQG4AmQ"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  AvailabilityScalarFieldEnum: () => AvailabilityScalarFieldEnum,
  BookingScalarFieldEnum: () => BookingScalarFieldEnum,
  CategoryScalarFieldEnum: () => CategoryScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  SubjectScalarFieldEnum: () => SubjectScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  TutorProfilesScalarFieldEnum: () => TutorProfilesScalarFieldEnum,
  TutorSubjectScalarFieldEnum: () => TutorSubjectScalarFieldEnum,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.4.1",
  engine: "55ae170b1ced7fc6ed07a15f110549408c501bb3"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Availability: "Availability",
  Booking: "Booking",
  Category: "Category",
  Review: "Review",
  Subject: "Subject",
  TutorProfiles: "TutorProfiles",
  TutorSubject: "TutorSubject"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  phone: "phone",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  role: "role",
  status: "status"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AvailabilityScalarFieldEnum = {
  id: "id",
  tutorId: "tutorId",
  day: "day",
  startTime: "startTime",
  endTime: "endTime",
  status: "status"
};
var BookingScalarFieldEnum = {
  id: "id",
  studentId: "studentId",
  tutorId: "tutorId",
  subjectId: "subjectId",
  availabilityId: "availabilityId",
  status: "status",
  price: "price",
  createdAt: "createdAt",
  completedAt: "completedAt"
};
var CategoryScalarFieldEnum = {
  id: "id",
  name: "name",
  description: "description",
  createdAt: "createdAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  bookingId: "bookingId",
  studentId: "studentId",
  tutorId: "tutorId",
  review: "review",
  rating: "rating",
  createdAt: "createdAt"
};
var SubjectScalarFieldEnum = {
  id: "id",
  name: "name",
  categoryId: "categoryId",
  createdAt: "createdAt"
};
var TutorProfilesScalarFieldEnum = {
  id: "id",
  userId: "userId",
  bio: "bio",
  hourlyRate: "hourlyRate",
  categoryId: "categoryId",
  isFeatured: "isFeatured",
  avgRating: "avgRating",
  totalReviews: "totalReviews",
  createdAt: "createdAt"
};
var TutorSubjectScalarFieldEnum = {
  tutorId: "tutorId",
  subjectId: "subjectId"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var UserRoles = {
  ADMIN: "ADMIN",
  TUTOR: "TUTOR",
  STUDENT: "STUDENT"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED"
};
var AvailabilityStatus = {
  AVAILABLE: "AVAILABLE",
  BOOKED: "BOOKED"
};
var BookingStatus = {
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
import { createAuthMiddleware } from "better-auth/api";
import { url } from "inspector";

// src/utils/sendVerificationEmail.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS
  }
});
var getEmailTemplate = (userName, verificationUrl) => {
  return `<html> ... <a href="${verificationUrl}">Verify email</a> ... </html>`;
};
var sendVerificationEmail = async ({ user, url: url2, token }) => {
  try {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    const info = await transporter.sendMail({
      from: '"SkillBridge" <skillbridge@mail.com>',
      to: user.email,
      subject: "Verify Your Email Address - SkillBridge",
      text: `Hi ${user.name}, please verify your email: ${verificationUrl}`,
      html: getEmailTemplate(user.name, verificationUrl)
    });
    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.log(error);
  }
};
var sendVerificationEmail_default = sendVerificationEmail;

// src/lib/auth.ts
var transporter2 = nodemailer2.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS
  }
});
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: [process.env.BETTER_AUTH_URL],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: false
      },
      phone: {
        type: "string",
        required: false
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url: url2, token }) => {
      console.log(url2);
      sendVerificationEmail_default({ user: { ...user, image: user.image ?? null }, url: url2, token });
    },
    autoSignInAfterVerification: true
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      console.log(url);
      if (ctx.path === "/sign-up/email") {
        if (ctx.body.role === UserRoles.ADMIN && process.env.ALLOW_ADMIN_SEED == "true") {
          throw new APIError("BAD_REQUEST", {
            message: "you can not sign up as admin"
          });
        }
      }
    })
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            if (user.role === UserRoles.TUTOR) {
              await prisma.tutorProfiles.create({
                data: {
                  userId: user.id
                }
              });
            }
          } catch (error) {
            console.log(error);
          }
          ;
        }
      }
    }
  }
});

// src/modules/user/user.router.ts
import { Router } from "express";

// src/middleware/auth.ts
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "you are not authenticated"
        });
      }
      req.user = session.user;
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You dont have access to this premission"
        });
      }
      if (req.user.role === UserRoles.TUTOR) {
        const tutorProfile = await prisma.tutorProfiles.findUnique({
          where: {
            userId: req.user.id
          },
          select: {
            id: true
          }
        });
        if (tutorProfile) {
          req.tutorId = tutorProfile.id;
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
var auth_default = auth2;

// src/modules/user/user.service.ts
var listUsers = async ({ page, limit, sortBy, skip, sortOrder }) => {
  const total = await prisma.tutorProfiles.count({});
  const result = await prisma.user.findMany({
    take: limit,
    skip,
    orderBy: {
      [sortBy]: sortOrder
    }
  });
  return {
    data: result,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getUser = async (user) => {
  return await prisma.user.findUnique({
    where: {
      id: user.id
    },
    include: {
      studentReviews: user.role === UserRoles.STUDENT,
      StudentBookings: user.role === UserRoles.STUDENT,
      tutorProfile: user.role === UserRoles.TUTOR && {
        include: {
          subjects: {
            include: {
              subject: true
            }
          }
        }
      }
    }
  });
};
var updateUserData = async (data, user) => {
  const { name, image, phone } = data;
  if (!name && !image && !phone) {
    throw new Error("Invalid data provided for update");
  }
  const userExists = await prisma.user.findUniqueOrThrow({
    where: {
      id: user.id
    }
  });
  return await prisma.user.update({
    where: {
      id: userExists.id
    },
    data: {
      ...name && { name },
      ...image && { image },
      ...phone && { phone }
    },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      phone: true
    }
  });
};
var updateUserStatus = async (status, userId) => {
  return await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      status
    }
  });
};
var userService = {
  listUsers,
  getUser,
  updateUserData,
  updateUserStatus
};

// src/utils/paginationHelper.ts
var paginationSortingHelper = (options) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder
  };
};
var paginationHelper_default = paginationSortingHelper;

// src/modules/user/user.controller.ts
var getUser2 = async (req, res, next) => {
  try {
    const result = await userService.getUser(req.user);
    return res.status(200).json({ success: true, message: "Users data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var listUserts = async (req, res, next) => {
  try {
    const paginations = paginationHelper_default(req.query);
    const result = await userService.listUsers(paginations);
    return res.status(200).json({ success: true, message: "users data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var updateUserStatus2 = async (req, res, next) => {
  try {
    if (!req.body?.status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }
    const result = await userService.updateUserStatus(req.body.status, req.params.userId);
    return res.status(200).json({ success: true, message: "Users status ufdated", data: result });
  } catch (e) {
    next(e);
  }
};
var updateUserData2 = async (req, res, next) => {
  try {
    const result = await userService.updateUserData(req.body, req.user);
    return res.status(200).json({ success: true, message: "Users data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var userController = {
  getUser: getUser2,
  listUserts,
  updateUserData: updateUserData2,
  updateUserStatus: updateUserStatus2
};

// src/modules/user/user.router.ts
var router = Router();
router.get("/me", auth_default(UserRoles.STUDENT, UserRoles.ADMIN), userController.getUser);
router.put("/update", auth_default(UserRoles.STUDENT, UserRoles.ADMIN), userController.updateUserData);
router.get("/list", auth_default(UserRoles.ADMIN), userController.listUserts);
router.put("/ban/:userId", auth_default(UserRoles.ADMIN), userController.updateUserStatus);
var userRouter = router;

// src/modules/tutor/tutor.router.ts
import { Router as Router2 } from "express";

// src/modules/tutor/tutor.service.ts
var getAllTutors = async ({ search, hourlyRate, categoryId, isFeatured, avgRating, totalReviews, subjectId, page, limit, sortBy, skip, sortOrder }) => {
  const andConditions = [];
  if (search) {
    andConditions.push({
      OR: [
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive"
            }
          }
        },
        {
          bio: {
            contains: search,
            mode: "insensitive"
          }
        }
      ]
    });
  }
  if (subjectId) {
    andConditions.push({
      subjects: {
        some: {
          subjectId
        }
      }
    });
  }
  if (hourlyRate) {
    andConditions.push({
      hourlyRate: {
        lte: hourlyRate
      }
    });
  }
  if (categoryId) {
    andConditions.push({
      categoryId
    });
  }
  if (isFeatured !== null) {
    andConditions.push({
      isFeatured
    });
  }
  if (avgRating) {
    andConditions.push({
      avgRating: {
        gte: avgRating
      }
    });
  }
  if (totalReviews) {
    andConditions.push({
      totalReviews: {
        gte: totalReviews
      }
    });
  }
  andConditions.push({
    user: {
      status: UserStatus.ACTIVE
    }
  });
  const result = await prisma.tutorProfiles.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions
    },
    orderBy: {
      [sortBy]: sortOrder
    },
    include: {
      user: true,
      availability: true,
      category: true,
      _count: {
        select: {
          reviews: true
        }
      },
      subjects: {
        include: {
          subject: true
        }
      }
    }
  });
  const total = await prisma.tutorProfiles.count({
    where: {
      AND: andConditions
    }
  });
  return {
    data: result,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getTutorById = async (totorId) => {
  return await prisma.tutorProfiles.findUnique({
    where: {
      id: totorId
    },
    include: {
      user: true,
      category: true,
      availability: true,
      reviews: {
        include: {
          student: true
        }
      },
      subjects: {
        include: {
          subject: true
        }
      }
    }
  });
};
var updateTutor = async (data, user) => {
  if (user.role !== UserRoles.ADMIN) {
    delete data.isFeatured;
    delete data.avgRating;
    delete data.totalReviews;
  }
  return await prisma.tutorProfiles.update({
    where: {
      userId: user.id
    },
    data
  });
};
var updateTutorSubjects = async (subjectIds, user) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: {
      userId: user.id
    }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  if (!tutorProfile.categoryId) {
    throw new Error("Tutor profile category not found");
  }
  const subjects = await prisma.subject.findMany({
    where: {
      id: { in: subjectIds }
    },
    select: {
      id: true,
      categoryId: true
    }
  });
  if (subjects.length !== subjectIds.length) {
    throw new Error("One or more subjects are invalid");
  }
  const invalidSubject = subjects.find(
    (s) => s.categoryId !== tutorProfile.categoryId
  );
  if (invalidSubject) {
    throw new Error("You selected a subject outside your category");
  }
  return await prisma.$transaction(async (tx) => {
    await tx.tutorSubject.deleteMany({
      where: {
        tutorId: tutorProfile.id
      }
    });
    const data = subjectIds.map((subjectId) => ({ tutorId: tutorProfile.id, subjectId }));
    return await tx.tutorSubject.createManyAndReturn({
      data
    });
  });
};
var deletTutorSubject = async (subjectId, user) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: { userId: user.id }
  });
  if (!tutorProfile) {
    throw new Error("Tutor not found");
  }
  return await prisma.tutorSubject.delete({
    where: {
      tutorId_subjectId: {
        tutorId: tutorProfile.id,
        subjectId
      }
    }
  });
};
var featureTutor = async (isFeatured, tutorId) => {
  return await prisma.tutorProfiles.update({
    where: {
      id: tutorId
    },
    data: {
      isFeatured
    }
  });
};
var getTutorDashboardOverview = async (user) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: {
      userId: user.id
    },
    select: {
      id: true,
      bio: true,
      hourlyRate: true,
      avgRating: true,
      totalReviews: true,
      isFeatured: true,
      category: {
        select: {
          id: true,
          name: true
        }
      },
      subjects: {
        select: {
          subject: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  return await prisma.$transaction(async (tx) => {
    const [
      totalBookings,
      completedBookings,
      cancelledBookings,
      upcomingBookings,
      totalEarnings,
      recentReviews,
      availabilities
    ] = await Promise.all([
      tx.booking.count({
        where: {
          tutorId: tutorProfile.id
        }
      }),
      tx.booking.count({
        where: {
          tutorId: tutorProfile.id,
          status: "COMPLETED"
        }
      }),
      tx.booking.count({
        where: {
          tutorId: tutorProfile.id,
          status: "CANCELLED"
        }
      }),
      tx.booking.findMany({
        where: {
          tutorId: tutorProfile.id,
          status: "CONFIRMED"
        },
        orderBy: {
          completedAt: "desc"
        },
        take: 5,
        select: {
          id: true,
          price: true,
          status: true,
          createdAt: true,
          completedAt: true,
          stdudent: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          availability: {
            select: {
              day: true,
              startTime: true,
              endTime: true
            }
          }
        }
      }),
      tx.booking.aggregate({
        where: {
          tutorId: tutorProfile.id,
          status: "COMPLETED"
        },
        _sum: {
          price: true
        }
      }),
      tx.review.findMany({
        where: {
          tutorId: tutorProfile.id
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5,
        select: {
          id: true,
          rating: true,
          review: true,
          createdAt: true,
          student: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      }),
      tx.availability.findMany({
        where: {
          tutorId: tutorProfile.id
        },
        orderBy: {
          day: "asc"
        },
        select: {
          id: true,
          day: true,
          startTime: true,
          endTime: true,
          status: true
        }
      })
    ]);
    const activeAvilabilities = availabilities.filter((a) => a.status === AvailabilityStatus.AVAILABLE);
    return {
      profile: {
        bio: tutorProfile.bio,
        hourlyRate: tutorProfile.hourlyRate,
        avgRating: tutorProfile.avgRating,
        totalReview: tutorProfile.totalReviews,
        isFeatured: tutorProfile.isFeatured,
        category: tutorProfile.category,
        subjects: tutorProfile.subjects.map((tutorSubject) => tutorSubject.subject)
      },
      stats: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        upcomingCount: upcomingBookings.length,
        totalEarnings: totalEarnings._sum.price ?? 0
      },
      upcomingBookings,
      recentReviews,
      availability: {
        total: availabilities.length,
        activeSlots: activeAvilabilities.length,
        slots: availabilities
      }
    };
  });
};
var tutorService = {
  getAllTutors,
  getTutorById,
  updateTutor,
  updateTutorSubjects,
  deletTutorSubject,
  featureTutor,
  getTutorDashboardOverview
};

// src/modules/tutor/tutor.controller.ts
var getAllTutors2 = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search ? req.query.search : null,
      hourlyRate: req.query.hourlyRate ? Number(req.query.hourlyRate) : null,
      categoryId: req.query.categoryId ? req.query.categoryId : null,
      isFeatured: req.query.isFeatured ? req.query.isFeatured === "true" ? true : req.query.isFeatured === "false" ? false : null : null,
      avgRating: req.query.avgRating ? Number(req.query.avgRating) : null,
      totalReviews: req.query.totalReviews ? Number(req.query.totalReviews) : null,
      subjectId: req.query.subjectId ? req.query.subjectId : null
    };
    const paginations = paginationHelper_default(req.query);
    const result = await tutorService.getAllTutors({ ...filters, ...paginations });
    if (result.data.length < 1) {
      return res.status(200).json({ success: true, message: "No tutors foun ", data: [] });
    }
    return res.status(200).json({ success: true, message: "Tutors data retrieved successfully", data: result.data, pagination: result.pagination });
  } catch (e) {
    next(e);
  }
};
var getTutorById2 = async (req, res, next) => {
  try {
    const result = await tutorService.getTutorById(req.params.tutourId);
    if (result === null) {
      return res.status(400).json({ success: false, message: "Tutor not found", data: null });
    }
    return res.status(200).json({ success: true, message: "Tutors data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var updateTutor2 = async (req, res, next) => {
  try {
    const result = await tutorService.updateTutor(req.body, req.user);
    return res.status(200).json({ success: true, message: "Tutors data update successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var updateTutorSubjects2 = async (req, res, next) => {
  try {
    const { subjectIds } = req.body;
    if (!Array.isArray(subjectIds) || subjectIds.length === 0 || !subjectIds.every((id) => typeof id === "string")) {
      return res.status(400).json({
        success: false,
        message: "Invalid format.Expected :subjectIds:['id1','id2'] "
      });
    }
    const result = await tutorService.updateTutorSubjects(subjectIds, req.user);
    return res.status(200).json({ success: true, message: "Subjects updated successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var deleteTutorSubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    if (!subjectId || typeof subjectId !== "string") {
      return res.status(400).json({
        success: false,
        message: "subjectId is required"
      });
    }
    const result = await tutorService.deletTutorSubject(subjectId, req.user);
    return res.status(200).json({ success: true, message: "Subject deleted successful", data: result });
  } catch (e) {
    next(e);
  }
};
var featureTutor2 = async (req, res, next) => {
  try {
    if (Object.keys(req.body).some((key) => key !== "isFeatured"))
      return res.status(400).json({
        success: false,
        message: "Invalid field input. Only isFeatured is allowed."
      });
    const result = await tutorService.featureTutor(req.body.isFeatured, req.params.tutorId);
    return res.status(200).json({ success: true, message: "Subjects updated successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var getTutorDashboardOverview2 = async (req, res, next) => {
  try {
    const result = await tutorService.getTutorDashboardOverview(req.user);
    return res.status(200).json({ success: true, message: "Retrieved tutors overview successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var tutorController = {
  getAllTutors: getAllTutors2,
  getTutorById: getTutorById2,
  updateTutor: updateTutor2,
  updateTutorSubjects: updateTutorSubjects2,
  deleteTutorSubject,
  featureTutor: featureTutor2,
  getTutorDashboardOverview: getTutorDashboardOverview2
};

// src/modules/tutor/tutor.router.ts
var router2 = Router2();
router2.get("/", tutorController.getAllTutors);
router2.get("/overview", auth_default(UserRoles.TUTOR), tutorController.getTutorDashboardOverview);
router2.get("/:tutorId", tutorController.getTutorById);
router2.put("/update", auth_default(UserRoles.TUTOR), tutorController.updateTutor);
router2.put("/subjucts", auth_default(UserRoles.TUTOR), tutorController.updateTutorSubjects);
router2.put("/feature/:tutorId", auth_default(UserRoles.ADMIN), tutorController.featureTutor);
router2.delete("/subjects/:subjuctId", auth_default(UserRoles.TUTOR), tutorController.deleteTutorSubject);
var tutorRouter = router2;

// src/modules/category/category.router.ts
import { Router as Router3 } from "express";

// src/modules/category/category.service.ts
var createCategory = async (data) => {
  return await prisma.category.create({
    data
  });
};
var createSubject = async (data) => {
  return await prisma.subject.create({
    data
  });
};
var getAllCategories = async () => {
  return await prisma.category.findMany({
    include: {
      subjects: true
    }
  });
};
var updateCategory = async (data, categoryId) => {
  return await prisma.category.update({
    where: {
      id: categoryId
    },
    data
  });
};
var updateSubject = async (data, subjectId) => {
  return await prisma.subject.update({
    where: {
      id: subjectId
    },
    data
  });
};
var deleteCategory = async (categoryId) => {
  return await prisma.category.delete({
    where: {
      id: categoryId
    }
  });
};
var deleteSubject = async (subjectId) => {
  return await prisma.subject.delete({
    where: {
      id: subjectId
    }
  });
};
var categoryService = {
  createCategory,
  createSubject,
  getAllCategories,
  updateCategory,
  updateSubject,
  deleteCategory,
  deleteSubject
};

// src/modules/category/category.controller.ts
var createCategory2 = async (req, res, next) => {
  try {
    const result = await categoryService.createCategory(req.body);
    return res.status(201).json({ success: true, message: "Category created successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var createSubject2 = async (req, res, next) => {
  try {
    const result = await categoryService.createSubject(req.body);
    return res.status(201).json({ success: true, message: "subject create successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var getAllCategories2 = async (req, res, next) => {
  try {
    const result = await categoryService.getAllCategories();
    if (result.length < 1) {
      return res.status(200).json({ seccess: true, message: "No categories found", data: [] });
    }
    return res.status(200).json({ success: true, message: "Categories data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var updateCategory2 = async (req, res, next) => {
  try {
    const result = await categoryService.updateCategory(req.body, req.params.categoryId);
    return res.status(200).json({ success: true, message: "Category updated successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var updateSubject2 = async (req, res, next) => {
  try {
    const result = await categoryService.updateSubject(req.body, req.params.subjectId);
    return res.status(200).json({ success: true, message: "subject update successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var deleteCategory2 = async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.params.categoryId);
    return res.status(200).json({ success: true, message: "category delete  successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var deleteSubject2 = async (req, res, next) => {
  try {
    const result = await categoryService.deleteSubject(req.params.subjectId);
    return res.status(200).json({ success: true, message: "Subject deleted successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var categoryController = {
  createCategory: createCategory2,
  createSubject: createSubject2,
  getAllCategories: getAllCategories2,
  updateCategory: updateCategory2,
  updateSubject: updateSubject2,
  deleteCategory: deleteCategory2,
  deleteSubject: deleteSubject2
};

// src/modules/category/category.router.ts
var router3 = Router3();
router3.get("/", categoryController.getAllCategories);
router3.post("/create", auth_default(UserRoles.ADMIN), categoryController.createCategory);
router3.post("/subject/create", auth_default(UserRoles.ADMIN), categoryController.createSubject);
router3.put("/update/:categoryId", auth_default(UserRoles.ADMIN), categoryController.updateCategory);
router3.put("/update/subject/:subjectId", auth_default(UserRoles.ADMIN), categoryController.updateSubject);
router3.delete("/delete/:categoryId", auth_default(UserRoles.ADMIN), categoryController.deleteCategory);
router3.delete("/delete/subject/:subjectId", auth_default(UserRoles.ADMIN), categoryController.deleteSubject);
var categoryRouter = router3;

// src/modules/availability/availability.router.ts
import { Router as Router4 } from "express";

// src/modules/availability/availability.service.ts
var createAvailbability = async (data, tutorId) => {
  const { day, startTime, endTime } = data;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new Error("Time must be in HH:mm format");
  }
  if (endTime <= startTime) {
    throw new Error("end time must be after start time");
  }
  const confict = await prisma.availability.findFirst({
    where: {
      tutorId,
      day,
      status: "AVAILABLE",
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } }
      ]
    }
  });
  if (confict) {
    throw new Error("This time slot overlaps with existion availability ");
  }
  return prisma.availability.create({
    data: {
      tutorId,
      day,
      startTime,
      endTime
    }
  });
};
var getAllAvailabilities = async (tutorId) => {
  return await prisma.availability.findMany({
    where: {
      tutorId
    }
  });
};
var updateAvailability = async (data, tutorId, availabilityId) => {
  const existing = await prisma.availability.findUnique({
    where: { id: availabilityId, tutorId }
  });
  if (!existing) {
    throw new Error("Availability not found");
  }
  if (existing.tutorId !== tutorId) {
    throw new Error("Not authorized to update this availability");
  }
  if (existing.status === "BOOKED") {
    throw new Error("Cannot modify a booked availability");
  }
  const day = data.day ?? existing.day;
  const startTime = data.startTime ?? existing.startTime;
  const endTime = data.endTime ?? existing.endTime;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (endTime <= startTime) {
    throw new Error("End time must be after start time");
  }
  const conflict = await prisma.availability.findFirst({
    where: {
      tutorId,
      day,
      status: AvailabilityStatus.AVAILABLE,
      NOT: { id: availabilityId },
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } }
      ]
    }
  });
  if (conflict) {
    throw new Error("This time slot overlaps with existing availability");
  }
  return prisma.availability.update({
    where: { id: availabilityId },
    data: {
      day,
      startTime,
      endTime
    }
  });
};
var deleteAvailability = async (availabilityId, tutorId) => {
  const existing = await prisma.availability.findUnique({
    where: { id: availabilityId }
  });
  if (!existing) {
    throw new Error("Availability not found");
  }
  if (existing.tutorId !== tutorId) {
    throw new Error("cannot delete a booked availability");
  }
  if (existing.status === AvailabilityStatus.BOOKED) {
    throw new Error("cannot delete a booked availability");
  }
  return prisma.availability.delete({
    where: { id: availabilityId }
  });
};
var availabilityService = {
  createAvailbability,
  updateAvailability,
  getAllAvailabilities,
  deleteAvailability
};

// src/modules/availability/availability.controller.ts
var createAvailability = async (req, res, next) => {
  try {
    const result = await availabilityService.createAvailbability(req.body, req.tutorId);
    return res.json({ success: true, message: "Tutor availability slot created successfully ", data: result });
  } catch (e) {
    next(e);
  }
};
var getAllAvailabilities2 = async (req, res, next) => {
  try {
    const result = await availabilityService.getAllAvailabilities(req.tutorId);
    return res.json({ seccuss: true, message: "tutor availability data retrieved seccessfull ", data: result });
  } catch (e) {
    next(e);
  }
};
var updateAvailability2 = async (req, res, next) => {
  try {
    const data = req.body;
    const tutorId = req.tutorId;
    const availabilityId = req.params.availabilityId;
    const result = await availabilityService.updateAvailability(data, tutorId, availabilityId);
    return res.json({ success: true, message: "Tutor availability slot update successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var deleteAvailability2 = async (req, res, next) => {
  try {
    const tutorId = req.tutorId;
    const availabilityId = req.params.availabilityId;
    const result = await availabilityService.deleteAvailability(availabilityId, tutorId);
    return res.json({ success: true, message: "Tutor availability slot deleted successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var availabilityController = {
  createAvailability,
  updateAvailability: updateAvailability2,
  getAllAvailabilities: getAllAvailabilities2,
  deleteAvailability: deleteAvailability2
};

// src/modules/availability/availability.router.ts
var router4 = Router4();
router4.get("/", auth_default(UserRoles.TUTOR), availabilityController.getAllAvailabilities);
router4.post("/create", auth_default(UserRoles.TUTOR), availabilityController.createAvailability);
router4.put("/update/:availabilityId", auth_default(UserRoles.TUTOR), availabilityController.updateAvailability);
router4.delete("/delete/:availabilityId", auth_default(UserRoles.TUTOR), availabilityController.deleteAvailability);
var availabilityRouter = router4;

// src/modules/booking/booking.router.ts
import { Router as Router5 } from "express";

// src/modules/booking/booking.service.ts
var getAllBookings = async (user, tutorId) => {
  if (user.role === UserRoles.STUDENT) {
    return await prisma.booking.findMany({
      where: {
        studentId: user.id
      },
      include: {
        tutor: true,
        availability: true
      },
      orderBy: {
        completedAt: "desc"
      }
    });
  }
  if (user.role === UserRoles.TUTOR) {
    return await prisma.booking.findMany({
      where: {
        tutorId: user.id
      },
      include: {
        stdudent: true,
        availability: true
      },
      orderBy: {
        completedAt: "desc"
      }
    });
  }
  if (user.role === UserRoles.ADMIN) {
    return prisma.booking.findMany({
      include: {
        stdudent: true,
        availability: true
      },
      orderBy: {
        completedAt: "desc"
      }
    });
  }
  throw new Error("Unathorized");
};
var getBookingBYId = async (user, tutorId, bookingId) => {
  if (user.role === UserRoles.STUDENT) {
    return await prisma.booking.findFirst({
      where: {
        studentId: user.id,
        id: bookingId
      },
      include: {
        stdudent: true,
        tutor: {
          include: {
            user: true
          }
        },
        subject: true,
        availability: true,
        review: true
      }
    });
  }
  if (user.role === UserRoles.TUTOR) {
    return await prisma.booking.findFirst({
      where: {
        tutorId,
        id: bookingId
      },
      include: {
        stdudent: true,
        tutor: {
          include: {
            user: true
          }
        },
        subject: true,
        availability: true,
        review: true
      }
    });
  }
  if (user.role === UserRoles.ADMIN) {
    return await prisma.booking.findFirst({
      where: {
        id: bookingId
      },
      include: {
        stdudent: true,
        tutor: {
          include: {
            user: true
          }
        },
        subject: true,
        availability: true,
        review: true
      }
    });
  }
  throw new Error("Unauthorized");
};
var createBooking = async (data, studentId) => {
  const { tutorId, availabilityId, subjectId } = data;
  if (!availabilityId || !tutorId || !subjectId) {
    throw new Error("Availability ID,Tutor ID,and Subject ID are required");
  }
  const tutorInfo = await prisma.$transaction(async (tx) => {
    const availability = await tx.availability.findUniqueOrThrow({
      where: {
        id: availabilityId,
        tutorId
      }
    });
    const tutor = await tx.tutorProfiles.findUniqueOrThrow({
      where: {
        id: tutorId
      }
    });
    return { ...tutor, availability };
  });
  if (tutorInfo.availability.status === AvailabilityStatus.BOOKED) {
    throw new Error("This availability is already booked");
  }
  const { startTime, endTime } = tutorInfo.availability;
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  const duration = (end - start) / 60;
  const price = tutorInfo.hourlyRate * duration;
  return prisma.$transaction(async (tx) => {
    await tx.availability.update({
      where: {
        id: availabilityId
      },
      data: {
        status: AvailabilityStatus.BOOKED
      }
    });
    return await tx.booking.create({
      data: {
        studentId,
        tutorId,
        availabilityId,
        price,
        subjectId
      }
    });
  });
};
var updateBookingStatus = async (bookingId, status, user, tutorId) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId }
  });
  if (user.role === UserRoles.STUDENT) {
    if (booking.status === BookingStatus.CANCELLED) {
      throw new Error("you can not change a completed booking");
    }
    if (status !== BookingStatus.CANCELLED) {
      throw new Error("Students can only cancel their bookings");
    }
    if (booking.studentId !== user.id) {
      throw new Error("Not authorized to cancel this bookin");
    }
  }
  if (tutorId) {
    if (user.role === UserRoles.TUTOR) {
      if (booking.status === BookingStatus.CANCELLED) {
        throw new Error("you can not change a cancelled booking");
      }
      if (status !== BookingStatus.COMPLETED) {
        throw new Error("Tutors can only complete bookings");
      }
      if (booking.tutorId !== tutorId) {
        throw new Error("Nor authorized to complete this booking");
      }
    }
  }
  return await prisma.$transaction(async (tx) => {
    await tx.availability.update({
      where: {
        id: booking.availabilityId
      },
      data: {
        status: AvailabilityStatus.AVAILABLE
      }
    });
    return await tx.booking.update({
      where: { id: bookingId },
      data: {
        status,
        completedAt: status === BookingStatus.CANCELLED ? /* @__PURE__ */ new Date() : null
      }
    });
  });
};
var bookingService = {
  getAllBookings,
  createBooking,
  getBookingBYId,
  updateBookingStatus
};

// src/modules/booking/booking.controller.ts
var getAllBookings2 = async (req, res, next) => {
  try {
    const result = await bookingService.getAllBookings(req.user, req.tutorId);
    return res.json({ success: true, message: "Bookings data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var getBookingById = async (req, res, next) => {
  try {
    const result = await bookingService.getBookingBYId(req.user, req.tutorId, req.params.bookingId);
    return res.json({ success: true, message: "Booking data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var createBooking2 = async (req, res, next) => {
  try {
    const data = req.body;
    const studentId = req.user?.id;
    const result = await bookingService.createBooking(data, studentId);
    return res.json({ success: true, message: "booking created successfully ", data: result });
  } catch (e) {
    next(e);
  }
};
var updateBookingStatus2 = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.json({ success: false, message: "Invalid input " });
    }
    if (!Object.values(BookingStatus).includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status type" });
    }
    const tutorId = req.user?.role === UserRoles.TUTOR ? req.tutorId : null;
    const bookingId = req.params.bookingId;
    const result = await bookingService.updateBookingStatus(bookingId, status, req.user, tutorId);
    return res.json({ success: true, message: "Booking status update", data: result });
  } catch (e) {
    next(e);
  }
};
var bookingController = {
  getAllBookings: getAllBookings2,
  createBooking: createBooking2,
  getBookingById,
  updateBookingStatus: updateBookingStatus2
};

// src/modules/booking/booking.router.ts
var router5 = Router5();
router5.get("/", auth_default(UserRoles.STUDENT, UserRoles.TUTOR, UserRoles.ADMIN), bookingController.getAllBookings);
router5.get("/:bookingId", auth_default(UserRoles.STUDENT), bookingController.getBookingById);
router5.post("/create", auth_default(UserRoles.STUDENT), bookingController.createBooking);
router5.put("/update/:bookingId", auth_default(UserRoles.STUDENT, UserRoles.TUTOR, UserRoles.ADMIN), bookingController.updateBookingStatus);
var bookingRouter = router5;

// src/modules/review/review.router.ts
import { Router as Router6 } from "express";

// src/modules/review/review.service.ts
var createReview = async (data, studentId) => {
  const { bookingId, rating, review } = data;
  if (!bookingId) {
    throw new Error("Booking Id is required");
  }
  if (!review || review.trim().length === 0) {
    throw new Error("Review cannot be empty");
  }
  const numericRating = Number(rating);
  if (isNaN(numericRating)) {
    throw new Error("Rating must be a number");
  }
  if (numericRating < 1 || numericRating > 5) {
    throw new Error("Rating must be between 1 and 5.0");
  }
  const roundedRating = Number(numericRating.toFixed(1));
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirstOrThrow({
      where: { id: bookingId },
      select: {
        id: true,
        studentId: true,
        tutorId: true,
        status: true
      }
    });
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new Error("Booking must be completed to leave a review");
    }
    if (booking.studentId !== studentId) {
      throw new Error("Not authorized to leave a review for this booking");
    }
    const existingReview = await tx.review.findUnique({
      where: { bookingId }
    });
    if (existingReview) {
      throw new Error("Review already exists for this booking");
    }
    const tutorReviews = await tx.review.findMany({
      where: { tutorId: booking.tutorId },
      select: { rating: true }
    });
    const totalOld = tutorReviews.reduce((acc, r) => acc + Number(r.rating), 0);
    const newAverage = Number(((totalOld + roundedRating) / (tutorReviews.length + 1)).toFixed(1));
    await tx.tutorProfiles.update({
      where: { id: booking.tutorId },
      data: {
        totalReviews: tutorReviews.length + 1,
        avgRating: newAverage
      }
    });
    return await tx.review.create({
      data: {
        bookingId: booking.id,
        studentId,
        tutorId: booking.tutorId,
        rating: roundedRating,
        review: review.trim()
      }
    });
  });
};
var updateReview = async (reviewId, data, studentId) => {
  const { rating, review } = data;
  if (!review || review.trim().length === 0) {
    throw new Error("Review cannot be empty");
  }
  const numericRating = Number(rating);
  if (isNaN(numericRating)) {
    throw new Error("Rating must be a number");
  }
  if (numericRating > 1 || numericRating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
  const roundedRating = Number(numericRating.toFixed(1));
  return await prisma.$transaction(async (tx) => {
    const existingReview = await tx.review.findUniqueOrThrow({
      where: { id: reviewId },
      select: {
        id: true,
        studentId: true,
        tutorId: true,
        rating: true
      }
    });
    if (existingReview.studentId !== studentId) {
      throw new Error("You can only edit your own review");
    }
    const tutor = await tx.tutorProfiles.findFirstOrThrow({
      where: { id: existingReview.tutorId },
      select: {
        avgRating: true,
        totalReviews: true
      }
    });
    const totalOld = Number(tutor.avgRating) * tutor.totalReviews;
    const newAverage = Number(
      ((totalOld - Number(existingReview.rating) + roundedRating) / tutor.totalReviews).toFixed(1)
    );
    await tx.tutorProfiles.update({
      where: { id: existingReview.tutorId },
      data: {
        avgRating: newAverage
      }
    });
    return await tx.review.update({
      where: { id: reviewId },
      data: {
        rating: roundedRating,
        review: review.trim()
      }
    });
  });
};
var reviewService = {
  createReview,
  updateReview
};

// src/modules/review/review.controller.ts
var createReview2 = async (req, res, next) => {
  try {
    const data = req.body;
    const studentId = req.user?.id;
    const result = await reviewService.createReview(data, studentId);
    return res.json({ success: true, message: "Review added successfully ", data: result });
  } catch (e) {
    next(e);
  }
};
var updatReview = async (req, res, next) => {
  try {
    const data = req.body;
    const studentId = req.user?.id;
    const reviewId = req.params.reviewId;
    const result = await reviewService.updateReview(reviewId, data, studentId);
    return res.json({ success: true, message: "Review updated successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var reviewController = {
  createReview: createReview2,
  updatReview
};

// src/modules/review/review.router.ts
var router6 = Router6();
router6.post("/create", auth_default(UserRoles.STUDENT), reviewController.createReview);
router6.put("/update/:reviewId", auth_default(UserRoles.STUDENT), reviewController.updatReview);
var reviewRouter = router6;

// src/middleware/errorHandler.ts
function errorHandler(err, req, res, next) {
  let statusCode = 400;
  let message = err.message || "Internal Server Error";
  let error = err;
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    message = "Missing field or incorrect field type.";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      message = "Record not found.";
    } else if (err.code === "P2002") {
      statusCode = 400;
      message = "Duplicate key error";
    } else if (err.code === "P2003") {
      statusCode = 400;
      message = "Foreign key constraint failed.";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = 500;
    message = "Error occurred during query execution";
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      message = "Authentication error.";
    } else if (err.errorCode === "P1001") {
      statusCode = 400;
      message = "Cannlt connect to the database";
    }
  }
  res.status(statusCode).json({ success: false, message, error });
}
var errorHandler_default = errorHandler;

// src/middleware/notFound.ts
function notFound(req, res) {
  res.status(404).json({
    message: "Route not found"
  });
}

// src/app.ts
var app = express();
app.use(cors({
  origin: process.env.APP_URL || "http://localhost:3000",
  // origin:process.env.FRONTEND_URL,
  //  origin: [
  //     'http://localhost:3000',
  //     'http://localhost:4000'
  //   ],
  credentials: true
}));
app.use(express.json());
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/user", userRouter);
app.use("/api/tutors", tutorRouter);
app.use("/api/categories", categoryRouter);
app.use("/aip/availability", availabilityRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.get("/", (req, res) => {
  res.send("Hello World :prisma is working");
});
app.use(errorHandler_default);
app.use(notFound);
var app_default = app;

// src/server.ts
var PORT = process.env.PORT || 3e3;
async function main() {
  try {
    await prisma.$connect();
    console.log("Connect to the database Successfully");
    app_default.listen(PORT, () => {
      console.log(`server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("An error occurred :", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
main();
