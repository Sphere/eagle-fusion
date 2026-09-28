import { QuizService } from './quiz.service'

/**
 * Regression: an MTF answer reaching submit still holding raw jsPlumb connections put a circular
 * structure (connection → `_jsPlumb` instance → connection) into the request, and `JSON.stringify`
 * threw "Converting circular structure to JSON" in the IndexedDB save and the submit POST.
 */
describe('QuizService', () => {
  let service: QuizService

  // Mimics a jsPlumb connection: plain source/target elements plus a back-reference to the instance
  const connection = (source: string, target: string) => {
    const instance: any = { connections: [] }
    const conn = { source: { innerText: source }, target: { innerText: target }, _jsPlumb: instance }
    instance.connections.push(conn)
    return conn
  }

  const mtfQuiz = (): any => ({
    questions: [
      {
        questionId: 'q1',
        questionType: 'mtf',
        options: [
          { optionId: 'o1', text: 'Apple', match: 'Red' },
          { optionId: 'o2', text: 'Banana', match: 'Yellow' },
        ],
      },
    ],
  })

  beforeEach(() => {
    service = new QuizService({} as any, {} as any, {} as any, { log: jest.fn(), error: jest.fn() } as any)
  })

  describe('createAssessmentSubmitRequest', () => {
    it('resolves unresolved MTF connections into a serializable payload', () => {
      const hash = { q1: [[connection('Apple', 'Red'), connection('Banana', 'Green')]] }

      const request: any = service.createAssessmentSubmitRequest('id', 'title', mtfQuiz(), hash)

      expect(() => JSON.stringify(request)).not.toThrow()
      const [apple, banana] = request.questions[0].options
      expect(apple).toEqual(expect.objectContaining({ text: 'Apple', response: 'Red', isCorrect: true }))
      expect(banana).toEqual(expect.objectContaining({ text: 'Banana', response: 'Green', isCorrect: false }))
    })

    it('keeps an MTF answer already resolved by checkMtfAnswer as-is', () => {
      const resolved = [{ optionId: 'o1', text: 'Apple', match: 'Red', response: 'Red', isCorrect: true }]

      const request: any = service.createAssessmentSubmitRequest('id', 'title', mtfQuiz(), { q1: resolved })

      expect(request.questions[0].options).toBe(resolved)
    })

    it('leaves an unanswered MTF question without options', () => {
      const request: any = service.createAssessmentSubmitRequest('id', 'title', mtfQuiz(), {})

      expect(request.questions[0].options).toBeUndefined()
    })
  })

  describe('checkMtfAnswer', () => {
    it('marks a pair correct only when the connected response matches, ignoring whitespace and case', () => {
      const quiz = mtfQuiz()
      quiz.questions[0].options[0].text = 'Apple  '
      const hash = { qslideIndex: 0, q1: [[connection('Apple', ' red ')]] }

      const [apple, banana] = service.checkMtfAnswer(quiz, hash).answer

      expect(apple).toEqual(expect.objectContaining({ text: 'Apple', response: 'red', isCorrect: true }))
      expect(banana).toEqual(expect.objectContaining({ response: '', isCorrect: false }))
    })

    it('returns an already-resolved answer instead of wiping every response', () => {
      const resolved = [{ optionId: 'o1', text: 'Apple', match: 'Red', response: 'Red', isCorrect: true }]

      const result = service.checkMtfAnswer(mtfQuiz(), { qslideIndex: 0, q1: resolved })

      expect(result.answer).toBe(resolved)
      expect(result.isExplanation).toBe(true)
    })
  })
})
