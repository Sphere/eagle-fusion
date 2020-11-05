import {
  Component,
  OnInit,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  // Renderer,
  Renderer2,
  ViewChild,
  ElementRef,
} from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { Subscription, interval } from 'rxjs'
import { NSClassDiagram } from './class-diagram.model'
import { map } from 'rxjs/operators'
import { jsPlumb, jsPlumbInstance } from 'jsplumb'
import { ClassDiagramService } from './class-diagram.service'

@Component({
  selector: 'viewer-plugin-class-diagram',
  templateUrl: './class-diagram.component.html',
  styleUrls: ['./class-diagram.component.scss'],
})
export class ClassDiagramComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @ViewChild('classDiagramContainer', { static: true }) classDiagramContainer: ElementRef | null = null
  @Input() contentName = ''
  @Input() identifier = ''
  @Input() classDiagram: any

  clsDiagramData: NSClassDiagram.IClassDiagramResponse | null = null
  clsDiagramStartedAt = 0
  clsDiagramTimeRemaining = 0
  jsPlumbInstance: jsPlumbInstance | null = null
  classCount = 0
  isSubmitted = false
  isDisabled = false
  isIdeal = false
  result: NSClassDiagram.IClassDiagramApiResponse | null = null
  error = false
  public selectedAccess = 'public'
  public selectedRelation = 'is-a'
  private tmpListener: any
  userOptions: NSClassDiagram.IOptionsObject = { classes: [], relations: [] }

  classOptions: string[] = []
  private timerSubscription: Subscription | null = null

  constructor(
    private domSanitizer: DomSanitizer,
    // private el: ElementRef,
    // private renderer: Renderer,
    private renderer: Renderer2,
    private clsDiagramSvc: ClassDiagramService,
  ) { }

  ngOnInit() {
    this.tmpListener = this.renderer.listen(
      (this.classDiagramContainer ? this.classDiagramContainer.nativeElement : ''), 'dragover', (event: any) => {
        event.preventDefault()
      })
    this.tmpListener = this.renderer.listen(
      (this.classDiagramContainer ? this.classDiagramContainer.nativeElement : ''), 'drop', (event: any) => {
        // tslint:disable-next-line:max-line-length
        if (
          !['statemachine-class-diagram', 'card-pile'].includes(event.target.id) &&
          !event.target.classList.contains('new-class')
        ) {
          this.drop(event)
          return false
        }
        return
      })
    this.tmpListener = this.renderer.listen(
      (this.classDiagramContainer ? this.classDiagramContainer.nativeElement : ''), 'click', (event: any) => {
        if (event.target.className === 'drag-icon') {
          this.jsPlumbRemoved(event)
        } else if (event.target.nodeName === 'LI') {
          this.removeListItems(event)
        }
      })
    this.lintErrorRemover(this.tmpListener)
  }

  ngAfterViewInit() {
    // setup some defaults for jsPlumb.
    this.jsPlumbInstance = jsPlumb.getInstance({
      Endpoint: 'Dot',
      Connector: 'StateMachine',
      HoverPaintStyle: { stroke: '#1e8151', strokeWidth: 2 },
      ConnectionOverlays: [
        [
          'Arrow',
          {
            location: 1,
            id: 'arrow',
            length: 14,
            foldback: 0.8,
          },
        ],
        ['Label', { label: '', id: 'label', cssClass: 'aLabel' }],
      ],
      Container: 'statemachine-class-diagram',
    })

    this.jsPlumbInstance.registerConnectionType('basic', { anchor: 'Continuous', connector: 'StateMachine' })
  }

  ngOnChanges() {
    this.ngOnDestroy()
    this.initializeClassDiagram()
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe()
    }
  }

  private lintErrorRemover(_tmpListener: any) {

  }

  private initializeClassDiagram() {
    this.clsDiagramData = this.deepCopy(this.classDiagram)
    if (this.clsDiagramData) {
      this.clsDiagramData.safeProblemStatement = this.sanitize(this.clsDiagramData.problemStatement)
      this.clsDiagramData.timeLimit *= 1000
      this.clsDiagramData.options.classes.forEach(value => {
        this.classOptions.push(value.name.substr(0, 1).toLocaleLowerCase() + value.name.substr(1))
      })
      this.classOptions.sort(() => Math.random() - 0.5)
      this.clsDiagramStartedAt = Date.now()
      this.clsDiagramTimeRemaining = this.clsDiagramData.timeLimit
    }
    if (this.clsDiagramData && this.clsDiagramData.timeLimit > -1) {
      this.timerSubscription = interval(100)
        .pipe(map(() => this.clsDiagramStartedAt + (this.clsDiagramData ? this.clsDiagramData.timeLimit : 0) - Date.now()))
        .subscribe(exerciseTimeRemaining => {
          this.clsDiagramTimeRemaining = exerciseTimeRemaining
          if (this.clsDiagramTimeRemaining < 0) {
            this.isIdeal = true
            this.clsDiagramTimeRemaining = 0
            if (this.timerSubscription) {
              this.timerSubscription.unsubscribe()
            }
            this.submit()
          }
        })
    }
  }

  addClass() {
    this.classCount += 1
    const addClass =
      `<div data-class-id="${this.classCount}" class="class-container class${this.classCount}">
        <div class="class-name" id="cls${this.classCount}">
          ClassName
        </div>
        <div class="attributes" id="attr${this.classCount}">
          Attributes
        </div>
        <div class="methods" id="mtds${this.classCount}">
          Methods
        </div>
      </div>`

    const container = document.createElement('div')
    container.classList.add('new-class')
    const icon = document.createElement('div')
    icon.classList.add('drag-icon')
    container.appendChild(icon)
    const newDiv = document.createElement('div')
    newDiv.innerHTML = addClass
    container.insertBefore(newDiv, icon)
    document.getElementsByClassName('statemachine-class-diagram')[0].appendChild(container)
    this.jsPlumbInitialization(this.jsPlumbInstance, container)
  }

  jsPlumbInitialization(instance: any, element: any) {
    // const windows = instance.getSelector('.statemachine-class-diagram .new-class')
    instance.draggable(element, { containment: 'statemachine-class-diagram' })

    // suspend drawing and initialise.
    instance.batch(() => {
      instance.makeSource(element, {
        filter: '.drag-icon',
        anchor: 'AutoDefault',
        connectorStyle: { stroke: '#5c96bc', strokeWidth: 2, outlineStroke: 'transparent', outlineWidth: 4 },
        connectionType: 'basic',
      })

      instance.makeTarget(element, {
        dropOptions: { hoverClass: 'dragHover' },
        anchor: 'AutoDefault',
        allowLoopback: true,
      })

      instance.bind('click', (c: any) => {
        instance.deleteConnection(c)
      })

      instance.bind('connection', (info: any) => {
        info.connection.getOverlay('label').setLabel(this.selectedRelation)
      })
    })
  }

  drag(ev: any) {
    ev.dataTransfer.setData('text', ev.target.textContent)
  }

  drop(event: any) {
    let data = event.dataTransfer.getData('text').trim()
    event.target.id = event.target.id ? event.target.id : event.target.offsetParent.id
    if (event.target.id.indexOf('cls') > -1) {
      const clsName = data.substring(0, 1).toLocaleUpperCase() + data.substring(1)
      const eventTarget = document.getElementById(event.target.id)
      if (eventTarget) {
        eventTarget.innerHTML = ''
        eventTarget.innerHTML = ` < ul > <li class='text-center' > ${clsName} </li></ul > `
      }
    } else {
      const access = this.selectedAccess === 'public' ? '+ ' : this.selectedAccess === 'private' ? '- ' : '# '
      data = access + data
      const eventTarget = document.getElementById(event.target.id)
      if (eventTarget && eventTarget.getElementsByTagName('ul').length > 0) {
        const eventTargetId = document.getElementById(event.target.id)
        if (eventTargetId) {
          eventTargetId.getElementsByTagName('ul')[0].innerHTML += ` < li > ${data} </li>`
        }
      } else {
        const eventTargetId = document.getElementById(event.target.id)
        if (eventTargetId) {
          eventTargetId.innerHTML = `<ul><li>${data}</li></ul>`
        }
      }
    }
  }

  jsPlumbRemoved(event: any) {
    const id = event.target.offsetParent.id
    const classDiagramDiv = document.getElementById('statemachine-class-diagram')
    if (this.jsPlumbInstance) {
      (this.jsPlumbInstance.select({ source: id as string }) as any).delete();
      (this.jsPlumbInstance.select({ target: id as string }) as any).delete()
    }
    if (classDiagramDiv) {
      classDiagramDiv.removeChild(event.target.parentNode)
    }
  }

  removeListItems(event: any) {
    const parent = event.target.offsetParent.id
    if (event.target.parentNode.childNodes.length === 1) {
      if (parent.indexOf('attr') >= 0) {
        const parentById = document.getElementById(parent)
        if (parentById) {
          parentById.innerHTML = 'Attributes'
        }
      } else if (parent.indexOf('mtds') >= 0) {
        const parentById = document.getElementById(parent)
        if (parentById) {
          parentById.innerHTML = 'Methods'
        }
      } else {
        const parentById = document.getElementById(parent)
        if (parentById) {
          parentById.innerHTML = 'Class Name'
        }
      }
    } else {
      event.target.parentNode.removeChild(event.target)
    }
  }

  submit() {
    this.isSubmitted = true
    this.isDisabled = true
    this.result = null
    this.userOptions.classes = []
    this.userOptions.relations = []
    const classElements = document.getElementsByClassName('new-class')
    if (classElements.length) {
      for (let i = 0; i < classElements.length; i += 1) {
        //  const id = classElements[i].getElementsByClassName('class-container')[0].classList[1].substring(5);
        const id = classElements[i].getElementsByClassName('class-container')[0].getAttribute('data-class-id')
        const clsId = document.getElementById(`cls${id}`)
        let exists = null
        if (clsId) {
          exists = clsId.getElementsByTagName('li')
        }
        let className = ''
        if (exists) {
          className = exists.length ? exists[0].innerText.trim() : ''
        }
        this.userOptions.classes.push({
          name: className,
          type: 'class',
          belongsTo: '',
          access: '',
        })
        const attrId = document.getElementById(`attr${id}`)
        let attr = null
        if (attrId) {
          attr = attrId.getElementsByTagName('li')
        }
        if (attr && attr.length) {
          for (let j = 0; j < attr.length; j += 1) {
            const attributeValue = attr[j].innerText.trim()
            // tslint:disable-next-line:max-line-length
            const accessSpecifier =
              attributeValue.substring(0, 1) === '+'
                ? 'public'
                : attributeValue.substring(0, 1) === '-'
                  ? 'private'
                  : 'protected'
            this.userOptions.classes.push({
              name: attributeValue.substring(1).trim(),
              type: 'attribute',
              belongsTo: className,
              access: accessSpecifier,
            })
          }
        }
        const mtdsId = document.getElementById(`mtds${id}`)
        let method = null
        if (mtdsId) {
          method = mtdsId.getElementsByTagName('li')
        }
        if (method && method.length) {
          for (let j = 0; j < method.length; j += 1) {
            const methodValue = method[j].innerText.trim()
            // tslint:disable-next-line:max-line-length
            const accessSpecifier =
              methodValue.substring(0, 1) === '+'
                ? 'public'
                : methodValue.substring(0, 1) === '-'
                  ? 'private'
                  : 'protected'
            this.userOptions.classes.push({
              name: methodValue.substring(1).trim(),
              type: 'method',
              belongsTo: className,
              access: accessSpecifier,
            })
          }
        }
      }
      if (this.jsPlumbInstance) {
        this.jsPlumbInstance.select().each((info: any) => {
          // const sourceId = info.source.getElementsByClassName('class-container')[0].classList[1].substring(5);
          // const targetId = info.target.getElementsByClassName('class-container')[0].classList[1].substring(5);
          const sourceId = info.source.getElementsByClassName('class-container')[0].getAttribute('data-class-id')
          const targetId = info.target.getElementsByClassName('class-container')[0].getAttribute('data-class-id')
          const clsSourceId = document.getElementById(`cls${sourceId}`)
          const clsTargetId = document.getElementById(`cls${targetId}`)
          let sourceClass = null
          let targetClass = null
          if (clsSourceId) {
            sourceClass = clsSourceId.getElementsByTagName('li')
          }
          if (clsTargetId) {
            targetClass = clsTargetId.getElementsByTagName('li')
          }

          if (sourceClass && sourceClass.length && targetClass && targetClass.length) {
            const object = {
              source: sourceClass[0].innerText.trim(),
              relation: info.getOverlay('label').getLabel(),
              target: targetClass[0].innerText.trim(),
            }
            this.userOptions.relations.push(object)
          }
        })
      }

      if (this.userOptions.classes.length) {
        const requestData = {
          identifier: this.identifier,
          userSolution: this.userOptions,
        }
        this.clsDiagramSvc.submitClassDiagram(requestData).subscribe(
          (res: NSClassDiagram.IClassDiagramApiResponse | null) => {
            this.result = res
            this.error = false
            this.isSubmitted = false
            this.isDisabled = false
          },
          (_err: any) => {
            this.error = true
            this.isDisabled = false
          },
        )
      }
    } else {
      this.isDisabled = false
    }
  }

  reset() {
    this.selectedAccess = 'public'
    this.selectedRelation = 'is-a'
    const stateMachineClassDiagram = document.getElementById('statemachine-class-diagram')
    if (stateMachineClassDiagram) {
      stateMachineClassDiagram.innerHTML = ''
    }
    if (this.jsPlumbInstance) {
      this.jsPlumbInstance.deleteEveryConnection()
    }
    this.userOptions.classes = []
    this.userOptions.relations = []
    this.result = null
    this.isSubmitted = false
    this.isDisabled = false
    this.error = false
  }

  private sanitize(htmlString: string) {
    return this.domSanitizer.bypassSecurityTrustHtml(htmlString)
  }

  deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  }

}
