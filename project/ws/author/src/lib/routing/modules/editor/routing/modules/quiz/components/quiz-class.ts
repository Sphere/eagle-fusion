export class Question {
  public question: string
  public questionType: string
  public questionId?: string
  public isInValid?: boolean
  constructor(init: Partial<any>) {
    this.questionId = init.questionId || ''
    this.question = init.question || ''
    this.questionType = init.questionType || 'mcq-sca'
  }
}

// tslint:disable-next-line: max-classes-per-file
export class FillUps extends Question {
  public options: Option[]
  constructor(init: Partial<any>) {
    super(init)
    this.options = init.options ? init.options.map((op: any) => new Option(op)) : []
  }
}
// tslint:disable-next-line: max-classes-per-file
export class McqQuiz extends Question {
  public options: Option[]
  public multiSelection: boolean
  constructor(init: Partial<any>) {
    super(init)
    this.options = this.options = init.options ? init.options.map((op: any) => new Option(op)) : []
    this.multiSelection = init.multiSelection || false
  }
}

// tslint:disable-next-line: max-classes-per-file
export class MatchQuiz extends Question {
  // public colAName: string
  // public colBName: string
  public options: MatchOption[]
  constructor(init: Partial<any>) {
    super(init)
    // this.colAName = init.colAName || ''
    // this.colBName = init.colBName || ''
    this.options = this.options = init.options ? init.options.map((op: any) => new MatchOption(op)) : []
  }
}

// tslint:disable-next-line: max-classes-per-file
export class Option {
  public optionId: string
  public text: string
  public hint?: string
  public isCorrect: boolean
  constructor(init: Partial<any>) {
    this.text = init.text || ''
    this.optionId = init.optionId || ''
    this.isCorrect = init.isCorrect
  }
}

// tslint:disable-next-line: max-classes-per-file
export class MatchOption extends Option {
  public match?: string
  constructor(init: Partial<any>) {
    super(init)
    this.match = init.match || ''
  }
}
