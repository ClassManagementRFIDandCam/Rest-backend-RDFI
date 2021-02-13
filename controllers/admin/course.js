const { validationResult } = require('express-validator');

const Course = require('../../models/course');
const Subject = require('../../models/subject');
const Lecturer = require('../../models/lecturer');
const Student = require('../../models/student');

const {
  checkStatusCode,
  createError
} = require('../../util/error-handler');

exports.createCourse = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    throw createError('Validation failed D:', 422, errors.array());

  const {
    classType, room, weekday,
    periods,
    lecturerId, subjectId
  } = req.body;

  try {
    const existingCourses = await Course.find({ room, weekday });

    const overlappingCourse = existingCourses.find(course => {
      course.periods.some(period => periods.includes(period))
    })
    if (overlappingCourse)
      throw createError('Courses are overlapping', 503, overlappingCourse);

    const course = new Course({
      classType, room, weekday,
      periods,
      lecturerId, subjectId
    });
    await course.save();

    const lecturer = await Lecturer.findById(lecturerId);
    lecturer.courses.push(course);
    await lecturer.save();

    const subject = await Subject.findById(subjectId);
    subject.courses.push(course);
    await subject(save);

    res.status(201).json({
      message: 'Created course :D',
      course,
      subject,
      lecturer
    });
  } catch (error) {
    checkStatusCode(error, next);
  }
};

// TODO update overlapping logic
exports.updateCourse = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    throw createError('Validation failed D:', 422, errors.array());

  const {
    courseId,
    classType, room, weekday,
    periods
  } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course)
      throw createError('Course not found D:', 404);

    course.classType = classType;
    course.room = room;
    course.weekday = weekday;
    course.periods = periods;
    await course.save();
  } catch (error) {
    checkStatusCode(error, next);
  }
};

exports.deleteCourse = async (req, res, next) => {
  const { courseId } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course)
      throw createError('Course not found D:', 404);

    await Course.findByIdAndRemove(courseId);
    res.status(200).json({ message: 'Deleted course :D' });
  } catch (error) {
    checkStatusCode(error, next);
  }
};

exports.getCourse = async (req, res, next) => {
  const { courseId } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course)
      throw createError('Course not found D:', 404);

    res.status(200).json({ message: 'Fetched course :D', course });
  } catch (error) {
    checkStatusCode(error, next);
  }
}

exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find();

    res.status(200).json({ courses });
  } catch (error) {
    checkStatusCode(error, next);
  }
};

exports.getCoursesByLecturerId = async (req, res, next) => {
  const { lecturerId } = req.body;
  try {
    const courses = await Course.find({ lecturerId });

    res.status(200).json({ courses });
  } catch (error) {
    checkStatusCode(error, next);
  }
};

exports.getCoursesBySubjectId = async (req, res, next) => {
  const { subjectId } = req.body;
  try {
    const courses = await Course.find({ subjectId });

    res.status(200).json({ courses });
  } catch (error) {
    checkStatusCode(error, next);
  }
};

exports.getRegistrations = async (req, res, next) => {
  const { courseId } = req.body;

  try {
    const course = await Course.findById(courseId).populate('regStudentIds');
    if (!course)
      throw createError('Course not found D:', 404);

    const students = await Student.find();
    if (!students)
      throw createError('No student created D:', 503);

    res.status(200).json({
      message: 'Fetched course\'s student ids :D',
      regStudents: course.regStudentIds,
      students: students
    })
  } catch (error) {
    checkStatusCode(error, next);
  }
};

// TODO
exports.updateRegistration = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    throw createError('Validation failed D:', 422, errors.array());

  const { regStudentIds, courseId } = req.body;

  try {
    const course = await Course.findById(courseId).populate('regStudentIds');
    console.log(course);
    res.status(200);
  } catch (error) {
    checkStatusCode(error, next);
  }
};