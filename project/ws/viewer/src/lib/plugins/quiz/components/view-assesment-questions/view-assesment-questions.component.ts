import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { NSQuiz } from '../../quiz.model'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { jsPlumb, OnConnectionBindInfo } from 'jsplumb'
import { QuizService } from '../../quiz.service'
import * as _ from 'lodash'
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs'
@Component({
  selector: 'viewer-view-assesment-questions',
  templateUrl: './view-assesment-questions.component.html',
  styleUrls: ['./view-assesment-questions.component.scss'],
})
export class ViewAssesmentQuestionsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() artifactUrl = ''

  @Input() viewState = 'initial'
  @Input() question: NSQuiz.IQuestion = {
    multiSelection: false,
    question: '',
    questionId: '',
    options: [
      {
        optionId: '',
        text: '',
        isCorrect: false,
      },
    ],
  }
  @Output() itemSelected = new EventEmitter<string | Object>()
  @Input() itemSelectedList: string[] = []
  @Input() markedQuestions: Set<string> = new Set()
  title = 'match'
  jsPlumbInstance: any
  safeQuestion: SafeHtml = ''
  correctOption: boolean[] = []
  unTouchedBlank: boolean[] = []
  matchHintDisplay: NSQuiz.IOption[] = []
  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers']
  public unsubscribe = new Subject<void>()
  constructor(
    private domSanitizer: DomSanitizer,
    private elementRef: ElementRef,
    public quizService: QuizService) {

  }

  ngOnInit() {
    const res: string[] = this.question.question.match(/<img[^>]+src="([^">]+)"/g) || ['']
    for (const oldImg of res) {
      if (oldImg) {
        let temp = oldImg.match(/src="([^">]+)"/g) || ['']
        const toBeReplaced = temp[0]
        temp = [temp[0].replace('src="/', '')]
        temp = [temp[0].replace(/\"/g, '')]
        const baseUrl = this.artifactUrl.split('/')
        const newUrl = this.artifactUrl.replace(baseUrl[baseUrl.length - 1], temp[0])
        this.question.question = this.question.question.replace(toBeReplaced, `src="${newUrl}"`)
      }
    }
    if (this.question.questionType === 'fitb') {
      const iterationNumber = (this.question.question.match(/<input/g) || []).length
      for (let i = 0; i < iterationNumber; i += 1) {
        this.question.question = this.question.question.replace('<input', 'idMarkerForReplacement')
        this.correctOption.push(false)
        this.unTouchedBlank.push(true)
      }
      for (let i = 0; i < iterationNumber; i += 1) {
        this.question.question = this.question.question.replace(
          'idMarkerForReplacement',
          `<input matInput style="border-style: none none solid none;
          border-width: 1px; padding: 8px 12px;" type="text" id="${this.question.questionId}${i}"`,
        )
      }
      this.safeQuestion = this.domSanitizer.bypassSecurityTrustHtml(this.question.question)
    }
    if (this.question.questionType === 'mtf') {
      this.question.options.map(option => (option.matchForView = option.match))
      const array = this.question.options.map(elem => elem.match)
      const arr = this.shuffle(array)
      for (let i = 0; i < this.question.options.length; i += 1) {
        this.question.options[i].matchForView = arr[i]
      }
      const matchHintDisplayLocal = [...this.question.options]
      matchHintDisplayLocal.forEach(element => {
        if (element.hint) {
          this.matchHintDisplay.push(element)
        }
      })
    }
    this.quizService.updateMtf$.pipe(takeUntil(this.unsubscribe)).subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      (res: any) => {
        if (!_.isUndefined(res)) {
          if (res) {
            this.initJsPlump()
          } else {
            if (this.jsPlumbInstance) {
              this.jsPlumbInstance.reset()
              this.jsPlumbInstance.deleteEveryConnection()
            }

          }
        }

      })
  }
  initFitb() {
    if (this.question.questionType === 'fitb') {
      const iterationNumber = (this.question.question.match(/<input/g) || []).length
      for (let i = 0; i < iterationNumber; i += 1) {
        this.question.question = this.question.question.replace('<input', 'idMarkerForReplacement')
        this.correctOption.push(false)
        this.unTouchedBlank.push(true)
      }
      for (let i = 0; i < iterationNumber; i += 1) {
        this.question.question = this.question.question.replace(
          'idMarkerForReplacement',
          `<input matInput style="border-style: none none solid none;
          border-width: 1px; padding: 8px 12px;" type="text" id="${this.question.questionId}${i}"`,
        )
      }
      this.safeQuestion = this.domSanitizer.bypassSecurityTrustHtml(this.question.question)
      for (let i = 0; i < (this.question.question.match(/<input/g) || []).length; i += 1) {
        this.elementRef.nativeElement
          .querySelector(`#${this.question.questionId}${i}`)
          .addEventListener('change', this.onChange.bind(this, this.question.questionId + i))
      }
    }

  }
  initJsPlump() {
    if (this.question.questionType === 'mtf') {
      this.jsPlumbInstance = jsPlumb.getInstance({
        DragOptions: {
          cursor: 'pointer',
        },
        PaintStyle: {
          stroke: 'rgba(0,0,0,0.5)',
          strokeWidth: 3,
        },
      })
      const connectorType = ['Bezier', { curviness: 10 }]
      this.jsPlumbInstance.bind('connection', (_i: any, _c: any) => {
        this.itemSelected.emit(this.jsPlumbInstance.getAllConnections())
      })
      this.jsPlumbInstance.bind('connectionDetached', (i: OnConnectionBindInfo, _c: any) => {
        this.setBorderColor(i, '')
        this.resetColor()
      })
      this.jsPlumbInstance.bind(
        'connectionMoved',
        (i: { originalSourceId: string; newSourceId: string; originalTargetId: string }, _c: any) => {
          this.setBorderColorById(i.originalSourceId, '')
          this.setBorderColorById(i.newSourceId, '')
          this.setBorderColorById(i.originalTargetId, '')
          this.resetColor()
        })
      // get the list of ".smallWindow" elements.
      const questionSelector = `.question${this.question.questionId}`
      const answerSelector = `.answer${this.question.questionId}`
      const questions = this.jsPlumbInstance.getSelector(questionSelector)
      const answers = this.jsPlumbInstance.getSelector(answerSelector)
      if (answers.length > 0) {
        this.jsPlumbInstance.batch(() => {
          this.jsPlumbInstance.makeSource((questions as unknown as string), {
            maxConnections: 1,
            connector: connectorType,
            overlay: 'Arrow',
            endpoint: [
              'Dot',
              {
                radius: 3,
              },
            ],
            anchor: 'Right',
          })
          this.jsPlumbInstance.makeTarget(answers as unknown as string, {
            maxConnections: 1,
            dropOptions: {
              hoverClass: 'hover',
            },
            anchor: 'Left',
            endpoint: [
              'Dot',
              {
                radius: 3,
              },
            ],
          })
        })
      }

    } else if (this.question.questionType === 'fitb') {
      for (let i = 0; i < (this.question.question.match(/<input/g) || []).length; i += 1) {
        this.elementRef.nativeElement
          .querySelector(`#${this.question.questionId}${i}`)
          .addEventListener('change', this.onChange.bind(this, this.question.questionId + i))
      }
    }
  }
  ngAfterViewInit() {
    this.jsPlumbInstance = jsPlumb.getInstance({
      DragOptions: {
        cursor: 'pointer',
      },
      PaintStyle: {
        stroke: 'rgba(0,0,0,0.5)',
        strokeWidth: 3,
      },
    })
    if (this.question.questionType === 'fitb') {
      for (let i = 0; i < (this.question.question.match(/<input/g) || []).length; i += 1) {
        this.elementRef.nativeElement
          .querySelector(`#${this.question.questionId}${i}`)
          .addEventListener('change', this.onChange.bind(this, this.question.questionId + i))
      }
    }
  }

  get numConnections() {
    if (this.jsPlumbInstance) {
      return (this.jsPlumbInstance.getAllConnections() as any[]).length
    }

    return 0
  }

  onEntryInBlank(id: any) {
    const arr = []
    for (let i = 0; i < (this.question.question.match(/<input/g) || []).length; i += 1) {
      const blank: HTMLInputElement = this.elementRef.nativeElement.querySelector(`#${this.question.questionId}${i}`)
      arr.push(_.toLower(blank.value.trim()))
    }
    this.itemSelected.emit(arr.join())
    this.ifFillInTheBlankCorrect(id)
  }

  isSelected(option: NSQuiz.IOption) {
    return this.itemSelectedList && this.itemSelectedList.indexOf(option.optionId) !== -1
  }

  isQuestionMarked() {
    return this.markedQuestions.has(this.question.questionId)
  }

  markQuestion() {
    if (this.markedQuestions.has(this.question.questionId)) {
      this.markedQuestions.delete(this.question.questionId)
    } else {
      this.markedQuestions.add(this.question.questionId)
    }
  }

  onChange(id: any, _event: any) {
    this.onEntryInBlank(id)
  }

  setBorderColorById(id: string, color: string | null) {
    const elementById: HTMLElement | null = document.getElementById(id)
    if (elementById && color) {
      elementById.style.borderColor = color
    }
  }

  setBorderColor(bindInfo: OnConnectionBindInfo, color: string) {
    const connnectionSourceId: HTMLElement | null = document.getElementById(bindInfo.sourceId)
    const connnectionTargetId: HTMLElement | null = document.getElementById(bindInfo.targetId)
    if (connnectionSourceId != null) {
      connnectionSourceId.style.borderColor = color
    }
    if (connnectionTargetId != null) {
      connnectionTargetId.style.borderColor = color
    }
  }

  @HostListener('window:resize')
  onResize(_event: any) {
    if (this.question.questionType === 'mtf') {
      this.jsPlumbInstance.repaintEverything()
    }
  }

  repaintEveryThing() {
    if (this.question.questionType === 'mtf') {
      this.jsPlumbInstance.repaintEverything()
    }
  }

  ifFillInTheBlankCorrect(id: string) {
    const blankPosition: number = id.slice(-1) as unknown as number
    const text = this.question.options[blankPosition].text
    const valueOfBlank = document.getElementById(id) as HTMLInputElement
    if (text.trim().toLowerCase() === valueOfBlank.value.trim().toLowerCase()) {
      this.correctOption[blankPosition] = true
    } else {
      this.correctOption[blankPosition] = false
    }
    if (valueOfBlank.value.length < 1) {
      this.unTouchedBlank[blankPosition] = true
    } else {
      this.unTouchedBlank[blankPosition] = false
    }
  }

  shuffle(array: any[] | (string | undefined)[]) {
    let currentIndex = array.length
    let temporaryValue
    let randomIndex

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1

      // And swap it with the current element.
      temporaryValue = array[currentIndex]
      array[currentIndex] = array[randomIndex]
      array[randomIndex] = temporaryValue
    }

    return array
  }

  reset() {
    this.resetColor()
    this.resetMtf()
    if (this.question.questionType === 'fitb') {
      this.resetBlankBorder()
    } else if (this.question.questionType === 'mtf') {
      this.resetColor()
      this.resetMtf()
    }
  }

  resetMtf() {
    this.jsPlumbInstance.deleteEveryConnection()
    if (this.question.questionType === 'mtf') {
      this.jsPlumbInstance.deleteEveryConnection()
    }
  }

  resetColor() {
    const a = this.jsPlumbInstance.getAllConnections() as any[]
    a.forEach((element: { setPaintStyle: (arg0: { stroke: string }) => void }) => {
      element.setPaintStyle({
        stroke: 'rgba(0,0,0,0.5)',
      })
      // this.setBorderColor(element, '')
    })
  }

  changeColor() {
    const a = this.jsPlumbInstance.getAllConnections() as any[]
    if (a.length < this.question.options.length) {
      alert('Please select all answers')
      return
    }
    a.forEach(element => {
      const b = element.sourceId
      const options = this.question.options
      if (options) {
        const match = options[(b.slice(-1) as number) - 1].match
        if (match && match.trim() === element.target.innerHTML.trim()) {
          element.setPaintStyle({
            stroke: '#357a38',
          })
          this.setBorderColor(element, '#357a38')
        } else {
          element.setPaintStyle({
            stroke: '#f44336',
          })
          this.setBorderColor(element, '#f44336')
        }
      }
    })
  }

  matchShowAnswer() {
    if (this.question.questionType === 'mtf') {
      this.jsPlumbInstance.deleteEveryConnection()
      for (let i = 1; i <= this.question.options.length; i += 1) {
        const questionSelector = `#c1${this.question.questionId}${i}`
        for (let j = 1; j <= this.question.options.length; j += 1) {
          const answerSelector = `#c2${this.question.questionId}${j}`
          const options = this.question.options[i - 1]
          if (options) {
            const match = options.match
            const selectors: HTMLElement[] = this.jsPlumbInstance.getSelector(answerSelector) as unknown as HTMLElement[]
            if (match && match.trim() === selectors[0].innerText.trim()) {
              const endpoint = `[
                'Dot',
                {
                  radius: 5
                }
              ]`
              this.jsPlumbInstance.connect({
                endpoint,
                source: this.jsPlumbInstance.getSelector(questionSelector) as unknown as Element,
                target: this.jsPlumbInstance.getSelector(answerSelector) as unknown as Element,
                anchors: ['Right', 'Left'],
              })
            }
          }
        }
      }
      this.changeColor()
    }
  }

  functionChangeBlankBorder() {
    if (this.question.questionType === 'fitb') {
      for (let i = 0; i < (this.question.question.match(/<input/g) || []).length; i += 1) {
        if (this.correctOption[i] && !this.unTouchedBlank[i]) {
          this.elementRef.nativeElement
            .querySelector(`#${this.question.questionId}${i}`)
            .setAttribute('style', 'border-style: none none solid none; border-width: 1px; padding: 8px 12px; border-color: #357a38')
        } else if (!this.correctOption[i] && !this.unTouchedBlank[i]) {
          this.elementRef.nativeElement
            .querySelector(`#${this.question.questionId}${i}`)
            .setAttribute('style', 'border-style: none none solid none; border-width: 1px; padding: 8px 12px; border-color: #f44336')
        } else if (this.unTouchedBlank[i]) {
          this.elementRef.nativeElement
            .querySelector(`#${this.question.questionId}${i}`)
            .setAttribute('style', 'border-style: none none solid none; border-width: 1px; padding: 8px 12px;')
        }
      }
    }
  }

  resetBlankBorder() {
    for (let i = 0; i < (this.question.question.match(/<input/g) || []).length; i += 1) {
      this.elementRef.nativeElement
        .querySelector(`#${this.question.questionId}${i}`)
        .setAttribute('style', 'border-style: none none solid none; border-width: 1px; padding: 8px 12px;')
    }
  }
  ngOnDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }
}
