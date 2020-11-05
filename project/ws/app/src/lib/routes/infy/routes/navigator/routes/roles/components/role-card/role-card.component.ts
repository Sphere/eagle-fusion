import { Component, Input, OnInit } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import { IRole, IVariant } from '../../../../models/navigator.model'

@Component({
  selector: 'ws-app-role-card',
  templateUrl: './role-card.component.html',
  styleUrls: ['./role-card.component.scss'],
})
export class RoleCardComponent implements OnInit {
  @Input()
  roleOffering!: IRole
  selectedVariant!: IVariant
  allVariants: IVariant[]
  variants: IVariant[]
  otherVariants: IVariant[]

  showMore = true
  showLess = false
  variantStart = 0

  defaultThumbnail = '/assets/images/missing-thumbnail.png'
  constructor(private configSvc: ConfigurationsService) {
    this.variants = []
    this.otherVariants = []
    this.allVariants = []
  }

  ngOnInit() {
    // //console.log('test', this.roleOffering)
    this.selectedVariant = {
      variant_id: this.roleOffering.variants[0].variant_id,
      variant_name: this.roleOffering.variants[0].variant_name,
      variant_image: this.roleOffering.variants[0].variant_image,
      variant_description: this.roleOffering.variants[0].variant_description,
    }
    if (this.configSvc.instanceConfig) {
      this.defaultThumbnail = this.configSvc.instanceConfig.logos.defaultContent
    }
    this.allVariants = this.roleOffering.variants
    if (this.allVariants.length > 3) {
      const tempVariants = this.allVariants.concat()
      this.variants = tempVariants.slice(this.variantStart, 3)
      this.otherVariants = tempVariants.slice(this.variantStart)
    } else {
      this.variants = this.allVariants.slice()
    }
  }

  onSelectionChange(entry: IVariant) {
    if (this.selectedVariant) {
      this.selectedVariant.variant_id = entry.variant_id
      this.selectedVariant.variant_name = entry.variant_name
    }
  }

  changeVariants(mode: string) {
    if (mode === 'prev') {
      this.showMore = true
      this.variantStart -= 3
      const tempVariants = this.allVariants.concat()
      this.variants = tempVariants.splice(this.variantStart, 3)
      if (this.variantStart <= 2) {
        this.variantStart = 0
        this.showLess = false
      }
    } else {
      this.showLess = true
      // here we update the variants based on the selection
      if (this.allVariants.length - 3 > 3) {
        this.variantStart += 3
        const tempVariants = this.allVariants.concat()
        this.variants = tempVariants.splice(this.variantStart, 3)
      } else {
        this.variantStart += 3
        const tempVariants = this.allVariants.concat()
        this.variants = tempVariants.splice(this.variantStart, 3)
      }

      if (this.variantStart + 2 >= this.allVariants.length - 1) {
        this.variantStart = this.allVariants.length - 1
        this.showMore = false
      }
    }

    // //console.log('new variants', this.variants, this.otherVariants)
  }
}
