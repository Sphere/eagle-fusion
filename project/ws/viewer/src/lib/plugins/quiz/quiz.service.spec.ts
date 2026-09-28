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

  describe('createAssessmentSubmitRequest mtf resolution', () => {
    const buildMtfQuiz = (): any => ({
      questions: [
        {
          questionId: 'q1',
          questionType: 'mtf',
          options: [
            { optionId: 'o1', text: 'Yellow bag ', match: 'Anatomical waste ', isCorrect: false },
            { optionId: 'o2', text: 'Red bag', match: 'Sharps', isCorrect: false },
          ],
        },
      ],
    })

    it('resolves raw jsPlumb connections into plain options with responses', () => {
      const quiz = buildMtfQuiz()
      const connections = [
        { source: { innerText: 'Yellow bag' }, target: { innerText: 'Anatomical waste' } },
        { source: { innerText: 'Red bag' }, target: { innerText: 'General waste' } },
      ]
      const result = service.createAssessmentSubmitRequest('id1', 'title1', quiz, { q1: [connections] })
      const options: any[] = result.questions[0].options
      expect(options.map(o => o.optionId)).toEqual(['o1', 'o2'])
      expect(options[0].response).toBe('Anatomical waste')
      expect(options[1].response).toBe('General waste')
    })

    it('produces a payload that JSON.stringify can serialise when connections are circular', () => {
      const quiz = buildMtfQuiz()
      const connection: any = { source: { innerText: 'Red bag' }, target: { innerText: 'Sharps' } }
      connection.instance = { connections: [connection] }
      const result = service.createAssessmentSubmitRequest('id1', 'title1', quiz, { q1: [[connection]] })
      expect(() => JSON.stringify(result)).not.toThrow()
    })

    it('leaves an unanswered mtf question without options', () => {
      const quiz = buildMtfQuiz()
      const result = service.createAssessmentSubmitRequest('id1', 'title1', quiz, {})
      expect(result.questions[0].options).toBeUndefined()
    })
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

  describe('checkMtfAnswer', () => {
    const buildQuiz = (): any => ({
      questions: [
        {
          questionId: 'q1',
          questionType: 'mtf',
          options: [
            { optionId: 'o1', text: 'Yellow  bag ', match: ' Anatomical waste', isCorrect: false },
            { optionId: 'o2', text: 'Red bag', match: 'Sharps', isCorrect: false },
            { optionId: 'o3', text: 'Black bag', match: 'General waste', isCorrect: false },
          ],
        },
      ],
    })

    it('matches connections by normalised text and marks each pair isCorrect', () => {
      const quiz = buildQuiz()
      const hash: any = {
        qslideIndex: 0,
        q1: [[
          { source: { innerText: 'Yellow bag' }, target: { innerText: 'ANATOMICAL waste' } },
          { source: { innerText: 'Red bag' }, target: { innerText: 'General waste' } },
        ]],
      }
      const result = service.checkMtfAnswer(quiz, hash)
      const [yellow, red, black] = result.answer
      expect(yellow.text).toBe('Yellow bag')
      expect(yellow.match).toBe('Anatomical waste')
      expect(yellow.response).toBe('ANATOMICAL waste')
      expect(yellow.isCorrect).toBe(true)
      expect(red.response).toBe('General waste')
      expect(red.isCorrect).toBe(false)
      // Not connected: no response, never correct
      expect(black.response).toBe('')
      expect(black.isCorrect).toBe(false)
    })

    it('does not mark a pair correct when both response and match are empty', () => {
      const quiz: any = { questions: [{ questionId: 'q1', options: [{ optionId: 'o1', text: 'A', match: '' }] }] }
      const result = service.checkMtfAnswer(quiz, { qslideIndex: 0, q1: [[]] })
      expect(result.answer[0].isCorrect).toBe(false)
    })

    it('returns an already-resolved answer unchanged instead of wiping responses', () => {
      const quiz = buildQuiz()
      const resolved = [
        { optionId: 'o1', text: 'Yellow bag', match: 'Anatomical waste', response: 'Anatomical waste', isCorrect: true },
      ]
      const result = service.checkMtfAnswer(quiz, { qslideIndex: 0, q1: resolved })
      expect(result.answer).toBe(resolved)
      expect(result.answer[0].response).toBe('Anatomical waste')
      expect(result.isExplanation).toBe(true)
    })

    it('does not throw when the stored entry is not an array', () => {
      const quiz = buildQuiz()
      expect(() => service.checkMtfAnswer(quiz, { qslideIndex: 0, q1: { not: 'an array' } })).not.toThrow()
    })

    it('treats an empty stored array as no connections', () => {
      const quiz = buildQuiz()
      const result = service.checkMtfAnswer(quiz, { qslideIndex: 0, q1: [] })
      expect(result.answer.every((o: any) => o.response === '' && o.isCorrect === false)).toBe(true)
    })
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
