/*
  Warnings:

  - Added the required column `category` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Exercise" ADD COLUMN     "category" TEXT NOT NULL;
