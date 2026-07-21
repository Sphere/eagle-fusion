import { QuizService } from './quiz.service'
import { of, throwError } from 'rxjs'

describe('QuizService', () => {
  let service: QuizService
  let mockHttp: any
  let mockConfigService: any
  let mockIndexedDbService: any
  let mockLogger: any

  beforeEach(() => {
    mockHttp = { post: jest.fn().mockReturnValue(of({})), patch: jest.fn().mockReturnValue(of({})) }
    mockConfigService = { userProfile: { userId: 'u1' } }
    mockIndexedDbService = {
      getRecordFromTable: jest.fn().mockReturnValue(of({ record: true })),
      deleteRecordByKey: jest.fn().mockReturnValue(of({})),
      insertProgressData: jest.fn().mockReturnValue(of({})),
    }
    mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() }

    service = new QuizService(mockHttp, mockConfigService, mockIndexedDbService, mockLogger)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('submitQuizV2 should post request and handle success path of indexeddb chain', () => {
    service.submitQuizV2({ userId: 'u1', courseId: 'c1', contentId: 'ct1' })
    expect(mockIndexedDbService.getRecordFromTable).toHaveBeenCalled()
    expect(mockIndexedDbService.deleteRecordByKey).toHaveBeenCalled()
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('submitQuizV2 should handle error path from getRecordFromTable', () => {
    mockIndexedDbService.getRecordFromTable.mockReturnValue(throwError(() => new Error('fail')))
    service.submitQuizV2({ userId: 'u1', courseId: 'c1', contentId: 'ct1' })
    expect(mockIndexedDbService.insertProgressData).toHaveBeenCalled()
  })

  it('submitQuizV2 should handle deleteRecordByKey error callback', () => {
    mockIndexedDbService.deleteRecordByKey.mockReturnValue(throwError(() => new Error('del fail')))
    service.submitQuizV2({ userId: 'u1', courseId: 'c1', contentId: 'ct1' })
    expect(mockLogger.error).toHaveBeenCalled()
  })

  it('competencySubmitQuizV2 should call http post', () => {
    service.competencySubmitQuizV2({} as any)
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('updatePassbook should call http patch', () => {
    service.updatePassbook({ a: 1 })
    expect(mockHttp.patch).toHaveBeenCalled()
  })

  it('updateAshaAssessment should call http post', () => {
    service.updateAshaAssessment({ a: 1 })
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('createAssessmentSubmitRequest should mark mcq options as userSelected', () => {
    const quiz: any = {
      questions: [
        {
          questionId: 'q1',
          questionType: 'mcq-sca',
          options: [{ optionId: 'o1' }, { optionId: 'o2' }],
        },
      ],
    }
    const result = service.createAssessmentSubmitRequest('id1', 'title1', quiz, { q1: ['o1'] })
    expect(result.questions[0].options[0].userSelected).toBe(true)
    expect(result.questions[0].options[1].userSelected).toBe(false)
  })

  it('createAssessmentSubmitRequest should handle fitb question type', () => {
    const quiz: any = {
      questions: [
        {
          questionId: 'q1',
          questionType: 'fitb',
          options: [{ optionId: 'o1' }],
        },
      ],
    }
    const result = service.createAssessmentSubmitRequest('id1', 'title1', quiz, { q1: ['answer1'] })
    expect(result.questions[0].options[0].response).toBe('answer1')
  })

  it('createAssessmentSubmitRequest should handle mtf question type', () => {
    const quiz: any = {
      questions: [
        {
          questionId: 'q1',
          questionType: 'mtf',
          options: [{ optionId: 'o1' }],
        },
      ],
    }
    const newOptions = [{ optionId: 'x1' }]
    const result = service.createAssessmentSubmitRequest('id1', 'title1', quiz, { q1: newOptions })
    expect(result.questions[0].options).toBe(newOptions)
  })

  it('checkAnswer should mark isCorrect true when user selected correct option', () => {
    const quiz: any = {
      questions: [
        {
          questionId: 'q1',
          options: [
            { optionId: 'o1', isCorrect: true, text: 'A' },
            { optionId: 'o2', isCorrect: false, text: 'B' },
          ],
        },
      ],
    }
    const result = service.checkAnswer(quiz, { qslideIndex: 0, q1: ['o1'] })
    expect(result.isCorrect).toBe(true)
    expect(result.answer).toBe('A')
  })

  it('checkAnswer should mark isCorrect false when user selected wrong option', () => {
    const quiz: any = {
      questions: [
        {
          questionId: 'q1',
          options: [
            { optionId: 'o1', isCorrect: true, text: 'A' },
            { optionId: 'o2', isCorrect: false, text: 'B' },
          ],
        },
      ],
    }
    const result = service.checkAnswer(quiz, { qslideIndex: 0, q1: ['o2'] })
    expect(result.isCorrect).toBe(false)
  })

  it('checkAnswer should handle fitb question type match', () => {
    const quiz: any = {
      questions: [
        {
          questionId: 'q1',
          questionType: 'fitb',
          options: [{ optionId: 'o1', isCorrect: true, text: 'Answer' }],
        },
      ],
    }
    const result = service.checkAnswer(quiz, { qslideIndex: 0, q1: ['answer'] })
    expect(result.isCorrect).toBe(true)
  })

  it('shuffle should return array of same length', () => {
    const array = [1, 2, 3, 4, 5]
    const result = service.shuffle([...array])
    expect(result.length).toBe(array.length)
    expect(result.sort()).toEqual(array.sort())
  })

  it('checkMtfAnswer should compute responses and matchForView', () => {
    const quiz: any = {
      questions: [
        {
          questionId: 'q1',
          options: [
            { optionId: 'o1', text: 'Source1', match: 'Target1' },
          ],
        },
      ],
    }
    const questionAnswerHash: any = {
      qslideIndex: 0,
      q1: [[
        { source: { innerText: 'Source1' }, target: { innerText: 'Target1' } },
      ]],
    }
    const result = service.checkMtfAnswer(quiz, questionAnswerHash)
    expect(result.isExplanation).toBe(true)
    expect(quiz.questions[0].options[0].response).toBe('Target1')
  })

  it('checkMtfAnswer should default response to empty string when no match', () => {
    const quiz: any = {
      questions: [
        {
          questionId: 'q1',
          options: [
            { optionId: 'o1', text: 'Source1', match: 'Target1' },
          ],
        },
      ],
    }
    const questionAnswerHash: any = { qslideIndex: 0 }
    service.checkMtfAnswer(quiz, questionAnswerHash)
    expect(quiz.questions[0].options[0].response).toBe('')
  })

  it('sanitizeAssessmentSubmitRequest should strip text/hint for non fitb/mtf and filter no-option questions', () => {
    const requestData: any = {
      questions: [
        { questionType: 'mcq-sca', question: 'Q', options: [{ text: 'A', hint: 'h' }] },
        { questionType: 'fitb', question: 'Q2', options: [{ text: 'B', hint: 'h' }] },
        { questionType: 'mcq-sca', question: 'Q3', options: undefined },
      ],
    }
    const result = service.sanitizeAssessmentSubmitRequest(requestData)
    expect(result.questions.length).toBe(2)
    expect(result.questions[0].question).toBe('')
    expect(result.questions[0].options[0].text).toBe('')
    expect(result.questions[1].options[0].text).toBe('B')
  })
})
