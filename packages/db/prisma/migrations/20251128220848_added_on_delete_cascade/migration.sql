-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_user_id_fkey";

-- DropForeignKey
ALTER TABLE "CourseDoc" DROP CONSTRAINT "CourseDoc_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_course_id_fkey";

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseDoc" ADD CONSTRAINT "CourseDoc_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
