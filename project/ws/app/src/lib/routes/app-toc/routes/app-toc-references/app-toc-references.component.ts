import { Component, OnDestroy, OnInit } from '@angular/core'
import { NsContent } from '@ws-widget/collection'

@Component({
  selector: 'ws-app-app-toc-references',
  templateUrl: './app-toc-references.component.html',
  styleUrls: ['./app-toc-references.component.scss'],
})
export class AppTocReferencesComponent implements OnInit, OnDestroy {
  content: NsContent.IContent | null = null
  references = [
    { name: "Reference 1", "type": "pdf", "link": "https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_11342049408739737611575/artifact/do_11342049408739737611575_1638245256353_drugs_oxytocin_misoprostolny1620386277640.pdf" },
    { name: "Reference 2", "type": "video", "link": "https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_11341932837665996811056/artifact/do_11341932837665996811056_1638106111909_chapter1rmcandwhatdoesitmean1604386534913.mp4" },
    { name: "Reference 3", "type": "link", "link": "https://www.youtube.com/embed/4FbMEg9k9us" },
    { name: "Reference 4", "type": "audio", "link": "https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_11342625882651033611676/artifact/do_11342625882651033611676_1638948595198_respectful1638948590359.pdf" }
  ]

  loadContent = true
  constructor() { }

  ngOnInit() {
  }
  ngOnDestroy() {
  }

}
