const Interview = require('../models/Interview');
const { generateInterviewQuestions, evaluateInterviewSession } = require('../services/geminiService');

// @desc    Create a new interview session and generate AI questions
// @route   POST /api/interviews
// @access  Private
const createInterview = async (req, res, next) => {
  try {
    const {
      jobRole = 'Software Engineer',
      experienceLevel = 'Fresher',
      interviewType = 'Technical',
      difficulty = 'Medium',
      questionCount = 5,
      preferredMethod = 'Both',
      cameraEnabled = false,
    } = req.body;

    const countNum = parseInt(questionCount, 10);
    const validCount = [5, 10, 15].includes(countNum) ? countNum : 5;

    // Generate questions using Gemini AI or domain fallback
    const { questions, source } = await generateInterviewQuestions({
      jobRole: jobRole.trim(),
      experienceLevel,
      interviewType,
      difficulty,
      count: validCount,
    });

    // Initialize answer placeholders
    const initialAnswers = questions.map((q) => ({
      questionId: q.id,
      questionText: q.question,
      answerText: '',
      speechUsed: false,
      timeSpentSeconds: 0,
      answeredAt: new Date(),
    }));

    const interview = await Interview.create({
      userId: req.user._id,
      jobRole: jobRole.trim(),
      experienceLevel,
      interviewType,
      difficulty,
      questionCount: validCount,
      preferredMethod,
      cameraEnabled: Boolean(cameraEnabled),
      questions,
      answers: initialAnswers,
      completionStatus: 'in-progress',
      startedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: `Interview session generated successfully (${source})`,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's interview history with filtering & pagination
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };

    if (req.query.status) {
      query.completionStatus = req.query.status;
    }

    if (req.query.role) {
      query.jobRole = new RegExp(req.query.role, 'i');
    }

    if (req.query.type) {
      query.interviewType = req.query.type;
    }

    if (req.query.search) {
      query.$or = [
        { jobRole: new RegExp(req.query.search, 'i') },
        { interviewType: new RegExp(req.query.search, 'i') },
      ];
    }

    const total = await Interview.countDocuments(query);
    const interviews = await Interview.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-evaluationResults.suggestedIdealAnswer'); // Keep list payload light

    res.status(200).json({
      success: true,
      count: interviews.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific interview session by ID
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    // Strict ownership verification: Prevent access to other users' records
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to view this interview session.',
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Autosave / update in-progress answers
// @route   PUT /api/interviews/:id/answers
// @access  Private
const saveAnswers = async (req, res, next) => {
  try {
    const { answers, cameraEnabled, faceEvents, multipleFacesDetected } = req.body;

    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (interview.completionStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify answers for an interview that has already been submitted.',
      });
    }

    if (Array.isArray(answers)) {
      interview.answers = answers;
    }

    if (typeof cameraEnabled === 'boolean') {
      interview.cameraEnabled = cameraEnabled;
    }

    if (typeof multipleFacesDetected === 'boolean') {
      interview.multipleFacesDetected = multipleFacesDetected;
    }

    if (Array.isArray(faceEvents) && faceEvents.length > 0) {
      interview.faceEvents = faceEvents;
    }

    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Answers saved successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit interview session for AI Evaluation
// @route   POST /api/interviews/:id/submit
// @access  Private
const submitInterview = async (req, res, next) => {
  try {
    const { answers, faceEvents, multipleFacesDetected } = req.body;

    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Prevent duplicate evaluation requests
    if (interview.completionStatus === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'This interview was already submitted and evaluated.',
        interview,
      });
    }

    // Update answers if provided in submission payload
    if (Array.isArray(answers) && answers.length > 0) {
      interview.answers = answers;
    }

    if (typeof multipleFacesDetected === 'boolean') {
      interview.multipleFacesDetected = multipleFacesDetected;
    }

    if (Array.isArray(faceEvents)) {
      interview.faceEvents = faceEvents;
    }

    console.log(`[Interview Controller] Evaluating interview ${interview._id} for role: ${interview.jobRole}...`);

    // Call Gemini AI or resilient algorithmic evaluator
    const evaluation = await evaluateInterviewSession({
      jobRole: interview.jobRole,
      experienceLevel: interview.experienceLevel,
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,
      questions: interview.questions,
      answers: interview.answers,
      cameraEnabled: interview.cameraEnabled,
      multipleFacesDetected: interview.multipleFacesDetected,
    });

    interview.evaluationResults = evaluation.questions;
    interview.overallScore = evaluation.overallScore;
    interview.overallFeedback = evaluation.overallFeedback;
    interview.strengths = evaluation.strengths;
    interview.weaknesses = evaluation.weaknesses;
    interview.improvementPlan = evaluation.improvementPlan;
    interview.completionStatus = 'completed';
    interview.completedAt = new Date();

    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Interview evaluated and completed successfully!',
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an interview record
// @route   DELETE /api/interviews/:id
// @access  Private
const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await interview.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Interview record removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterview,
  getInterviews,
  getInterviewById,
  saveAnswers,
  submitInterview,
  deleteInterview,
};
