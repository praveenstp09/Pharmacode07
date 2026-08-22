import TestAttempt from '../models/TestAttempt.js';
import TestPaper from '../models/TestPaper.js';

// @desc    Submit a test attempt and calculate score
// @route   POST /api/attempts/submit
// @access  Private
export const submitAttempt = async (req, res) => {
  try {
    const { paperId, answers, timeSpentSeconds } = req.body;

    if (!paperId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Invalid submission data' });
    }

    const paper = await TestPaper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Test paper not found' });
    }

    const positiveMark = paper.positiveMarks || 1;
    const negativeMark = paper.negativeMarks || 0.25;
    const totalQuestions = paper.questions.length;

    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const formattedAnswers = paper.questions.map((q, index) => {
      const studentAnsObj = answers[index];
      const selectedOption = studentAnsObj !== undefined && studentAnsObj !== null 
        ? (typeof studentAnsObj === 'object' ? studentAnsObj.selectedOption : studentAnsObj)
        : -1;
      const questionTime = (typeof studentAnsObj === 'object' && studentAnsObj.timeSpentSeconds) || 0;

      if (selectedOption === -1 || selectedOption === undefined || selectedOption === null) {
        unattemptedCount++;
        return {
          selectedOption: -1,
          timeSpentSeconds: questionTime,
          isCorrect: false,
        };
      } else if (selectedOption === q.correctOptionIndex) {
        correctCount++;
        score += positiveMark;
        return {
          selectedOption,
          timeSpentSeconds: questionTime,
          isCorrect: true,
        };
      } else {
        incorrectCount++;
        score -= negativeMark;
        return {
          selectedOption,
          timeSpentSeconds: questionTime,
          isCorrect: false,
        };
      }
    });

    // Score can't be negative if total is 0, but can be negative if rules allow. Let's keep precise 2 decimals:
    score = Math.round(score * 100) / 100;
    const totalPossibleMarks = paper.totalMarks || totalQuestions * positiveMark || 1;
    const percentage = totalPossibleMarks > 0 
      ? Math.max(0, Math.round(((score / totalPossibleMarks) * 100) * 100) / 100)
      : 0;

    const attempt = await TestAttempt.create({
      userId: req.user.id,
      testSeriesId: paper.testSeriesId || null,
      testPaperId: paper._id,
      score,
      totalMarks: totalPossibleMarks,
      correctCount,
      incorrectCount,
      unattemptedCount,
      percentage,
      timeSpentSeconds: timeSpentSeconds || 0,
      answers: formattedAnswers,
    });

    res.status(201).json({
      success: true,
      attemptId: attempt._id,
      result: {
        score,
        totalMarks: totalPossibleMarks,
        correctCount,
        incorrectCount,
        unattemptedCount,
        percentage,
        timeSpentSeconds: attempt.timeSpentSeconds,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all attempts for logged in student
// @route   GET /api/attempts/my-attempts
// @access  Private
export const getMyAttempts = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({ userId: req.user.id })
      .populate('testSeriesId', 'title slug examType')
      .populate('testPaperId', 'title paperNumber durationMinutes totalMarks')
      .sort({ completedAt: -1 });

    res.json({
      success: true,
      count: attempts.length,
      data: attempts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed attempt analysis with question explanations
// @route   GET /api/attempts/:attemptId
// @access  Private
export const getAttemptById = async (req, res) => {
  try {
    const attempt = await TestAttempt.findById(req.params.attemptId)
      .populate('testSeriesId', 'title slug examType')
      .populate('testPaperId');

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    // Verify student owns this attempt or is admin
    if (attempt.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this test result' });
    }

    const paper = attempt.testPaperId;
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'The test paper associated with this attempt has been deleted or is no longer available.',
      });
    }

    // Combine questions with student responses & explanations
    const detailedQuestions = paper.questions.map((q, idx) => {
      const studentAns = attempt.answers[idx] || { selectedOption: -1, isCorrect: false, timeSpentSeconds: 0 };
      return {
        questionNumber: idx + 1,
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        selectedOption: studentAns.selectedOption,
        isCorrect: studentAns.isCorrect,
        timeSpentSeconds: studentAns.timeSpentSeconds,
        explanation: q.explanation,
        subject: q.subject,
        topic: q.topic,
        imageUrl: q.imageUrl,
      };
    });

    res.json({
      success: true,
      data: {
        _id: attempt._id,
        testSeriesTitle: attempt.testSeriesId?.title,
        testSeriesSlug: attempt.testSeriesId?.slug,
        testPaperTitle: paper.title,
        paperId: paper._id,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        unattemptedCount: attempt.unattemptedCount,
        percentage: attempt.percentage,
        timeSpentSeconds: attempt.timeSpentSeconds,
        completedAt: attempt.completedAt,
        questions: detailedQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
