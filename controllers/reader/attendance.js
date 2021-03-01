const Student = require('../../models/student');
const Course = require('../../models/course');
const Attendance = require('../../models/attendance');

const { 
  createError,
  checkStatusCode 
} = require('../../util/error-handler');
const io = require('../../util/socket');

exports.checkAttendance = async (req, res, next) => {
  const { courseId, rfidTag } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course)
      throw createError('Course not found', 404);

    const student = await Student.findOne({ rfidTag });
    if (!student)
      throw createError('Student not found', 404);

    const studentInCourse = course.regStudentIds.includes(student._id);
    if (studentInCourse) {
      const attendance = new Attendance({
        courseId: course._id,
        studentId: student._id
      });
      await attendance.save();
    } else {
      // to different model
    }

    io.getIO().emit('attendance', {
      action: 'create',
      studentName: student.name
    })
    res.status(201).json({
      message: studentInCourse ? 
        'Check attendance successfully :D' :
        'Student does not registered for this course :D',
      course: course._id,
      student: student.name
    })
  } catch (error) {
    
  }
};